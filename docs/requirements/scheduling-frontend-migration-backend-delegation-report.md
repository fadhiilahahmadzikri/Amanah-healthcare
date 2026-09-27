# Scheduling Frontend Migration and Backend Delegation Report

> Document type: Frontend domain migration report and backend contract delegation  
> Scope: Flutter mobile, Next.js admin web, Next.js patient web  
> Out of scope: backend implementation, database design, final table names, final endpoint names  
> Status: Frontend requirement handoff based on inspected frontend code and explicit product direction  
> Supersedes: any older schedule document that still treats `Penuh` and `Cuti` as primary availability states

---

## 1. Executive Correction

The current scheduling frontend is still modeled around manually managed slots, manual end times, daily/session capacity counters, and primary statuses such as `Penuh` and `Cuti`.

The target product model is different.

The frontend must move to this domain:

```text
availability definition
+ effective consultation duration
+ authoritative scheduling boundary
+ appointments or queue entries
+ closures or exceptions
= projected timeline
```

The frontend must not manually create arbitrary empty slots. It must render projected intervals from the backend.

The three frontend-facing availability states are:

| Canonical state | Indonesian label | Meaning                                                                                                       |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `OPEN`          | `Buka`           | The interval can accept a patient and has no active appointment.                                              |
| `OCCUPIED`      | `Terisi`         | The interval already has an active appointment or queue entry. Authorized users may inspect occupant details. |
| `CLOSED`        | `Tutup`          | The interval cannot accept appointments. The reason may exist as metadata, for example `closedReason`.        |

`Penuh` is not a primary availability state. It is an old aggregate-slot mental model.

`Cuti` is not a primary availability state. It is a closure reason under `CLOSED`.

Appointment lifecycle statuses such as `pending`, `confirmed`, `waiting`, `completed`, or local equivalents must remain separate from availability states.

---

## 2. Product Rules Used As Source Of Truth

These rules are explicit product direction from the user conversation, not inferred from the current codebase.

1. Flutter mobile is the upstream workflow because doctors or medical staff commonly input availability there.
2. Flutter is not the authoritative data source. The backend and database remain the source of truth.
3. Admin/CS in the Next.js web app can also change schedule data.
4. Web admin and mobile must synchronize indirectly through the backend, not through copied local state.
5. The doctor should not manually input `from` and `to` for each consultation interval.
6. The doctor/admin provides a start time; interval end is derived by the system using the effective consultation duration.
7. A boundary still exists and is required for capacity calculation. The frontend must receive it from the canonical domain.
8. Arbitrary practitioner start times must be supported, for example `08:45`.
9. The interval sequence is anchored to the practitioner's chosen start time.
10. Capacity is calculated as `floor((boundary - availabilityStart) / effectiveDuration)`.
11. Partial trailing time must not create a partial appointment unless the product later explicitly supports partial appointments.
12. Consultation duration is configurable, for example `20`, `30`, `45`, or `60` minutes.
13. Changing duration must not silently rewrite already confirmed appointments.
14. Admin detail view should keep the calendar concept, but the per-hour schedule view should become a serialized timeline or Gantt-like view.
15. The frontend must not fake correctness with local transformation when the root domain contract is wrong.

---

## 3. Evidence Base

This report is based on inspected frontend files only:

| Area                                         | Evidence                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js stack                                | `package.json` shows Next.js `16.2.6`, React `19.2.4`, TypeScript `5.7.2`, TanStack Query, Zustand, and Nuqs.                                                |
| Next.js admin schedule contract              | `src/server/contracts/schedules/doctor-schedules.dto.ts` and `src/features/jadwal-dokter/api/types.ts`.                                                      |
| Next.js admin schedule UI                    | `src/features/jadwal-dokter/components/*`.                                                                                                                   |
| Next.js patient appointment UI               | `src/features/klinik/*`.                                                                                                                                     |
| Next.js admin appointment UI                 | `src/features/appointment-pasien/*`.                                                                                                                         |
| Flutter mobile schedule model and repository | `D:\amanah-healthcare-mobile\packages\amanah_healthcare\lib\features\schedule\domain\amanah_schedule_model.dart` and `data\amanah_schedule_repository.dart`. |
| Flutter mobile schedule store and form       | `data\amanah_schedule_store.dart` and `presentation\components\amanah_schedule_form_and_calendar_dialog.dart`.                                               |

This report deliberately does not assert backend table names, backend service logic, or database constraints as facts.

---

## 4. Current Frontend Architecture Map

### 4.1 Flutter mobile schedule area

Flutter mobile currently contains:

