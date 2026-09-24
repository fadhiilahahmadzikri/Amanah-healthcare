# Backend Delegation Report: Patient Booking Visibility, 5-Column Grid Showcase, Detail Demographics Modal, and Appointment Cancellation Lifecycle

**Document Version:** 1.0.0  
**Target Audience:** Amanah Healthcare Backend Engineering Team (NestJS, Drizzle ORM, PostgreSQL)  
**Author:** Web Admin Frontend Engineering Team  
**Scope:** Doctor Schedule Administration, Session Slot Visibility, Patient Queue Management, and Appointment Lifecycle State Machine  
**Reference Document:** `# Web Admin — Spesifikasi Resmi & Changelog: Level-1 vs Level-2 SSOT Synchronization on Reschedule & Day Status`  
**Status:** DRAFT / DELEGATION SPECIFICATION  
**Date:** September 24, 2026  

---

## 1. Executive Summary & Purpose

Following the successful resolution and SSOT stabilization of Level-1 (Monthly Calendar) and Level-2 (Daily Sessions) aggregation, the Frontend Web Admin team requires a standardized backend contract and endpoint suite to support **Patient Booking Visibility, Patient Showcase Grid, Comprehensive Patient Demographics, and the Patient Appointment Cancellation & Queue Lifecycle**.

