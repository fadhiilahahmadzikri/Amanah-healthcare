# Backend Delegation Report: Calendar Level-1 vs Session Level-2 SSOT Synchronization Failure on Reschedule & Day Status Evaluation

**Document Version:** 1.0.0  
**Target Recipient:** Backend Engineering Team (NestJS / Drizzle ORM / PostgreSQL)  
**Author:** Frontend Engineering Team (Next.js Admin Dashboard)  
**Target Backend Service:** `Amanah-healthcare-backend`  
**Severity:** Critical (Breaks Calendar-to-Grid Consistency & Single Source of Truth)  
**Date:** September 24, 2026

---

## 1. Executive Summary

During testing of the doctor schedule reschedule flow for doctor **Ahmadamikom Zikri** (`practitioner_id = c518facb-372e-4f07-9766-f3eacf54221f`), a critical synchronization defect was identified between **Level 1 (Monthly Calendar Status)** and **Level 2 (Session Shifts & Hourly Grid)**.

### The Observed Behavior:

1. An admin rescheduled the only active session on **September 25, 2026 (`2026-09-25`)** to **September 26, 2026 (`2026-09-26`)**.
2. In the **"Jadwal & Kuota"** (Daily Grid) tab, September 25 correctly reflects reality: **0 sessions exist**, all 4 shift blocks are closed/grey.
3. However, in the **"Kalender"** (Monthly Calendar) tab, September 25 **remains GREEN ("Buka")**.
4. Frontend is an uncompromised consumer of the backend Single Source of Truth (SSOT). An audit of the network payloads and backend database confirmed that **the backend API endpoint `GET /api/v1/admin/doctor-schedules/:id` is returning `status: "Buka"` for September 25 despite 0 sessions existing on that date.**

---

## 2. Architectural Paradigm & Domain Invariant

The Amanah Healthcare scheduling system operates on a **3-Level Deterministic Hierarchy**:

```
Level 1: CALENDAR DAY (schedule_date)
         └── Binary Status: BUKA (Green) vs TUTUP (Grey / Neutral)
                 │
                 ▼
Level 2: PRACTITIONER SCHEDULE SESSIONS (Shift Blocks)
         └── Up to 4 Shifts: Dini Hari, Pagi, Siang, Malam
                 │
                 ▼
Level 3: PATIENT CONSULTATION INTERVALS (Slots)
         └── Canonically: OPEN, OCCUPIED, CLOSED
```

### Strict Domain Invariant:

- **Level 1 (Calendar) MUST be a deterministic aggregation of Level 2 (Sessions):**
  - If a day has **at least one active/open session** (`status === 'open'` with available capacity), the calendar day status is **`Buka`**.
  - If a day has **zero sessions**, or **all sessions on that day are `closed` or `leave`**, the calendar day status **MUST BE `Tutup`** (or `Cuti` if a medical leave record exists).
  - **A calendar day must NEVER be marked as `Buka` if there are 0 practicing sessions for that doctor on that date.**

---

## 3. Root Cause Analysis in Backend Codebase

We performed an audit of the backend repository (`D:\Amanah-healthcare-backend`) and PostgreSQL database. Two distinct bugs were identified:

### Bug 1: Flawed Day Status Aggregation in `findAdminDoctorScheduleDetail`

- **File:** `src/modules/schedules/infrastructure/drizzle/schedule.drizzle-repository.ts`
- **Lines:** `2588 – 2599`
- **Code:**

```typescript
} else if (daySessions.length === 0) {
  if (
    daySetting &&
    !daySetting.isLeave &&
    (daySetting.leaveReason === 'Buka' ||
      daySetting.leaveReason === 'open')
  ) {
    dayStatus = 'Buka'; // <--- DEFECT! Doctor has 0 sessions, yet marked "Buka"!
    dayNotes = 'Status dibuka oleh admin';
  } else {
    dayStatus = 'Tutup';
  }
}
```

#### Why this is broken:

When an admin previously touched or opened a day, a row was inserted into `practitioner_schedule_day_settings` with `leave_reason = 'Buka'`.  
When all sessions are subsequently removed or rescheduled away to another day, `daySessions.length` becomes `0`. However, because the backend checks `if (daySetting.leaveReason === 'Buka')`, it artificially overrides `dayStatus` to `'Buka'`.  
Contrast this with `getCalendarSummary` in the same repository (line 1113), which correctly does:

```typescript
} else if (daySessions.length === 0) {
  dayStatus = 'Tutup';
  isClosed = true;
}
```

`findAdminDoctorScheduleDetail` must follow the exact same rule: **0 sessions = `Tutup`**.

---

### Bug 2: Missing Source-Day Cascade in `rescheduleAdminDoctorSession`

- **File:** `src/modules/schedules/infrastructure/drizzle/schedule.drizzle-repository.ts`
- **Lines:** `3392 – 3456`