| Current area              | Verified evidence                                         | Current behavior                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schedule model            | `amanah_schedule_model.dart:210-248`                      | `DoctorSchedule` has `capacity`, `availableSlots`, `bookedPatientCount`, and `isAvailable`. It derives a badge as `Buka` or `Tutup`.                                         |
| Default capacity          | `amanah_schedule_model.dart:210`, `246`                   | Default capacity is `8`.                                                                                                                                                     |
| Available slots           | `amanah_schedule_model.dart:248`                          | `availableSlots` defaults to `capacity - bookedPatientCount`.                                                                                                                |
| Duration option reference | `amanah_schedule_model.dart:644-652`                      | Reads `timeSlotIntervals` from reference options. This is promising but not yet the canonical projection model.                                                              |
| API repository            | `amanah_schedule_repository.dart:221-516`                 | Uses `/api/v1/schedules/*` endpoints for my schedules, calendar summary, day settings, create/update schedules, availability toggle, booked patients, and reference options. |
| Create schedule payload   | `amanah_schedule_repository.dart:319-343`                 | Requires `startTime`, `endTime`, optional `capacity`, and optional `isAvailable`.                                                                                            |
| Update schedule payload   | `amanah_schedule_repository.dart:360-384`                 | Still sends optional `startTime`, `endTime`, `capacity`, and `isAvailable`.                                                                                                  |
| Form time options         | `amanah_schedule_form_and_calendar_dialog.dart:8`         | Time choices are currently predefined, not a demonstrated arbitrary-minute input.                                                                                            |
| Manual From/To slot model | `amanah_schedule_form_and_calendar_dialog.dart:443-454`   | `_ScheduleFormSlot` has `from` and `to`.                                                                                                                                     |
| Manual From/To UI         | `amanah_schedule_form_and_calendar_dialog.dart:1794-1817` | The drawer renders `From` and `To` time pickers.                                                                                                                             |
| Mobile status options     | `amanah_schedule_form_and_calendar_dialog.dart:542-547`   | Status options include `Menunggu`, `Buka`, and `Cuti`.                                                                                                                       |
| Optimistic fallback       | `amanah_schedule_store.dart:305-307`                      | On error, the store keeps the optimistic local update.                                                                                                                       |
| Local default quota       | `amanah_schedule_store.dart:65`                           | Default day setting uses `targetQuota: 8`.                                                                                                                                   |

Current mobile conclusion:

Flutter is already shaped as the upstream workflow, but its frontend model still lets a user create/update schedules with manual `endTime`, capacity/quota style fields, and `Cuti` as a first-class status. It also can preserve failed optimistic changes locally.

### 4.2 Next.js admin schedule area

Next.js admin currently contains:

| Current area              | Verified evidence                                                | Current behavior                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Contract enum             | `src/server/contracts/schedules/doctor-schedules.dto.ts:3`       | `ScheduleDayStatus` is `Buka`, `Penuh`, `Cuti`, `Tutup`.                                                                             |
| Feature enum              | `src/features/jadwal-dokter/api/types.ts:1`                      | Same status union is used in feature types.                                                                                          |
| Session fields            | `doctor-schedules.dto.ts:15-19`, `108-111`                       | Daily sessions include `jam_selesai`, `slot_tersedia`, and `status_sesi`.                                                            |
| Aggregate counters        | `doctor-schedules.dto.ts:43-44`                                  | Doctor list/detail includes `slot_tersedia` and `kapasitas_per_hari`.                                                                |
| Admin API path wrappers   | `src/server/api/paths.ts:36-46`                                  | Admin schedule paths exist for list, detail, update, day status, create session, update session, delete session, and filter options. |
| Error fallback            | `src/features/jadwal-dokter/api/service.ts:34-52`                | List/detail service catches errors and returns empty or undefined data.                                                              |
| Filter fallback           | `src/features/jadwal-dokter/api/service.ts:112-124`              | Filter options fallback includes `Penuh` and `Cuti`.                                                                                 |
| Card status               | `doctor-schedule-card.tsx:398-408`                               | Card computes `Cuti`, `Belum Diatur`, `Tutup`, `Penuh`, or `Buka` from old fields.                                                   |
| Detail sheet status       | `doctor-schedule-detail-sheet.tsx:64-72`                         | Detail sheet computes `Cuti`, `Tutup`, `Belum Diatur`, `Penuh`, or `Buka`.                                                           |
| Detail status mapping bug | `doctor-schedule-detail-sheet.tsx:295-298`                       | Calendar status mapping maps every non-`buka`/non-`cuti` selection to `Penuh`, including `tutup`.                                    |
| Calendar statuses         | `doctor-timeline-calendar.tsx:18`, `77-95`, `112-115`, `626-634` | Calendar presents `Buka`, `Penuh`, `Cuti`, and `Tutup`.                                                                              |
| Hourly grid statuses      | `doctor-daily-hourly-grid.tsx:24`                                | Hourly grid status is `buka`, `penuh`, `tutup`, `cuti`.                                                                              |
| Hour-only matching        | `doctor-daily-hourly-grid.tsx:152-153`                           | Grid parses only the hour from `jam_mulai` and `jam_selesai`, losing minute precision.                                               |
| Local hourly overrides    | `doctor-daily-hourly-grid.tsx:226-231`, `267-270`                | Per-hour status can be changed locally through `hourlyOverrides`.                                                                    |
| Local extra sessions      | `doctor-daily-hourly-grid.tsx:231`, `308-314`                    | `extraSessions` are locally added and capacity/slot counters are recomputed in the UI.                                               |
| Add session modal         | `doctor-add-session-modal.tsx:28`, `66-70`, `93-112`, `183-261`  | Uses preset sessions, manual start/end, quota, slot count, and status including `Penuh` and `Cuti`.                                  |
| Edit session modal        | `doctor-edit-session-modal.tsx:36-40`, `66-70`, `131-208`        | Same manual session model is used for editing.                                                                                       |
| Schedule edit modal       | `doctor-schedule-edit-modal.tsx:30`, `61`, `180-181`, `205`      | Edits `slot_tersedia`, uses `Penuh` and `Cuti`, and treats leave as schedule status.                                                 |
| Design status mapper      | `src/styles/clinical-tokens.ts:120-193`                          | Maps `PENUH/FULL` to `Penuh` and `CUTI/LEAVE` to `Cuti` as primary status labels.                                                    |

