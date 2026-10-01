# Relocate Room Collision Check to Modal & Purge Purple Grid State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Purge misleading purple ("Terisi Dokter Lain") slots from the Doctor Schedule Grid and relocate room collision detection to its true location: the room selection step in the Add Session Modal, disabling occupied rooms and offering a "Lihat siapa" modal trigger.

**Architecture:** 
1. The Schedule Grid reflects doctor-level facts only (scheduled, cuti, clinic closed). Unscheduled slots remain clean `UNSCHEDULED` (dashed border) and directly clickable.
2. Room collision occurs only when room and time intersect: `StepRoomSelect` calls `GET /api/v1/schedules/reference/rooms?date=...&startTime=...&endTime=...`. Occupied rooms are disabled with badge `Terisi (dr. ...)`, preventing selection, and render a `"Lihat dokter"` action button triggering `DoctorOccupancyConflictModal`.
3. Backend reference repository loads occupant practitioner profile & specialty, returning `occupantDetails` along with `isOccupied`.

**Tech Stack:** Next.js 16 (App Router), React 19, TanStack Query v5, Tailwind CSS v4, NestJS 11, Drizzle ORM, PostgreSQL.

---

## Global Constraints
- Maximum file length strictly `< 500 LOC` for all modified and created files.
- Zero hardcoded color literals; use semantic Tailwind design tokens (`bg-destructive/10`, `text-destructive`, `text-primary`, etc.).
- Do not break existing availability guards for the header "Tambah Jadwal" button.
- Clean and deterministic UI/UX: no intermittent queries, no confusing purple slots on the main schedule sheet.

---

## Task Decomposition

### Task 1: Purge Purple Slot Projection from Backend Schedule Detail Query

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\infrastructure\drizzle\repositories\admin\drizzle-admin-doctor-schedule-detail.query.ts:230-290`
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\domain\resolvers\schedule-slot-state.resolver.ts:525-545`
- Test: `D:\Amanah-healthcare-backend\src\modules\schedules\domain\resolvers\schedule-slot-state.resolver.spec.ts`

**Interfaces:**
- Removes `otherDoctorSessionsInRoom` query from `drizzle-admin-doctor-schedule-detail.query.ts`.
- Ensures all future unassigned slots project as canonical `UNSCHEDULED` (`dashed_border`).

- [ ] **Step 1: Inspect and update resolver test for unscheduled slots**

```ts
// In schedule-slot-state.resolver.spec.ts
// Verify that an unscheduled slot without session is always UNSCHEDULED (dashed_border), not OCCUPIED_BY_OTHER
it('should resolve future slot without session as UNSCHEDULED with dashed_border variant', () => {
  const result = ScheduleSlotStateResolver.resolveContextProjection({
    scheduleDate: '2026-10-01',
    context: { code: 'MALAM', startTime: '18:00', endTime: '21:00' },
    intervalMinutes: 30,
    openedRanges: [],
    appointments: [],
    leavePeriods: [],
    closures: [],
    rescheduleEvents: []
  });
  const slot = result.slots.find((s) => s.startTime === '18:00');
  expect(slot?.uiVariant).toBe('dashed_border');
  expect(slot?.uiStatus).toBe('UNSCHEDULED');
});
```

- [ ] **Step 2: Remove other doctor room query in `drizzle-admin-doctor-schedule-detail.query.ts`**

Eliminate `otherDoctorSessionsInRoom` and `otherDoctorRoomOccupancies` from lines 231–290 and line 361. Pass empty array or omit it from `ScheduleSlotStateResolver.resolveContextProjection`.

- [ ] **Step 3: Run backend unit tests**

Run: `docker exec amanah-healthcare-backend-api-1 bun test src/modules/schedules/domain/resolvers/schedule-slot-state.resolver.spec.ts`
Expected: PASS.

---

### Task 2: Enhance Backend Reference Repository to Provide `occupantDetails`

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\domain\entities\schedule.entity.ts:99-108`
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\infrastructure\drizzle\repositories\shared\drizzle-schedule-reference.repository.ts:54-95`
- Test: `D:\Amanah-healthcare-backend\src\modules\schedules\presentation\schedules.controller.spec.ts`

**Interfaces:**
- Produces `ClinicRoomReferenceEntity.occupantDetails`:
  ```ts
  occupantDetails?: {
    practitionerName: string;
    specialty?: string;
    startTime: string;
    endTime: string;
    roomName: string;
  } | null;
  ```

