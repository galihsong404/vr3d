# 🔐 Audit WalletConnect: Connect, Disconnect, Sign

## Files yang Di-Audit
| # | File | Fungsi |
|---|------|--------|
| 1 | `frontend/src/lib/wagmi.ts` | Konfigurasi wagmi + chains |
| 2 | `frontend/src/app/Web3ModalProvider.tsx` | Inisialisasi Web3Modal |
| 3 | `frontend/src/store/useGameStore.ts` | State management + auth flow |
| 4 | `frontend/src/app/dapp/page.tsx` | Dapp auth gate + disconnect logic |
| 5 | `frontend/src/components/ui/Navbar.tsx` | Navbar connect + session handling |
| 6 | `frontend/.env.local` | Environment variables |

---

## ❌ BUG #1: Hardcoded ProjectID Duplikat (KRITIS)

### Lokasi
- `wagmi.ts` line 4: `const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'e9489c77e12cf9091d7f3d7dd2f3e4d1'`
- `Web3ModalProvider.tsx` line 13: `projectId: 'e9489c77e12cf9091d7f3d7dd2f3e4d1'`

### Masalah
Project ID di-hardcode di **dua tempat berbeda** dan tidak konsisten:
1. `wagmi.ts` membaca dari env variable **dengan fallback hardcoded**
2. `Web3ModalProvider.tsx` SELALU pakai **hardcoded string**, mengabaikan env var sepenuhnya

Jika developer mengganti `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` di `.env.local`, `Web3ModalProvider` akan tetap pakai ID lama → **koneksi gagal atau modal tidak muncul**.

### Fix
```tsx
// Web3ModalProvider.tsx — FIX: gunakan env variable, bukan hardcode
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

createWeb3Modal({
    wagmiConfig: wagmiConfig,
    projectId, // ← dari env, bukan hardcode
    chains: chains,
    ...
});
```

---

## ❌ BUG #2: Sesi Zombie — Persisted Auth Tanpa Validasi Token (KRITIS)

### Lokasi
- `useGameStore.ts` line 374-384: `partialize` hanya menyimpan token tanpa expiry check

### Masalah
```tsx
partialize: (state) => ({
    authToken: state.authToken,   // Token JWT disimpan di localStorage
    userRole: state.userRole,
    userWallet: state.userWallet,
    isAuthenticated: state.isAuthenticated, // ← Selalu true meskipun token expired!
    isLoggedIn: state.isLoggedIn,
}),
```

Ketika user membuka browser keesokan harinya:
1. Zustand memuat `isAuthenticated: true` dari localStorage
2. Frontend menganggap user sudah login → **SKIP auth gate**
3. Semua API call pakai token yang **sudah expired** → 401 Unauthorized
4. User stuck di dapp tanpa data, tidak ada mekanisme retry

### Fix
Tambahkan validasi token di mount:
```tsx
// dapp/page.tsx — tambahkan useEffect ini:
useEffect(() => {
    if (mounted && isAuthenticated && authToken) {
        // Validate token masih hidup dengan hit lightweight endpoint
        fetch(`${API_BASE}/farm/status`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        }).then(res => {
            if (res.status === 401 || res.status === 403) {
                console.log('Token expired, forcing re-auth');
                logout();
            }
        }).catch(() => {
            // Network error, keep session but don't fetch
        });
    }
}, [mounted, isAuthenticated, authToken]);
```

---

## ❌ BUG #3: Disconnect Tidak Membersihkan Zustand Persisted Storage

### Lokasi
- `dapp/page.tsx` line 165-197: `handleDisconnect()`

### Masalah
Fungsi `handleDisconnect()` membersihkan:
✅ wagmi state (`disconnect()`)
✅ Zustand in-memory state (`logout()`)
✅ WalletConnect localStorage keys

Tapi **TIDAK** membersihkan Zustand persisted storage key: `cash-cow-vault` di localStorage!

```
localStorage setelah disconnect:
- wc@... → DELETED ✅
- W3M... → DELETED ✅
- wagmi... → DELETED ✅
- cash-cow-vault → MASIH ADA ❌ (berisi authToken, isAuthenticated: true!)
```

Akibatnya: ketika user refresh halaman, Zustand memuat state lama dan user kembali "terlihat login" padahal wagmi sudah disconnected.

### Fix
```tsx
const handleDisconnect = () => {
    disconnect();
    logout();

    // Clear WC cache + Zustand persisted storage
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith('wc@') ||
                key.startsWith('W3M') ||
                key.startsWith('wagmi') ||
                key.startsWith('@w3m') ||
                key.includes('walletconnect') ||
                key.includes('Web3Modal') ||
                key === 'cash-cow-vault'  // ← TAMBAHKAN INI
            )) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
        console.error('Failed to clear cache:', e);
    }

    router.push('/');
};
```

---

## ❌ BUG #4: Navbar Disconnect Tidak Sinkron dengan Dapp

### Lokasi
- `Navbar.tsx` line 21-25

### Masalah
```tsx
useEffect(() => {
    if (!isConnected) {
        logout();  // Hanya clear Zustand — TIDAK clear WC cache!
    }
}, [isConnected, logout]);
```

