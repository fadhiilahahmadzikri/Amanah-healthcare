# Laporan Audit & Rekomendasi Kontrak Autentikasi (Untuk Backend Team)

> **Dokumen Audit & Sinkronisasi Kontrak: Password Reset Lifecycle**  
> **Ditujukan kepada:** Backend Engineer / Backend Agent  
> **Dari:** Frontend Engineer  
> **Status:** Critical Review & Remediation Guidance  
> **Tanggal:** 19 September 2026

---

## 1. Ringkasan Eksekutif

Telah terjadi kegagalan alur autentikasi (_404 Not Found_) pada pengujian pengguna saat mengeklik tautan reset password dari email (Mailpit).

Berdasarkan investigasi forensik terhadap log pesan Mailpit dan arsitektur sistem:

1. **Akar Masalah (Root Cause):** Backend men-generate tautan email yang mengarah ke path `/password-change` tanpa memverifikasi route resmi di frontend dan tanpa menetapkan kontrak rute bersama.
2. **Anomali Kritis (Dual-Path / Configuration Drift):** Dalam rentang waktu **8 menit**, backend menghasilkan dua format URL yang sama sekali berbeda dari dua aksi forgot password yang sama. Ini adalah bukti kuat bahwa di backend **tidak ada Single Source of Truth (SSOT)** untuk pembentukan tautan email.
3. **Dampak Arsitektural:** Frontend sempat merespons dengan pola yang salah (_anti-pattern_) berupa penumpukan lapisan fallback, multi-engine guessing (mencoba menebak JWT vs Better Auth), dan folder dummy. Seluruh fallback tersebut kini telah dibersihkan di frontend untuk kembali ke satu aliran kanonikal yang ketat.
4. **Tindakan yang Diperlukan:** Backend wajib membakukan generator URL email ke satu sumber konfigurasi tunggal (_SSOT_) dan memvalidasinya lewat automated test.

---

## 2. Bukti Forensik Nyata (Log Mailpit)

Pemeriksaan langsung pada antrean pesan SMTP Mailpit (`http://localhost:8025/api/v1/messages`) menunjukkan fakta berikut:

### A. Pesan ID: `2NWrql71GeDbyuhwEFb3Wu` (Pukul 12:20:01 UTC)

- **Subject:** Reset password
- **URL yang Di-generate Backend:**
  ```text
  http://localhost:3000/password-change?hash=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&expires=1789822201033
  ```
- **Status di Browser:** **404 Not Found** (Frontend tidak memiliki rute `/password-change`).

### B. Pesan ID: `34wIvC2WY7CS61YHCciegk` (Pukul 12:28:53 UTC)

- **Subject:** Reset password
- **URL yang Di-generate Backend:**
  ```text
  http://localhost:3000/auth/sign-in/reset-password?hash=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&expires=1789822733280&email=testuser%40gmail.com
  ```
- **Status di Browser:** **200 OK** (Tepat mengenai single mount point frontend).

### Analisis Anomali:

Dua email yang dikirimkan dalam selang 8 menit menggunakan format path dan query parameters yang berbeda (`/password-change` vs `/auth/sign-in/reset-password`). Ini mengindikasikan:

- Ada hardcoded string lama di salah satu template email / service method yang belum dibersihkan.
- ATAU nilai environment variable di backend diubah tanpa mekanisme reload/restart yang konsisten.
- Tidak adanya unit/contract test di backend yang mengunci format URL keluar.

---

## 3. Pelanggaran Prinsip Provider - Consumer

Dalam arsitektur sistem terdistribusi / decoupled:

1. **Backend adalah Provider Tautan:** Ketika backend menyusun URL yang mengarahkan user ke aplikasi eksternal (Frontend Web), backend tidak boleh menebak atau menggunakan default template starter kit (seperti `/password-change` bawaan template NestJS mailer starter).
2. **Ketiadaan Kontrak di Dokumentasi:** Dokumen `FRONTEND-HANDOFF.md` dan `CONTRACT.md` sebelumnya hanya mendokumentasikan endpoint REST:
   - `POST /api/v1/auth/forgot/password`
   - `POST /api/v1/auth/reset/password`  
     Backend sama sekali **tidak pernah mendefinisikan kontrak callback URL frontend**. Tanpa kontrak tertulis dan terverifikasi, frontend mendesain rute di `/auth/sign-in/reset-password` sementara backend mengirim link ke `/password-change`.

---

## 4. Risiko Keamanan dari "Multi-Engine Guessing"

