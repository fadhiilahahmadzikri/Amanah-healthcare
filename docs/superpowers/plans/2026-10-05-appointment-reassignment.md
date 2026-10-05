# Appointment Reassignment (Change Doctor & Change Room) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement reusable, transactionally safe backend capabilities and frontend modals for changing the assigned doctor and assigned room of an existing patient appointment, backed by backend candidate resolution and real-time WebSocket synchronization.

**Architecture:** The backend serves as the single source of truth (SSOT) for scheduling, collision detection, and assignment rules. An `AppointmentAssignmentService` coordinates reusable domain components (`ScheduleResolver`, `CollisionValidator`, `RoomResolver`). Mutations run in PostgreSQL transactions with `SELECT ... FOR UPDATE` row locks, followed by cache invalidations, outbox domain events, and Socket.IO real-time broadcasts. The frontend consumes candidate sets via Next.js proxy routes, displays them in modals adhering to the existing design system (`ModalWrapper`, dynamic category tabs, pill buttons), and triggers Sonner toasts with contextual navigation actions upon completion.

**Tech Stack:** 
- Backend: NestJS 11, Drizzle ORM, PostgreSQL 17, Redis 7 (Pub/Sub & Streams), Socket.IO, Biome, Bun test
- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix UI / shadcn/ui, TanStack Query v5, Sonner, Oxlint

**Spec:** `feature-spec/jadwal-dokter-new-feat/paradigm.md` & `feature-spec/jadwal-dokter-new-feat/phase1.md`

## Global Constraints

- Backend is located at `D:\Amanah-healthcare-backend` (linter/formatter: Biome, runtime: Bun).
- Frontend is located at `D:\manage-stock` (linter: Oxlint, formatter: Oxfmt, runtime: Bun).
- No new source file may exceed 500 lines of code.
- No hardcoded intervals (e.g. 30 minutes), shift names, or poli category names in frontend.
- Both features are only available when an appointment exists and has a patient; disabled/hidden for empty slots or terminal states (cancelled, completed).
- Consultation time, patient, and service remain unchanged during doctor and room reassignment.
- Candidate lists must be resolved by the backend; the frontend only renders what the backend provides.
- All database state mutations must be atomic within transactions (`BEGIN ... COMMIT`) with zero partial persistence on error.
- Real-time events must be emitted only after successful database transaction commit.

---

### Task 1: Backend DTOs & Domain Error Definitions

**Files:**
- Create: `D:\Amanah-healthcare-backend\src\modules\appointments\presentation\dto\change-appointment-doctor.dto.ts`
- Create: `D:\Amanah-healthcare-backend\src\modules\appointments\presentation\dto\change-appointment-room.dto.ts`
- Create: `D:\Amanah-healthcare-backend\src\modules\appointments\domain\errors\appointment-assignment.errors.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\domain\errors\appointment-assignment.errors.spec.ts`

**Interfaces:**
- Consumes: `class-validator`, NestJS `HttpException`
- Produces: `ChangeAppointmentDoctorDto`, `ChangeAppointmentRoomDto`, `AppointmentAssignmentException` hierarchy

- [ ] **Step 1: Write unit test for domain error mapping**

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\domain\errors\appointment-assignment.errors.spec.ts
import { describe, expect, it } from 'bun:test';
import {
  AppointmentNotFoundException,
  AppointmentTerminalStateException,
  DoctorCollisionException,
  RoomOccupiedException,
} from './appointment-assignment.errors';

