# ⚔️ SIMULASI SERANGAN API: CASH COW VALLEY (RED TEAM REPORT)

Sebagai Auditor Eksternal, saya telah mempelajari **Pertahanan Dewa** (JWT, Redlock, *Pessimistic Locking*, Nginx Rate Limit) yang kita bangun. Jika saya adalah seorang Hacker Top-Tier bayaran yang disewa kompetitor Anda untuk menghancurkan *Cash Cow Valley*, **ini adalah cara saya menyusup dan menghancurkan API Anda:**

Berikut adalah rincian *"Attack Vectors"* (Vektor Serangan) potensial yang masih mungkin dicoba terhadap struktur saat ini, beserta cara penyerang mengeksploitasinya:

---

## 💥 1. SERANGAN LOGIKA BISNIS (BUSINESS LOGIC EXPLOIT)

Sistem Golang/Postgres Anda kebal terhadap injeksi SQL, tapi mungkin lemah secara kelogisan matematika.

### 1a. Eksploitasi: Marketplace Wash Trading (Pencucian Volume)
*   **Target API:** `POST /api/v1/market/buy`
*   **Cara Menyerang:** 
    1. Saya buat dua akun (Akun A & Akun B). 
    2. Akun A menjual 1 Rumput seharga 1.000.000 USDT.
    3. Akun B (yang entah dari mana mendapat USDT, atau via *Ad Webhook exploit*) membeli barang tersebut.
    4. Karena harga barang tidak dibatasi nilainya (*Max Price*), saya memindahkan uang gelap secara leluasa antar akun, memanipulasi *Market Volume* yang terlihat di UI (*Fake Hype*).
*   **Mitigasi yang Kita Punya:** Saat ini kita menolak `SellerID == BuyerID`.
*   **Celah Tersisa:** Kita **BELUM** membatasi *Harga Minimum* & *Harga Maksimum* di Marketplace. Orang bisa jual Rumput seharga $0.000001 (menghancurkan harga pasar / *Market Crash*).

### 1b. Eksploitasi: AdNetwork Webhook Replay (Pencetakan Uang Palsu)
*   **Target API:** `POST /api/v1/ad-webhook`
*   **Cara Menyerang:**
    1. Saya mengetahui kalau Jaringan Iklan (SSV) merespons ke URL Anda dengan melampirkan HMAC Signature rahasia.
    2. Saya *sniff* (cegat) Payload Webhook ASLI yang valid tersebut (beserta *signature*-nya) di lalu lintas jaringan/router log (jika HTTPS bocor atau admin lalai).
    3. Payload ASLI itu berbunyi: `{"user": "idku", "reward": 20, "event_id": "ABC"}`.
    4. Walaupun saya tidak tahu HMAC Secret-nya, saya tinggal me-*replay* ulang (Kirim ulang via cURL) payload yang sama persis 100.000x. Karena isinya persis, HMAC validasinya pasti *Lulus*.
*   **Mitigasi yang Kita Punya:** Tabel `tx_logs` mencegat `event_id` yang sama.
*   **Celah Tersisa:** Jika Hacker mengirim 100 *Request* secara Murni Bersamaan (Konkurensi 1ms), Golang mungkin membaca `tx_logs` masih "kosong" untuk ke-100 *request* tersebut karena transaksi DB belum *Commit*! Ini disebut *TOCTOU (Time of Check to Time of Use) Flaw*.

---

## 💥 2. SERANGAN KONKURENSI & JARINGAN (RACE CONDITIONS)

Walaupun kita pakai *Redlock* & *Row-Locking*, saya akan mencoba mematahkannya lewat limitasi eksekusi I/O.

