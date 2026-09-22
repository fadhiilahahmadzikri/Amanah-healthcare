# Backend Bug Report & Architecture Fix: Hybrid/Dual Auth Guard for `/api/v1/*`

> **Dokumen Resmi Delegasi Frontend ke Tim Backend (NestJS)**  
> **Target Audiens:** Backend Engineer (NestJS), Tech Lead, System Architect  
> **Modul Terkait:** `auth` (`src/auth`), `patients` (`src/modules/patients`), & seluruh controller `/api/v1/*`  
> **Tingkat Urgensi:** 🔴 **CRITICAL (Blocker Flow Google OAuth)**  
> **Tanggal:** 19 September 2026  
> **Status:** Open / Proposed Solution Ready

---

## 1. Ringkasan Eksekutif (Executive Summary)

Pengguna yang masuk (**login**) menggunakan penyedia sosial **Google OAuth** (yang dikelola oleh modul `Better Auth` di `/api/auth/*`) **gagal total dan ditolak dengan HTTP 401 Unauthorized** saat mencoba mengakses endpoint bisnis `/api/v1/*`, khususnya:

1. `POST /api/v1/patients/registration` (Registrasi Mandiri Pasien Baru)
2. `GET /api/v1/auth/me` (Sinkronisasi Profil Sesi)

### Dampak Sistem (Business Impact):

Pasien yang mendaftar atau login pertama kali via Google **terjebak pada modal barrier registrasi**, tidak dapat menyimpan data rekam medis, dan menerima pesan kesalahan:

> `"Unauthorized"` / `"Sesi autentikasi tidak valid atau token tidak disertakan"`

---

## 2. Bukti Log Live Server (Evidence from NestJS Logs)

Berikut adalah rekaman log langsung dari container backend NestJS (`amanah-healthcare-backend-api-1`) saat pengguna Google OAuth mencoba menyelesaikan pendaftaran pasien:

```log
api-1  | [Nest] 93  - 09/19/2026, 10:49:42 PM     LOG [HTTP] GET /api/auth/get-session 200 +20ms [trace: ec4ab5a3-6f25-498a-b5fc-bb6ef2460251]
api-1  | [Nest] 93  - 09/19/2026, 10:49:42 PM    WARN [ProblemDetailsFilter] [f59c7c9a-0aa5-4623-a0a3-fc2e74f63f33] POST /api/v1/patients/registration -> 401 UNAUTHENTICATED: Unauthorized
api-1  | [Nest] 93  - 09/19/2026, 10:49:42 PM    WARN [HTTP] POST /api/v1/patients/registration 401 +12ms [trace: f59c7c9a-0aa5-4623-a0a3-fc2e74f63f33]
api-1  | [Nest] 93  - 09/19/2026, 10:50:06 PM     LOG [HTTP] GET /api/auth/get-session 200 +36ms [trace: 82763513-b24b-457f-b6a4-730c5c38c279]
api-1  | [Nest] 93  - 09/19/2026, 10:50:06 PM    WARN [ProblemDetailsFilter] [a52b6639-17d4-4bb8-8992-6fd2efe5f74c] POST /api/v1/patients/registration -> 401 UNAUTHENTICATED: Unauthorized
api-1  | [Nest] 93  - 09/19/2026, 10:50:06 PM    WARN [HTTP] POST /api/v1/patients/registration 401 +2ms [trace: a52b6639-17d4-4bb8-8992-6fd2efe5f74c]
api-1  | [Nest] 93  - 09/19/2026, 10:50:20 PM     LOG [HTTP] GET /api/auth/get-session 200 +44ms [trace: 121095f8-b1a2-49aa-9d07-d02f774a3794]
api-1  | [Nest] 93  - 09/19/2026, 10:50:20 PM    WARN [ProblemDetailsFilter] [fe603804-7735-40b9-8eb4-62dab042e01a] POST /api/v1/patients/registration -> 401 UNAUTHENTICATED: Unauthorized
api-1  | [Nest] 93  - 09/19/2026, 10:50:20 PM    WARN [HTTP] POST /api/v1/patients/registration 401 +1ms [trace: fe603804-7735-40b9-8eb4-62dab042e01a]
```