Current admin conclusion:

The admin web UI is wired to a backend-facing service layer, but the contract it renders is the old session/slot/status model. Its detail sheet calendar may be salvageable, but the hourly grid and session modals must be replaced or heavily refactored around timeline projections.

### 4.3 Next.js patient booking area

Next.js patient booking currently contains:

| Current area          | Verified evidence                                  | Current behavior                                                                     |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Appointment storage   | `src/features/klinik/api/service.ts:3-4`, `67-112` | Appointments and queues are stored in `localStorage`.                                |
| Appointment creation  | `src/features/klinik/api/service.ts:145-184`       | `createAppointmentRecordWithQueue` creates local appointment and queue records.      |
| Reservation hook      | `useAppointmentReservation.ts:109`, `257`          | Reads doctors from local `getDoctors()` and creates appointment locally.             |
| View hook persistence | `useAppointmentsView.ts:5`, `75`                   | Appointment view saves to localStorage.                                              |
| Calendar day states   | `appointment-calendar-day-picker.tsx:117-206`      | Day picker uses `Penuh` and `Cuti` to disable dates.                                 |
| Time slot generator   | `appointment-time-slot-picker.tsx:24`, `181-205`   | Time picker uses hardcoded standard shifts and increments by hardcoded `30` minutes. |
| Fake booking pressure | `appointment-time-slot-picker.tsx:204-208`         | Simulates booked counts by shift index.                                              |

Current patient booking conclusion:

The patient-facing booking frontend still has localStorage as a source of truth and independently generates appointment slots. This directly violates the target model. Patient booking must consume canonical projected intervals and send a booking mutation to the backend.

### 4.4 Next.js admin appointment area

Next.js admin appointment currently contains:

| Current area                 | Verified evidence                                       | Current behavior                                                                                                            |
| ---------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| In-memory admin appointments | `src/features/appointment-pasien/api/service.ts:10-109` | Admin appointment records are stored in an in-memory array.                                                                 |
| Appointment lifecycle        | `src/features/appointment-pasien/api/types.ts:1-32`     | `LiveStatus` contains appointment/queue statuses such as `SUDAH BUAT JANJI`, `MENUNGGU`, `SELESAI`, and `TIDAK ADA DOKTER`. |

Current appointment conclusion:

Appointment lifecycle already exists as a separate concept in the frontend. It must not be collapsed into availability states. However, the current service layer is not canonical because it is in-memory.

---

## 5. Frontend Contradictions Against Target Domain