### 2a. Eksploitasi: Redlock Poisoning (Menahan Kunci Selamanya)
*   **Target API:** `/api/v1/market/buy` dan `/api/v1/farm/feed`
*   **Cara Menyerang:**
    1. Redlock bekerja dengan mengunci ID pengguna. 
    2. Jika saya bisa memanipulasi panjang paket HTTP (*Slowloris Attack*) saat API dipanggil...
    3. API terkepung, CPU Golang penuh. Database melambat parah.
    4. Redlock kita diatur punya batas hidup (TTL) 5 detik. Akibat kelambatan, proses Database berjalan melebihi 5 detik. 
    5. Kunci Redlock otomatis *terbuka* sendiri sebelum DB selesai! 
    6. Aplikasi Klien (*Bot*) menembakan *Request* kedua dengan cepat. Kini saya mengeksekusi *Database Transaction* **keparalelan ganda** meskipun ada pelindung Redlock awal!
*   **Celah Tersisa:** *Database Lock Statement Timeout* kita belum dikonfigurasi secara eksplisit di GORM agar selalu putus otomatis jika lebih pendek dari TTL Redis.

---

## 💥 3. SERANGAN INFRASTRUKTUR & DEVOPS (APPLICATION DOS)

Peretas cerdas takkan capek-capek membobol sandi, mereka akan mematikan peladen Anda dari luar.

### 3a. Eksploitasi: Nginx Volumetric Parse Crashing (JSON Injection)
*   **Target API:** Seluruh API (Lewat Nginx)
*   **Cara Menyerang:**
    1. Nginx membatasi 10 request/detik per IP.
    2. Daripada mengirim 20 per detik dari 1 IP (yang akan di-*Rate Limit* wajar), saya sewa Botnet (Mirai Mirip) dari 50.000 IP berbeda alamat IPv6.
    3. Masing-masing hanya mengirim 5 request/detik. (Nginx bilang ini beban wajar).
    4. Nginx *Lolos*, Golang menerima **250.000 Request/detik**.
    5. RAM Golang tidak kuat me-*Unmarshall JSON* sebesar itu. Terjadi Puncak Alokasi *Garbage Collector* (GC). 
    6. Golang mati kelaparan memori (*OOM Killed* oleh Docker Service). Seluruh *game* tak bisa diakses.
*   **Celah Tersisa:** Belum adanya Global Rate Limiting / WAF Level (Cloudflare Under Attack Mode) sebelum menyentuh VPS Nginx Anda.

### 3b. Eksploitasi: JWT Signature Fuzzing (Penipuan Payload)
*   **Target API:** Mem-Bypass Middleware Auth `RequireAuth`
*   **Cara Menyerang:**
    1. Saya mencetak JWT palsu dengan identitas `wallet_address: "ALAMAT_SULTAN_TERKAYA"`.
    2. Saya mengubah Header Signature Algorithm dari `HS256` ke `MAC` (jika *library* lupa divalidasi ketat) atau memotong titik (`.`) akhir dari JWT.
    3. Jika pustaka JWT *Golang* memproses *String parsing* tanpa *error catch* yang sempurna, saya masuk sebagai Sultan tanpa sandi.
*   **Mitigasi Kita:** Middleware sangat teliti.
*   **Celah Tersisa:** Jika *Base64 Decoding* pada JWT memakan CPU berlebihan (*Zip Bomb Payload* dengan JWT muatan 5MB), Golang bisa mogok.

---

### KESIMPULAN PENYERANG (RED TEAM VERDICT)
Berdasarkan "Maha Audit" kita, sistem ini **SECARA TEORITIS AMAN DARI PENETRASI KLASIK** (SQLi, IDOR, CSRF Biasa). 

Namun, peretas sejati *akan menyerang lapisan terlemah*: **Keterbatasan Fisik Hardware (RAM & CPU Time)** melalui serangan *Idempotency Konkurensi* atau *Volumetric Botnet IP Spoof*. 

Cara satu-satunya menjinakkannya adalah dengan bantuan Cloudflare (Lapis 7 Luar) dan Timeout Database Keras (Lapis Terdalam).
