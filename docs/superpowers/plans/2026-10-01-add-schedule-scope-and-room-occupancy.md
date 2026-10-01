# Add Schedule Scope Consistency & Room Occupancy Collision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate disabled-session inconsistency in Admin "Tambah Jadwal" modal (aligning header entry with direct grid slot entry) and support cross-doctor room occupancy collision visualization (purple grid slots & conflict inspection modal) driven authoritatively by backend SSOT.

**Architecture:**
1. **Backend SSOT Computation**: `drizzle-admin-doctor-schedule-detail.query.ts` queries sessions of other doctors scheduled in the target doctor's default clinic room on the evaluation date. `schedule-slot-state.resolver.ts` overlays these collisions onto theoretical slots, producing canonical `uiVariant: 'purple_other'`, `uiStatus: 'OCCUPIED_BY_OTHER'`, `actionType: 'VIEW_OCCUPANCY_CONFLICT'`, and detailed `conflictInfo`.
2. **Frontend Tokenization & Thin Rendering**: `shift-slot-builder.ts` registers `purple_other` in `UI_VARIANT_CONFIG` and `STATUS_CONFIG` using semantic tokens (`bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 dotBg: bg-purple-500`). `DoctorGridLegend` includes the purple legend indicator "Terisi Dokter Lain".
3. **Modal Availability Correction**: `schedule-availability-guard.ts` and `useScheduleShiftAvailability.ts` remove the erroneous assumption that having an existing session locks the entire 6-hour shift. Shifts remain selectable as long as unallocated duration / available slots exist and the shift is not in the past. Redundant "Sudah Ada Jadwal" badges are removed.
4. **Collision Inspection Modal**: `DoctorOccupancyConflictModal` provides a lightweight, focused dialog displaying occupant doctor name, specialty, room name, time range, and explanation when a purple slot is clicked.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, Tailwind CSS v4, TanStack React Query v5, NestJS 11, Drizzle ORM, PostgreSQL.

## Global Constraints
- Maximum file length strictly `< 500 LOC` for all files.
- Zero client guessing or frontend business logic hallucination: backend remains authoritative SSOT.
- Zero hardcoded color literals: consume semantic design tokens (`bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30`).
- 100% test pass rate across both frontend (`bun test`) and backend (Jest).

---

