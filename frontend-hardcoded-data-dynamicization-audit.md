# FRONTEND HARDCODED DATA DYNAMICIZATION AUDIT

## 1. Audit Context

- **Context:** Scheduled Dokter (`jadwal-dokter` / Doctor Outpatient Practice Schedules)
- **Repository:** `D:\manage-stock` (Amanah Healthcare Management System)
- **Frontend Stack:** Next.js 16 (App Router, Server Actions, RSC), React 19, TypeScript 5.7, TanStack Query v5, TanStack Table v8, Nuqs (URL state), Tailwind CSS v4, shadcn/ui & Radix UI primitives.
- **Scope:** Feature `src/features/jadwal-dokter` (API, components, config, constants, model, utils), shared clinical design tokens (`src/styles/clinical-tokens.ts`), server contract DTOs (`src/server/contracts/schedules`), and routes (`src/app/dashboard/jadwal-dokter`).
- **Audit Mode:** **STRICT READ-ONLY INVESTIGATION**. Zero source code modifications, zero component alterations, zero refactoring executed.

---

## 2. Architecture Observed

- **Routing & Page Structure:**
  - Route: `src/app/dashboard/jadwal-dokter/page.tsx` (RSC protected by `requireAdmin()`).
  - Container: `DoctorScheduleListingPage` (`src/features/jadwal-dokter/components/doctor-schedule-listing.tsx`) prefetching `doctorScheduleQueryOptions` via `HydrationBoundary` and rendering `DoctorScheduleView`.
- **State Management & URL Synchronization:**
  - URL Search Params: Managed via `nuqs` in `useDoctorScheduleView.ts` (`page`, `perPage`, `search`, `month`, `date`, `poli`, `status`) with shallow routing to prevent RSC round-trips.
  - Dialog / Sheet State: React local state (`activeDialog: 'detail' | 'edit' | null`, `selectedDoctor: DoctorSchedule | null`).
- **Data Fetching & Cache Management:**
  - TanStack React Query v5 with query key factories in `query-keys.ts` (`['doctor-schedules', 'list', ...]`, `['doctor-schedules', 'detail', ...]`, `['doctor-schedules', 'filter-options']`).
  - Mutations in `mutations.ts` invalidating `doctorScheduleKeys.all`.
- **API & Transport Layer:**
  - Next.js Server Actions in `doctor-schedule-actions.ts` (`'use server'`) delegating to server-only service in `doctor-schedule-service.ts`.
  - HTTP Client: `httpClient` calling backend endpoint paths defined in `src/server/api/paths.ts` with bearer token resolved from cookie/session.
- **Static Data & Config Structure:**
  - Static filter options and options arrays located in `constants/options.ts` and `config/doctor-schedule-filter-options.ts`.
  - Static clinical badge token mapper in `src/styles/clinical-tokens.ts`.
- **Type & Schema System:**
  - Zod schemas in `src/server/contracts/schedules/doctor-schedules.dto.ts`.
  - TypeScript contracts in `src/features/jadwal-dokter/api/types.ts`.

---

## 3. Search Coverage

The investigation audited 100% of the relevant files in the doctor scheduling scope from start to finish:

- `src/server/contracts/schedules/doctor-schedules.dto.ts` (Lines 1–189 of 189)
- `src/server/api/paths.ts` (Lines 1–52 of 52)
- `src/features/jadwal-dokter/index.ts` (Lines 1–3 of 3)
- `src/features/jadwal-dokter/api/types.ts` (Lines 1–142 of 142)
- `src/features/jadwal-dokter/api/service.ts` (Lines 1–132 of 132)
- `src/features/jadwal-dokter/api/doctor-schedule-actions.ts` (Lines 1–79 of 79)
- `src/features/jadwal-dokter/api/doctor-schedule-service.ts` (Lines 1–222 of 222)
- `src/features/jadwal-dokter/api/queries.ts` (Lines 1–39 of 39)
- `src/features/jadwal-dokter/api/query-keys.ts` (Lines 1–31 of 31)
- `src/features/jadwal-dokter/api/mutations.ts` (Lines 1–132 of 132)
- `src/features/jadwal-dokter/api/doctor-schedule.test.ts` (Lines 1–352 of 352)
- `src/features/jadwal-dokter/constants/options.ts` (Lines 1–20 of 20)
- `src/features/jadwal-dokter/config/doctor-schedule-filter-options.ts` (Lines 1–27 of 27)
- `src/features/jadwal-dokter/model/useDoctorScheduleView.ts` (Lines 1–148 of 148)
- `src/features/jadwal-dokter/components/doctor-schedule-filters.tsx` (Lines 1–173 of 173)
- `src/features/jadwal-dokter/components/doctor-schedule-card.tsx` (Lines 1–573 of 573)
- `src/features/jadwal-dokter/components/doctor-schedule-detail-sheet.tsx` (Lines 1–401 of 401)
- `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx` (Lines 1–800 of 800)
- `src/features/jadwal-dokter/components/doctor-timeline-calendar.tsx` (Lines 1–640 of 640)
- `src/features/jadwal-dokter/components/doctor-calendar-grid.tsx` (Lines 1–176 of 176)
- `src/features/jadwal-dokter/components/doctor-add-session-modal.tsx` (Lines 1–300 of 300)
- `src/features/jadwal-dokter/components/doctor-edit-session-modal.tsx` (Lines 1–261 of 261)
- `src/features/jadwal-dokter/components/doctor-schedule-edit-modal.tsx` (Lines 1–258 of 258)
- `src/features/jadwal-dokter/components/doctor-tables/columns.tsx` (Lines 1–221 of 221)
- `src/features/jadwal-dokter/components/doctor-tables/cell-action.tsx` (Lines 1–104 of 104)
- `src/features/jadwal-dokter/components/doctor-tables/doctor-table.tsx` (Lines 1–101 of 101)
- `src/features/jadwal-dokter/utils/leave-calculator.ts` (Lines 1–51 of 51)
- `src/styles/clinical-tokens.ts` (Lines 1–263 of 263)
- `src/app/dashboard/jadwal-dokter/page.tsx` (Lines 1–31 of 31)

---

## 4. Executive Finding

```text
===================================================================================
EXECUTIVE FINDING: DYNAMICIZATION CANDIDATES FOUND & CONTRACT MISALIGNMENT DETECTED
===================================================================================
```

**Forensic Summary:**