**Perhatikan anomali di atas:**

1. Endpoint Better Auth `GET /api/auth/get-session` menghasilkan **HTTP 200 OK** (artinya sesi Google OAuth di database dan cookie `better-auth.session_token` valid 100%).
2. Namun saat memanggil `POST /api/v1/patients/registration`, request **langsung ditolak dengan HTTP 401 UNAUTHENTICATED**.

---

## 3. Bedah Akar Masalah di Backend (Root Cause Analysis)

Setelah dilakukan audit ke dalam repositori backend NestJS (`D:\Amanah-healthcare-backend`), ditemukan diskoneksi arsitektural mendasar antara **Engine A (Kanonikal JWT)** dan **Engine B (Better Auth)**:

### 1. `PatientsController` Di-hardcode Hanya Menerima Passport JWT

Lokasi file: `D:\Amanah-healthcare-backend\src\modules\patients\presentation\patients.controller.ts:45`

```typescript
@ApiTags('Patients (Data Pasien & Rekam Medis)')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard) // <-- HANYA AuthGuard('jwt')
@Controller({ path: 'patients', version: '1' })
export class PatientsController {
```

### 2. `JwtStrategy` Mewajibkan String JWT HS256 Bertanda Tangan `auth.secret`

Lokasi file: `D:\Amanah-healthcare-backend\src\auth\strategies\jwt.strategy.ts:19-24`

```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: configService.getOrThrow('auth.secret', { infer: true }),
  algorithms: ['HS256']
});
```

### 3. Alur Kegagalan (Mechanism of Failure):

1. Pengguna login via Google OAuth di frontend &rarr; Ditangani oleh Better Auth (`/api/auth/sign-in/social`).
2. Better Auth menyimpan sesi di tabel PostgreSQL `session` dan menetapkan cookie `better-auth.session_token`.
3. **Better Auth TIDAK PERNAH menerbitkan JWT HS256.** Pengguna Google OAuth hanya memiliki token sesi Better Auth (string _opaque_ acak), bukan JWT bertanda tangan `auth.secret`.
4. Saat frontend mengirim request registrasi pasien ke `/api/v1/patients/registration`:
   - Frontend menyertakan token sesi Better Auth (atau cookie Better Auth).
   - NestJS melemparkan token tersebut ke `AuthGuard('jwt')`.
   - `passport-jwt` mencoba mem-parse string sesi tersebut menggunakan `jsonwebtoken.verify()`.
   - Karena formatnya bukan JWT HS256 dengan secret backend, Passport melempar error: **`401 UNAUTHENTICATED: Unauthorized`**.
5. Bahkan file guard `BetterAuthGuard` di `src/auth/better-auth/guards/better-auth.guard.ts` sudah sempat dibuat oleh tim backend, **tetapi tidak pernah dipasang di controller manapun**.

---

## 4. Solusi Rekomendasi: `HybridAuthGuard` (Dual-Engine Guard)

Agar arsitektur **Dual-Engine** bekerja selaras tanpa memaksa frontend mengotak-atik token rahasia server, backend NestJS harus menyediakan **`HybridAuthGuard`** (atau `DualAuthGuard`) yang dapat menerima **salah satu** dari dua metode otentikasi:

1. **Prioritas 1:** Header `Authorization: Bearer <jwt_token>` (Validasi via `JwtStrategy`).
2. **Prioritas 2:** Cookie sesi `better-auth.session_token` ATAU Header `Authorization: Bearer <better_auth_token>` (Validasi via Better Auth `auth.api.getSession()`).

