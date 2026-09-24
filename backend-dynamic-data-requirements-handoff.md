# Backend Dynamic Data Requirements & API Integration Handoff

**Target Backend Service:** Amanah Healthcare Backend v1.2.0  
**API Specification Version:** Schedule V2 Integration Specification (v2.1.0)  
**Feature Scope:** Scheduled Dokter (`/dashboard/jadwal-dokter`)  
**Auditor / Integration Lead:** Senior Frontend Architect & API Contract Analyst  
**Date:** 2026-09-24  
**Status:** **HANDOFF DOCUMENT APPROVED & READY FOR CONTRACT CONSUMPTION**

---

## 1. Executive Summary & Purpose

Following the forensic audit of the frontend doctor schedule implementation (`frontend-hardcoded-data-dynamicization-audit.md`), multiple legacy assumptions and hardcoded fallbacks were uncovered. These included client-side session interval slicing, conflicting static polyclinic lists, the ambiguous status `"Penuh"`, and an unauthorized session deletion mechanism.

The backend team has authoritatively resolved these architectural flaws in the **Amanah Healthcare Backend v1.2.0 (Schedule V2)**. This document serves as the formal handoff and alignment contract between the Next.js Web Admin frontend and the Backend engineering team, confirming the exact capabilities required, the canonical data contracts, and the operational boundaries.

---

## 2. Core Architectural Invariants

### 2.1 Backend as the Single Source of Truth (Zero Client Arithmetic)
- **Rule:** The frontend will perform **zero arithmetic operations** regarding schedule slots, session durations, shift boundaries, or daily patient capacities.
- **Contract:** All formulas, interval slicing, and capacity derivations reside exclusively in PostgreSQL. The frontend simply renders the projection output returned by the backend.
- **Dynamic Policy:** Consultation durations (default: `30` minutes, configurable to 15, 20, 30, 45, 60 minutes) and shift boundaries reside in the database and are configured per practitioner by Administrators.

### 2.2 Canonical Status Semantics (Deprecation of `Penuh`)
Healthcare clinical outpatient scheduling operates on **discrete 1-on-1 practitioner-patient consultation slots**, not bulk commercial airline passenger seating.
- **`OPEN` (Display Label: `Buka`):** The consultation slot is active and ready for patient booking.
- **`OCCUPIED` (Display Label: `Terisi`):** The consultation slot contains an active, scheduled patient appointment.
- **`CLOSED` (Display Label: `Tutup`):** The consultation slot is unavailable, out of hours, or the doctor is registered on leave (`closedReason: "LEAVE"`).
- **Session Quota Overview:** When all slots in a session are taken, the session overview card displays `0/N slot tersedia`. However, each individual slot on the timeline is authoritatively `OCCUPIED` (`Terisi`). The ambiguous status string `"Penuh"` is completely deprecated.

### 2.3 Strict Administrator Deletion Prohibition
- **Rule:** Sesi jadwal dokter yang telah tercatat dalam sistem **tidak dapat dihapus** oleh administrator (`DELETE` endpoint menolak permintaan dengan status `403 Forbidden` dan kode `ADMIN_SCHEDULE_DELETION_PROHIBITED`).
- **Rationale:** Menjaga integritas jejak audit klinis, riwayat pelayanan pasien, dan mencegah hilangnya histori rekam medis.
- **Prescribed Alternatives:**
  1. Mengubah status sesi menjadi `Tutup` atau `Cuti` via `PATCH /admin/doctor-schedules/:id/sessions/:sessionId` atau `PATCH /admin/doctor-schedules/:id/day-status`.
  2. Melakukan penjadwalan ulang ke tanggal/jam lain via `POST /admin/doctor-schedules/:id/sessions/:sessionId/reschedule`.

---

## 3. Dynamic Data Requirements & Endpoint Catalog

