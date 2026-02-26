# 🔐 Audit Sign-to-Login Flow — Root Cause & Fix

## Masalah
Setelah register berhasil, klik "Sign to Login" selalu gagal.

## File yang Terlibat
| # | File | Peran |
|---|------|-------|
| 1 | `frontend/.env.local` | Konfigurasi API URL |
| 2 | `frontend/src/store/useGameStore.ts` | Logic authenticate (fetch nonce → sign → verify) |
| 3 | `frontend/next.config.js` | Proxy/rewrite rules |

---

## Root Cause

### Flow yang gagal:
```
User klik "Sign to Login"
  → handleAuthenticate()
    → authenticate() di useGameStore.ts
      → fetch(`${API_BASE}/auth/nonce/${address}`)  ❌ GAGAL DI SINI
```

### Kenapa gagal?

`.env.local` line 20:
```env
NEXT_PUBLIC_API_URL=http://localhost/api/v1
```

`useGameStore.ts` line 91:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
```

Jadi `API_BASE` = `http://localhost/api/v1` = **port 80**.

**Tapi tidak ada server yang jalan di port 80!**
- Frontend jalan di port 3002 (Next.js dev server)
- Backend (Go) dirancang untuk port 8080, tapi tidak sedang jalan
- Port 80 = kosong = **connection refused**

Akibatnya:
1. `fetch("http://localhost/api/v1/auth/nonce/0x...")` → **ERR_CONNECTION_REFUSED**
2. `authenticate()` masuk ke `catch` block → return `false`
3. Frontend tampilkan: *"Signature verification failed"*
4. Padahal masalahnya bukan signature, tapi **backend tidak bisa dihubungi**

---

## Fix yang Diterapkan

### 1. `.env.local` — Ganti absolute URL ke relative path
```diff
# SEBELUM (port 80, error):
- NEXT_PUBLIC_API_URL=http://localhost/api/v1

# SESUDAH (relative, diproksikan oleh Next.js):
+ NEXT_PUBLIC_API_URL=/api/v1
+ BACKEND_URL=http://localhost:8080
```

### 2. `next.config.js` — Tambah rewrite proxy
```javascript
// Next.js akan meneruskan /api/v1/* ke Go backend di port 8080
async rewrites() {
    return [
        {
            source: '/api/v1/:path*',
            destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/v1/:path*`,
        },
    ];
},
```

### Bagaimana cara kerjanya sekarang:
```
Browser → http://localhost:3002/api/v1/auth/nonce/0x...
  → Next.js rewrite proxy
    → http://localhost:8080/api/v1/auth/nonce/0x...
      → Go backend me-respond nonce
        → Browser menerima response ✅
```

### Keuntungan:
- **Tidak ada CORS issue** — browser hanya berkomunikasi dengan origin yang sama (localhost:3002)
- **Tidak perlu konfigurasi CORS di Go backend**
- **Production ready** — di Docker/Nginx, URL tetap relatif `/api/v1` dan proxy diatur di nginx

---

## ⚠️ PENTING: Backend Harus Jalan!

Sign flow membutuhkan **Go backend** yang jalan di port 8080. Tanpa backend, sign tetap gagal.

Untuk menjalankan backend:
```bash
cd backend
go run cmd/main.go
```

Atau jika pakai Docker:
```bash
docker-compose up -d
```

Backend endpoints yang dibutuhkan oleh sign flow:
1. `GET /api/v1/auth/nonce/{address}` — ambil nonce untuk signing
2. `POST /api/v1/auth/login` — verifikasi signature + issue JWT token

---

## Rangkuman Perubahan

| File | Perubahan |
|------|-----------|
| `.env.local` | `NEXT_PUBLIC_API_URL` diubah dari `http://localhost/api/v1` ke `/api/v1` |
| `.env.local` | Tambah `BACKEND_URL=http://localhost:8080` |
| `next.config.js` | Tambah `rewrites()` proxy `/api/v1/*` → backend:8080 |