| Contradiction                              | Current behavior                                                                                    | Why it conflicts                                                                                  | Affected frontend layers                                                         | Required frontend migration                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Penuh` as primary state                   | Contracts, filters, cards, calendars, grids, modals, and tokens treat `Penuh` as a status.          | Target state is `OCCUPIED -> Terisi`; "full" is an old aggregate slot concept.                    | DTO/types, filters, calendar, detail sheet, grid, modals, status tokens.         | Replace primary availability enum with `OPEN`, `OCCUPIED`, `CLOSED`; label `OCCUPIED` as `Terisi`. |
| `Cuti` as primary state                    | Mobile and web treat `Cuti` as a schedule/day status.                                               | Target state is `CLOSED`; leave is metadata such as `closedReason = leave`.                       | Mobile form/store, admin status logic, calendar, grid, leave calculator, tokens. | Render leave as `Tutup` with reason, not as a fourth top-level availability state.                 |
| Manual interval end input                  | Mobile form has `From` and `To`; web session modals have `jam_mulai` and `jam_selesai`.             | Product says doctors should not enter per-consultation `to`; interval end derives from duration.  | Flutter drawer, mobile repository payload, web add/edit session modals, DTOs.    | Replace per-interval end input with availability start plus authoritative boundary/window.         |
| Manual empty slot/slot count CRUD          | Admin modals expose `slot_tersedia`, `kuota_pasien`, `kapasitas_per_hari`; mobile exposes capacity. | Slots should be projected from duration and boundary, not manually edited as empty rows/counters. | Web DTOs, cards, modals, tables, export, mobile model/store.                     | Use projection summaries and interval statuses from backend.                                       |
| Hardcoded duration                         | Patient time picker increments by `30` minutes.                                                     | Duration is configurable and should come from the canonical effective policy.                     | Patient web booking time picker.                                                 | Remove local duration math; render server projection.                                              |
| Hardcoded shifts                           | Patient web uses fixed standard shifts; web admin grid uses fixed day-part shift groups.            | Start time must be arbitrary and anchored to practitioner availability.                           | Patient time picker, admin hourly grid.                                          | Replace with timeline projection windows from backend.                                             |
| Hour-only schedule rendering               | Admin hourly grid parses only `HH` from `HH:mm`.                                                    | `08:45` or `09:40` cannot render correctly in hour cells.                                         | Admin detail sheet grid.                                                         | Replace with minute-accurate timeline blocks.                                                      |
| Local status overrides                     | Admin hourly grid uses `hourlyOverrides`.                                                           | Status cannot be locally authoritative.                                                           | Admin detail sheet grid.                                                         | Mutate backend, then refetch canonical projection.                                                 |
| Local extra sessions                       | Admin hourly grid adds `extraSessions` and recomputes capacity locally.                             | Projection must be canonical; local projection can drift.                                         | Admin detail sheet grid and add session flow.                                    | Replace with backend mutation plus projection refetch.                                             |
| LocalStorage appointments                  | Patient booking saves appointments and queues in localStorage.                                      | Appointment booking must be authoritative and double-booking-safe server-side.                    | Patient booking service and hooks.                                               | Replace with booking API and canonical query invalidation/refetch.                                 |
| In-memory admin appointment service        | Admin appointments are stored in an array.                                                          | Admin appointment view cannot reconcile with schedule occupancy.                                  | Appointment admin service.                                                       | Use canonical appointment API.                                                                     |
| Failed optimistic mobile mutation persists | Mobile keeps optimistic local update after server error.                                            | Failed schedule mutation must not silently become local truth.                                    | Flutter store.                                                                   | Mark stale/offline state clearly or rollback; canonical response/refetch required.                 |
| Status mapping bug                         | Detail sheet maps `tutup` selection to `Penuh`.                                                     | `CLOSED` and occupancy cannot be conflated.                                                       | Admin detail sheet.                                                              | Delete old mapping with new canonical state model.                                                 |
| Stale docs                                 | Existing reports still call `Penuh/Cuti` ready or acceptable.                                       | They conflict with current product direction.                                                     | Documentation and team handoff.                                                  | Treat this report as the new frontend migration source.                                            |

---

## 6. Target Frontend Contract Model

This is the frontend-facing shape required by mobile and web. Field names are examples for clarity, not final backend naming instructions.

### 6.1 Schedule projection read model

The frontend needs a canonical projection for a practitioner, date, and optional service/polyclinic context:

```json
{
  "practitionerId": "string",
  "date": "YYYY-MM-DD",
  "timezone": "Asia/Jakarta",
  "effectiveDurationMinutes": 30,
  "durationPolicy": {
    "source": "clinic | practitioner | service | schedule | unknown",
    "canEdit": false
  },
  "availability": [
    {
      "id": "string",
      "startsAt": "2026-09-23T08:45:00+07:00",
      "boundaryAt": "2026-09-23T12:00:00+07:00",
      "label": "Sesi Pagi",
      "room": null,
      "service": null
    }
  ],
  "summary": {
    "capacity": 6,
    "openCount": 4,
    "occupiedCount": 1,
    "closedCount": 1
  },
  "intervals": [
    {
      "id": "string",
      "availabilityId": "string",
      "startsAt": "2026-09-23T08:45:00+07:00",
      "endsAt": "2026-09-23T09:15:00+07:00",
      "status": "OPEN",
      "label": "Buka",
      "closedReason": null,
      "appointment": null,
      "permissions": {
        "canBook": true,
        "canInspectOccupant": false,
        "canClose": true,
        "canReopen": false
      }
    },
    {
      "id": "string",
      "availabilityId": "string",
      "startsAt": "2026-09-23T09:15:00+07:00",
      "endsAt": "2026-09-23T09:45:00+07:00",
      "status": "OCCUPIED",
      "label": "Terisi",
      "closedReason": null,
      "appointment": {
        "id": "string",
        "displayName": "Redacted or role-filtered",
        "queueNumber": "optional"
      },
      "permissions": {
        "canBook": false,
        "canInspectOccupant": true,
        "canClose": false,
        "canReopen": false
      }
    },
    {
      "id": "string",
      "availabilityId": "string",
      "startsAt": "2026-09-23T09:45:00+07:00",
      "endsAt": "2026-09-23T10:15:00+07:00",
      "status": "CLOSED",
      "label": "Tutup",
      "closedReason": {
        "code": "leave",
        "label": "Cuti dokter"
      },
      "appointment": null,
      "permissions": {
        "canBook": false,
        "canInspectOccupant": false,
        "canClose": false,
        "canReopen": true
      }
    }
  ]
}
```

### 6.2 Projection math the frontend must reflect, not own

The frontend may show the formula in tests and documentation, but it must not independently become a second source of truth for production booking:

```text
slot_start(i) = availabilityStart + i * effectiveDuration
slot_end(i)   = slot_start(i) + effectiveDuration
capacity      = floor((boundary - availabilityStart) / effectiveDuration)
```

Example:

```text
availabilityStart = 09:40
boundary          = 12:00
duration          = 30 minutes