| Endpoint | Method | Backend Capability & Payload | Frontend Consumption & Mapping |
| :--- | :---: | :--- | :--- |
| `/api/v1/admin/doctor-schedules/filter-options` | `GET` | Returns dynamic master data: `poliklinik`, `spesialisasi`, `statuses`. | Populates filter toolbar dropdowns. Replaces hardcoded `POLI_OPTIONS` arrays in `constants/options.ts` and `config/doctor-schedule-filter-options.ts`. |
| `/api/v1/admin/doctor-schedules/:id` | `GET` | Accepts `?date=YYYY-MM-DD` and `?month=YYYY-MM`. Returns doctor details, `monthly_schedule`, and serialized `timeline_intervals`. | Powers the Doctor Detail Sheet. Tab 2 renders `timeline_intervals` directly as a compact Gantt Milestone Timeline. |
| `/api/v1/admin/doctor-schedules/:id/sessions/:sessionId/reschedule` | `POST` | Accepts `RescheduleAdminDoctorSessionDto`. Reschedules shift and auto-shifts patient appointments. | Connects to Doctor Card "Reschedule" button and Detail Sheet action menu via a dedicated Reschedule Modal. |
| `/api/v1/admin/doctor-schedules/:id/duration` | `PATCH` | Accepts `{ consultationDurationMinutes: number, startPrecisionMinutes?: number }`. Configures doctor duration policy. | Powers the Doctor Settings / Practice Duration configuration form. |
| `/api/v1/admin/doctor-schedules/:id/sessions/:sessionId` | `PATCH` | Updates session operational fields: `status_sesi`, `ruang`, `kuota_pasien`, `notes`. | Powers Session Edit modal. |
| `/api/v1/admin/doctor-schedules/:id/days/:date` | `PATCH` | Sets day status: `Buka`, `Cuti`, `Tutup` with reason. | Powers quick day status change from the monthly calendar grid. |
| `/api/v1/admin/doctor-schedules/:id/sessions/:sessionId` | `DELETE` | Strictly returns `403 Forbidden` (`ADMIN_SCHEDULE_DELETION_PROHIBITED`). | Frontend removes the trash icon and `useDeleteDoctorSessionMutation`. |

---

## 4. Serialized Gantt Timeline Contract Specification

### 4.1 Query Request
```http
GET /api/v1/admin/doctor-schedules/:id?date=2026-09-24 HTTP/1.1
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### 4.2 Timeline Interval Schema (`timeline_intervals[*]`)
```typescript
export interface TimelineInterval {
  intervalIndex: number;          // 1-indexed milestone sequence (1, 2, 3...)
  startTime: string;              // "08:45" (HH:mm format)
  endTime: string;                // "09:15" (HH:mm format)
  status: 'OPEN' | 'OCCUPIED' | 'CLOSED';
  displayLabel: 'Buka' | 'Terisi' | 'Tutup';
  isOccupied: boolean;
  appointmentRef: {
    appointmentId: string;
    queueNumber: string;          // e.g. "A-01"
    status: string;               // e.g. "booked"
  } | null;
  closedReason: string | null;    // e.g. "LEAVE", "SCHEDULE_CLOSED"
}
```

### 4.3 Visual Mapping Rules for Frontend Gantt Chart:
- **X-Axis (Milestone Timeline Ticks):** Plotted continuously based on `startTime` of each interval and `endTime` of the terminal interval (e.g. `08:45 → 09:15 → 09:45 → 10:15 → 10:45 → 11:15 → 11:45`).
- **Y-Axis (Practice Lanes):** Grouped by session (`sesi_harian[*].nama_sesi`) and practice room (`ruang_praktik`).
- **Slot Colors:**
  - `OPEN` (`Buka`): Emerald Green (`bg-emerald-500/10 text-emerald-700 border-emerald-500/30`).
  - `OCCUPIED` (`Terisi`): Sky Blue (`bg-sky-500/10 text-sky-700 border-sky-500/30`), displaying `queueNumber` (e.g. `#A-01`).
  - `CLOSED` (`Tutup`): Slate Gray (`bg-muted/40 text-muted-foreground border-border/60`).
- **Occupied Slot Click Interaction:** Displays patient appointment summary (`appointmentRef.queueNumber`, `appointmentRef.status`).

---

## 5. Reschedule Contract Specification

### 5.1 Request
- **Method:** `POST`
- **Path:** `/api/v1/admin/doctor-schedules/:id/sessions/:sessionId/reschedule`
- **Request Body:**
```json
{
  "targetDate": "2026-10-15",
  "targetStartTime": "09:00",
  "targetScheduleContextId": "morning",
  "targetRoomId": "e3067341-a185-484d-91d6-84848fcff1ef",
  "reason": "Dokter berhalangan hadir darurat, sesi dialihkan ke tanggal 15 Oktober",
  "rescheduleActiveAppointments": true
}
```