describe('AppointmentAssignmentErrors', () => {
  it('should create AppointmentNotFoundException with 404 status', () => {
    const error = new AppointmentNotFoundException('apt-123');
    expect(error.getStatus()).toBe(404);
    expect(error.message).toContain('apt-123');
  });

  it('should create AppointmentTerminalStateException with 400 status', () => {
    const error = new AppointmentTerminalStateException('completed');
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toMatchObject({ code: 'APPOINTMENT_TERMINAL_STATE' });
  });

  it('should create DoctorCollisionException with 409 status and metadata', () => {
    const error = new DoctorCollisionException('Dr. B', '08:30 - 09:00 WIB');
    expect(error.getStatus()).toBe(409);
    expect(error.getResponse()).toMatchObject({
      code: 'DOCTOR_COLLISION',
      doctorName: 'Dr. B',
      timeSlot: '08:30 - 09:00 WIB',
    });
  });

  it('should create RoomOccupiedException with 409 status', () => {
    const error = new RoomOccupiedException('Ruang Poli 1', '08:30 - 09:00 WIB');
    expect(error.getStatus()).toBe(409);
    expect(error.getResponse()).toMatchObject({ code: 'ROOM_OCCUPIED' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test ./src/modules/appointments/domain/errors/appointment-assignment.errors.spec.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement DTOs and Domain Errors**

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\domain\errors\appointment-assignment.errors.ts
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

export class AppointmentNotFoundException extends NotFoundException {
  constructor(appointmentId: string) {
    super({
      code: 'APPOINTMENT_NOT_FOUND',
      message: `Janji temu dengan ID ${appointmentId} tidak ditemukan.`,
    });
  }
}

export class AppointmentTerminalStateException extends BadRequestException {
  constructor(status: string) {
    super({
      code: 'APPOINTMENT_TERMINAL_STATE',
      message: `Janji temu tidak dapat dialihkan karena berstatus "${status}".`,
    });
  }
}

export class DoctorCollisionException extends ConflictException {
  constructor(doctorName: string, timeSlot: string) {
    super({
      code: 'DOCTOR_COLLISION',
      message: `Dokter ${doctorName} sudah memiliki janji temu aktif pada jam ${timeSlot}.`,
      doctorName,
      timeSlot,
    });
  }
}

export class RoomOccupiedException extends ConflictException {
  constructor(roomName: string, timeSlot: string) {
    super({
      code: 'ROOM_OCCUPIED',
      message: `${roomName} sudah terisi oleh jadwal/janji temu lain pada jam ${timeSlot}.`,
      roomName,
      timeSlot,
    });
  }
}
```

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\presentation\dto\change-appointment-doctor.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangeAppointmentDoctorDto {
  @ApiProperty({
    description: 'ID dokter baru yang akan ditugaskan (UUID)',
    example: '77bbb45a-18df-4311-b2a4-a4b6f22870ca',
  })
  @IsUUID('4', { message: 'ID dokter harus berformat UUID v4 valid' })
  @IsNotEmpty({ message: 'Target doctorId wajib diisi' })
  doctorId: string;
}
```

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\presentation\dto\change-appointment-room.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangeAppointmentRoomDto {
  @ApiProperty({
    description: 'ID ruangan baru yang akan ditugaskan (UUID)',
    example: 'b77d141b-2fa5-4481-9f47-a5a040faf57a',
  })
  @IsUUID('4', { message: 'ID ruangan harus berformat UUID v4 valid' })
  @IsNotEmpty({ message: 'Target roomId wajib diisi' })
  roomId: string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test ./src/modules/appointments/domain/errors/appointment-assignment.errors.spec.ts`
Expected: PASS (4 tests passed)

---

### Task 2: Backend Candidate Resolvers (Doctor & Room Availability Queries)

**Files:**
- Create: `D:\Amanah-healthcare-backend\src\modules\appointments\application\resolvers\appointment-candidate.resolver.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\application\resolvers\appointment-candidate.resolver.spec.ts`

**Interfaces:**
- Consumes: Drizzle Database, `appointments`, `practitioners`, `clinicRooms`, `practitionerScheduleSessions`
- Produces: `AppointmentCandidateResolver.resolveDoctorCandidates(appointmentId: string)`, `AppointmentCandidateResolver.resolveRoomCandidates(appointmentId: string)`

- [ ] **Step 1: Write unit test for candidate resolver**

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\application\resolvers\appointment-candidate.resolver.spec.ts
import { describe, expect, it } from 'bun:test';
import { AppointmentCandidateResolver } from './appointment-candidate.resolver';

describe('AppointmentCandidateResolver', () => {
  it('should filter out the current doctor from candidate set', async () => {
    const mockDb = {
      query: {
        appointments: {
          findFirst: async () => ({
            id: 'apt-1',
            practitionerId: 'doc-current',
            scheduledDate: '2026-10-06',
            scheduledStartTime: '08:30:00',
            scheduledEndTime: '09:00:00',
            status: 'booked',
          }),
        },
        practitioners: {
          findMany: async () => [
            {
              id: 'doc-current',
              displayName: 'Dr. Current',
              isAcceptingAppointments: true,
              staffProfile: { fullName: 'Dr. Current', staffType: 'doctor' },
              medicalSpecialty: { name: 'Dokter Umum' },
            },
            {
              id: 'doc-target',
              displayName: 'Dr. Target',
              isAcceptingAppointments: true,
              staffProfile: { fullName: 'Dr. Target', staffType: 'doctor' },
              medicalSpecialty: { name: 'Dokter Umum' },
            },
          ],
        },
        appointments: {
          findMany: async () => [],
        },
        practitionerScheduleSessions: {
          findMany: async () => [],
        },
      },
    } as any;

    const resolver = new AppointmentCandidateResolver(mockDb);
    const result = await resolver.resolveDoctorCandidates('apt-1');

    expect(result.currentDoctorId).toBe('doc-current');
    const allDoctors = result.groups.flatMap((g: any) => g.doctors);
    expect(allDoctors.some((d: any) => d.id === 'doc-current')).toBe(false);
    expect(allDoctors.some((d: any) => d.id === 'doc-target')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test ./src/modules/appointments/application/resolvers/appointment-candidate.resolver.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement AppointmentCandidateResolver**

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\application\resolvers\appointment-candidate.resolver.ts
import { DRIZZLE_SOURCE } from '@database/drizzle/drizzle.constants';
import { DrizzleDatabase } from '@database/drizzle/drizzle.provider';
import {
  appointments,
  clinicRooms,
  practitionerScheduleSessions,
  practitioners,
} from '@database/schema';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, not } from 'drizzle-orm';
import { ACTIVE_APPOINTMENT_STATUSES } from '../../../schedules/domain/constants/schedule.constants';
import {
  AppointmentNotFoundException,
  AppointmentTerminalStateException,
} from '../../domain/errors/appointment-assignment.errors';

export interface DoctorCandidateItem {
  id: string;
  name: string;
  specialty: string;
  staffType: string;
  availability: 'AVAILABLE' | 'SCHEDULE_REQUIRED';
  existingSessionId: string | null;
  defaultRoomName: string | null;
}

export interface DoctorCandidateGroup {
  id: string;
  name: string;
  doctors: DoctorCandidateItem[];
}

export interface DoctorCandidatesResult {
  appointmentId: string;
  currentDoctorId: string | null;
  scheduledDate: string;
  scheduledTime: string;
  groups: DoctorCandidateGroup[];
}

export interface RoomCandidateItem {
  id: string;
  name: string;
  code: string;
  location: string | null;
  isAvailable: boolean;
  occupantDetails?: {
    doctorName?: string;
    bookingCode?: string;
  } | null;
}

@Injectable()
export class AppointmentCandidateResolver {
  constructor(
    @Inject(DRIZZLE_SOURCE)
    private readonly db: DrizzleDatabase,
  ) {}

  async resolveDoctorCandidates(appointmentId: string): Promise<DoctorCandidatesResult> {
    const apt = await this.db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: { practitioner: true },
    });

    if (!apt) {
      throw new AppointmentNotFoundException(appointmentId);
    }
    if (apt.status === 'cancelled' || apt.status === 'completed') {
      throw new AppointmentTerminalStateException(apt.status);
    }

    const scheduledDate = apt.scheduledDate;
    const startTime = apt.scheduledStartTime;
    const formattedTime = startTime.slice(0, 5);

    // 1. Fetch all active practitioners
    const allPractitioners = await this.db.query.practitioners.findMany({
      where: eq(practitioners.isAcceptingAppointments, true),
      with: {
        staffProfile: true,
        medicalSpecialty: true,
        clinicRoom: true,
      },
    });

    // 2. Fetch doctors with conflicting appointments at the same date & time slot
    const conflictingAppts = await this.db.query.appointments.findMany({
      where: and(
        eq(appointments.scheduledDate, scheduledDate),
        eq(appointments.scheduledStartTime, startTime),
        inArray(appointments.status, [...ACTIVE_APPOINTMENT_STATUSES]),
        not(eq(appointments.id, appointmentId)),
      ),
    });
    const occupiedDoctorIds = new Set(
      conflictingAppts.map((a) => a.practitionerId).filter(Boolean),
    );

    // 3. Fetch existing open schedule sessions for this date that cover the start time
    const existingSessions = await this.db.query.practitionerScheduleSessions.findMany({
      where: and(
        eq(practitionerScheduleSessions.scheduleDate, scheduledDate),
        eq(practitionerScheduleSessions.status, 'open'),
      ),
    });

    const groupMap = new Map<string, DoctorCandidateGroup>();

    for (const p of allPractitioners) {
      // Exclude current doctor
      if (p.id === apt.practitionerId) continue;
      // Exclude doctor already occupied with another patient at this exact slot
      if (occupiedDoctorIds.has(p.id)) continue;

      const matchingSession = existingSessions.find(
        (s) => s.practitionerId === p.id && s.startTime <= startTime && s.endTime > startTime,
      );

      const groupKey = p.medicalSpecialty?.name || 'Umum';
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          id: p.specialtyId || groupKey.toLowerCase().replace(/\s+/g, '_'),
          name: groupKey,
          doctors: [],
        });
      }

      groupMap.get(groupKey)!.doctors.push({
        id: p.id,
        name: p.displayName || p.staffProfile?.fullName || 'Dokter',
        specialty: groupKey,
        staffType: p.staffProfile?.staffType || 'doctor',
        availability: matchingSession ? 'AVAILABLE' : 'SCHEDULE_REQUIRED',
        existingSessionId: matchingSession?.id || null,
        defaultRoomName: p.clinicRoom?.name || null,
      });
    }

    return {
      appointmentId: apt.id,
      currentDoctorId: apt.practitionerId,
      scheduledDate,
      scheduledTime: `${formattedTime} WIB`,
      groups: Array.from(groupMap.values()),
    };
  }

  async resolveRoomCandidates(appointmentId: string): Promise<RoomCandidateItem[]> {
    const apt = await this.db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
    });

    if (!apt) {
      throw new AppointmentNotFoundException(appointmentId);
    }
    if (apt.status === 'cancelled' || apt.status === 'completed') {
      throw new AppointmentTerminalStateException(apt.status);
    }

    const scheduledDate = apt.scheduledDate;
    const startTime = apt.scheduledStartTime;

    const allRooms = await this.db.query.clinicRooms.findMany({
      where: eq(clinicRooms.isActive, true),
    });

    const conflictingAppts = await this.db.query.appointments.findMany({
      where: and(
        eq(appointments.scheduledDate, scheduledDate),
        eq(appointments.scheduledStartTime, startTime),
        inArray(appointments.status, [...ACTIVE_APPOINTMENT_STATUSES]),
        not(eq(appointments.id, appointmentId)),
      ),
      with: {
        practitioner: { with: { staffProfile: true } },
      },
    });

    const roomOccupantMap = new Map<string, { doctorName?: string; bookingCode?: string }>();
    for (const c of conflictingAppts) {
      if (c.roomId) {
        roomOccupantMap.set(c.roomId, {
          doctorName: c.practitioner?.displayName || c.practitioner?.staffProfile?.fullName,
          bookingCode: c.bookingCode,
        });
      }
    }

    return allRooms.map((room) => {
      const isOccupied = roomOccupantMap.has(room.id);
      return {
        id: room.id,
        name: room.name,
        code: room.code,
        location: room.location,
        isAvailable: !isOccupied,
        occupantDetails: isOccupied ? roomOccupantMap.get(room.id) : null,
      };
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test ./src/modules/appointments/application/resolvers/appointment-candidate.resolver.spec.ts`
Expected: PASS

---

### Task 3: Backend Reusable Appointment Assignment Service (Doctor & Room Mutation with Transaction)

**Files:**
- Create: `D:\Amanah-healthcare-backend\src\modules\appointments\application\services\appointment-assignment.service.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\application\services\appointment-assignment.service.spec.ts`

**Interfaces:**
- Consumes: Drizzle Database, `practitionerScheduleSessions`, `appointments`, `appointmentStatusEvents`, `RedisService`, `AppointmentNotificationPublisher`
- Produces: `AppointmentAssignmentService.changeDoctor(appointmentId, doctorId, actorUser)`, `AppointmentAssignmentService.changeRoom(appointmentId, roomId, actorUser)`

- [ ] **Step 1: Write unit test for assignment service**

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\application\services\appointment-assignment.service.spec.ts
import { describe, expect, it } from 'bun:test';
import { AppointmentAssignmentService } from './appointment-assignment.service';

describe('AppointmentAssignmentService', () => {
  it('should reject reassignment if target doctor already has conflicting appointment', async () => {
    const mockDb = {
      transaction: async (cb: any) => {
        const tx = {
          select: () => ({
            from: () => ({
              where: () => ({
                for: async () => [
                  {
                    id: 'apt-1',
                    status: 'booked',
                    scheduledDate: '2026-10-06',
                    scheduledStartTime: '08:30:00',
                    scheduledEndTime: '09:00:00',
                  },
                ],
              }),
            }),
          }),
          query: {
            practitioners: {
              findFirst: async () => ({ id: 'doc-target', displayName: 'Dr. Target', isAcceptingAppointments: true }),
            },
            appointments: {
              findFirst: async () => ({ id: 'apt-conflict', practitionerId: 'doc-target' }),
            },
          },
        };
        return cb(tx);
      },
    } as any;

    const service = new AppointmentAssignmentService(mockDb, {} as any, {} as any, {} as any);
    expect(
      service.changeDoctor('apt-1', 'doc-target', { id: 'admin-1', role: 'ADMIN' })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test ./src/modules/appointments/application/services/appointment-assignment.service.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement AppointmentAssignmentService**

```typescript
// D:\Amanah-healthcare-backend\src\modules\appointments\application\services\appointment-assignment.service.ts
import { DRIZZLE_SOURCE } from '@database/drizzle/drizzle.constants';
import { DrizzleDatabase } from '@database/drizzle/drizzle.provider';
import {
  appointmentStatusEvents,
  appointments,
  clinicSchedulePolicies,
  practitionerScheduleSessions,
  practitioners,
} from '@database/schema';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq, inArray, not, sql } from 'drizzle-orm';
import { RedisService } from '../../../common/redis/redis.service';
import { ACTIVE_APPOINTMENT_STATUSES } from '../../schedules/domain/constants/schedule.constants';
import { resolveShiftFromTime } from '../../schedules/domain/constants/schedule-shift.constants';
import { AppointmentEntity } from '../domain/entities/appointment.entity';
import {
  AppointmentNotFoundException,
  AppointmentTerminalStateException,
  DoctorCollisionException,
  RoomOccupiedException,
} from '../domain/errors/appointment-assignment.errors';
import { AppointmentNotificationPublisher } from './appointment-notification.publisher';

@Injectable()
export class AppointmentAssignmentService {
  private readonly logger = new Logger(AppointmentAssignmentService.name);

  constructor(
    @Inject(DRIZZLE_SOURCE)
    private readonly db: DrizzleDatabase,
    private readonly redisService: RedisService,
    private readonly notificationPublisher: AppointmentNotificationPublisher,
    @Inject('FIND_APPOINTMENT_BY_ID')
    private readonly findAppointmentById: (id: string) => Promise<AppointmentEntity | null>,
  ) {}

  async changeDoctor(
    appointmentId: string,
    targetDoctorId: string,
    user?: any,
  ): Promise<AppointmentEntity> {
    await this.db.transaction(async (tx) => {
      // 1. Lock appointment row
      const [apt] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .for('update');

      if (!apt) throw new AppointmentNotFoundException(appointmentId);
      if (apt.status === 'cancelled' || apt.status === 'completed') {
        throw new AppointmentTerminalStateException(apt.status);
      }
      if (apt.practitionerId === targetDoctorId) {
        return; // Idempotent no-op
      }

      // 2. Validate target practitioner
      const targetDoc = await tx.query.practitioners.findFirst({
        where: eq(practitioners.id, targetDoctorId),
        with: { staffProfile: true, clinicRoom: true },
      });
      if (!targetDoc || !targetDoc.isAcceptingAppointments) {
        throw new DoctorCollisionException(
          targetDoc?.displayName || 'Target',
          'Dokter tidak tersedia atau tidak menerima janji temu',
        );
      }

      // 3. Collision check: ensure target doctor is not already occupied at this exact slot
      const existingConflict = await tx.query.appointments.findFirst({
        where: and(
          eq(appointments.practitionerId, targetDoctorId),
          eq(appointments.scheduledDate, apt.scheduledDate),
          eq(appointments.scheduledStartTime, apt.scheduledStartTime),
          inArray(appointments.status, [...ACTIVE_APPOINTMENT_STATUSES]),
          not(eq(appointments.id, appointmentId)),
        ),
      });

      if (existingConflict) {
        throw new DoctorCollisionException(
          targetDoc.displayName || targetDoc.staffProfile?.fullName || 'Dokter',
          `${apt.scheduledStartTime.slice(0, 5)} WIB`,
        );
      }

      // 4. Resolve or create target schedule session
      let targetSessionId = apt.scheduleSessionId;
      let targetRoomId = apt.roomId;

      const matchingSession = await tx.query.practitionerScheduleSessions.findFirst({
        where: and(
          eq(practitionerScheduleSessions.practitionerId, targetDoctorId),
          eq(practitionerScheduleSessions.scheduleDate, apt.scheduledDate),
          sql`${practitionerScheduleSessions.startTime} <= ${apt.scheduledStartTime}`,
          sql`${practitionerScheduleSessions.endTime} > ${apt.scheduledStartTime}`,
        ),
      });

      if (matchingSession) {
        targetSessionId = matchingSession.id;
        if (matchingSession.roomId) targetRoomId = matchingSession.roomId;
      } else {
        // Create canonical schedule session on-the-fly for target doctor
        const shift = resolveShiftFromTime(apt.scheduledStartTime);
        const policy = await tx.query.clinicSchedulePolicies.findFirst({
          where: eq(clinicSchedulePolicies.code, 'default'),
        });
        const duration = policy?.defaultConsultationDurationMinutes ?? 30;

        const [createdSession] = await tx
          .insert(practitionerScheduleSessions)
          .values({
            practitionerId: targetDoctorId,
            scheduleDate: apt.scheduledDate,
            sessionLabel: `Sesi ${shift.toUpperCase()}`,
            sessionShift: shift,
            startTime: apt.scheduledStartTime,
            endTime: apt.scheduledEndTime || sql`${apt.scheduledStartTime}::time + interval '${duration} minutes'`,
            capacity: 1,
            availableSlots: 0,
            status: 'open',
            roomId: targetDoc.defaultRoomId || apt.roomId,
          })
          .returning();

        targetSessionId = createdSession.id;
        if (createdSession.roomId) targetRoomId = createdSession.roomId;
      }

      // 5. Transfer session capacity (old session increment if valid, target session decrement)
      if (apt.scheduleSessionId && apt.scheduleSessionId !== targetSessionId) {
        await tx
          .update(practitionerScheduleSessions)
          .set({ availableSlots: sql`LEAST(capacity, available_slots + 1)` })
          .where(eq(practitionerScheduleSessions.id, apt.scheduleSessionId));
      }
      if (targetSessionId) {
        await tx
          .update(practitionerScheduleSessions)
          .set({ availableSlots: sql`GREATEST(0, available_slots - 1)` })
          .where(eq(practitionerScheduleSessions.id, targetSessionId));
      }

      // 6. Update appointment assignment
      await tx
        .update(appointments)
        .set({
          practitionerId: targetDoctorId,
          scheduleSessionId: targetSessionId,
          roomId: targetRoomId,
          updatedBy: user?.id || user?.sub,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(appointments.id, appointmentId));

      // 7. Audit log event
      await tx.insert(appointmentStatusEvents).values({
        appointmentId,
        fromStatus: apt.status,
        toStatus: apt.status,
        reason: `Perubahan dokter ke ${targetDoc.displayName || targetDoctorId}`,
        changedBy: user?.id || user?.sub,
      });
    });

    // 8. Invalidate Redis caches
    await this.redisService.deleteByPrefix('queue:');
    await this.redisService.invalidateTags('schedule', 'appointment', 'queue');

    const updated = await this.findAppointmentById(appointmentId);
    if (!updated) throw new AppointmentNotFoundException(appointmentId);

    // 9. Publish real-time events via NotificationPublisher & Socket.IO
    return updated;
  }

  async changeRoom(
    appointmentId: string,
    targetRoomId: string,
    user?: any,
  ): Promise<AppointmentEntity> {
    await this.db.transaction(async (tx) => {
      const [apt] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .for('update');

      if (!apt) throw new AppointmentNotFoundException(appointmentId);
      if (apt.status === 'cancelled' || apt.status === 'completed') {
        throw new AppointmentTerminalStateException(apt.status);
      }
      if (apt.roomId === targetRoomId) {
        return; // Idempotent no-op
      }

      // Check room collision
      const conflictingAppt = await tx.query.appointments.findFirst({
        where: and(
          eq(appointments.roomId, targetRoomId),
          eq(appointments.scheduledDate, apt.scheduledDate),
          eq(appointments.scheduledStartTime, apt.scheduledStartTime),
          inArray(appointments.status, [...ACTIVE_APPOINTMENT_STATUSES]),
          not(eq(appointments.id, appointmentId)),
        ),
      });

      if (conflictingAppt) {
        const room = await tx.query.clinicRooms.findFirst({ where: eq(clinicRooms.id, targetRoomId) });
        throw new RoomOccupiedException(
          room?.name || 'Ruangan',
          `${apt.scheduledStartTime.slice(0, 5)} WIB`,
        );
      }

      await tx
        .update(appointments)
        .set({
          roomId: targetRoomId,
          updatedBy: user?.id || user?.sub,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(appointments.id, appointmentId));

      await tx.insert(appointmentStatusEvents).values({
        appointmentId,
        fromStatus: apt.status,
        toStatus: apt.status,
        reason: `Perubahan ruangan janji temu`,
        changedBy: user?.id || user?.sub,
      });
    });

    await this.redisService.deleteByPrefix('queue:');
    await this.redisService.invalidateTags('schedule', 'appointment', 'queue');

    const updated = await this.findAppointmentById(appointmentId);
    if (!updated) throw new AppointmentNotFoundException(appointmentId);

    return updated;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test ./src/modules/appointments/application/services/appointment-assignment.service.spec.ts`
Expected: PASS

---

### Task 4: Expose Backend Endpoints in AdminAppointmentsController

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\presentation\admin-appointments.controller.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\appointments.module.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\presentation\admin-appointments.controller.spec.ts`

**Endpoints Exposed:**
- `GET /api/v1/admin/appointments/:appointmentId/candidates/doctors` -> Candidate doctors
- `GET /api/v1/admin/appointments/:appointmentId/candidates/rooms` -> Candidate rooms
- `PATCH /api/v1/admin/appointments/:appointmentId/doctor` -> Reassign doctor
- `PATCH /api/v1/admin/appointments/:appointmentId/room` -> Reassign room

- [ ] **Step 1: Write controller spec for new endpoints**

```typescript
// Add test cases in admin-appointments.controller.spec.ts for getDoctorCandidates, getRoomCandidates, changeDoctor, changeRoom
```

- [ ] **Step 2: Add routes to AdminAppointmentsController and register services in AppointmentsModule**
- [ ] **Step 3: Run backend linter (`bun run lint`) and tests (`bun test`)**
Expected: PASS with 0 lint errors.

---

### Task 5: Frontend API Client & React Query Hooks

**Files:**
- Modify: `D:\manage-stock\src\features\appointment-pasien\api\types.ts`
- Modify: `D:\manage-stock\src\features\appointment-pasien\api\service.ts`
- Modify: `D:\manage-stock\src\features\appointment-pasien\api\query-keys.ts`
- Modify: `D:\manage-stock\src\features\appointment-pasien\api\queries.ts`
- Modify: `D:\manage-stock\src\features\appointment-pasien\api\mutations.ts`
- Test: `D:\manage-stock\tests\unit\appointment-reassignment-api.test.ts`

**Interfaces:**
- Consumes: `clientFetch` from `@/lib/client-fetch`
- Produces:
  - `fetchDoctorCandidates(appointmentId: string)`
  - `fetchRoomCandidates(appointmentId: string)`
  - `useChangeAppointmentDoctorMutation()`
  - `useChangeAppointmentRoomMutation()`

- [ ] **Step 1: Write unit test for candidate fetching and mutation options**

```typescript
// D:\manage-stock\tests\unit\appointment-reassignment-api.test.ts
import { describe, expect, it } from 'bun:test';
import { appointmentKeys } from '@/features/appointment-pasien/api/query-keys';

describe('AppointmentReassignmentQueryKeys', () => {
  it('should generate consistent query keys for candidate resolution', () => {
    expect(appointmentKeys.doctorCandidates('apt-1')).toEqual(['appointments', 'candidates', 'doctors', 'apt-1']);
    expect(appointmentKeys.roomCandidates('apt-1')).toEqual(['appointments', 'candidates', 'rooms', 'apt-1']);
  });
});
```

- [ ] **Step 2: Add functions to `service.ts`, `query-keys.ts`, `queries.ts`, and `mutations.ts`**
- [ ] **Step 3: Run test to verify it passes**

Run: `bun test tests/unit/appointment-reassignment-api.test.ts`
Expected: PASS

---

### Task 6: Frontend Change Doctor Modal (`ChangeDoctorModal`)

**Files:**
- Create: `D:\manage-stock\src\features\appointment-pasien\components\change-doctor-modal.tsx`
- Test: `D:\manage-stock\tests\unit\change-doctor-modal.test.tsx`

**Features:**
- Consumes `doctorCandidatesQueryOptions(appointmentId)`
- Renders dynamic tabs based on `groups` from backend (e.g. Umum, Bidan, Gigi)
- Doctor list cards with photo/avatar, name, specialty, availability badge
- Radio selection indicator
- Bottom actions: "Batal" (Cancel) and "Simpan Perubahan Dokter" (Assign) with loading spinner
- Sonner toast on success:
  ```tsx
  toast.success('Dokter berhasil diperbarui', {
    description: `Pasien kini ditugaskan kepada ${selectedDoctorName}.`,
    action: {
      label: 'Lihat Janji Temu',
      onClick: () => onViewAppointment?.(appointmentId),
    },
  });
  ```

- [ ] **Step 1: Implement `ChangeDoctorModal`**
- [ ] **Step 2: Write component render and selection test**
- [ ] **Step 3: Verify with `bun test` and run `oxlint`**

---

### Task 7: Frontend Change Room Modal (`ChangeRoomModal`)

**Files:**
- Create: `D:\manage-stock\src\features\appointment-pasien\components\change-room-modal.tsx`
- Test: `D:\manage-stock\tests\unit\change-room-modal.test.tsx`

**Features:**
- Consumes `roomCandidatesQueryOptions(appointmentId)`
- Lists clinic rooms with icon, code, location, and status badge (`Tersedia` vs `Terisi`)
- Disabled selection on occupied rooms with explanation badge
- Bottom actions: "Batal" and "Simpan Perubahan Ruangan" with loading spinner
- Sonner toast on success:
  ```tsx
  toast.success('Ruangan berhasil diperbarui', {
    description: `Janji temu dialihkan ke ${selectedRoomName}.`,
    action: {
      label: 'Lihat Janji Temu',
      onClick: () => onViewAppointment?.(appointmentId),
    },
  });
  ```

- [ ] **Step 1: Implement `ChangeRoomModal`**
- [ ] **Step 2: Write component render and selection test**
- [ ] **Step 3: Verify with `bun test` and run `oxlint`**

---

### Task 8: Action Menu & Modal Wiring in Appointment Organisms

**Files:**
- Modify: `D:\manage-stock\src\features\klinik\components\appointment-card\organisms\appointment-detail-organism.tsx`
- Modify: `D:\manage-stock\src\features\appointment-pasien\components\appointment-detail-modal.tsx`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\booked-patient-detail-modal.tsx`

**Integrations:**
- In `AppointmentDetailOrganism`:
  - When `appointment` is active (not cancelled, not completed) and has a patient:
    - Add `Ganti Dokter` (`Icons.userCheck`) in `DropdownMenuContent`
    - Add `Ganti Ruangan` (`Icons.location` / `Icons.door`) in `DropdownMenuContent`
    - Clicking opens `ChangeDoctorModal` and `ChangeRoomModal`
- On mutation completion:
  - Invalidate queries: `appointmentKeys.all`, `doctorScheduleKeys.all`, `session-patients`
  - Closes child wizard modal and refreshes parent detail state

- [ ] **Step 1: Wire modals and action items in `AppointmentDetailOrganism`**
- [ ] **Step 2: Wire in `AppointmentDetailModal`**
- [ ] **Step 3: Run `bun run lint` (oxlint) and `bun run format:check`**

---

### Task 9: Real-Time Event & WebSocket Synchronization

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\common\events\appointment.events.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\application\appointment-notification.publisher.ts`
- Modify: `D:\manage-stock\src\features\notifications\hooks\use-notification-socket.ts`

**Integrations:**
- Backend:
  - Add `AppointmentAssignmentChangedEvent` in `appointment.events.ts`
  - In `AppointmentAssignmentService`, call `publishAssignmentChanged(...)`
  - Emit real-time notification to patient and admin/staff socket rooms
- Frontend:
  - Listen for `appointment:assignment:updated` or standard `notification:new` in `use-notification-socket.ts`
  - Automatically invalidate active appointment queries so other connected admin/doctor dashboards update immediately without manual reload

- [ ] **Step 1: Add assignment changed event and publisher methods in backend**
- [ ] **Step 2: Verify socket listener invalidations in frontend**
- [ ] **Step 3: Run backend and frontend test suites**

---

## Verification Plan

### Automated Tests
1. **Backend Unit Tests:**
   `bun test ./src/modules/appointments/domain/errors/`
   `bun test ./src/modules/appointments/application/resolvers/`
   `bun test ./src/modules/appointments/application/services/`
2. **Backend Biome Linting:**
   `bun run lint` (in `D:\Amanah-healthcare-backend`)
3. **Frontend Unit Tests:**
   `bun test tests/unit/` (in `D:\manage-stock`)
4. **Frontend Oxlint:**
   `bun run lint` (in `D:\manage-stock`)

### Manual Verification
1. **Change Doctor Flow:**
   - Open browser dashboard at `http://localhost:3000/dashboard/jadwal-dokter` or `http://localhost:3000/dashboard/appointment-pasien`.
   - Click an active appointment -> open 3-dots menu -> click "Ganti Dokter".
   - Verify dynamic category tabs match backend data (e.g. Dokter Umum, Bidan).
   - Select another doctor -> click "Simpan Perubahan Dokter".
   - Verify database row in `appointments` table has updated `practitioner_id`.
   - Verify toast appears with button `[Lihat Janji Temu]`.
2. **Change Room Flow:**
   - Open active appointment -> 3-dots menu -> click "Ganti Ruangan".
   - Verify list of rooms shows correct availability.
   - Select an available room -> click "Simpan Perubahan Ruangan".
   - Verify database row in `appointments` table has updated `room_id`.
   - Verify doctor and time remain strictly unchanged.
3. **Collision Rejection:**
   - Attempt to assign to a doctor or room that already has an appointment at that slot.
   - Verify 409 Conflict error is returned and UI displays error banner without changing database state.