- [ ] **Step 1: Add `occupantDetails` to `ClinicRoomReferenceEntity` in `schedule.entity.ts`**

```ts
export class ClinicRoomReferenceEntity {
  id: string;
  code: string;
  name: string;
  location?: string | null;
  floor?: string | null;
  isOccupied: boolean;
  occupiedBy?: string | null;
  occupantDetails?: {
    practitionerName: string;
    specialty?: string;
    startTime: string;
    endTime: string;
    roomName: string;
  } | null;
}
```

- [ ] **Step 2: Populate `occupantDetails` in `drizzle-schedule-reference.repository.ts`**

Include `medicalSpecialty: true` in the practitioner query relation:
```ts
with: {
  practitioner: {
    with: {
      staffProfile: true,
      medicalSpecialty: true,
    },
  },
  clinicRoom: true,
}
```
Construct `occupantDetails` with `practitionerName`, `specialty`, `startTime`, `endTime`, and `roomName`.

- [ ] **Step 3: Test room reference endpoint query with date/startTime/endTime**

Run: `docker exec amanah-healthcare-backend-api-1 bun test src/modules/schedules/presentation/schedules.controller.spec.ts`
Expected: PASS.

---

### Task 3: Update Frontend DTOs and API Service

**Files:**
- Modify: `D:\manage-stock\src\server\contracts\schedules\doctor-schedules.dto.ts:700-720`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\api\service.ts:145-161`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\api\queries.ts:46-56`
- Test: `D:\manage-stock\src\server\contracts\schedules\doctor-schedules.dto.test.ts`

**Interfaces:**
- `clinicRoomSchema` parses `occupantDetails`.
- `getClinicRooms` and `clinicRoomsQueryOptions` accept `{ date?: string; startTime?: string; endTime?: string; poliklinikId?: string; clinicUnitId?: string; }`.

- [ ] **Step 1: Add `clinicRoomOccupantDetailsSchema` to `doctor-schedules.dto.ts`**

```ts
export const clinicRoomOccupantDetailsSchema = z.object({
  practitionerName: z.string(),
  specialty: z.string().optional().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  roomName: z.string()
});
export type ClinicRoomOccupantDetails = z.infer<typeof clinicRoomOccupantDetailsSchema>;
```
Attach `occupantDetails: clinicRoomOccupantDetailsSchema.optional().nullable()` to `clinicRoomSchema`.

- [ ] **Step 2: Update `getClinicRooms` in `service.ts`**

Append `date`, `startTime`, and `endTime` to query string when present:
```ts
export async function getClinicRooms(params?: {
  poliklinikId?: string;
  clinicUnitId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}): Promise<ClinicRoom[]> {
  const qs = new URLSearchParams();
  if (params?.poliklinikId) qs.set('poliklinikId', params.poliklinikId);
  if (params?.clinicUnitId) qs.set('clinicUnitId', params.clinicUnitId);
  if (params?.date) qs.set('date', params.date);
  if (params?.startTime) qs.set('startTime', params.startTime);
  if (params?.endTime) qs.set('endTime', params.endTime);
  const q = qs.toString();
  const res = await clientFetch<ClinicRoom[] | { data?: ClinicRoom[] }>(
    `/api/v1/schedules/reference/rooms${q ? `?${q}` : ''}`
  );
  if (res && 'data' in res && Array.isArray(res.data)) return res.data;
  return (Array.isArray(res) ? res : []) as ClinicRoom[];
}
```

- [ ] **Step 3: Update `clinicRoomsQueryOptions` in `queries.ts`**

Forward the parameters to `queryKey` and `queryFn`.

---

### Task 4: Purge Purple Legend & Grid Slot Handler in Frontend

**Files:**
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\grid\doctor-grid-legend.tsx:26-31`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\model\useDoctorHourlyGrid.ts:234,339-346,479`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-daily-hourly-grid.tsx:25,380-386`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\utils\shift-slot-builder.ts:136-142,186-192`
- Test: `D:\manage-stock\src\features\jadwal-dokter\api\doctor-schedule-occupancy.test.ts`

**Interfaces:**
- Doctor schedule grid has NO purple slots and NO "Terisi Dokter Lain" in legend.
- Clicking an unscheduled slot always executes `ADD_SESSION` without showing any conflict modal at grid level.

- [ ] **Step 1: Remove "Terisi Dokter Lain" from `doctor-grid-legend.tsx`**

Remove the purple legend item completely.

- [ ] **Step 2: Clean up `useDoctorHourlyGrid.ts` and `doctor-daily-hourly-grid.tsx`**