1. **Critical Source-of-Truth Drift:** Polyclinic lists are hardcoded in two separate files with conflicting entries (5 items in `constants/options.ts` vs 12 items in `config/doctor-schedule-filter-options.ts`), even though a backend API (`GET /admin/doctor-schedules/filter-options`) already exists.
2. **Ambiguous & Deprecated Status Paradigms:** The frontend extensively hardcodes and branches upon `'Penuh'` (commercial airline bulk capacity paradigm) and treats `'Cuti'` as an ad-hoc master status, whereas the clinical domain operates on discrete consultation intervals (`OPEN` / `Buka`, `OCCUPIED` / `Terisi`, `CLOSED` / `Tutup`). The canonical status `OCCUPIED` (`Terisi`) is completely absent from frontend types, DTOs, and token systems.
3. **Violations of Backend SSOT & Zero Client Arithmetic:** The frontend performs client-side synthetic session division (`SHIFTS` with 4 fixed 6-hour windows in `doctor-daily-hourly-grid.tsx` and `PRESET_SESSIONS` in `doctor-add-session-modal.tsx`), along with manual summation of quota and slots, bypassing the backend Schedule V2 serialized milestone projection engine (`timeline_intervals`).
4. **Illegal Operational Actions (Contract Violation):** The frontend UI exposes session deletion (`Icons.trash` calling `DELETE /sessions/:sessionId`), directly conflicting with Backend Contract V2.1.0 Section 1.3 & 5 which strictly prohibits Admin session deletion (`403 Forbidden` with `ADMIN_SCHEDULE_DELETION_PROHIBITED`).
5. **Missing Critical V2 Business Workflows:** The frontend lacks integration with `POST .../sessions/:sessionId/reschedule` (rescheduling shift and auto-shifting patient appointments) and `PATCH .../duration` (configuring dynamic doctor consultation durations such as 15, 20, 30, 45, 60 minutes).

---

## 5. Candidate Inventory

| ID         | Concept                            | Source / File                                                       | Current Form                                               | Classification         | Ownership                                         |
| :--------- | :--------------------------------- | :------------------------------------------------------------------ | :--------------------------------------------------------- | :--------------------- | :------------------------------------------------ |
| **HD-001** | Poliklinik Master Data             | `constants/options.ts` & `config/doctor-schedule-filter-options.ts` | Hardcoded Arrays (5 vs 12 items)                           | **STRONG CANDIDATE**   | Backend Domain Ownership                          |
| **HD-002** | Schedule & Slot Status Paradigm    | `constants/options.ts`, `clinical-tokens.ts`, DTOs                  | String Unions & Enums (`'Buka'\|'Penuh'\|'Cuti'\|'Tutup'`) | **STRONG CANDIDATE**   | Shared Contract (Backend Enum + Frontend Tokens)  |
| **HD-003** | Shift Presets & Hourly Windows     | `doctor-daily-hourly-grid.tsx` & `doctor-add-session-modal.tsx`     | Hardcoded Array Objects (`SHIFTS`, `PRESET_SESSIONS`)      | **STRONG CANDIDATE**   | Backend Projection Engine Ownership               |
| **HD-004** | Available Calendar Years           | `doctor-timeline-calendar.tsx` (Line 56)                            | Static Number Array `[2024, 2025, 2026, 2027]`             | **POSSIBLE CANDIDATE** | Frontend Dynamic Calculation / Configuration      |
| **HD-005** | Capacity & Quota Derivation        | `doctor-daily-hourly-grid.tsx` & `doctor-schedule-edit-modal.tsx`   | Client-Side Arithmetic & Form Inputs                       | **STRONG CANDIDATE**   | Backend Calculation (Zero Client Arithmetic)      |
| **HD-006** | Session Deletion Mutation          | `doctor-daily-hourly-grid.tsx` & `mutations.ts`                     | Client Action & Mutation (`deleteSession`)                 | **STRONG CANDIDATE**   | Prohibited Operation (Backend Contract Violation) |
| **HD-007** | Session Reschedule Workflow        | `doctor-schedule-card.tsx`                                          | Fallback calling Edit Modal                                | **STRONG CANDIDATE**   | Backend Domain Workflow (`POST .../reschedule`)   |
| **HD-008** | Consultation Duration Policy       | None in UI (Missing)                                                | Not Implemented                                            | **STRONG CANDIDATE**   | Backend Dynamic Policy (`PATCH .../duration`)     |
| **HD-009** | Serialized Gantt Timeline Interval | `doctor-daily-hourly-grid.tsx`                                      | Synthetic 24h Hourly Matrix                                | **STRONG CANDIDATE**   | Backend Projection (`timeline_intervals`)         |

---

## 6. Strong Database/API Candidates

### HD-001 — Poliklinik / Clinical Department Master Data

- **Current Definition:**
  - `src/features/jadwal-dokter/constants/options.ts:13-19`:
    ```typescript
    export const POLI_OPTIONS = [
      { label: 'Penyakit Dalam', value: 'Penyakit Dalam' },
      { label: 'Dokter Umum', value: 'Dokter Umum' },
      { label: 'Spesialis Anak', value: 'Spesialis Anak' },
      { label: 'Spesialis Kandungan', value: 'Spesialis Kandungan' },
      { label: 'Spesialis Kulit', value: 'Spesialis Kulit' }
    ];
    ```
  - `src/features/jadwal-dokter/config/doctor-schedule-filter-options.ts:1-14`:
    ```typescript
    export const POLI_OPTIONS = [
      'Penyakit Dalam',
      'Spesialis Anak',
      'Kebidanan & Kandungan',
      'Dokter Gigi',
      'Ortopedi & Traumatologi',
      'Dermatologi',
      'Jantung & Kardiovaskular',
      'Spesialis Mata',
      'Spesialis THT',
      'Kesehatan Jiwa & Psikiatri',
      'Neurologi / Saraf',
      'Dokter Umum'
    ] as const;
    ```
