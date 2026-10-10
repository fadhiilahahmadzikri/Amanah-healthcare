# Doctor Schedule Card Contract Alignment — Discrepancy Report

**Scope:** Outer Doctor Schedule Cards on Doctor Schedule Dashboard Page (`src/features/jadwal-dokter/components/doctor-schedule-card.tsx`)  
**Context:** Phase 1 Frontend-Backend Contract Alignment & Legacy Strangulation

---

## 1. Scope & Target Files

| File | Type | Current Responsibility | Relevance to Phase 1 Alignment |
|---|---|---|---|
| `frontend-web/src/features/jadwal-dokter/components/doctor-schedule-card.tsx` | Component | Renders the doctor schedule card on dashboard & chatwoot carousel | **Primary Target:** Trim to only 4 approved fields (Status, Name, Specialty, Avatar) + 3 actions (Settings, Details, Reschedule). Eliminate background detail query fan-out. |
| `frontend-web/src/features/jadwal-dokter/components/doctor-card-atoms.tsx` | Atoms | Sub-components used inside the card (`DoctorCardImage`, `DoctorStatusBadge`, `DoctorInfoRow`, `DoctorCutiNotice`, `DoctorQuickCallButton`, etc.) | **Target:** Remove atoms from the card that display room, date, quick call, and cuti notice. Deprecate orphaned atoms. |
| `frontend-web/src/features/jadwal-dokter/utils/doctor-schedule-card-utils.ts` | Utilities | Computes card status (`getDoctorCardStatus`) using complex client-side minutes, slot availability, and unconfigured checks | **Target:** Align `getDoctorCardStatus` strictly to backend canonical status (`OPEN` or `CLOSED`). Eliminate client-side slot/occupancy calculation. |
| `frontend-web/src/features/jadwal-dokter/config/doctor-schedule-filter-options.ts` | Config | Status filter options (`DOCTOR_SCHEDULE_STATUS_OPTIONS`) | **Target:** Remove `OCCUPIED` ('Terisi'). Align options strictly to `OPEN` ('Buka') and `CLOSED` ('Tutup') to prevent backend `400 Bad Request` (`INVALID_SCHEDULE_STATUS_FILTER`). |
| `frontend-web/src/server/contracts/schedules/doctor-schedules.dto.ts` | Zod DTO | Zod schema for backend response (`doctorScheduleItemSchema`) | **Target:** Align with backend: `is_on_leave`, `leave_reason`, `leave_start`, `leave_end`, `status_dokter: 'OPEN' \| 'CLOSED'`, `status_jadwal: 'OPEN' \| 'CLOSED'`. Remove legacy slot attributes (`slot_tersedia`, `kapasitas_per_hari`, `display_akumulasi_slot`). |
| `frontend-web/src/features/jadwal-dokter/api/types.ts` | Types | TypeScript interface `DoctorSchedule` and status types | **Target:** Update types to match aligned DTO. |
| `frontend-web/src/features/jadwal-dokter/components/doctor-gantt-timeline.tsx` | Component | Unused 440-line component rendering 30-minute interval slots and timeline lanes | **Deletion Target:** Stale, unreferenced component violating no-slot architecture. |
| `frontend-web/src/features/jadwal-dokter/components/timeline/doctor-gantt-session-lane.tsx` | Component | Subcomponent of `doctor-gantt-timeline.tsx` rendering 30-minute slot lanes | **Deletion Target:** Stale child component of gantt timeline. |

---

## 2. Frontend-versus-Backend Contract Comparison

| Item | Frontend Current Behavior | Backend Contract (`GET /api/v1/admin/doctor-schedules`) | Discrepancy | Proposed Action |
|---|---|---|---|---|
| **Schedule Status** | Computes 6 statuses client-side: `Buka`, `isOnLeave`, `Terisi`, `Belum Diatur`, `Tutup`, `Selesai` via `getDoctorCardStatus` | Returns canonical binary `status_dokter`: `'OPEN' \| 'CLOSED'` | Frontend overrides backend source-of-truth and hallucinates slot occupancy & temporal expiration | **Align:** Outer card strictly consumes `status_dokter` (`OPEN` $\rightarrow$ "Buka", `CLOSED` $\rightarrow$ "Tutup"). Remove client-side status synthesis. |
| **Leave Handling** | Sets distinct card status `isOnLeave`, renders banner `DoctorCutiNotice ('Dokter sedang isOnLeave')` | Computes `status_dokter: 'CLOSED'`, `is_on_leave: true`, `leave_reason: string` | Frontend treats leave as a 3rd top-level card status | **Align:** Doctor on leave displays strictly as `CLOSED` ("Tutup") at card level. Leave reason preserved exclusively in Details drawer. Remove banner from card. |
| **Practice Room** | Displays room name & icon via `DoctorInfoRow` (`doctor.ruang_praktik`) | Returns `ruang_praktik: string` | Room details displayed on outer card | **Remove:** Delete `DoctorInfoRow` (room) from the card. Room details remain available in Details sheet. |
| **Schedule Date** | Displays formatted date & calendar icon via `DoctorInfoRow` (`doctor.tanggal_praktik`) | Returns `tanggal_praktik: string` | Date displayed redundantly on outer card | **Remove:** Delete `DoctorInfoRow` (date) from the card. Filter header already establishes effective date. |
| **Quick Call Action** | Renders telephone icon button `DoctorQuickCallButton` calling `tel:` | Backend provides optional `nomor_telepon` | Quick call is not an approved card element | **Remove:** Remove `DoctorQuickCallButton` from the card header. |
| **Cuti / Stats Banner** | Renders `DoctorCutiNotice` ("Dokter sedang isOnLeave", "Belum ada jadwal praktik", "Praktik Selesai") | Backend provides structured metadata for Details sheet | Card displays complex operational notice box | **Remove:** Remove `DoctorCutiNotice` from card. |
| **Detail Query Fan-Out** | Every single card runs `useQuery(doctorScheduleDetailQueryOptions(...))` in background | List endpoint already returns complete card entity | Massive redundant network waterfall (N+1 query fan-out) | **Remove:** Eliminate `detailQuery` from `DoctorScheduleCard`. Detail query is already correctly executed by `useDoctorScheduleDetailSheet` when sheet is opened. |
| **Status Filter Options** | Provides `OPEN`, `OCCUPIED`, `CLOSED` in filter dropdown | Backend validator throws `400 Bad Request` (`INVALID_SCHEDULE_STATUS_FILTER`) if `OCCUPIED` is passed | Frontend offers status that crashes the backend query | **Align:** Remove `OCCUPIED` from `DOCTOR_SCHEDULE_STATUS_OPTIONS`. Only allow `OPEN` and `CLOSED`. |
| **Data Contract Field Names** | Expects `isOnLeave`, `cuti_reason`, `cuti_start`, `cuti_end`, `slot_tersedia`, `kapasitas_per_hari` | Returns canonical English `is_on_leave`, `leave_reason`, `leave_start`, `leave_end`. No slot attributes. | Stale variable names and obsolete slot metrics | **Align:** Update `doctorScheduleItemSchema` and `DoctorSchedule` interface to match backend contract. |