Remove `selectedConflictSlot` state, remove `VIEW_OCCUPANCY_CONFLICT` branch in `handleSlotClick`, and remove `<DoctorOccupancyConflictModal>` from `doctor-daily-hourly-grid.tsx`.

- [ ] **Step 3: Update tests in `doctor-schedule-occupancy.test.ts`**

Ensure tests assert clean `UNSCHEDULED` behavior and verify removal of purple legend item.

---

### Task 5: Enhance `StepRoomSelect` and `DoctorOccupancyConflictModal`

**Files:**
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\add-session\step-room-select.tsx`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-occupancy-conflict-modal.tsx`
- Test: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-occupancy-conflict-modal.test.ts`

**Interfaces:**
- `StepRoomSelectProps` adds `onViewConflict?: (room: ClinicRoom) => void`.
- `DoctorOccupancyConflictModalProps` adds `conflictDetails?: ClinicRoomOccupantDetails | null`.

- [ ] **Step 1: Enhance `DoctorOccupancyConflictModal` to support `conflictDetails`**

Allow the modal to render directly from `conflictDetails`:
```tsx
export interface DoctorOccupancyConflictModalProps {
  slot?: OccupancySlot | null;
  conflictDetails?: {
    practitionerName: string;
    specialty?: string | null;
    roomName: string;
    startTime: string;
    endTime: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  targetDoctorName?: string;
}
```

- [ ] **Step 2: Update `StepRoomSelect` with disabled styling and "Lihat dokter" trigger**

When `room.isOccupied` is true:
- Button is disabled (`disabled={isOccupied}`).
- Badge displays `Terisi (${room.occupiedBy})` or `Terisi`.
- Beside it, render:
```tsx
<button
  type='button'
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    onViewConflict?.(room);
  }}
  className='text-[11px] font-semibold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-1'
>
  Lihat dokter
  <Icons.arrowRight className='size-2.5 stroke-[2.5]' />
</button>
```

- [ ] **Step 3: Test modal rendering with `conflictDetails`**

Run: `bun test src/features/jadwal-dokter/components/doctor-occupancy-conflict-modal.test.ts`
Expected: PASS.

---

### Task 6: Wire `useDoctorAddSessionModal` and Mount Conflict Modal in `DoctorAddSessionModal`

**Files:**
- Modify: `D:\manage-stock\src\features\jadwal-dokter\model\useDoctorAddSessionModal.ts`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-add-session-modal.tsx`

**Interfaces:**
- Queries `clinicRoomsQueryOptions({ date: selectedDate, startTime: selectedSlot?.time, endTime: selectedSlot?.endTime })`.
- Auto-selects default room only if NOT occupied; falls back to first available room.
- Prevents proceeding (`canProceedNext = false`) if selected room is occupied.
- Mounts `DoctorOccupancyConflictModal` triggered by `selectedConflictRoom`.

- [ ] **Step 1: Update `useDoctorAddSessionModal.ts`**

Pass date and times to `clinicRoomsQueryOptions`:
```ts
const queryStartTime = selectedSlot?.time || initialStartTime;
const queryEndTime = selectedSlot?.endTime || (initialStartTime ? computeSafeEndTime(initialStartTime, initialEndTime) : undefined);

const { data: clinicRooms = [], isLoading: isLoadingRooms } = useQuery({
  ...clinicRoomsQueryOptions({
    date: selectedDate,
    startTime: queryStartTime,
    endTime: queryEndTime
  }),
  enabled: isOpen
});
```
Validate that `canProceedNext` requires `selectedRoom && !selectedRoom.isOccupied`.

- [ ] **Step 2: Mount `DoctorOccupancyConflictModal` in `doctor-add-session-modal.tsx`**

Maintain `selectedConflictRoom` state, pass `onViewConflict={(room) => setSelectedConflictRoom(room)}` to `StepRoomSelect`, and render `<DoctorOccupancyConflictModal>`.

---

### Task 7: Comprehensive Verification & Regression Testing

**Files:**
- All touched files in frontend and backend.

- [ ] **Step 1: Run frontend tests**

Run: `bun test` in `D:\manage-stock`.
Expected: All tests pass.

- [ ] **Step 2: Run backend tests**

Run: `docker exec amanah-healthcare-backend-api-1 bun test` in backend.
Expected: All tests pass.

- [ ] **Step 3: Verify container health and build status**

Verify backend container log shows clean start with zero errors.
Verify frontend types pass: `bun run lint` or `bun x tsc --noEmit`.