- **File & Symbol:** `constants/options.ts` (`POLI_OPTIONS`), `config/doctor-schedule-filter-options.ts` (`POLI_OPTIONS`).
- **Consumers:** `doctor-schedule-filters.tsx`, `useDoctorScheduleView.ts`.
- **Current Values:** 5 values in constants vs 12 values in config.
- **Domain Meaning:** Clinical organizational units / polyclinics where practitioners are assigned.
- **Why It Is Hardcoded Today:** Legacy scaffolding created before backend filter API was connected; left behind as fallback.
- **Assessment Dimensions:**
  - Mutability: **HIGH** (Clinics add, rename, or deactivate departments).
  - Cardinality Growth: **HIGH** (Grows as the hospital expands services).
  - Business Ownership: **HIGH** (Hospital management & operations).
  - Cross-Client Relevance: **HIGH** (Web Admin, Mobile Doctor App, Patient Portal).
  - Relationship Relevance: **HIGH** (Doctors, rooms, and appointments belong to polyclinics).
  - Persistence Need: **HIGH** (Stored in PostgreSQL `clinical_units` / `poliklinik` table).
- **Evidence:** `GET /api/v1/admin/doctor-schedules/filter-options` already returns `poliklinik: [{ id, name, code }]`.
- **Why Static Frontend Ownership Is Risky:** Divergence between files, broken filters when clinics add new specialties, frontend redeployment required for clinic administrative changes.
- **Likely Authoritative Owner:** Backend PostgreSQL Master Data (`poliklinik` / `clinic_units`).
- **Frontend Requirement:** Frontend must solely consume `filterOptionsData.poliklinik` from `GET /admin/doctor-schedules/filter-options`, removing the duplicate hardcoded arrays.
- **Backend Capability Needed:** Verified existing (`GET /admin/doctor-schedules/filter-options`).
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-002 — Canonical Status Paradigm (Deprecation of `Penuh`, Introduction of `Terisi`)

- **Current Definition:**
  - `src/styles/clinical-tokens.ts:120-262` (`getStatusConfig`): maps `PENUH` to `status.pending` with label `'Penuh'`. No mapping for `OCCUPIED` or `TERISI`.
  - `src/server/contracts/schedules/doctor-schedules.dto.ts:3`:
    ```typescript
    export const scheduleDayStatusSchema = z.enum(['Buka', 'Penuh', 'Cuti', 'Tutup']);
    ```
  - `src/features/jadwal-dokter/api/types.ts:1-2`: `ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti' | 'Tutup'`.
  - `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx:24`: `HourlySlotStatus = 'buka' | 'penuh' | 'tutup' | 'cuti'`.
  - `src/features/jadwal-dokter/components/doctor-timeline-calendar.tsx:21`: `SimpleScheduleStatus = 'buka' | 'cuti' | 'penuh' | 'tutup'`.
- **File & Symbol:** `clinical-tokens.ts`, `doctor-schedules.dto.ts`, `types.ts`, `doctor-daily-hourly-grid.tsx`, `doctor-timeline-calendar.tsx`.
- **Consumers:** Doctor table columns, schedule card badges, monthly calendar cells, hourly cells, filter dropdowns.
- **Current Values:** `'Buka'`, `'Penuh'`, `'Cuti'`, `'Tutup'`.
- **Domain Meaning:** Operational availability of clinical consultation time slots.
- **Why It Is Hardcoded Today:** Scaffolding mirrored generic appointment booking concepts rather than clinical queue-based outpatient intervals.
- **Assessment Dimensions:**
  - Mutability: **LOW** (Finite domain semantics, but definitions must be exact).
  - Cardinality Growth: **LOW** (Fixed semantic states: `OPEN`, `OCCUPIED`, `CLOSED`).
  - Business Ownership: **HIGH** (Clinical practice governance).
  - Cross-Client Relevance: **HIGH** (Mobile doctor input, Web Admin oversight, Patient booking).
  - Relationship Relevance: **HIGH** (Slot status directly maps to appointment records).
  - Persistence Need: **HIGH** (PostgreSQL enum / projection status).
- **Evidence:** Backend Specification V2.1.0 Section 1.2 canonicalizes:
  - `OPEN` (`displayLabel: "Buka"`)
  - `OCCUPIED` (`displayLabel: "Terisi"`)
  - `CLOSED` (`displayLabel: "Tutup"`, with `closedReason: "LEAVE"` or `"SCHEDULE_CLOSED"`)
  - `Penuh` is explicitly deprecated. Quota overview shows `0/N slot tersedia`.
- **Why Static Frontend Ownership Is Risky:** Ambiguity confuses clinicians and patients; frontend displays "Penuh" as a slot status when the slot is actually an active 1-on-1 patient appointment (`Terisi`).
- **Likely Authoritative Owner:** Backend Domain State Machine + Shared Contract.
- **Frontend Requirement:** Align types, token mapper (`clinical-tokens.ts`), and badges with `OPEN` (`Buka`), `OCCUPIED` (`Terisi`), and `CLOSED` (`Tutup`).
- **Backend Capability Needed:** Verified existing in Schedule V2 response (`timeline_intervals[*].status`).
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-003 — Shift Preset Definitions & Fixed 24h Hourly Division

- **Current Definition:**
  - `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx:99-124`:
    ```typescript
    const SHIFTS = [
      { id: 'pagi', name: 'Pagi', range: '06:00 - 12:00', hours: [6, 7, 8, 9, 10, 11] },
      {
        id: 'siang',
        name: 'Siang / Sore',
        range: '12:00 - 18:00',
        hours: [12, 13, 14, 15, 16, 17]
      },
      { id: 'malam', name: 'Malam', range: '18:00 - 24:00', hours: [18, 19, 20, 21, 22, 23] },
      { id: 'dini-hari', name: 'Dini Hari', range: '00:00 - 06:00', hours: [0, 1, 2, 3, 4, 5] }
    ];
    ```
  - `src/features/jadwal-dokter/components/doctor-add-session-modal.tsx:28-53`:
    ```typescript
    const PRESET_SESSIONS = [
      { name: 'Sesi Pagi', start: '07:30', end: '11:30', kuota: 12 },
      { name: 'Sesi Siang / Sore', start: '14:00', end: '17:30', kuota: 15 },
      { name: 'Sesi Malam', start: '19:00', end: '22:00', kuota: 10 },
      { name: 'Shift Dini Hari', start: '23:00', end: '06:00', kuota: 8 }
    ];
    ```