Currently, the Doctor Schedule view presents slot metrics (e.g., `8 / 12` slots filled in a shift session, or `X / Y` accumulated across a daily schedule). However, administrative staff and practitioners currently lack:
1. **Direct Visibility into Booked Patients:** An explicit, authenticated admin endpoint that retrieves the exact roster of patients who booked a specific doctor session or date.
2. **5-Column Grid Showcase Modal:** A responsive UI modal presenting patient cards in a spacious 5-column grid layout (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`). Outer cards must remain minimal (Patient Name, Chief Complaint, Room, Queue/Slot Time, Status Badge), deliberately omitting crowded demographic data (age, NIK, addresses).
3. **Comprehensive Patient Demographic Sub-Modal:** A nested detail modal opened by clicking a card, revealing full civil and clinical identity data (Full Name, NIK, Medical Record Number/No. RM, Gender, Birth Date, Calculated Age, Guardian/Emergency Contact, Phone, Full Address, Reservation Timestamp, Intake Notes).
4. **Appointment Cancellation & Slot Recovery Lifecycle:** A robust, idempotent cancellation mechanism allowing admins or patients to cancel appointments prior to examination, complete with validation guards (disabled if in-service or completed), late/no-show status handling, and **automatic slot restoration cascading** back into `practitioner_schedule_sessions`.

---

## 2. Domain Invariants & State Machine Specification

### 2.1 The 5 Essential Queue & Appointment Lifecycle Statuses

The backend database currently defines the `appointment_status` enum as `('booked', 'checked_in', 'waiting', 'in_service', 'completed', 'cancelled', 'no_doctor', 'no_show')`. The frontend requires the administrative contract to map these into clear operational states:

```
                  ┌──────────────┐
                  │    BOOKED    │ (Initial patient registration)
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   WAITING    │ (Checked-in, waiting in clinic queue)
                  └──────┬───────┘
           ┌─────────────┼─────────────┐
           │             │             │
   (Late/No-Show) (Doctor calls) (Cancelled prior to start)
           │             │             │
           ▼             ▼             ▼
     ┌───────────┐ ┌───────────┐ ┌───────────┐
     │  NO_SHOW  │ │IN_SERVICE │ │ CANCELLED │
     │  (Telat)  │ │ (Di Sesi) │ │  (Batal)  │
     └───────────┘ └─────┬─────┘ └───────────┘
                         │
                 (Exam completed)
                         │
                         ▼
                   ┌───────────┐
                   │ COMPLETED │
                   │ (Selesai) │
                   └───────────┘
```

| Domain Status Code | Indonesian Label | Allowed Transitions | Description |
| :--- | :--- | :--- | :--- |
| `waiting` / `checked_in` | **Menunggu (Antrean)** | `-> in_service`, `-> cancelled`, `-> no_show` | Patient has confirmed attendance and is in the clinic waiting area. |
| `in_service` | **Sedang Diperiksa (Dalam Sesi)** | `-> completed` | Patient has been called by the practitioner and is currently inside the examination room. |
| `completed` | **Selesai Pemeriksaan** | *Terminal state* (None) | Clinical examination and electronic medical record (EMR) entry concluded. |
| `no_show` / `late` | **Terlambat / Tidak Hadir** | `-> cancelled` (optional) | Patient failed to attend their booked time slot within clinic grace period tolerance (e.g., > 15-30 mins late). |
| `cancelled` | **Dibatalkan** | *Terminal state* (None) | Appointment cancelled by patient or admin prior to examination start. |

---

### 2.2 Appointment Cancellation Rules & Slot Cascading Invariants

1. **Pre-Service Cancellation Window:**
   - Cancellation is **ONLY PERMITTED** when an appointment is in `booked`, `waiting`, or `no_show` status.
   - An appointment in `in_service` (patient actively inside the room) or `completed` (medical consultation concluded) **MUST REJECT CANCELLATION** with `400 Bad Request` or `422 Unprocessable Entity`.
2. **Idempotency & Button Disabling:**
   - If an appointment is already `cancelled`, subsequent cancellation requests must be handled idempotently (returning the existing cancelled state without error or double-incrementing slots).
   - In the frontend UI, the "Batalkan Janji Temu" button is **strictly disabled** if `status === 'cancelled'`, `status === 'in_service'`, or `status === 'completed'`.
3. **Slot Recovery Cascade (`available_slots` Increment):**
   - When an appointment tied to a `practitioner_schedule_sessions` is cancelled or marked `no_show`, the backend transaction **MUST atomically increment** `practitioner_schedule_sessions.available_slots` by `1` (capped at `capacity`), and decrement occupied slot count.
   - If the session status was previously `'terisi'` / `'full'` (`available_slots === 0`), restoring a slot **MUST automatically transition the session status back to `'open'`** and update the parent day/calendar status accordingly.
4. **Queue Plotting & Subsequent Delegation:**
   - In the sequential queue model (e.g. 08:00 - 08:30 consumes slot 1, 08:30 - 09:00 consumes slot 2), releasing a cancelled slot makes that time window available again for walk-ins or waitlisted patient reallocation.

---

## 3. Required REST Endpoints & Contracts

### 3.1 Endpoint 1: Get Booked Patients for a Specific Session

Retrieves all patient bookings assigned to a specific schedule shift session.

* **Route:** `GET /api/v1/admin/doctor-schedules/:id/sessions/:sessionId/patients`
* **Alternative Query Route:** `GET /api/v1/admin/doctor-schedules/sessions/:sessionId/booked-patients`
* **HTTP Method:** `GET`
* **Auth Guard:** `@Roles('ADMIN', 'STAF')`
* **Query Parameters:**
  ```typescript
  export class GetSessionPatientsQueryDto {
    @IsOptional()
    @IsEnum(['waiting', 'in_service', 'completed', 'cancelled', 'no_show', 'all'])
    status?: string = 'all';

    @IsOptional()
    @IsString()
    search?: string; // Search by patient name or medical record number
  }
  ```

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "8489be4c-7c05-4c07-b352-7bf579b29cb1",
    "sessionLabel": "Pagi",
    "shift": "Pagi",
    "scheduleDate": "2026-09-24",
    "startTime": "08:00",
    "endTime": "11:30",
    "capacity": 12,
    "availableSlots": 4,
    "bookedCount": 8,
    "clinicRoom": {
      "id": "e4b2d189-9a71-46f9-8d77-628a8d11e5a1",
      "name": "Ruang Poli Umum 1",
      "floor": "Lantai 1"
    },
    "patients": [
      {
        "appointmentId": "6d3a26e2-77fb-466d-9096-d3b2400c443d",
        "queueTicketId": "9fa87102-4412-4211-91a1-872f2aa56e99",
        "queueNumber": "P-001",
        "timeSlot": "08:00 - 08:30 WIB",
        "status": "waiting",
        "statusBadge": "Menunggu",
        "chiefComplaint": "Demam tinggi 3 hari dan batuk berdahak",
        "clinicRoomName": "Ruang Poli Umum 1",
        "isCancellable": true,
        "patient": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "fullName": "Ahmad Dahlan",
          "medicalRecordNumber": "RM-2026-00891",
          "nik": "3201234567890001",
          "gender": "Laki-laki",
          "birthDate": "1994-05-14",
          "age": "32 Thn",
          "phoneNumber": "081234567890",
          "email": "ahmad.dahlan@example.com",
          "address": "Jl. Merdeka No. 45, RT 02/RW 05, Kel. Cibinong, Kab. Bogor",
          "guardianName": "Siti Aminah (Istri)",
          "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
        },
        "bookingMetadata": {
          "bookedAt": "2026-09-23T14:20:00.000Z",
          "checkedInAt": "2026-09-24T07:45:00.000Z",
          "startedAt": null,
          "completedAt": null,
          "cancelledAt": null,
          "cancelReason": null
        }
      }
    ]
  }
}
```

---

### 3.2 Endpoint 2: Get Doctor's Accumulated Booked Patients by Date

For daily accumulation and search across all 4 sessions of the day (Dini Hari, Pagi, Siang, Malam).

* **Route:** `GET /api/v1/admin/doctor-schedules/:id/patients`
* **HTTP Method:** `GET`
* **Auth Guard:** `@Roles('ADMIN', 'STAF')`
* **Query Parameters:**
  - `date`: `YYYY-MM-DD` (Required, e.g. `2026-09-24`)
  - `sessionShift`: Optional (`dini_hari`, `pagi`, `siang`, `malam`)
  - `status`: Optional (`waiting`, `in_service`, `completed`, `cancelled`, `no_show`)

#### Response Summary Structure:
```json
{
  "success": true,
  "data": {
    "doctorId": "123e4567-e89b-12d3-a456-426614174000",
    "doctorName": "dr. H. Muhammad Fadhil, Sp.PD",
    "date": "2026-09-24",
    "accumulatedCapacity": 48,
    "accumulatedBookedCount": 18,
    "accumulatedAvailableSlots": 30,
    "sessions": [
      {
        "sessionId": "uuid-session-1",
        "sessionLabel": "Dini Hari",
        "bookedCount": 2,
        "capacity": 12,
        "patients": [...]
      },
      {
        "sessionId": "uuid-session-2",
        "sessionLabel": "Pagi",
        "bookedCount": 8,
        "capacity": 12,
        "patients": [...]
      }
    ]
  }
}
```

---

### 3.3 Endpoint 3: Cancel Patient Appointment (With Slot Restoration)

Cancels an appointment and immediately triggers slot recovery in `practitioner_schedule_sessions`.

* **Route:** `PATCH /api/v1/admin/appointments/:appointmentId/cancel`
* **HTTP Method:** `PATCH`
* **Auth Guard:** `@Roles('ADMIN', 'STAF', 'PATIENT')`
* **Request Body Schema:**
  ```typescript
  export class CancelAppointmentDto {
    @ApiProperty({
      description: 'Alasan pembatalan janji temu',
      example: 'Pasien terlambat melebihi 30 menit atau berhalangan hadir',
    })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiPropertyOptional({
      description: 'Menandai apakah pembatalan disebabkan karena pasien terlambat (No-Show)',
      example: true,
    })
    @IsOptional()
    @IsBoolean()
    isNoShow?: boolean;
  }
  ```

#### Success Response: `200 OK`
```json
{
  "success": true,
  "message": "Janji temu berhasil dibatalkan dan 1 slot kuota sesi telah dipulihkan",
  "data": {
    "appointmentId": "6d3a26e2-77fb-466d-9096-d3b2400c443d",
    "previousStatus": "waiting",
    "newStatus": "cancelled",
    "cancelledAt": "2026-09-24T08:35:12.104Z",
    "cancelReason": "Pasien terlambat melebihi toleransi waktu (No-Show)",
    "scheduleSession": {
      "sessionId": "8489be4c-7c05-4c07-b352-7bf579b29cb1",
      "restoredAvailableSlots": 5,
      "totalCapacity": 12,
      "sessionStatus": "open"
    }
  }
}
```

#### Error Response: `400 Bad Request` (Attempt to cancel active or completed consultation)
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Janji temu tidak dapat dibatalkan karena pasien sedang dalam pemeriksaan dokter atau telah selesai."
}
```

---

### 3.4 Endpoint 4: Update Appointment Queue Status (Lifecycle Transition)

For moving patients through the consultation workflow.

* **Route:** `PATCH /api/v1/admin/appointments/:appointmentId/status`
* **HTTP Method:** `PATCH`
* **Auth Guard:** `@Roles('ADMIN', 'STAF')`
* **Request Body:**
  ```json
  {
    "status": "in_service", // Options: "waiting", "in_service", "completed", "no_show", "cancelled"
    "reason": "Pasien dipanggil masuk ke Ruang Poli Umum 1"
  }
  ```

---

## 4. Frontend UI Architectural Contract

### 4.1 Showcase Card on Doctor Schedule Listing (`DoctorScheduleCard`)
1. **Upcoming Schedule Badge ("Jadwal Praktik Mendatang"):**
   - Must evaluate the closest upcoming session based on real-time current hour (`currentMinutes`).
   - If an ongoing session is active, highlight the active session. If upcoming, show the earliest future shift.
2. **Accumulated Slot Display ("Slot Terisi / Kapasitas"):**
   - Formula: `${accumulatedBookedSlots} / ${accumulatedTotalCapacity}` (e.g. `8 / 24` or `18 / 48`).
   - `X` represents the total active bookings for that day.
   - `Y` represents the total dynamic capacity across all active sessions.

---

### 4.2 Modal 1: Booked Patients 5-Column Grid Showcase Modal

When an administrator clicks on a session's slot badge (e.g. `8 / 12 Terisi`) or clicks "Lihat Pasien Terdaftar", a spacious modal renders.

* **Grid Breakpoints:**  
  `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5`
* **Outer Card Information Hierarchy (Strict Minimalism):**
  1. **Queue Number & Time Slot:** e.g., `#P-003 • 08:30 WIB`
  2. **Patient Full Name:** Prominent semi-bold title (e.g., `Budi Santoso`).
  3. **Chief Complaint ("Sakit / Keluhan"):** Short badge or 1-line truncated note (e.g., `Sakit Kepala & Mual`).
  4. **Room Name:** (e.g., `Ruang Poli Umum 1`).
  5. **Status Badge:** Pill indicator (`Menunggu`, `Di Sesi`, `Terlambat`, `Batal`, `Selesai`).
  *Excluded from outer card:* Age, NIK, No. RM, Gender, Full Address. This ensures cards fit comfortably in 5 columns without visual crowding.