### Task 1: Backend Drizzle Query & Resolver Extension for Cross-Doctor Room Occupancy

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\domain\resolvers\schedule-slot-state.resolver.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\domain\resolvers\schedule-slot-state.resolver.spec.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\schedules\infrastructure\drizzle\repositories\admin\drizzle-admin-doctor-schedule-detail.query.ts`

**Interfaces:**
- Consumes: `practitionerScheduleSessions` table with relations `practitioner` (and its `staffProfile`, `medicalSpecialty`) and `clinicRoom`.
- Produces: `SlotStateResolverInput.otherDoctorRoomOccupancies`, `SlotUiVariant: 'purple_other'`, `SlotUiStatus: 'OCCUPIED_BY_OTHER'`, `SlotActionType: 'VIEW_OCCUPANCY_CONFLICT'`, and `MultiDimensionalSlotProjection.conflictInfo`.

- [ ] **Step 1: Write the failing test for purple slot resolution in backend**

In `D:\Amanah-healthcare-backend\src\modules\schedules\domain\resolvers\schedule-slot-state.resolver.spec.ts`, add test case:
```ts
    it('should resolve slot as OCCUPIED_BY_OTHER with purple_other variant when another doctor occupies the room', () => {
      const input: SlotStateResolverInput = {
        scheduleDate: '2026-10-01',
        context: 'night',
        intervalMinutes: 30,
        currentDate: '2026-09-25',
        currentTime: '10:00',
        openedRanges: [], // Target doctor has no session at this time
        otherDoctorRoomOccupancies: [
          {
            sessionId: 'sess-other-1',
            practitionerId: 'prac-other-1',
            practitionerName: 'dr. Sarah Sp.A',
            specialty: 'Spesialis Anak',
            roomId: 'room-kia-1',
            roomName: 'Ruang KIA 1',
            startTime: '18:00',
            endTime: '19:00',
          },
        ],
      };

      const result = ScheduleSlotStateResolver.resolveContextProjection(input);
      const slot1800 = result.slots.find((s) => s.startTime === '18:00');
      const slot1830 = result.slots.find((s) => s.startTime === '18:30');
      const slot1900 = result.slots.find((s) => s.startTime === '19:00');

      expect(slot1800?.uiVariant).toBe('purple_other');
      expect(slot1800?.uiStatus).toBe('OCCUPIED_BY_OTHER');
      expect(slot1800?.actionType).toBe('VIEW_OCCUPANCY_CONFLICT');
      expect(slot1800?.conflictInfo?.type).toBe('ROOM_COLLISION_OTHER_DOCTOR');
      expect(slot1800?.conflictInfo?.practitionerName).toBe('dr. Sarah Sp.A');

      expect(slot1830?.uiVariant).toBe('purple_other');
      expect(slot1900?.uiVariant).toBe('dashed_border'); // Unscheduled after other doctor finishes
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- schedule-slot-state.resolver.spec.ts` in `D:\Amanah-healthcare-backend`
Expected: FAIL with compilation error on `otherDoctorRoomOccupancies` / `purple_other`.

- [ ] **Step 3: Update `schedule-slot-state.resolver.ts`**

In `D:\Amanah-healthcare-backend\src\modules\schedules\domain\resolvers\schedule-slot-state.resolver.ts`:
1. Add to type definitions:
```ts
export type SlotUiStatus =
  | 'UNSCHEDULED_PAST'
  | 'UNSCHEDULED'
  | 'COMPLETED'
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'OCCUPIED_BY_OTHER'
  | 'RESCHEDULED'
  | 'CLOSED_LEAVE'
  | 'CLOSED_CLINIC';

export type SlotUiVariant =
  | 'neutral_disabled'
  | 'dashed_border'
  | 'muted_gray'
  | 'success_green'
  | 'info_blue'
  | 'purple_other'
  | 'warning_amber'
  | 'sky_badge'
  | 'danger_red';

export type SlotActionType =
  | 'NONE'
  | 'ADD_SESSION'
  | 'VIEW_SESSION'
  | 'VIEW_PATIENTS'
  | 'VIEW_OCCUPANCY_CONFLICT';

export interface OtherDoctorRoomOccupancyFact {
  sessionId: string;
  practitionerId: string;
  practitionerName: string;
  specialty?: string;
  roomId: string;
  roomName: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface SlotStateResolverInput {
  scheduleDate: string;
  context: ScheduleShiftDefinition | ScheduleShift;
  intervalMinutes: number;
  currentDate?: string;
  currentTime?: string;
  openedRanges?: OpenedAvailabilityRange[];
  appointments?: ActiveAppointmentFact[];
  leavePeriods?: LeavePeriodFact[];
  closures?: ScheduleClosureFact[];
  rescheduleEvents?: RescheduleEventFact[];
  otherDoctorRoomOccupancies?: OtherDoctorRoomOccupancyFact[];
}

export interface SlotConflictInfo {
  type: string;
  sessionId?: string;
  practitionerId?: string;
  practitionerName?: string;
  practitionerSpecialty?: string;
  roomId?: string;
  roomName?: string;
  startTime?: string;
  endTime?: string;
  message?: string;
}
```
2. In `MultiDimensionalSlotProjection` interface: add `conflictInfo?: SlotConflictInfo | null;`
3. In `resolveContextProjection`:
Inside the slot loop, check for other doctor occupancy when `availabilityState === 'UNSCHEDULED'`:
```ts
      let conflictInfo: SlotConflictInfo | null = null;

      const otherDoctorOccupancy = (input.otherDoctorRoomOccupancies || []).find((occ) => {
        const occStart = parseClockTime(occ.startTime);
        const occEnd = parseClockTime(occ.endTime);
        return occStart < slot.endMinutes && occEnd > slot.startMinutes;
      });

      if (closure?.category === 'LEAVE') {
        ...
      } else if (availabilityState === 'UNSCHEDULED') {
        if (otherDoctorOccupancy) {
          uiStatus = 'OCCUPIED_BY_OTHER';
          uiLabel = otherDoctorOccupancy.practitionerName;
          uiSubLabel = otherDoctorOccupancy.roomName;
          uiVariant = 'purple_other';
          isClickable = true;
          actionType = 'VIEW_OCCUPANCY_CONFLICT';
          conflictInfo = {
            type: 'ROOM_COLLISION_OTHER_DOCTOR',
            sessionId: otherDoctorOccupancy.sessionId,
            practitionerId: otherDoctorOccupancy.practitionerId,
            practitionerName: otherDoctorOccupancy.practitionerName,
            practitionerSpecialty: otherDoctorOccupancy.specialty,
            roomId: otherDoctorOccupancy.roomId,
            roomName: otherDoctorOccupancy.roomName,
            startTime: otherDoctorOccupancy.startTime,
            endTime: otherDoctorOccupancy.endTime,
            message: `Ruangan ${otherDoctorOccupancy.roomName} sedang digunakan oleh ${otherDoctorOccupancy.practitionerName} (${otherDoctorOccupancy.specialty || 'Dokter'}) pada ${otherDoctorOccupancy.startTime} - ${otherDoctorOccupancy.endTime} WIB.`,
          };
        } else if (temporalState === 'PAST') {
          uiStatus = 'UNSCHEDULED_PAST';
          uiLabel = 'Belum Terjadwal';
          uiVariant = 'neutral_disabled';
          isClickable = false;
          actionType = 'NONE';
        } else {
          uiStatus = 'UNSCHEDULED';
          uiLabel = 'Belum Terjadwal';
          uiVariant = 'dashed_border';
          isClickable = true;
          actionType = 'ADD_SESSION';
        }
      }
```
Include `conflictInfo` in the returned `projectedSlots.push({ ..., conflictInfo })`.

- [ ] **Step 4: Update `drizzle-admin-doctor-schedule-detail.query.ts`**

In `D:\Amanah-healthcare-backend\src\modules\schedules\infrastructure\drizzle\repositories\admin\drizzle-admin-doctor-schedule-detail.query.ts`:
1. In `execute` method, query other doctor sessions scheduled in `prac.clinicRoomId` on `evalDate`:
```ts
    const [evalClosures, evalReschedules, otherDoctorSessionsInRoom] = await Promise.all([
      this.db.query.practitionerScheduleClosures?.findMany
        ? this.db.query.practitionerScheduleClosures.findMany({
            where: and(
              eq(practitionerScheduleClosures.practitionerId, prac.id),
              eq(practitionerScheduleClosures.scheduleDate, evalDate),
            ),
          })
        : Promise.resolve([]),
      this.db.query.scheduleRescheduleEvents?.findMany
        ? this.db.query.scheduleRescheduleEvents.findMany({
            where: and(
              eq(scheduleRescheduleEvents.practitionerId, prac.id),
              or(
                eq(scheduleRescheduleEvents.targetDate, evalDate),
                eq(scheduleRescheduleEvents.sourceDate, evalDate),
              ),
            ),
          })
        : Promise.resolve([]),
      prac.clinicRoomId
        ? this.db.query.practitionerScheduleSessions.findMany({
            where: and(
              eq(practitionerScheduleSessions.roomId, prac.clinicRoomId),
              ne(practitionerScheduleSessions.practitionerId, prac.id),
              eq(practitionerScheduleSessions.scheduleDate, evalDate),
              ne(practitionerScheduleSessions.status, 'cancelled'),
            ),
            with: {
              practitioner: {
                with: {
                  staffProfile: true,
                  medicalSpecialty: true,
                },
              },
              clinicRoom: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const otherDoctorRoomOccupancies = (otherDoctorSessionsInRoom || []).map((s) => ({
      sessionId: s.id,
      practitionerId: s.practitionerId,
      practitionerName:
        s.practitioner?.staffProfile?.fullName ||
        s.practitioner?.displayName ||
        'Dokter Lain',
      specialty:
        s.practitioner?.medicalSpecialty?.name ||
        s.practitioner?.staffProfile?.specialization ||
        'Spesialis',
      roomId: s.roomId || prac.clinicRoomId!,
      roomName: s.clinicRoom?.name || defaultRoomName,
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
    }));
```
2. Pass `otherDoctorRoomOccupancies` into `ScheduleSlotStateResolver.resolveContextProjection({ ..., otherDoctorRoomOccupancies })`.

- [ ] **Step 5: Run backend tests to verify it passes**

Run: `npm test -- schedule-slot-state.resolver.spec.ts` in `D:\Amanah-healthcare-backend`
Expected: PASS (all 12 tests pass).

---

### Task 2: Frontend Semantic Design Tokens & Shift Slot Builder Update

**Files:**
- Modify: `D:\manage-stock\src\features\jadwal-dokter\utils\shift-slot-builder.ts`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\grid\doctor-grid-legend.tsx`
- Modify: `D:\manage-stock\src\server\contracts\schedules\doctor-schedules.dto.ts`
- Test: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-schedule-occupancy.test.ts`

**Interfaces:**
- Consumes: Backend canonical `SlotUiVariant: 'purple_other'` and `SlotUiStatus: 'OCCUPIED_BY_OTHER'`.
- Produces: Semantic styling tokens in `UI_VARIANT_CONFIG` and `STATUS_CONFIG`, legend element in `DoctorGridLegend`.

- [ ] **Step 1: Write the failing test for `purple_other` in frontend**

In `D:\manage-stock\src\features\jadwal-dokter\components\doctor-schedule-occupancy.test.ts`, add:
```ts
  it('UI_VARIANT_CONFIG defines purple_other variant with purple semantic tokens', () => {
    expect(UI_VARIANT_CONFIG.purple_other).toBeDefined();
    expect(UI_VARIANT_CONFIG.purple_other.cellBg).toContain('purple');
    expect(UI_VARIANT_CONFIG.purple_other.border).toContain('purple');
    expect(STATUS_CONFIG.OCCUPIED_BY_OTHER.cellBg).toContain('purple');
    expect(STATUS_CONFIG.OCCUPIED_BY_OTHER.label).toBe('Terisi Dokter Lain');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/features/jadwal-dokter/components/doctor-schedule-occupancy.test.ts`
Expected: FAIL because `UI_VARIANT_CONFIG.purple_other` is undefined and `STATUS_CONFIG.OCCUPIED_BY_OTHER` uses amber.

- [ ] **Step 3: Implement `purple_other` in `shift-slot-builder.ts` and update DTO**

In `D:\manage-stock\src\features\jadwal-dokter\utils\shift-slot-builder.ts`:
Add to `UI_VARIANT_CONFIG`:
```ts
  purple_other: {
    cellBg: 'bg-purple-500/10 hover:bg-purple-500/15',
    border: 'border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-400',
    dotBg: 'bg-purple-500',
    timeText: 'text-foreground'
  }
```
Update `STATUS_CONFIG.OCCUPIED_BY_OTHER`:
```ts
  OCCUPIED_BY_OTHER: {
    label: 'Terisi Dokter Lain',
    cellBg: 'bg-purple-500/10 hover:bg-purple-500/15',
    border: 'border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-400',
    dotBg: 'bg-purple-500'
  }
```
In `src\server\contracts\schedules\doctor-schedules.dto.ts`, add `'purple_other'` to `slotUiVariantSchema` and `'OCCUPIED_BY_OTHER'` to `slotUiStatusSchema`.

- [ ] **Step 4: Update `doctor-grid-legend.tsx`**

In `D:\manage-stock\src\features\jadwal-dokter\components\grid\doctor-grid-legend.tsx`, add:
```tsx
      <div className='flex items-center gap-1.5'>
        <span className='size-2.5 rounded-full bg-purple-500 shrink-0' />
        <span className='text-purple-700 dark:text-purple-400 font-semibold'>
          Terisi Dokter Lain
        </span>
      </div>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test src/features/jadwal-dokter/components/doctor-schedule-occupancy.test.ts`
Expected: PASS.

---

### Task 3: Fix Header "Tambah Jadwal" Disabled Sessions & Availability Guard

**Files:**
- Modify: `D:\manage-stock\src\features\jadwal-dokter\utils\schedule-availability-guard.ts`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\model\useScheduleShiftAvailability.ts`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\add-session\step-session-select.tsx`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\utils\schedule-availability-guard.test.ts`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\model\useScheduleShiftAvailability.test.ts`

**Interfaces:**
- Consumes: `selectedDate`, `existingSessions`, `bounds`, `consultationDuration`.
- Produces: True mathematical shift availability (`isUnavailable: boolean`, `reason: 'PAST' | 'TIME_EXHAUSTED' | 'FULL' | null`, `badgeLabel: 'Sudah Berlalu' | 'Penuh' | null`).

- [ ] **Step 1: Write tests expressing correct shift availability behavior**

In `D:\manage-stock\src\features\jadwal-dokter\utils\schedule-availability-guard.test.ts`:
Replace test `locks shift when doctor already has an existing schedule in this shift` with:
```ts
  it('does NOT lock shift when doctor has an existing session but remaining slots exist', () => {
    const futureDate = new Date('2026-10-01');
    const fixedNow = new Date('2026-09-25T10:00:00');

    const result = isSessionShiftUnavailable({
      selectedDate: futureDate,
      bounds: morningBounds, // 06:00 - 12:00
      hasExistingSchedule: false,
      referenceNow: fixedNow
    });

    expect(result.unavailable).toBe(false);
    expect(result.reason).toBeNull();
  });
```

In `D:\manage-stock\src\features\jadwal-dokter\model\useScheduleShiftAvailability.test.ts`:
```ts
  it('allows selecting shift when doctor has one session but remaining slots are open', () => {
    const existingSessions: DoctorDailySession[] = [
      {
        id: 's-1',
        nama_sesi: 'Malam',
        jam_mulai: '18:00',
        jam_selesai: '18:30',
        kuota_pasien: 1,
        slot_tersedia: 1,
        status_sesi: 'buka'
      }
    ];

    const result = evaluateShiftAvailability({
      selectedDate: '2026-10-05',
      existingSessions,
      consultationDuration: 30
    });

    // Malam shift has 360 mins, only 30 mins used -> 330 mins remaining
    expect(result.MALAM.isUnavailable).toBe(false);
    expect(result.MALAM.badgeLabel).toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail or need adjustment**

Run: `bun test src/features/jadwal-dokter/model/useScheduleShiftAvailability.test.ts`
Expected: FAIL due to old `hasExisting` check blocking `MALAM`.

- [ ] **Step 3: Fix `schedule-availability-guard.ts` & `useScheduleShiftAvailability.ts`**

1. In `D:\manage-stock\src\features\jadwal-dokter\utils\schedule-availability-guard.ts`:
Remove lines 101-104:
```ts
  // REMOVE:
  // if (hasExistingSchedule) {
  //   return { unavailable: true, reason: SCHEDULE_UNAVAILABLE_REASONS.FULL };
  // }
```
Deprecate `hasExistingSchedule?: boolean` param (or default to false, non-blocking).

2. In `D:\manage-stock\src\features\jadwal-dokter\model\useScheduleShiftAvailability.ts`:
Calculate true covered minutes by `existingSessions` in that shift:
```ts
export function evaluateShiftAvailability({
  selectedDate,
  existingSessions = [],
  consultationDuration = 30
}: UseScheduleShiftAvailabilityParams): Record<ScheduleShift, ShiftAvailabilityStatus> {
  const result = {} as Record<ScheduleShift, ShiftAvailabilityStatus>;

  for (const shift of ALL_SCHEDULE_SHIFTS) {
    const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[shift];
    const shiftStartM = shiftBounds.startHour * 60;
    const shiftEndM = shiftBounds.endHour * 60;
    const totalShiftMinutes = shiftEndM - shiftStartM;

    // Calculate minutes occupied by doctor's existing sessions within this shift boundary
    let occupiedMinutes = 0;
    for (const session of existingSessions) {
      const sStart = parseTimeToMinutes(session.jam_mulai);
      const sEnd = parseTimeToMinutes(session.jam_selesai);
      if (sStart !== null && sEnd !== null) {
        const overlap = Math.max(0, Math.min(sEnd, shiftEndM) - Math.max(sStart, shiftStartM));
        occupiedMinutes += overlap;
      }
    }

    const remainingMinutes = totalShiftMinutes - occupiedMinutes;
    const isCompletelyFull = remainingMinutes < consultationDuration;

    const guard = isSessionShiftUnavailable({
      selectedDate,
      isPastFromBackend: false,
      bounds: {
        startMinutes: shiftStartM,
        endMinutes: shiftEndM,
        defaultStart: shiftBounds.startTime,
        defaultEnd: shiftBounds.endTime
      },
      consultationDuration
    });

    let isUnavailable = guard.unavailable;
    let reason = guard.reason;
    let badgeLabel: string | null = null;

    if (!isUnavailable && isCompletelyFull) {
      isUnavailable = true;
      reason = SCHEDULE_UNAVAILABLE_REASONS.FULL;
    }

    if (isUnavailable) {
      if (
        reason === SCHEDULE_UNAVAILABLE_REASONS.PAST ||
        reason === SCHEDULE_UNAVAILABLE_REASONS.TIME_EXHAUSTED
      ) {
        badgeLabel = 'Sudah Berlalu';
      } else if (reason === SCHEDULE_UNAVAILABLE_REASONS.FULL) {
        badgeLabel = 'Penuh';
      }
    }

    result[shift] = {
      isUnavailable,
      reason,
      badgeLabel
    };
  }

  return result;
}
```

3. In `D:\manage-stock\src\features\jadwal-dokter\components\add-session\step-session-select.tsx`:
Remove the `'Sudah Ada Jadwal'` badge styling logic so only valid status badges (`'Sudah Berlalu'` or `'Penuh'`) render when unavailable.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/features/jadwal-dokter/model/useScheduleShiftAvailability.test.ts src/features/jadwal-dokter/utils/schedule-availability-guard.test.ts`
Expected: PASS.

---

### Task 4: Cross-Doctor Room Occupancy Conflict Modal & Grid Integration

**Files:**
- Create: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-occupancy-conflict-modal.tsx`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\model\useDoctorHourlyGrid.ts`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-daily-hourly-grid.tsx`
- Test: `D:\manage-stock\src\features\jadwal-dokter\components\doctor-occupancy-conflict-modal.test.ts`

**Interfaces:**
- Consumes: `OccupancySlot.conflictInfo` (`type`, `practitionerName`, `practitionerSpecialty`, `roomName`, `startTime`, `endTime`, `message`).
- Produces: User inspection dialog with occupant details and clean dismissal.

- [ ] **Step 1: Write test for `DoctorOccupancyConflictModal`**

Create `D:\manage-stock\src\features\jadwal-dokter\components\doctor-occupancy-conflict-modal.test.ts`:
```ts
import { describe, it, expect } from 'bun:test';

describe('DoctorOccupancyConflictModal formatters', () => {
  it('extracts conflict details safely from slot', () => {
    const slot = {
      startTime: '18:00',
      endTime: '18:30',
      uiVariant: 'purple_other' as const,
      conflictInfo: {
        type: 'ROOM_COLLISION_OTHER_DOCTOR',
        practitionerName: 'dr. Sarah Sp.A',
        practitionerSpecialty: 'Spesialis Anak',
        roomName: 'Ruang KIA 1',
        startTime: '18:00',
        endTime: '19:00',
        message: 'Ruangan Ruang KIA 1 sedang digunakan oleh dr. Sarah Sp.A pada 18:00 - 19:00 WIB.'
      }
    };

    expect(slot.conflictInfo.practitionerName).toBe('dr. Sarah Sp.A');
    expect(slot.conflictInfo.roomName).toBe('Ruang KIA 1');
  });
});
```

- [ ] **Step 2: Implement `DoctorOccupancyConflictModal`**

Create `D:\manage-stock\src\features\jadwal-dokter\components\doctor-occupancy-conflict-modal.tsx` (< 100 LOC):
```tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface DoctorOccupancyConflictModalProps {
  slot: OccupancySlot | null;
  isOpen: boolean;
  onClose: () => void;
  targetDoctorName?: string;
}

export function DoctorOccupancyConflictModal({
  slot,
  isOpen,
  onClose,
  targetDoctorName
}: DoctorOccupancyConflictModalProps) {
  if (!slot) return null;

  const conflict = slot.conflictInfo;
  const occupantDoctorName = conflict?.practitionerName || slot.displayLabel || 'Dokter Lain';
  const occupantSpecialty = conflict?.practitionerSpecialty || 'Dokter Praktik';
  const roomName = conflict?.roomName || 'Ruang Praktik';
  const timeRange = conflict?.startTime && conflict?.endTime
    ? `${conflict.startTime} - ${conflict.endTime} WIB`
    : `${slot.startTime} - ${slot.endTime} WIB`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-md p-6 font-sans sm:rounded-2xl'>
        <DialogHeader className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/20'>
              <Icons.stethoscope className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground'>
                Ruangan Terisi Dokter Lain
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground'>
                Informasi penggunaan ruangan praktik pada jam ini
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='my-3 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-3'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <p className='text-xs text-muted-foreground font-medium'>Dokter yang Menggunakan:</p>
              <p className='text-sm font-bold text-foreground mt-0.5'>{occupantDoctorName}</p>
              <p className='text-xs text-purple-700 dark:text-purple-400 font-medium'>{occupantSpecialty}</p>
            </div>
            <span className='px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'>
              Terjadwal
            </span>
          </div>

          <div className='grid grid-cols-2 gap-2 pt-2 border-t border-purple-500/15 text-xs'>
            <div>
              <span className='text-muted-foreground'>Ruangan:</span>
              <p className='font-semibold text-foreground mt-0.5'>{roomName}</p>
            </div>
            <div>
              <span className='text-muted-foreground'>Rentang Waktu:</span>
              <p className='font-mono font-bold text-foreground mt-0.5'>{timeRange}</p>
            </div>
          </div>
        </div>

        <p className='text-xs text-muted-foreground leading-relaxed'>
          Slot pada jam ini tidak dapat dijadwalkan untuk {targetDoctorName || 'dokter ini'} karena ruangan sedang dipakai oleh dokter lain. Anda dapat memilih jam lain atau menjadwalkan di ruangan yang berbeda.
        </p>

        <DialogFooter className='mt-2'>
          <Button type='button' variant='outline' onClick={onClose} className='w-full sm:w-auto'>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Integrate with `useDoctorHourlyGrid.ts` and `doctor-daily-hourly-grid.tsx`**

1. In `D:\manage-stock\src\features\jadwal-dokter\model\useDoctorHourlyGrid.ts`:
- Add `selectedConflictSlot` state:
```ts
const [selectedConflictSlot, setSelectedConflictSlot] = useState<OccupancySlot | null>(null);
```
- In `handleSlotClick`:
```ts
    if (
      slot.actionType === 'VIEW_OCCUPANCY_CONFLICT' ||
      slot.uiVariant === 'purple_other' ||
      slot.status === 'OCCUPIED_BY_OTHER'
    ) {
      setSelectedConflictSlot(slot);
      return;
    }
```
- Export `selectedConflictSlot` and `setSelectedConflictSlot`.
- Check LOC: Ensure file remains `< 500 LOC` (currently 470 -> ~478 LOC).

2. In `D:\manage-stock\src\features\jadwal-dokter\components\doctor-daily-hourly-grid.tsx`:
- Render `<DoctorOccupancyConflictModal slot={grid.selectedConflictSlot} isOpen={Boolean(grid.selectedConflictSlot)} onClose={() => grid.setSelectedConflictSlot(null)} targetDoctorName={doctor?.nama_dokter} />`.

- [ ] **Step 4: Run frontend tests to verify 100% pass**

Run: `bun test src/features/jadwal-dokter`
Expected: All tests pass.

---

### Task 5: End-to-End Verification & Container Restart

**Files:** None (Execution and Verification commands)

- [ ] **Step 1: Run complete frontend unit tests**

Run: `bun test src/features/jadwal-dokter` in `D:\manage-stock`
Expected: 100% PASS with 0 failures.

- [ ] **Step 2: Run frontend typecheck**

Run: `bun x tsc --noEmit` in `D:\manage-stock`
Expected: Exit code 0, 0 type errors.

- [ ] **Step 3: Run backend unit tests**

Run: `npm test -- schedule-slot-state.resolver.spec.ts` in `D:\Amanah-healthcare-backend`
Expected: 100% PASS with 0 failures.

- [ ] **Step 4: Restart backend docker container**

Run: `docker restart amanah-healthcare-backend-api-1`
Verify: Container status is `Up` and healthy via `docker ps --filter "name=amanah-healthcare-backend-api-1"`.

- [ ] **Step 5: Verify git diff cleanly formatted**

Check `git diff --stat` on both repositories to ensure strictly targeted edits without spurious changes.