- **File & Symbol:** `doctor-daily-hourly-grid.tsx` (`SHIFTS`), `doctor-add-session-modal.tsx` (`PRESET_SESSIONS`).
- **Consumers:** Hourly practice grid, add session modal.
- **Current Values:** Rigid 4-shift 24h split, hardcoded 6-hour windows, rigid preset quotas.
- **Domain Meaning:** Clinic shift operational policies.
- **Why It Is Hardcoded Today:** Frontend attempted to invent a 24-hour visual time matrix without backend timeline projection.
- **Assessment Dimensions:**
  - Mutability: **HIGH** (Doctor shifts start dynamically on mobile, e.g. 08:45, with dynamic consultation intervals like 30 minutes).
  - Cardinality Growth: **MEDIUM** (Shifts vary per clinic operational rules).
  - Business Ownership: **HIGH** (Clinical operational policy).
  - Cross-Client Relevance: **HIGH** (Mobile doctor input has only `startTime`, backend auto-derives end time & capacity).
  - Relationship Relevance: **HIGH** (Tied to room availability and appointment queue limits).
  - Persistence Need: **HIGH** (Configured in PostgreSQL clinic shift rules).
- **Evidence:** Backend Contract V2.1.0 Section 1.1: "Zero Client Arithmetic: The Web Admin frontend must never compute session interval slices, derive end times, or calculate daily capacities locally."
- **Why Static Frontend Ownership Is Risky:** Doctors who start at 08:45 or 09:15 cannot be cleanly displayed in a rigid 1-hour static block (08:00, 09:00). Client synthesis causes misalignment with patient appointment times.
- **Likely Authoritative Owner:** Backend Projection Engine (`timeline_intervals`).
- **Frontend Requirement:** Replace static 24-hour hourly grid with a serialized Gantt milestone timeline component driven directly by `timeline_intervals`.
- **Backend Capability Needed:** Verified existing (`timeline_intervals` array in `GET /admin/doctor-schedules/:id`).
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-005 — Client-Side Capacity & Quota Arithmetic

- **Current Definition:**
  - `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx:311-315`:
    ```typescript
    const extraCapacity = extraSessions.reduce((acc, s) => acc + s.kuota_pasien, 0);
    const extraSlots = extraSessions.reduce((acc, s) => acc + s.slot_tersedia, 0);
    const totalCapacity = (doctor?.kapasitas_per_hari || 0) + extraCapacity;
    const totalSlots = isDayCuti ? 0 : (doctor?.slot_tersedia || 0) + extraSlots;
    ```
  - `src/features/jadwal-dokter/components/doctor-schedule-edit-modal.tsx:30-32, 61-62`: Manual input fields for `kapasitasPerHari` and `slotTersedia`.
- **File & Symbol:** `doctor-daily-hourly-grid.tsx`, `doctor-schedule-edit-modal.tsx`.
- **Consumers:** Header slot counter, modal payload submission.
- **Current Values:** Summation of local session state and doctor metadata.
- **Domain Meaning:** Practice capacity and remaining appointment slots.
- **Why It Is Hardcoded Today:** Fallback calculation before backend returned authoritative projection.
- **Assessment Dimensions:**
  - Mutability: **HIGH** (Changes whenever an appointment is booked, cancelled, or rescheduled).
  - Cardinality Growth: **N/A**
  - Business Ownership: **HIGH** (Clinical governance & queuing).
  - Cross-Client Relevance: **HIGH** (Must match mobile patient booking app in real time).
  - Relationship Relevance: **HIGH** (Sum of discrete appointment slots).
  - Persistence Need: **HIGH** (Calculated from database records).
- **Evidence:** Backend Contract V2.1.0: "All formulas, boundary validations, and capacity determinations belong exclusively to PostgreSQL and the backend projection engine."
- **Why Static Frontend Ownership Is Risky:** Admin can accidentally type `kapasitasPerHari = 50` while doctor practice interval only allows 6 slots (08:45–11:45 with 30-min interval = 6 slots), creating database integrity mismatch.
- **Likely Authoritative Owner:** Backend Projection Engine.
- **Frontend Requirement:** Treat `kapasitas_per_hari` and `slot_tersedia` as read-only projections returned by backend.
- **Backend Capability Needed:** Verified existing (`kapasitas_per_hari`, `slot_tersedia`, `timeline_intervals` in `GET /admin/doctor-schedules/:id`).
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-006 — Prohibited Session Deletion Mutation

- **Current Definition:**
  - `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx:239-250, 734-742`: Delete button invoking `deleteSessionMutation`.
  - `src/features/jadwal-dokter/api/mutations.ts:111-131`: `useDeleteDoctorSessionMutation`.
  - `src/features/jadwal-dokter/api/service.ts:105-110`: `deleteDoctorSession`.
  - `src/features/jadwal-dokter/api/doctor-schedule-service.ts:205-221`: `deleteAdminDoctorSession` executing `DELETE /sessions/:sessionId`.
  - `src/server/contracts/schedules/doctor-schedules.dto.ts:148-159`: `deleteAdminDoctorSessionResponseSchema`.
- **File & Symbol:** Multiple files across feature API and UI.
- **Consumers:** Trash icon button on each session card.
- **Current Values:** Invokes HTTP DELETE on session ID.
- **Domain Meaning:** Administrative deletion of clinical shifts.
- **Why It Is Hardcoded Today:** Implemented as standard CRUD without knowing clinical audit trail compliance rules.
- **Assessment Dimensions:**
  - Mutability: **N/A** (Prohibited operation).
  - Business Ownership: **HIGH** (Medical record audit trail compliance).
  - Cross-Client Relevance: **HIGH** (Neither Admin nor Doctor can erase historic clinic sessions).
- **Evidence:** Backend Contract V2.1.0 Section 1.3 & Section 5:
  - Admin CANNOT delete doctor schedules (`403 Forbidden` with error code `ADMIN_SCHEDULE_DELETION_PROHIBITED`).
  - Prescribed alternatives: (1) Set status to `Tutup` or `Cuti`, or (2) Reschedule via `POST .../reschedule`.
- **Why Static Frontend Ownership Is Risky:** Frontend presents a trash action that will inevitably fail with a 403 error, frustrating clinic administrators and encouraging corrupt data habits.
- **Likely Authoritative Owner:** Backend Security Policy & Audit Integrity Guard.
- **Frontend Requirement:** Deprecate and remove session deletion UI and mutations from Web Admin. Replace with Reschedule and Deactivate actions.
- **Backend Capability Needed:** 403 Forbidden enforcement (Verified existing).
- **Database Change:** TO BE DETERMINED BY BACKEND (already enforced).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-007 — Missing Reschedule Session Contract & Workflow