---

### 4.3 Modal 2: Patient Demographic & Reservation Detail Sub-Modal

Clicking any card in the 5-column grid opens the nested Detail Sub-Modal containing:
1. **Complete Demographics:**
   - Nama Lengkap (Full Name)
   - NIK (16 Digits)
   - No. Rekam Medis (Medical Record No.)
   - Jenis Kelamin (Gender)
   - Tanggal Lahir & Usia (Birth Date & Calculated Age, e.g. `14 Mei 1994 (32 Tahun)`)
   - Kontak / No. WhatsApp
   - Nama Wali / Kontak Darurat (Guardian)
   - Alamat KTP & Domisili Lengkap (Full Address)
2. **Clinical Reservation Details:**
   - Waktu Booking & Waktu Datang (Check-in time)
   - Keluhan Lengkap (Chief Complaint)
   - Catatan Medis Awal (Intake Notes)
   - Poliklinik & Ruang Pemeriksaan
3. **Action Footer:**
   - Button **"Batalkan Janji Temu"** (Destructive outline/ghost style).
   - Disabled with tooltip if status is `cancelled`, `in_service`, or `completed`.
   - Clicking opens confirmation alert requiring a cancellation reason input.

---

## 5. Drizzle ORM Transaction Blueprint (For Backend Implementation)