Ketika wallet disconnect dari extension (bukan dari tombol "Disconnect" di Dapp):
1. Navbar memanggil `logout()` → Zustand state cleared
2. Tapi WalletConnect cache di localStorage **TIDAK dibersihkan**
3. User reconnect → langsung auto-pick wallet lama tanpa permission dialog
4. Zustand persisted storage masih ada → isAuthenticated zombie

### Fix
```tsx
useEffect(() => {
    if (!isConnected) {
        logout();
        // Also clear persisted Zustand auth
        try { localStorage.removeItem('cash-cow-vault'); } catch {}
    }
}, [isConnected, logout]);
```

---

## ❌ BUG #5: Race Condition di Auth Flow

### Lokasi
- `dapp/page.tsx` line 104-122

### Masalah
```tsx
useEffect(() => {
    if (!mounted || status !== 'connected' || !address) return;

    const isWrongWallet = userWallet && address.toLowerCase() !== userWallet.toLowerCase();

    if (isWrongWallet) {
        logout();      // ← async state update
        return;        // ← return tapi logout belum selesai
    }

    if (!isAuthenticated) {
        checkRegistration(address).then(({ exists }) => {
            setNeedsRegistration(!exists);
        });
    }
}, [status, address, mounted, isAuthenticated, userWallet, ...]);
```

Skenario race condition:
1. User switch wallet dari A ke B
2. `isWrongWallet` = true → `logout()` dipanggil
3. `logout()` set `isAuthenticated = false` secara async
4. React re-render → useEffect fire lagi karena dependency berubah
5. Sekarang `isAuthenticated = false` → `checkRegistration(addressB)` dipanggil
6. TAPI di render ke-2 ini, `userWallet` mungkin masih berisi wallet A (state belum updated)
7. → Potensi wrong wallet dicatat atau auth gate menampilkan data yang salah

### Fix
Tambahkan guard flag:
```tsx
const [isWalletSwitching, setIsWalletSwitching] = useState(false);

useEffect(() => {
    if (!mounted || status !== 'connected' || !address || isWalletSwitching) return;

    const isWrongWallet = userWallet && address.toLowerCase() !== userWallet.toLowerCase();

    if (isWrongWallet) {
        setIsWalletSwitching(true);
        logout();
        // Wait for state to settle before allowing re-check
        setTimeout(() => setIsWalletSwitching(false), 500);
        return;
    }

    if (!isAuthenticated) {
        checkRegistration(address).then(({ exists }) => {
            setNeedsRegistration(!exists);
        });
    }
}, [status, address, mounted, isAuthenticated, userWallet, isWalletSwitching]);
```

---

## ❌ BUG #6: Registration TX Sukses Tapi Auth Tidak Lanjut

### Lokasi
- `dapp/page.tsx` line 131-136, 138-148

### Masalah
```tsx
// Setelah TX berhasil:
useEffect(() => {
    if (isRegTxSuccess) {
        setNeedsRegistration(false);  // ← Hanya set flag
        // TIDAK memanggil authenticate()!
    }
}, [isRegTxSuccess]);
```

Setelah user bayar registration fee dan TX sukses di blockchain:
1. `setNeedsRegistration(false)` → auth gate berubah dari "Register" ke "Sign to Login"
2. User harus **klik lagi** "Sign to Login" secara manual
3. Tidak ada feedback bahwa registration berhasil
4. Tidak ada auto-trigger untuk signature step

### Fix
```tsx
useEffect(() => {
    if (isRegTxSuccess && address) {
        setNeedsRegistration(false);
        // Otomatis lanjutkan ke sign step setelah registration sukses
        // Beri jeda kecil agar UI update dulu
        setTimeout(() => {
            handleAuthenticate();
        }, 1000);
    }
}, [isRegTxSuccess, address]);
```

---

## ⚠️ BUG #7: Fallback Project ID = Security Concern

### Lokasi
- `wagmi.ts` line 4: `|| 'e9489c77e12cf9091d7f3d7dd2f3e4d1'`
- `Web3ModalProvider.tsx` line 13: hardcoded

### Masalah
Project ID ini adalah **API key publik** dari WalletConnect Cloud. Jika ID ini:
- Milik orang lain → bisa di-revoke kapan saja → connect tiba-tiba mati
- Shared/free tier → rate limited di production
- Dicuri → attacker bisa monitor koneksi

### Fix
1. Hapus semua fallback/hardcoded ID
2. Pastikan `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` WAJIB di `.env.local`
3. Tambahkan error handling jika env var kosong

```tsx
// wagmi.ts
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
    console.error('CRITICAL: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set!');
}
```

---

## 📋 Rangkuman Prioritas

| # | Bug | Severity | Status |
|---|-----|----------|--------|
| 1 | Hardcoded ProjectID duplikat | 🔴 Kritis | Perlu fix |
| 2 | Sesi zombie (token expired) | 🔴 Kritis | Perlu fix |
| 3 | Disconnect tidak clear Zustand storage | 🔴 Kritis | Perlu fix |
| 4 | Navbar disconnect tidak sinkron | 🟡 Medium | Perlu fix |
| 5 | Race condition wallet switch | 🟡 Medium | Perlu fix |
| 6 | Registration TX tidak auto-continue | 🟡 Medium | Perlu fix |
| 7 | Fallback Project ID security | 🟡 Medium | Perlu fix |