### 5.2 Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Jadwal dokter berhasil dijadwalkan ulang (rescheduled)",
  "data": {
    "sessionId": "8489be4c-7c05-4c07-b352-7bf579b29cb1",
    "practitionerId": "3cb62e10-450b-43e5-aba9-49ec37079ebb",
    "previousSchedule": {
      "date": "2026-09-24",
      "startTime": "08:45",
      "endTime": "11:45",
      "roomId": "e3067341-a185-484d-91d6-84848fcff1ef"
    },
    "rescheduledSchedule": {
      "id": "8489be4c-7c05-4c07-b352-7bf579b29cb1",
      "scheduleDate": "2026-10-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "timeRange": "09:00 - 12:00 WIB",
      "sessionLabel": "Pagi",
      "sessionShift": "morning",
      "capacity": 6,
      "availableSlots": 5,
      "status": "open",
      "roomId": "e3067341-a185-484d-91d6-84848fcff1ef",
      "notes": "[RESCHEDULED] Dokter berhalangan hadir darurat, sesi dialihkan ke tanggal 15 Oktober"
    },
    "rescheduledAppointmentsCount": 1
  }
}
```

### 5.3 Conflict & Validation Error Codes
Frontend error toasts will display the following localized messages based on backend error codes:
- `PRACTITIONER_ALREADY_SCHEDULED` (409): "Dokter sudah memiliki jadwal praktik lain pada rentang jam tersebut."
- `ROOM_ALREADY_OCCUPIED` (409): "Ruangan target sudah digunakan oleh dokter lain pada jam tersebut."
- `DATE_CLOSED` (409): "Dokter tercatat sedang cuti pada tanggal target."
- `START_OUTSIDE_BOUNDARY` (422): "Jam mulai berada di luar batas operasional shift target."
- `DURATION_LEAVES_NO_CAPACITY` (422): "Jam mulai terlalu dekat dengan akhir batas shift sehingga tidak menghasilkan kuota konsultasi."

---

## 6. Doctor Consultation Duration Configuration Contract

### 6.1 Request
- **Method:** `PATCH`
- **Path:** `/api/v1/admin/doctor-schedules/:id/duration`
- **Request Body:**
```json
{
  "consultationDurationMinutes": 20,
  "startPrecisionMinutes": 1
}
```

### 6.2 Constraints & Semantics
- `consultationDurationMinutes`: Integer between `5` and `240` minutes.
- Changing this value automatically updates future interval generation and capacity calculations for this practitioner across all future sessions.

---

## 7. Data Privacy & PII Compliance

- The backend projection engine guarantees that `timeline_intervals[*].appointmentRef` **never contains sensitive Patient Identifiable Information (PII)** such as NIK, home address, medical diagnoses, or billing info.
- Only safe reference identifiers (`appointmentId`, `queueNumber`, `status`) are transmitted to the Web Admin timeline view, satisfying clinical privacy standards.

---

## 8. Frontend Engineering Action Plan

Upon delivery of this handoff, the Web Admin frontend will proceed with the following updates:
1. **DTOs & Type Synchronization:** Update `src/server/contracts/schedules/doctor-schedules.dto.ts` and `src/features/jadwal-dokter/api/types.ts` to include `timeline_intervals`, `RescheduleAdminDoctorSessionDto`, and `consultationDurationMinutes`.
2. **Path & Mutation Registration:** Register `paths.doctorSchedules.reschedule` and `paths.doctorSchedules.updateDuration` in `src/server/api/paths.ts`. Implement `useRescheduleDoctorSessionMutation` and remove `useDeleteDoctorSessionMutation`.
3. **Gantt Milestone Timeline Component:** Replace `DoctorDailyHourlyGrid` in the Detail Sheet with a minimalist, compact, scrollable Gantt milestone timeline component utilizing TanStack Table or clean SVG/flex grid layout.
4. **Reschedule Modal:** Replace the generic edit modal trigger on the Doctor Card and Detail Sheet with an authentic Reschedule Modal validating date and time inputs.
5. **Purge Static Arrays:** Remove conflicting static `POLI_OPTIONS` arrays in `constants/options.ts` and `config/doctor-schedule-filter-options.ts`, relying 100% on `GET /admin/doctor-schedules/filter-options`.