- **Current Definition:**
  - `src/features/jadwal-dokter/components/doctor-schedule-card.tsx:353-363, 438-441`: "Reschedule" button merely triggers `onOpenEdit?.(doctor)` which opens generic edit modal.
  - No `rescheduleDoctorSessionAction`, no `useRescheduleDoctorSessionMutation`, no `paths.doctorSchedules.reschedule`.
- **File & Symbol:** Missing across API and components.
- **Consumers:** Doctor card actions, session action menu.
- **Domain Meaning:** Moving a doctor's shift to a new date/start time, automatically shifting active patient appointments.
- **Why It Is Hardcoded Today:** The requirement was originally mocked as a generic edit modal.
- **Assessment Dimensions:**
  - Mutability: **HIGH** (Frequent clinical operational event when doctors have emergencies).
  - Business Ownership: **HIGH** (Clinic front desk / administration).
  - Cross-Client Relevance: **HIGH** (Patients receive notification, mobile doctor schedule updates).
  - Relationship Relevance: **HIGH** (Shifts associated appointment times).
  - Persistence Need: **HIGH** (Transactional update in PostgreSQL with collision detection).
- **Evidence:** Backend Contract V2.1.0 Section 4 defines `POST /api/v1/admin/doctor-schedules/:id/sessions/:sessionId/reschedule` with schema:
  - `targetDate: string` (YYYY-MM-DD)
  - `targetStartTime: string` (HH:mm)
  - `targetScheduleContextId?: string`
  - `targetRoomId?: string`
  - `reason?: string`
  - `rescheduleActiveAppointments?: boolean`
- **Why Static Frontend Ownership Is Risky:** Admin cannot execute legal reschedules, causing manual phone calls and uncoordinated appointment shifts.
- **Likely Authoritative Owner:** Backend Outpatient Reschedule Service.
- **Frontend Requirement:** Integrate `POST .../reschedule` with dedicated Reschedule Modal validating target date and start time.
- **Backend Capability Needed:** Verified existing (`POST /admin/doctor-schedules/:id/sessions/:sessionId/reschedule`).
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-008 — Doctor Consultation Duration Configuration

- **Current Definition:**
  - Absent in frontend. Frontend implicitly assumes fixed duration or delegates blindly to unknown intervals.
- **File & Symbol:** Missing in `paths.ts`, `types.ts`, `service.ts`, `mutations.ts`.
- **Consumers:** Doctor settings / practice configuration.
- **Domain Meaning:** Policy defining how many minutes are allotted per patient consultation for a specific doctor (e.g., 20 mins for GP, 45 mins for Neurologist).
- **Why It Is Hardcoded Today:** Defaulted to 30 mins implicitly.
- **Assessment Dimensions:**
  - Mutability: **HIGH** (Configured per doctor specialty).
  - Business Ownership: **HIGH** (Clinic medical director & admin).
  - Persistence Need: **HIGH** (Stored per practitioner in PostgreSQL).
- **Evidence:** Backend Contract V2.1.0 Section 6 defines `PATCH /api/v1/admin/doctor-schedules/:id/duration` (`consultationDurationMinutes: 5..240`).
- **Why Static Frontend Ownership Is Risky:** All doctors are forced into one rigid duration or frontend cannot allow admins to configure duration as requested by clinics.
- **Likely Authoritative Owner:** Backend Policy Configuration.
- **Frontend Requirement:** Add duration configuration option in doctor settings.
- **Backend Capability Needed:** Verified existing (`PATCH /admin/doctor-schedules/:id/duration`).
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

### HD-009 — Gantt Milestone Timeline Interval Contract (`timeline_intervals`)

- **Current Definition:**
  - `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx`: Employs 24-hour grid with static 1-hour buttons.
  - `src/server/contracts/schedules/doctor-schedules.dto.ts`: Lacks `timeline_intervals` schema.
  - `src/features/jadwal-dokter/api/types.ts`: Lacks `timeline_intervals` type definition.
- **File & Symbol:** Missing in DTOs and types; synthesized locally in `doctor-daily-hourly-grid.tsx`.
- **Consumers:** Doctor Detail Sheet Tab "Jadwal & Kuota".
- **Domain Meaning:** The authoritative, pre-calculated milestone intervals of a doctor's shift (e.g., Slot 1: 08:45–09:15, Slot 2: 09:15–09:45).
- **Why It Is Hardcoded Today:** Frontend was built with an hourly grid mockup before the backend projection engine was developed.
- **Assessment Dimensions:**
  - Mutability: **HIGH** (Reflects live appointments and real-time interval slices).
  - Business Ownership: **HIGH** (Core outpatient delivery schedule).
  - Cross-Client Relevance: **HIGH** (Mobile doctor sees identical milestone intervals).
  - Relationship Relevance: **HIGH** (Links directly to `appointmentRef: { appointmentId, queueNumber, status }`).
  - Persistence Need: **HIGH** (Generated on-the-fly by PostgreSQL projection).
- **Evidence:** Backend Contract V2.1.0 Section 3 explicitly outputs:
  ```json
  "timeline_intervals": [
    {
      "intervalIndex": 1,
      "startTime": "08:45",
      "endTime": "09:15",
      "status": "OPEN",
      "displayLabel": "Buka",
      "isOccupied": false,
      "appointmentRef": null,
      "closedReason": null
    },
    {
      "intervalIndex": 2,
      "startTime": "09:15",
      "endTime": "09:45",
      "status": "OCCUPIED",
      "displayLabel": "Terisi",
      "isOccupied": true,
      "appointmentRef": { "appointmentId": "...", "queueNumber": "A-01", "status": "booked" },
      "closedReason": null
    }
  ]
  ```
- **Why Static Frontend Ownership Is Risky:** Static hourly blocks cannot display dynamic starts (08:45), intervals (30m, 20m), or patient queue numbers, degrading UX and making booking tracking impossible.
- **Likely Authoritative Owner:** Backend Outpatient Projection Engine.
- **Frontend Requirement:** Integrate `timeline_intervals` into DTOs, types, and render as a serialized Gantt chart / milestone table in the Detail Sheet as requested.
- **Backend Capability Needed:** Verified existing in `GET /admin/doctor-schedules/:id`.
- **Database Change:** TO BE DETERMINED BY BACKEND (already implemented).
- **Final Classification:** **STRONG DATABASE/API CANDIDATE**