Backend engineers can apply the following atomic transaction pattern when implementing `cancelAppointment`:

```typescript
// Location: src/modules/appointments/infrastructure/drizzle/appointment.drizzle-repository.ts
await this.db.transaction(async (tx) => {
  // 1. Fetch current appointment with lock
  const [apt] = await tx
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .for('update');

  if (!apt) throw new NotFoundException('Janji temu tidak ditemukan');

  // Guard: Reject if already in service or completed
  if (apt.status === 'in_service' || apt.status === 'completed') {
    throw new BadRequestException(
      'Janji temu tidak dapat dibatalkan karena pasien sedang diperiksa atau telah selesai.'
    );
  }

  // Idempotent: If already cancelled, return existing record
  if (apt.status === 'cancelled') {
    return apt;
  }

  const nowIso = new Date().toISOString();

  // 2. Mark appointment and queue ticket as cancelled
  await tx
    .update(appointments)
    .set({
      status: 'cancelled',
      cancelledAt: nowIso,
      cancelReason: reason,
      updatedAt: nowIso,
    })
    .where(eq(appointments.id, appointmentId));

  await tx
    .update(queueTickets)
    .set({
      status: 'cancelled',
      updatedAt: nowIso,
    })
    .where(eq(queueTickets.appointmentId, appointmentId));

  // 3. Atomically restore available slot in practitioner_schedule_sessions
  if (apt.scheduleSessionId) {
    const [session] = await tx
      .select()
      .from(practitionerScheduleSessions)
      .where(eq(practitionerScheduleSessions.id, apt.scheduleSessionId))
      .for('update');

    if (session) {
      const newAvailable = Math.min(session.capacity, session.availableSlots + 1);
      const newStatus = session.status === 'terisi' && newAvailable > 0 ? 'open' : session.status;

      await tx
        .update(practitionerScheduleSessions)
        .set({
          availableSlots: newAvailable,
          status: newStatus,
          updatedAt: nowIso,
        })
        .where(eq(practitionerScheduleSessions.id, session.id));
    }
  }

  // 4. Record audit and history log
  await tx.insert(appointmentStatusEvents).values({
    appointmentId,
    previousStatus: apt.status,
    newStatus: 'cancelled',
    changedBy: actorUserId,
    reason: reason,
  });
});
```