---

## 3. Removal & Deletion Candidates

### A. Component Files Scheduled for Safe Deletion
1. `frontend-web/src/features/jadwal-dokter/components/doctor-gantt-timeline.tsx`
   - *Current purpose:* Render 24-hour visual gantt chart of 30-minute interval slots.
   - *Reason for deletion:* Stale, completely unreferenced in codebase, violates queue-ticket non-slot architecture.
   - *Verification evidence:* 0 imports in repository outside of itself.
2. `frontend-web/src/features/jadwal-dokter/components/timeline/doctor-gantt-session-lane.tsx`
   - *Current purpose:* Child component of `doctor-gantt-timeline.tsx` rendering individual 30-minute slots.
   - *Reason for deletion:* Stale child of unreferenced gantt timeline.
   - *Verification evidence:* Only imported by `doctor-gantt-timeline.tsx`.

### B. Obsolete Card-Level Presentations Scheduled for Removal
1. `DoctorInfoRow` (Room) on card: Removed.
2. `DoctorInfoRow` (Date) on card: Removed.
3. `DoctorQuickCallButton` on card: Removed.
4. `DoctorCutiNotice` on card: Removed.
5. `detailQuery` in `DoctorScheduleCard`: Removed.

### C. Obsolete Constants Scheduled for Removal / Deprecation
1. `OCCUPIED` in `DOCTOR_SCHEDULE_STATUS_OPTIONS`: Removed.
2. `TERISI`, `BELUM_DIATUR`, `SELESAI`, `isOnLeave` in `DOCTOR_CARD_STATUS`: Simplified to canonical `OPEN` and `CLOSED`.
3. `slot_tersedia`, `kapasitas_per_hari`, `display_akumulasi_slot` in `doctorScheduleItemSchema`: Removed.

---

## 4. Backend Verification Evidence

### Direct Postgres Database Inspection (`docker exec -i backend-postgres-1 psql`)
```sql
SELECT p.id, p.display_name, ms.name as specialty, p.is_accepting_appointments 
FROM practitioners p 
LEFT JOIN medical_specialties ms ON ms.id = p.specialty_id;
```
- **Records found:** 5 practitioners (`dr. Ahmad Santoso`, `Bdn. Siti Rahmawati`, `dr. Maya Putri`, `dr. Rizky Maulana`, `Bdn. Laras Wulandari`).

### Backend Response Contract Inspection (`DrizzleAdminDoctorScheduleListQuery`)
Backend returns:
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "practitioner_id": "uuid",
        "nama_dokter": "dr. Ahmad Santoso",
        "spesialisasi": "Dokter Umum",
        "status_dokter": "OPEN",
        "avatar": "/storage/avatars/...",
        "status_jadwal": "OPEN",
        "is_on_leave": false,
        "leave_reason": null,
        "leave_start": null,
        "leave_end": null,
        "sesi_harian": [...]
      }
    ],
    "meta": { "page": 1, "limit": 6, "total_doctors": 5, "total_pages": 1 }
  }
}
```
Status filter validation in backend (`drizzle-admin-doctor-schedule-list.query.ts`):
```typescript
const invalidStatuses = statusList.filter(
  (status) => !Object.values(ScheduleOperationalStatus).includes(status)
);
if (invalidStatuses.length > 0) {
  throw new BadRequestException({
    code: 'INVALID_SCHEDULE_STATUS_FILTER',
    message: 'Status filter must use canonical values: OPEN, CLOSED.'
  });
}
```
*Confirmation:* Passing anything other than `OPEN` or `CLOSED` triggers a `400 Bad Request`.

---

## 5. Scope Boundary Compliance

- **Card Level:** Displays strictly **Status**, **Doctor Name**, **Doctor Specialty**, and **Avatar**.
- **Card Actions:** Preserves **Settings**, **Details**, and **Reschedule**.
- **Leave Rule:** Doctor on leave appears strictly as `CLOSED` ("Tutup") on the card. Reason is preserved in Details sheet.
- **Out-of-Scope Respected:** Detail drawer internals and other dashboard pages are not expanded in this phase.