available duration = 140 minutes
capacity           = floor(140 / 30) = 4

intervals:
09:40-10:10
10:10-10:40
10:40-11:10
11:10-11:40

remaining 20 minutes is not an appointment interval
```

### 6.3 Mutation response rule

Every schedule mutation should follow this frontend behavior:

```text
user action
-> backend mutation
-> canonical backend response
-> query invalidation or direct projection replacement
-> UI reconciliation
```

The frontend must not update unrelated local arrays and assume the result is correct.

---

## 7. Flutter Mobile Migration Requirements

Mobile is the upstream workflow, so it needs the strictest UX correction first.

### 7.1 Mobile data contract migration

Replace the current mobile schedule write model:

```text
date
session
startTime
endTime
capacity
isAvailable
```

with a model closer to:

```text
date or recurrence rule
availabilityStart
boundary/window/session reference
effectiveDurationMinutes, read-only unless user is authorized to edit policy
room or service context, if required by current product
closure metadata, if the user is closing availability
```

The mobile frontend should not send manual per-consultation `endTime` as if it is an independently authored slot. If backend still requires a boundary time, the UI must make the distinction clear:

```text
Start: when the doctor starts accepting patients
Boundary: when this availability window stops accepting complete intervals
Derived interval end: Start + effectiveDuration
```

### 7.2 Mobile form migration

Current verified UI:

```text
_ScheduleFormSlot has from/to
UI labels are From and To
Status options include Menunggu, Buka, Cuti
```

Required UI:

| Current field               | Migration                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `From`                      | Keep as `Start`, but support arbitrary minute precision such as `08:45`.                                                                        |
| `To`                        | Remove as per-appointment end input. If a boundary is required, rename and reposition it as availability boundary/window, not consultation end. |
| `capacity` or `targetQuota` | Remove as direct empty-slot authoring. Show projected capacity from server.                                                                     |
| `isAvailable` toggle        | Replace with `OPEN/CLOSED` availability intent and closure reason.                                                                              |
| `Cuti` status               | Replace with `Tutup` plus `closedReason = leave`.                                                                                               |
| `Menunggu` schedule status  | Keep only if it belongs to approval workflow; do not mix with availability.                                                                     |

### 7.3 Mobile schedule screen migration

The schedule screen should render:

1. A date selector/calendar summary.
2. Backend-projected timeline intervals.
3. Counts for `Buka`, `Terisi`, and `Tutup`.
4. Occupant details for `Terisi` intervals only when the logged-in role is authorized.
5. Clear stale/offline markers if cached data is shown.

It should not render:

1. Locally fabricated available slot counts.
2. Locally persisted failed mutations as if they succeeded.
3. `Cuti` as a fourth primary state.
4. Hour-only time choices when arbitrary minute starts are allowed.

### 7.4 Mobile store/cache migration

Current store behavior keeps an optimistic update after error. That must change.

Allowed mobile cache behavior:

1. Read-only stale cache may be displayed if clearly marked.
2. Pending mutations may be displayed as pending.
3. Failed mutations must rollback or remain visibly failed.
4. A failed mutation must not silently become canonical schedule state.

---

## 8. Next.js Admin Web Migration Requirements

### 8.1 Admin API/type migration

Replace old feature types:

```text
ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti' | 'Tutup'
DoctorDailySession.jam_selesai
DoctorDailySession.kuota_pasien
DoctorDailySession.slot_tersedia
DoctorDailySession.status_sesi
DoctorSchedule.slot_tersedia
DoctorSchedule.kapasitas_per_hari
```

with frontend projection types:

```text
AvailabilityState = 'OPEN' | 'OCCUPIED' | 'CLOSED'
TimelineProjection
TimelineAvailabilityWindow
TimelineInterval
TimelineSummary
DurationPolicy
ClosureReason
OccupantSummary
```

`Buka`, `Terisi`, and `Tutup` should become labels derived from canonical states, not the canonical values themselves.

### 8.2 Admin list/card migration

The doctor schedule card should stop centering the UI on:

```text
slot_tersedia / kapasitas_per_hari
Penuh
Cuti
```

It should show:

```text
effective duration
next availability start
projection boundary or window label
open interval count
occupied interval count
closed interval count
current availability state summary
```

If the doctor has not created availability for a date, the card can show `Belum Diatur`, but that must be an empty-configuration UI state, not an availability state sent to booking.

### 8.3 Admin detail sheet migration

The calendar can remain as the date navigation surface, but the old hourly grid should be replaced.

Current hourly grid problems:

1. It uses fixed shift buckets.
2. It renders one-hour cells.
3. It parses only the hour from time strings.
4. It lets admin override hour status locally.
5. It adds extra sessions locally.
6. It shows `Penuh` and `Cuti` as primary states.

Required detail layout:

```text
Header:
  practitioner identity
  service/polyclinic/room context
  selected date
  effective duration
  projection summary