---

## 6. Frontend Query Invalidation Contract

Upon receiving a successful `200 OK` from `cancelAppointment` or `updateStatus`, the frontend will invalidate the following TanStack React Query keys:

```typescript
// TanStack Query Cache Invalidation
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] }),
  queryClient.invalidateQueries({ queryKey: ['doctor-schedule-detail', doctorId] }),
  queryClient.invalidateQueries({ queryKey: ['session-booked-patients', sessionId] }),
  queryClient.invalidateQueries({ queryKey: ['daily-queue', date] }),
]);
```

---

## 7. Acceptance Criteria for Backend Team

| ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **AC-01** | Query booked patients for session with 8 bookings | Returns array of 8 patient objects with full demographic and appointment data. |
| **AC-02** | Filter booked patients by status (`waiting`) | Returns only patients currently in `waiting` status. |
| **AC-03** | Cancel appointment in `waiting` status | Updates status to `cancelled`, sets `cancelled_at` & `cancel_reason`. |
| **AC-04** | Slot recovery check on cancellation | `practitioner_schedule_sessions.available_slots` increments by 1. |
| **AC-05** | Session status recovery on cancellation | If session was `terisi` (0 available), status transitions back to `open`. |
| **AC-06** | Cancel appointment in `in_service` status | Returns `400 Bad Request` with descriptive rejection message. |
| **AC-07** | Cancel appointment in `completed` status | Returns `400 Bad Request` with descriptive rejection message. |
| **AC-08** | Idempotent cancellation on already cancelled appointment | Returns `200 OK` with existing cancelled record without incrementing slots again. |
| **AC-09** | Mark appointment as `no_show` / `late` | Updates status to `no_show`, records event log, restores slot if configured. |
| **AC-10** | Patient demographic data completeness | Response includes NIK, No. RM, Gender, Birth Date, Calculated Age, Phone, Address, Guardian. |

---

*End of Delegation Report. Please review and provide the delivery changelog once implemented.*