---

## 7. Possible Candidates

### HD-004 — Hardcoded Calendar Years Range

- **Current Definition:** `src/features/jadwal-dokter/components/doctor-timeline-calendar.tsx:56`:
  ```typescript
  const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];
  ```
- **File & Symbol:** `doctor-timeline-calendar.tsx` (`AVAILABLE_YEARS`).
- **Consumers:** Year selector dropdown in calendar header.
- **Current Values:** `[2024, 2025, 2026, 2027]`.
- **Domain Meaning:** Bounded years for scheduling inspection.
- **Why It Is Hardcoded Today:** Quick UI convenience.
- **Uncertainty / Assessment:** This does not necessarily require a dedicated database table or backend endpoint; it can be dynamically derived relative to `new Date().getFullYear()` (e.g. `[currentYear - 1, currentYear, currentYear + 1, currentYear + 2]`). However, if the clinic has specific fiscal / operational scheduling bounds, backend configuration may govern it.
- **Likely Authoritative Owner:** Frontend Dynamic Utility or Backend Clinic Calendar Config.
- **Final Classification:** **POSSIBLE CANDIDATE**

---

## 8. Whitelisted Static Hardcoding

The following elements are verified as legitimate static frontend constructs that **must NOT** be migrated to backend database ownership:

| Item                                                                              | Location                                                                                            | Classification       | Reason to Keep Static                                                            |
| :-------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :------------------- | :------------------------------------------------------------------------------- |
| **Month Names** (`Januari`..`Desember`)                                           | `doctor-daily-hourly-grid.tsx:41-54`, `doctor-timeline-calendar.tsx:41-54`                          | STATIC UI LOCALE     | Standard Indonesian calendar month names; universal immutable calendar standard. |
| **Day Names** (`Sen`..`Min`, `Minggu`..`Sabtu`)                                   | `doctor-calendar-grid.tsx:53`, `doctor-timeline-calendar.tsx:57`, `doctor-daily-hourly-grid.tsx:56` | STATIC UI LOCALE     | Standard days of week; universal immutable calendar standard.                    |
| **Pagination Page Size Options** (`[6, 12, 18, 24, 30]`)                          | `doctor-schedule-view.tsx:134`                                                                      | STATIC UI CONFIG     | Viewport density preference for grid cards; UI display concern only.             |
| **Icon Mappings** (`Icons.calendar`, `Icons.stethoscope`, etc.)                   | Throughout all components                                                                           | STATIC DESIGN SYSTEM | Presentation component assets tied to visual design tokens.                      |
| **Standard UI Copy** (`"Kembali"`, `"Hari Ini"`, `"Batal"`, `"Simpan perubahan"`) | Throughout all modals and sheets                                                                    | STATIC UI COPY       | Application UI strings. Not dynamic business content.                            |
| **Pill & Border Geometry Tokens** (`radius: 20px`, etc.)                          | `clinical-tokens.ts:99-108`                                                                         | STATIC DESIGN TOKEN  | Established design-system geometry specifications.                               |

---

## 9. Domain Enums / Workflow Constants

The following status codes represent **controlled domain workflow states** rather than open-ended mutable master data:

1. **`OPEN` / `Buka`:** Active consultation slot awaiting patient booking.
2. **`OCCUPIED` / `Terisi`:** Discrete consultation slot booked by a patient with an active queue number.
3. **`CLOSED` / `Tutup`:** Unavailable slot due to shift boundaries or registered leave (`closedReason: "LEAVE"`).

**Why these should NOT become database-driven mutable master data:**

- Application branching logic in both frontend and backend depends on these exact semantic states (e.g., booking engines only allow `OPEN` slots; check-in flows only attach to `OCCUPIED` slots).
- Allowing arbitrary user-created statuses in the database (e.g., "Mungkin Buka", "Antri Dikit") would break deterministic queue calculation and state machines.
- They must remain a shared, type-safe contract between backend and frontend.

---

## 10. Duplicate Hardcoded Sources

### Concept: Poliklinik List

- **Definitions:**
  - Definition A: `src/features/jadwal-dokter/constants/options.ts:13-19` (`POLI_OPTIONS`, 5 entries).
  - Definition B: `src/features/jadwal-dokter/config/doctor-schedule-filter-options.ts:1-14` (`POLI_OPTIONS`, 12 entries).
- **Consumers:** `doctor-schedule-filters.tsx`, `useDoctorScheduleView.ts`.
- **Differences:** Definition A contains 5 specialties, Definition B contains 12 specialties. Neither matches the actual live clinic database.
- **Risk:** Filter dropdowns show different options depending on which import was resolved; filters fail to query newly established polyclinics.

---

## 11. Hardcoded Source-of-Truth Drift

```text
File A (constants/options.ts):
- Penyakit Dalam
- Dokter Umum
- Spesialis Anak
- Spesialis Kandungan
- Spesialis Kulit

File B (config/doctor-schedule-filter-options.ts):
- Penyakit Dalam
- Spesialis Anak
- Kebidanan & Kandungan      <-- DRIFT (Different naming vs "Spesialis Kandungan")
- Dokter Gigi                <-- DRIFT (Missing in File A)
- Ortopedi & Traumatologi    <-- DRIFT (Missing in File A)
- Dermatologi                <-- DRIFT (Different naming vs "Spesialis Kulit")
- Jantung & Kardiovaskular   <-- DRIFT (Missing in File A)
- Spesialis Mata             <-- DRIFT (Missing in File A)
- Spesialis THT              <-- DRIFT (Missing in File A)
- Kesehatan Jiwa & Psikiatri <-- DRIFT (Missing in File A)
- Neurologi / Saraf          <-- DRIFT (Missing in File A)
- Dokter Umum
```

This represents clear **Hardcoded Source-of-Truth Drift**, proving that hardcoding domain values across multiple frontend files leads directly to fragmentation.

---

## 12. Validation Coupling

Hardcoded domain values are coupled to validation schemas and type unions in:

1. `src/server/contracts/schedules/doctor-schedules.dto.ts:3`:
   ```typescript
   export const scheduleDayStatusSchema = z.enum(['Buka', 'Penuh', 'Cuti', 'Tutup']);
   ```
   _Risk:_ Incoming Schedule V2 responses with canonical status `OPEN`, `OCCUPIED`, `CLOSED` will be rejected by Zod validation if not updated.