Ketika terjadi ketidakcocokan rute dan token, muncul godaan di sisi klien untuk melakukan _multi-engine guessing_:

- Jika token 6 digit ➔ coba Better Auth OTP.
- Jika token panjang ➔ coba JWT Kanonikal API.
- Jika gagal ➔ coba Better Auth token reset fallback.

**Ini adalah risiko keamanan serius.** Mencoba beberapa skema otentikasi secara bertingkat pada alur reset password dapat memicu:

1. _Timing attacks_ dan bypass validasi status akun.
2. Desinkronisasi data kredensial: password berubah di satu tabel (`account`) tetapi tidak terupdate di tabel kredensial kanonikal (`auth_accounts`), atau sebaliknya.
3. Kerentanan logika di mana token kedaluwarsa dari satu engine tidak sengaja lolos di engine lain.

Oleh karena itu, **Frontend telah menolak seluruh multi-engine fallback**. Frontend kini menerapkan penegakan ketat: **Hanya 1 aliran kanonikal tunggal**.

---

## 5. Rute Resmi & Kontrak Tunggal Frontend (SSOT)

Frontend telah mengunci satu titik mount resmi (_Single Mount Point_) untuk alur reset password:

| Properti                      | Nilai Resmi                                                                                                       |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Frontend Base URL**         | `http://localhost:3000` (development) / `process.env.FRONTEND_URL`                                                |
| **Path Resmi**                | `/auth/sign-in/reset-password`                                                                                    |
| **Query Parameters Wajib**    | `hash` (Token JWT kriptografis dari backend)                                                                      |
| **Query Parameters Opsional** | `email`, `expires`                                                                                                |
| **URL Lengkap Link Email**    | `${FRONTEND_URL}/auth/sign-in/reset-password?hash=${token}&expires=${expires}&email=${encodeURIComponent(email)}` |
| **Endpoint Eksekusi API**     | `POST /api/v1/auth/reset/password`                                                                                |
| **Payload Eksekusi**          | `{ "hash": string, "password": string }`                                                                          |

---

## 6. Tindakan yang Wajib Dilakukan oleh Backend Team

Agar masalah ini tuntas permanen dan tidak terjadi drift lagi di masa mendatang:

### 1. Hapus Semua Hardcoded `/password-change` di Backend

Cari dan bersihkan semua kemunculan string `password-change` di seluruh codebase backend (`src/mail/`, `src/auth/`, template handlebars/ejs):

```typescript
// SEBELUMNYA (SALAH / FRAGILE):
const resetUrl = `${this.configService.get('app.frontendUrl')}/password-change?hash=${token}`;

// PERBAIKAN (BENAR / KANONIKAL):
const frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
const resetUrl = `${frontendUrl}/auth/sign-in/reset-password?hash=${token}&expires=${expires}&email=${encodeURIComponent(email)}`;
```

### 2. Jadikan URL Callback sebagai Environment Variable / Config Constant

Definisikan secara eksplisit di file konfigurasi backend (misal: `auth.config.ts`):

```typescript
export default registerAs('auth', () => ({
  resetPasswordPath: process.env.AUTH_RESET_PASSWORD_PATH || '/auth/sign-in/reset-password'
  // ...
}));
```

### 3. Buat Automated Integration / Unit Test di Backend

Pastikan backend memiliki unit test pada `MailService` atau `AuthService` yang memverifikasi pembentukan tautan email:

```typescript
it('should construct reset password link pointing to /auth/sign-in/reset-password', async () => {
  const resetLink = await mailService.generateResetPasswordLink('test@example.com', 'dummy-token');
  expect(resetLink).toContain('/auth/sign-in/reset-password?hash=dummy-token');
  expect(resetLink).not.toContain('/password-change');
});
```

---

## 7. Status di Frontend Saat Ini

1. **Fallback Multi-Engine Dihapus:** Form frontend hanya memanggil satu endpoint kanonikal: `POST /api/v1/auth/reset/password` dengan payload `{ hash, password }`.
2. **Kesesuaian Kompatibilitas Sementara:** Proxy frontend saat ini tetap meneruskan (redirect 307) jika ada sisa email lama dengan path `/password-change` agar tester tidak terblokir, namun backend wajib menghentikan pengiriman tautan ke path tersebut.
3. **Build & Type Clean:** Seluruh route, schema, dan actions di frontend telah tervalidasi 100% clean (`tsc --noEmit` exit 0, `next build` exit 0).