#### Why this is broken:

In the reschedule transaction:

1. The session in `practitioner_schedule_sessions` is updated: its `schedule_date` is moved from the source date (`2026-09-25`) to the target date (`2026-09-26`).
2. Active patient appointments are moved to the target date.
3. **Missing step:** The backend does **not** check the remaining sessions on the source date!
   - On the source date (`2026-09-25`), a dangling row in `practitioner_schedule_day_settings` was left untouched:
     ```sql
     -- Query result from amanah_healthcare database:
     SELECT id, practitioner_id, schedule_date, target_quota, is_leave, leave_reason
     FROM practitioner_schedule_day_settings
     WHERE practitioner_id = 'c518facb-372e-4f07-9766-f3eacf54221f' AND schedule_date = '2026-09-25';
     -- Result:
     -- id: b60027a3-3957-4266-85c7-19b762ba94ab | is_leave: f | leave_reason: 'Buka'
     ```
   - Because this row was not synchronized or cleared when the source date lost its last remaining session, it permanently corrupted the calendar response.

---

## 4. Required Backend Remediation Specification

The backend team is requested to implement the following fixes and provide a verification changelog:

### 1. Fix `findAdminDoctorScheduleDetail` Aggregation Logic

In `src/modules/schedules/infrastructure/drizzle/schedule.drizzle-repository.ts` (around line 2588):

- When `daySessions.length === 0`, `dayStatus` must unconditionally resolve to `'Tutup'`.
- A doctor with zero scheduled sessions cannot be "Buka".
- Proposed correction:

```typescript
} else if (daySessions.length === 0) {
  dayStatus = 'Tutup';
  dayNotes = null;
}
```

- If all existing sessions on a day are closed (`anyOpen === false`), `dayStatus` must also resolve to `'Tutup'`.

### 2. Update Reschedule Transaction to Handle Source Date State

In `rescheduleAdminDoctorSession` (inside the atomic transaction `tx`):

- After moving the session, count the remaining open sessions for `practitionerId` on `previousSchedule.date`.
- If remaining open sessions on `previousSchedule.date` is `0`:
  - Update or reset `practitioner_schedule_day_settings` for that practitioner and date: set `leave_reason = 'Tutup'` (or delete/reset the open flag) so no stale `'Buka'` marker remains on an empty date.

### 3. Database Cleanup Script

Run a migration or one-time data cleanup to fix existing orphaned records:

```sql
UPDATE practitioner_schedule_day_settings ds
SET leave_reason = 'Tutup', updated_at = NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM practitioner_schedule_sessions s
  WHERE s.practitioner_id = ds.practitioner_id
    AND s.schedule_date = ds.schedule_date
    AND s.status = 'open'
)
AND ds.is_leave = false
AND (ds.leave_reason = 'Buka' OR ds.leave_reason = 'open');
```

---

## 5. Acceptance & Verification Criteria (Contract for Frontend)

The frontend team will verify this fix against the following test cases:

### Test Case 1: Single Session Reschedule from Date A to Date B

1. **Given:** Doctor has exactly 1 session on Date A (e.g. `2026-09-25`).
2. **When:** Admin calls `POST /api/v1/admin/doctor-schedules/:id/sessions/:sessionId/reschedule` to Date B (`2026-09-26`).
3. **Then:**
   - Calling `GET /api/v1/admin/doctor-schedules/:id?month=2026-09` MUST return:
     - `monthly_schedule` item for Date A: `status: "Tutup"`.
     - `monthly_schedule` item for Date B: `status: "Buka"`.
   - Calling `GET /api/v1/admin/doctor-schedules/:id?date=2026-09-25` MUST return `status_dokter: "Tutup"`, `sesi_harian: []`.

### Test Case 2: Multi-Session Reschedule (Partial)

1. **Given:** Doctor has 2 sessions on Date A (Morning and Afternoon).
2. **When:** Admin reschedules only the Morning session to Date B.
3. **Then:**
   - Date A still has 1 open Afternoon session -> Date A MUST remain `status: "Buka"`.
   - Date B now has 1 open Morning session -> Date B MUST become `status: "Buka"`.

### Test Case 3: Rescheduling Last Remaining Session

1. **When:** Admin subsequently reschedules the Afternoon session from Date A to Date C.
2. **Then:**
   - Date A now has 0 remaining open sessions -> Date A MUST immediately transition to `status: "Tutup"`.

---

## 6. Communication & Handoff Protocol

Once the backend fixes have been deployed and verified against the unit/integration tests:

1. Provide the Git commit hash and changelog describing the changes in `schedule.drizzle-repository.ts`.
2. Confirm the database migration/cleanup script execution.
3. The frontend team will immediately run end-to-end verification in the web admin calendar and close the defect ticket.