2. `src/features/jadwal-dokter/api/types.ts:1`:
   ```typescript
   export type ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti' | 'Tutup';
   ```
3. `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx:24`:
   ```typescript
   export type HourlySlotStatus = 'buka' | 'penuh' | 'tutup' | 'cuti';
   ```

---

## 13. Filter / Form Coupling

1. `src/features/jadwal-dokter/components/doctor-schedule-filters.tsx`:
   - Couples to `POLI_OPTIONS` as fallback when `filterOptionsData` is loading.
   - Couples status facet options to hardcoded `STATUS_DOTS` containing `penuh` and `cuti`.
2. `src/features/jadwal-dokter/components/doctor-add-session-modal.tsx`:
   - Couples `sessionType` select dropdown to `PRESET_SESSIONS` (Pagi, Siang/Sore, Malam, Dini Hari).
   - Couples status select dropdown to `Buka`, `Penuh`, `Cuti`.
3. `src/features/jadwal-dokter/components/doctor-edit-session-modal.tsx`:
   - Couples status select dropdown to `Buka`, `Penuh`, `Cuti`, `Tutup`.
4. `src/features/jadwal-dokter/components/doctor-schedule-edit-modal.tsx`:
   - Couples status select dropdown to `Buka`, `Penuh`, `Cuti`.

---

## 14. Hardcoded Identifier Risks

- No hardcoded UUID database IDs were found embedded in the frontend source code (all IDs are dynamically bound from props or API responses).
- However, hardcoded string identifiers (`'Poli Penyakit Dalam'`, `'Ruang 201'`) appear as placeholder values in modal forms.

---

## 15. Existing Backend/API Evidence

| Candidate              | Existing Endpoint                                                        | Existing Persistence                | Current Frontend Integration                               | Integration Gap                                                                                                |
| :--------------------- | :----------------------------------------------------------------------- | :---------------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Poliklinik List**    | `GET /api/v1/admin/doctor-schedules/filter-options`                      | PostgreSQL `clinical_units`         | Integrated via `doctorScheduleFilterOptionsQueryOptions()` | Frontend still keeps static fallback arrays that drift.                                                        |
| **Gantt Intervals**    | `GET /api/v1/admin/doctor-schedules/:id?date=YYYY-MM-DD`                 | PostgreSQL Schedule Projection      | **NOT INTEGRATED**                                         | Endpoint returns `timeline_intervals`, but frontend DTO drops it and component renders static 24h hourly grid. |
| **Reschedule Session** | `POST /api/v1/admin/doctor-schedules/:id/sessions/:sessionId/reschedule` | PostgreSQL Schedules & Appointments | **NOT INTEGRATED**                                         | Path missing in `paths.ts`, no action, no mutation, card button opens generic modal.                           |
| **Duration Config**    | `PATCH /api/v1/admin/doctor-schedules/:id/duration`                      | PostgreSQL Practitioner Policy      | **NOT INTEGRATED**                                         | Missing in API service and UI settings.                                                                        |
| **Session Deletion**   | `DELETE /api/v1/admin/doctor-schedules/:id/sessions/:sessionId`          | Rejects with 403 Forbidden          | **ERRONEOUSLY INTEGRATED**                                 | Frontend exposes trash icon and calls forbidden DELETE endpoint.                                               |

---

## 16. Ownership Matrix

| Concept                          | Frontend Static | Backend Domain | Shared Contract | Unknown | Rationale                                                            |
| :------------------------------- | :-------------: | :------------: | :-------------: | :-----: | :------------------------------------------------------------------- |
| **Poliklinik List**              |                 |       X        |                 |         | Domain master data owned by clinic administration.                   |
| **Schedule Slot Status**         |                 |                |        X        |         | Backend owns state transitions; frontend owns color/badge rendering. |
| **Shift & Interval Projections** |                 |       X        |                 |         | Backend projection engine calculates milestone boundaries.           |
| **Calendar Horizon Years**       |        X        |                |                 |         | Display horizon bounded relative to current date.                    |
| **Capacity & Slot Counts**       |                 |       X        |                 |         | Authoritative derived state from interval calculations.              |
| **Reschedule Operation**         |                 |       X        |                 |         | Transactional backend domain workflow.                               |
| **Consultation Duration**        |                 |       X        |                 |         | Practitioner policy configured in database.                          |
| **Gantt Timeline Intervals**     |                 |       X        |                 |         | Serialized milestone intervals returned by backend.                  |

---

## 17. Dynamicization Requirement Matrix

| ID         | Concept                      | Addable? | Removable? | Renameable? | Persist? | Backend Candidate                           |
| :--------- | :--------------------------- | :------: | :--------: | :---------: | :------: | :------------------------------------------ |
| **HD-001** | Poliklinik Master Data       |   YES    |    YES     |     YES     |   YES    | STRONG DATABASE/API CANDIDATE               |
| **HD-002** | Schedule Slot Status         |    NO    |     NO     |     NO      |   YES    | STRONG SHARED CONTRACT CANDIDATE            |
| **HD-003** | Shift & Interval Projections |   YES    |    YES     |     YES     |   YES    | STRONG DATABASE/API CANDIDATE               |
| **HD-004** | Calendar Years Range         |    NO    |     NO     |     NO      |    NO    | KEEP STATIC (DERIVE DYNAMICALLY)            |
| **HD-005** | Capacity & Slot Projections  |   N/A    |    N/A     |     N/A     |   YES    | STRONG DATABASE/API CANDIDATE               |
| **HD-006** | Session Deletion Prohibited  |    NO    |     NO     |     NO      |   N/A    | PURGE FRONTEND ACTION (CONTRACT COMPLIANCE) |
| **HD-007** | Session Reschedule Workflow  |   YES    |    N/A     |     N/A     |   YES    | STRONG DATABASE/API CANDIDATE               |
| **HD-008** | Consultation Duration Config |   YES    |     NO     |     N/A     |   YES    | STRONG DATABASE/API CANDIDATE               |
| **HD-009** | Gantt Timeline Intervals     |   YES    |    YES     |     N/A     |   YES    | STRONG DATABASE/API CANDIDATE               |

---

## 18. Frontend Runtime Impact

When the frontend is updated to integrate Schedule V2 dynamic data, the following modules will be affected:

1. **Routes & Pages:**
   - `src/app/dashboard/jadwal-dokter/page.tsx` (Preserves existing layout and title).