Jika salah satu valid, format objek pengguna yang disuntikkan ke `request.user` **harus identik** agar `RolesGuard` dan decorator `@CurrentUser()` di controller tetap berjalan normal tanpa perubahan logika bisnis.

---

## 5. Panduan Implementasi Teknis untuk Backend Engineer

### Langkah 1: Buat File `HybridAuthGuard`

Buat file baru di backend:  
`src/common/auth/hybrid-auth.guard.ts` (atau di `src/auth/guards/hybrid-auth.guard.ts`)

```typescript
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { fromNodeHeaders } from 'better-auth/node';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import { auth as betterAuth } from '../../auth/better-auth/auth';
import { DRIZZLE_SOURCE } from '../../database/drizzle/drizzle.constants';
import { DrizzleDatabase } from '../../database/drizzle/drizzle.provider';
import { users } from '../../database/schema';

@Injectable()
export class HybridAuthGuard implements CanActivate {
  private readonly jwtGuard = new (AuthGuard('jwt'))();

  constructor(
    @Inject(DRIZZLE_SOURCE)
    private readonly db: DrizzleDatabase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Coba Otentikasi via Passport JWT terlebih dahulu (Engine A)
    try {
      const jwtResult = await (this.jwtGuard.canActivate(context) as Promise<boolean>);
      if (jwtResult && (request as any).user) {
        return true;
      }
    } catch {
      // Abaikan error JWT, lanjutkan ke evaluasi Better Auth fallback
    }

    // 2. Fallback: Otentikasi via Better Auth Session (Engine B)
    try {
      const session = await betterAuth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      });

      if (!session || !session.user || !session.user.id) {
        throw new UnauthorizedException('Sesi autentikasi tidak valid atau token tidak disertakan');
      }

      if (session.user.banned) {
        throw new UnauthorizedException(session.user.banReason || 'Akun Anda dinonaktifkan');
      }

      // Ambil data profil relasi lengkap (format identik dengan JwtStrategy.validate)
      const userRecord = await this.db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        with: {
          userRoles_userId: {
            with: {
              role: true
            }
          },
          staffProfiles: {
            with: {
              practitioners: true
            }
          },
          patientProfiles: true
        }
      });

      if (!userRecord) {
        throw new UnauthorizedException('Pengguna tidak ditemukan di database');
      }

      const primaryRole = userRecord.userRoles_userId?.[0]?.role;
      let systemRole: 'ADMIN' | 'STAF' | 'PATIENT' = 'PATIENT';
      if (primaryRole?.code === 'admin') {
        systemRole = 'ADMIN';
      } else if (
        primaryRole?.code === 'staff_doctor' ||
        primaryRole?.code === 'staff_midwife' ||
        primaryRole?.code === 'staff_worker' ||
        (userRecord.staffProfiles && userRecord.staffProfiles.length > 0)
      ) {
        systemRole = 'STAF';
      }

      const staffProfile = userRecord.staffProfiles?.[0];
      const patientProfile = userRecord.patientProfiles?.[0];

      // Format `request.user` persis sama dengan output JwtStrategy agar RolesGuard berjalan mulus
      (request as any).user = {
        id: userRecord.id,
        email: userRecord.email,
        systemRole,
        role: {
          id: primaryRole?.id,
          name: systemRole
        },
        staff: staffProfile
          ? {
              id: staffProfile.id,
              practitionerId: staffProfile.practitioners?.[0]?.id || null,
              userId: userRecord.id,
              poliklinikId: staffProfile.primaryUnitId,
              fullName: staffProfile.fullName,
              profession: staffProfile.positionTitle,
              idCardNumber: staffProfile.staffCode,
              photoUrl: staffProfile.avatarUrl,
              phoneNumber: staffProfile.phone,
              isActive: staffProfile.status === 'active'
            }
          : null,
        patient: patientProfile
          ? {
              id: patientProfile.id,
              userId: userRecord.id,
              medicalRecordNumber: patientProfile.medicalRecordNumber,
              nik: patientProfile.nationalIdEncrypted || patientProfile.nationalIdHash || '',
              fullName: patientProfile.fullName,
              gender: patientProfile.gender === 'female' ? 'Perempuan' : 'Laki-laki',
              birthPlace: patientProfile.birthPlace,
              birthDate: patientProfile.birthDate,
              bloodType: patientProfile.bloodType,
              phoneNumber: patientProfile.phone,
              status: patientProfile.status
            }
          : null
      };

      (request as any).session = session.session;
      return true;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Sesi autentikasi tidak valid atau token tidak disertakan');
    }
  }
}
```