Calendar:
  day-level summary only
  labels: Buka, Terisi, Tutup

Timeline:
  X axis = time
  Y axis = availability window, room, or service lane when applicable
  blocks = projected intervals
  block width = interval duration
  block start = interval startsAt
  block label = Buka/Terisi/Tutup
  occupied block click = occupant/appointment details if authorized
  closed block click = closed reason and reopen action if authorized
```

The timeline must be minute-accurate. `08:45` and `09:40` must render as anchored starts, not rounded hour cells.

### 8.4 Admin mutation migration

Current modals should be replaced or refactored:

| Current UI                   | Required migration                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `DoctorAddSessionModal`      | Availability/window editor. Do not ask for manual `slot_tersedia`. Do not expose `Penuh` or `Cuti` as primary statuses.                       |
| `DoctorEditSessionModal`     | Availability/window or closure editor. If editing an existing occupied window affects appointments, backend must return conflict information. |
| `DoctorScheduleEditModal`    | Duration policy and closure controls must be separated from availability projection.                                                          |
| Calendar day status dropdown | Only allowed actions should map to canonical mutations: open/reopen, close with reason, or inspect summary. No `Penuh` action.                |

Admin mutation UX rules:

1. Submit mutation to backend.
2. Show pending state.
3. On success, refetch projection or replace with canonical response.
4. On conflict, show conflict details from backend.
5. On failure, do not mutate local schedule as if success occurred.

### 8.5 Admin filters and tokens

Replace filter/status options:

```text
Old: Buka, Penuh, Cuti
New: Buka, Terisi, Tutup
```

Update shared status token mapping:

```text
OPEN     -> Buka
OCCUPIED -> Terisi
CLOSED   -> Tutup
```

`leave`, `manual closure`, `clinic closure`, and `schedule cancellation` should be reason metadata under `CLOSED`, not token-level primary statuses.

---

## 9. Next.js Patient Web Migration Requirements

Patient booking must become a consumer of the same schedule projection.

### 9.1 Remove local slot generation

The patient time slot picker currently has:

```text
STANDARD_SHIFTS
curMins += 30
simulated bookedCount
availableCount from local math
Penuh label
```

All of that must be removed from production scheduling.

The patient flow should:

1. Ask the backend for projected intervals for selected practitioner/date/service.
2. Render `OPEN` intervals as selectable.
3. Render `OCCUPIED` intervals as disabled `Terisi`.
4. Render `CLOSED` intervals as disabled `Tutup`.
5. Send booking mutation for the selected interval.
6. Refetch or reconcile with canonical booking response.

### 9.2 Remove local appointment source of truth

Patient booking currently writes appointments and queues to localStorage. That must not be used for production booking.

Required patient behavior:

```text
select OPEN interval
-> POST booking mutation
-> backend validates availability and prevents double booking
-> backend returns appointment/queue representation
-> frontend invalidates appointment, queue, and schedule projection queries
```

### 9.3 Patient privacy

Patient clients should not receive unnecessary occupant details for other patients.

For patient-facing projection:

```text
OCCUPIED interval:
  appointment: null or redacted
  status: OCCUPIED
  label: Terisi
```

For admin/doctor clients:

```text
OCCUPIED interval:
  appointment: role-filtered occupant summary