2. **DTO & Contract Layer:**
   - `src/server/contracts/schedules/doctor-schedules.dto.ts`:
     - Add `timeline_intervals` schema (`intervalIndex`, `startTime`, `endTime`, `status`, `displayLabel`, `isOccupied`, `appointmentRef`, `closedReason`).
     - Add `rescheduleAdminDoctorSessionPayloadSchema` and response schema.
     - Add `updateAdminDoctorConsultationDurationPayloadSchema`.
     - Update `scheduleDayStatusSchema` to support canonical status semantics.
     - Deprecate `deleteAdminDoctorSessionResponseSchema`.
3. **API Paths & Service Layer:**
   - `src/server/api/paths.ts`: Add `reschedule`, `updateDuration`. Remove or mark `deleteSession` as deprecated.
   - `src/features/jadwal-dokter/api/types.ts`: Synchronize with V2 types (`TimelineInterval`, `RescheduleDoctorSessionPayload`, etc.).
   - `src/features/jadwal-dokter/api/doctor-schedule-service.ts`: Add `rescheduleAdminDoctorSession` and `updateAdminDoctorConsultationDuration`.
   - `src/features/jadwal-dokter/api/doctor-schedule-actions.ts`: Add server actions for reschedule and duration.
   - `src/features/jadwal-dokter/api/mutations.ts`: Add `useRescheduleDoctorSessionMutation` and `useUpdateDoctorConsultationDurationMutation`. Remove `useDeleteDoctorSessionMutation`.
4. **Components Layer:**
   - `src/features/jadwal-dokter/components/doctor-schedule-detail-sheet.tsx`:
     - Pass `date` query parameter when fetching detail.
     - In Tab 2, replace `DoctorDailyHourlyGrid` with serialized Gantt milestone table/timeline component consuming `timeline_intervals`.
   - `src/features/jadwal-dokter/components/doctor-schedule-card.tsx`:
     - Connect "Reschedule" button to dedicated Reschedule Modal instead of generic edit modal.
     - Remove "Penuh" status string resolution.
   - `src/features/jadwal-dokter/components/doctor-timeline-calendar.tsx`:
     - Update legend and status badges to `Buka`, `Terisi`, `Tutup`.
   - `src/styles/clinical-tokens.ts`:
     - Add token configuration for `OCCUPIED` / `TERISI` (Sky Blue / Info colorway).

---

## 19. Requested Backend Capabilities

Frontend requires the following backend-authoritative capabilities:

1. **Serialized Gantt Timeline Projections:** Authoritative provision of `timeline_intervals` array inside `GET /api/v1/admin/doctor-schedules/:id?date=YYYY-MM-DD`, eliminating any need for frontend time calculations or shift boundary guessing.
2. **Dynamic Poliklinik Options:** Continued authoritative provision of active polyclinics via `GET /api/v1/admin/doctor-schedules/filter-options`.
3. **Transactional Reschedule Endpoint:** `POST /api/v1/admin/doctor-schedules/:id/sessions/:sessionId/reschedule` handling time-shift validation and active appointment cascade.
4. **Consultation Duration Policy:** `PATCH /api/v1/admin/doctor-schedules/:id/duration` allowing administrators to configure practitioner consultation duration.
5. **Strict 403 Deletion Gating:** Maintained rejection of `DELETE /sessions/:sessionId` with `403 Forbidden` (`ADMIN_SCHEDULE_DELETION_PROHIBITED`).

_Note: All of the above capabilities have already been completed and verified by the backend team in Amanah Healthcare Backend v1.2.0 (Schedule V2 API Specification)._

---

## 20. Explicit Non-Requirements

1. **NO Generic Master-Data Framework:** No runtime CMS or open-ended custom field generator requested.
2. **NO Client-Side Time Arithmetic:** No local interval slicing, no `endTime = startTime + 30` calculation on frontend.
3. **NO Microservices or Message Queues:** Standard Next.js App Router to REST API integration.
4. **NO Arbitrary Status Creation:** No user-defined schedule statuses; must strictly adhere to `OPEN`, `OCCUPIED`, `CLOSED`.
5. **NO Unverified Redesign:** The user explicitly commanded: _"Signator UI harus sama. Pokoknya ini cuma paradigma perubahan logic. Gantt chart dibuat rapi, minimalis, compact."_

---

## 21. Backend Handoff References

The following items are transferred to `backend-dynamic-data-requirements-handoff.md`:

- `HD-001`: Poliklinik filter options integration verification.
- `HD-002`: Canonical status semantics mapping (`OPEN` / `OCCUPIED` / `CLOSED`).
- `HD-003` & `HD-009`: `timeline_intervals` Gantt milestone payload specification.
- `HD-006`: Confirmation of 403 Forbidden on session deletion.
- `HD-007`: Reschedule endpoint payload and response alignment.
- `HD-008`: Consultation duration endpoint payload alignment.

---

## 22. Unresolved Items

- **Item 1: Displaying Patient Info on Occupied Slot Click**
  - _Known:_ Backend returns sanitized `appointmentRef: { appointmentId, queueNumber, status }` without PII.
  - _Unknown:_ Does clicking an occupied slot in the Admin Gantt timeline require opening a full patient appointment detail modal (fetching from `GET /admin/appointments/:id`), or merely showing the queue number and status?
  - _Required Evidence:_ Clinical workflow confirmation from hospital administration.

---

## 23. Final Frontend Position

**Frontend remains unchanged during this audit.**

- **Hardcoded domain candidates:** 8 strong candidates identified (`HD-001`, `HD-002`, `HD-003`, `HD-005`, `HD-006`, `HD-007`, `HD-008`, `HD-009`).
- **Whitelisted static values:** Month names, day names, pagination sizes, icon mappings, layout tokens.
- **Backend-owned candidates:** Poliklinik master data, shift projections, capacity derivations, reschedule transactions, consultation duration policy, timeline intervals.
- **Shared ownership candidates:** Schedule status semantics (`OPEN`, `OCCUPIED`, `CLOSED`).
- **Unresolved candidates:** Scope of patient appointment modal when clicking an occupied Gantt slot.

The frontend audit does not prescribe backend implementation details. It identifies hardcoded values whose lifecycle belongs outside frontend source code. The backend has already prepared and verified the Schedule V2 API contract (`Version 2.1.0`), and the frontend will next be updated to consume this contract directly.