---

### Langkah 2: Daftarkan & Ekspor di `AuthModule`

Edit `src/auth/auth.module.ts`:

```typescript
import { HybridAuthGuard } from '../common/auth/hybrid-auth.guard';

@Module({
  // ...
  providers: [
    // ...
    HybridAuthGuard
  ],
  exports: [
    // ...
    HybridAuthGuard
  ]
})
export class AuthModule {}
```

---

### Langkah 3: Pasang `HybridAuthGuard` pada `PatientsController` & `AuthController`

1. **Pada `PatientsController` (`src/modules/patients/presentation/patients.controller.ts`):**
   Ganti:

   ```typescript
   // SEBELUM:
   @UseGuards(AuthGuard('jwt'), RolesGuard)

   // SESUDAH:
   @UseGuards(HybridAuthGuard, RolesGuard)
   ```

2. **Pada Endpoint Profil `GET /api/v1/auth/me` (`src/auth/auth.controller.ts`):**
   Ganti:

   ```typescript
   // SEBELUM:
   @Get('me')
   @UseGuards(AuthGuard('jwt'))

   // SESUDAH:
   @Get('me')
   @UseGuards(HybridAuthGuard)
   ```

3. **(Opsional tetapi Direkomendasikan)**: Terapkan `@UseGuards(HybridAuthGuard, RolesGuard)` juga pada modul appointment, rekam medis, dan klinik agar pengguna Google OAuth dapat bertransaksi penuh.

---

## 6. Skenario Uji Penerimaan Backend (Acceptance Test Cases)

Setelah `HybridAuthGuard` dipasang, tim backend dapat memverifikasi perbaikan dengan 2 pengujian berikut:

### Test 1: Request Menggunakan Token JWT Kanonikal (Engine A)

```bash
# Login Email/Password
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test_patient@amanah.health","password":"Password123!"}' | jq -r '.token')

# Panggil registrasi pasien
curl -s -i -X POST http://localhost:3001/api/v1/patients/registration \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ...17 atribut data pasien... }'
```

**Ekspektasi:** HTTP 201 Created atau HTTP 409 (jika NIK sudah terdaftar). Tidak boleh 401.

### Test 2: Request Menggunakan Cookie Sesi Better Auth / Google OAuth (Engine B)

```bash
# Panggil registrasi pasien dengan menyertakan Cookie Better Auth yang aktif
curl -s -i -X POST http://localhost:3001/api/v1/patients/registration \
  -H "Cookie: better-auth.session_token=<TOKEN_SESI_GOOGLE>" \
  -H "Content-Type: application/json" \
  -d '{ ...17 atribut data pasien... }'
```

**Ekspektasi:** HTTP 201 Created (atau 409 jika sudah terdaftar). Tidak ada error `401 UNAUTHENTICATED: Unauthorized`.

---

## 7. Status & Langkah Selanjutnya

1. Dokumen ini diserahkan kepada tim backend untuk mengimplementasikan `HybridAuthGuard` di server NestJS.
2. Frontend Next.js sudah siap 100% dan telah lolos uji linter, strict typing, dan unit test tanpa mock.
3. Begitu backend menerapkan guard hybrid ini, flow Google OAuth pasien di frontend akan langsung berjalan mulus tanpa perlu refaktor lanjutan.