```

---

## 10. Admin Appointment Migration Requirements

The admin appointment feature already has separate lifecycle statuses. That separation is good and must be preserved.

Required migration:

1. Replace in-memory `appointmentRecords` with canonical backend reads/mutations.
2. Keep appointment lifecycle separate from availability state.
3. Link occupied schedule intervals to active appointment or queue entries.
4. When admin changes appointment lifecycle, schedule projection should be invalidated if occupancy changes.

Do not convert appointment statuses such as `MENUNGGU` or `SELESAI` into availability states.

---

## 11. Backend Delegation From Frontend Perspective

This section states what the frontend needs. It does not prescribe backend table names or implementation internals.

### Already supported in frontend scaffolding

1. Next.js already has feature-level API layers and TanStack Query key patterns.
2. Next.js admin schedule already has server action/path wrappers for schedule reads and mutations.
3. Next.js mutation code already uses invalidation patterns after schedule mutation.
4. Flutter already has repository methods for schedule reads, writes, booked patients, and reference options.
5. Flutter already has reference parsing for `timeSlotIntervals`, which can evolve into effective duration display/selection.

### Missing from frontend contract

1. A canonical schedule projection response with intervals.
2. Effective consultation duration in every projection response.
3. Authoritative availability start and boundary/window data.
4. `OPEN/OCCUPIED/CLOSED` canonical availability states.
5. `closedReason` metadata for leave/closure reasons.
6. Role-filtered occupant or appointment summary for occupied intervals.
7. Conflict-safe booking mutation response.
8. Canonical response after schedule mutation.
9. Queryable duration policy and permission metadata.
10. Stale/offline semantics for mobile if offline scheduling is supported.

### Incorrect semantics in current frontend contract

1. `Penuh` as primary status.
2. `Cuti` as primary status.
3. `slot_tersedia` as editable schedule truth.
4. `kapasitas_per_hari` as manually authored slot truth.
5. `jam_selesai` as manually authored consultation interval end.
6. LocalStorage appointment and queue creation.
7. In-memory admin appointment records.
8. Independent slot generation in patient web.
9. Hour-only rendering in admin web.
10. Failed optimistic mobile writes preserved as local truth.

### Needs frontend migration

1. Flutter model, repository payloads, store semantics, and add/edit schedule drawer.
2. Next.js schedule DTOs and feature types.
3. Next.js admin schedule card, detail sheet, timeline/calendar, modals, filters, tokens, export.
4. Next.js patient booking calendar/time picker and reservation model.
5. Next.js admin appointment service integration.
6. Existing schedule documentation that still says the old status/slot model is ready.

### Needs backend capability for frontend to complete migration

Logical capabilities needed:

1. Read schedule projection for practitioner/date/context.
2. Read monthly/day summary for calendar rendering.
3. Create/update availability definition from mobile/admin.
4. Close/reopen availability interval, window, or day with reason metadata.
5. Read effective duration policy.
6. Update duration policy if role-authorized.
7. Create appointment from selected projected interval.
8. Cancel/reschedule appointment and return occupancy impact.
9. Read appointment occupying an interval, role-filtered.
10. Return conflict errors in a structured way.

These may be implemented through existing routes or new routes. Frontend does not require exact route names as long as the contract is coherent and canonical.

### Needs authorization decisions

The frontend needs explicit backend permissions for:

1. Doctor/staff creating or updating own availability.
2. Admin/CS updating availability.
3. Admin/CS changing duration policy.
4. Doctor/admin inspecting occupied interval details.
5. Patient seeing only redacted occupied intervals.
6. Who can close/reopen intervals.
7. Who can override closures caused by leave or clinic closure.

---

## 12. Candidate Removals Verified In Frontend

| Candidate removal                          | Exists?                  | Evidence                                                                                                        | Action                                                                                 |
| ------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Manual end-time input                      | Yes                      | Mobile `from/to`; web `jam_selesai` in DTOs and modals.                                                         | Remove as per-consultation end input. Keep boundary/window only if domain requires it. |
| Manual empty-slot CRUD                     | Yes                      | Web `slot_tersedia`, `kuota_pasien`, `kapasitas_per_hari`; mobile `capacity`, `availableSlots`.                 | Replace with projection summaries.                                                     |
| `Penuh` primary state                      | Yes                      | DTOs, types, calendar, grid, modals, filters, tokens.                                                           | Replace with `OCCUPIED -> Terisi`.                                                     |
| `Cuti` primary state                       | Yes                      | Mobile status options, admin status logic, tokens, filters.                                                     | Replace with `CLOSED -> Tutup` plus `closedReason`.                                    |
| Duplicated duration calculation            | Yes                      | Patient web increments by hardcoded 30 minutes.                                                                 | Remove local slot generation.                                                          |
| Duplicated slot generation                 | Yes                      | Patient web and admin hourly grid both infer slots/status locally.                                              | Render backend projection.                                                             |
| Hardcoded 30-minute values                 | Yes                      | Patient time slot picker uses `curMins + 30`.                                                                   | Use `effectiveDurationMinutes` from projection.                                        |
| Fallback schedule data                     | Yes                      | Admin service catches errors and returns empty or static status options. Mobile returns local cached schedules. | Do not silently hide canonical data failures.                                          |
| Local dummy appointments                   | Yes                      | Patient localStorage and admin in-memory array.                                                                 | Replace with backend appointment API.                                                  |
| Manual frontend-only state transformations | Yes                      | `hourlyOverrides`, `extraSessions`, local capacity recompute.                                                   | Remove or make pending-only until canonical response.                                  |
| Obsolete API parameters                    | Likely for target domain | `endTime`, `capacity`, `slot_tersedia`, `status_sesi`.                                                          | Backend/frontend contract migration required.                                          |

---

## 13. Frontend Migration Phases

### Phase 1: Contract freeze

Define frontend-facing types:

```text
AvailabilityState
TimelineProjection
TimelineInterval
TimelineAvailabilityWindow
TimelineSummary
ClosureReason
DurationPolicy
OccupantSummary
```

Block new UI work that introduces `Penuh` or `Cuti` as primary states.

### Phase 2: Mobile upstream correction

1. Replace `From/To` slot editor with availability start and boundary/window editor.
2. Support arbitrary minute input.
3. Render backend-projected intervals.
4. Remove silent persistence of failed optimistic updates.
5. Replace `Cuti` top-level status with `Tutup` plus reason.

### Phase 3: Next.js admin schedule correction

1. Replace schedule DTOs and feature types.
2. Replace status filters and token mapping.
3. Replace hourly grid with timeline projection.
4. Refactor add/edit session modals into availability/closure editors.
5. Remove local `hourlyOverrides` and `extraSessions` as canonical schedule state.
6. Keep calendar as summary/navigation only.

### Phase 4: Patient booking correction

1. Remove `STANDARD_SHIFTS`.
2. Remove hardcoded `30`.
3. Remove simulated booked counts.
4. Remove localStorage booking source of truth.
5. Book only canonical `OPEN` intervals.

### Phase 5: Appointment admin correction

1. Replace in-memory appointment records.
2. Connect appointment lifecycle to canonical reads/mutations.
3. Invalidate schedule projection when appointment occupancy changes.

### Phase 6: Documentation and test correction

1. Update stale schedule manifest and QA docs.
2. Add regression tests for `08:45` anchored starts.
3. Add regression tests for `09:40-12:00` with `30` minute duration producing 4 intervals.
4. Add tests that `Penuh` and `Cuti` are not primary availability states.
5. Add tests that patient booking UI does not generate slots independently.

---

## 14. Acceptance Criteria

The frontend migration is not complete until all criteria below are true.

1. Flutter schedule creation no longer asks doctors to manually input per-consultation `To`.
2. Flutter supports arbitrary minute start times such as `08:45`.
3. Flutter renders `Buka`, `Terisi`, and `Tutup`, not `Penuh` and `Cuti` as primary states.
4. Flutter does not keep failed schedule mutations as canonical local truth.
5. Next.js admin schedule types no longer define `ScheduleDayStatus = 'Buka' | 'Penuh' | 'Cuti' | 'Tutup'`.
6. Next.js admin detail sheet no longer uses hour-only schedule cells as the source schedule view.
7. Next.js admin detail sheet renders a minute-accurate timeline projection.
8. Next.js admin modals no longer expose manual `slot_tersedia` as authoritative schedule input.
9. Next.js status filters show only `Buka`, `Terisi`, and `Tutup`.
10. `Cuti` appears only as closed reason or explanatory metadata.
11. `Penuh` does not appear as a primary schedule availability state.
12. Patient web does not use `STANDARD_SHIFTS` to create available times.
13. Patient web does not hardcode `30` minutes for production slot generation.
14. Patient web books only intervals marked `OPEN` by canonical projection.
15. Patient web does not use localStorage as production appointment/queue source of truth.
16. Admin appointment service does not use an in-memory array as production appointment source.
17. Occupied intervals are clickable for authorized admin/doctor users and show role-filtered appointment details.
18. Occupied intervals are redacted or non-inspectable for unauthorized patient users.
19. Mutation success always reconciles against canonical backend response or query refetch.
20. Mutation failure does not silently mutate visible canonical schedule state.

---

## 15. Open Product Questions For Backend/Product Alignment

These are not blockers to defining the frontend migration, but they must be answered before final endpoint/schema work.

1. What is the authoritative boundary source: clinic operating hours, named session, practitioner shift, service schedule, or per-availability window?
2. Who can edit consultation duration: admin only, doctor, or both?
3. What is the duration precedence: clinic, practitioner, service, schedule, or explicit override?
4. Should duration changes apply only to future availability definitions?
5. Does every occupied interval map to an appointment, a queue ticket, or either one?
6. What exact appointment statuses count as active occupancy?
7. Can admin close a single interval that is already occupied, or must the appointment be cancelled/rescheduled first?
8. Should mobile support offline schedule mutation, or only offline read cache?
9. What occupant details may doctors see versus admin/CS versus patients?
10. Is `Belum Diatur` still needed as a frontend empty-configuration display state?

---

## 16. Final Frontend Position

Frontend wants a canonical schedule projection, not more client-side slot manipulation.

Mobile should become the upstream workflow for authoring availability definitions, but it must send mutations to the backend and reconcile with canonical responses.

Admin web should become the operational projection consumer and authorized editor, using a timeline/Gantt-like view instead of the current hour grid.

Patient web should become a pure booking consumer of `OPEN` projected intervals.

The migration is fundamentally a domain contract correction across frontend clients. Relabeling `Penuh` to `Terisi` without replacing slot generation, local appointments, manual `endTime`, and stale optimistic state would be a fake migration.
