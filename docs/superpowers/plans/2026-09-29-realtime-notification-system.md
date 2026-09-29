# Real-Time Event-Driven Notification System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish an end-to-end, production-ready real-time notification mechanism where clinical events (starting with patient appointment booking) publish domain events to Redis Streams, persist to PostgreSQL, fan out via Socket.IO, and update the Next.js admin dashboard navbar and notification drawer in real-time with zero mock data.

**Architecture:** 
- **Layer 1 (Event Producer):** Business modules (e.g. `AppointmentsService`) publish typed `DomainEvent` instances via `RedisStreamsPublisher` (`XADD notifications:events`).
- **Layer 2 (Message Broker & Worker):** `NotificationStreamWorker` consumes Redis Streams via consumer group (`notification-service`), delegating to `NotificationOrchestratorService`.
- **Layer 3 (Persistence & Deduplication):** `NotificationDrizzleRepository` inserts into PostgreSQL `notifications` and `notification_recipients` with deterministic unique `idempotency_key` (`${eventId}:${recipientId}:${eventType}`).
- **Layer 4 (Real-Time Transport):** `InAppDeliveryChannel` emits events via `SocketIoRealtimeGateway` (backed by `@socket.io/redis-adapter`) to `user:${userId}` and `role:${roleName}` rooms.
- **Layer 5 (Web Presentation & Sync):** Client `NotificationProvider` maintains an authenticated WebSocket connection (supporting HttpOnly cookies & Bearer tokens), invalidating React Query caches and updating the existing `<NotificationCenter />` navbar badge and drawer. Writes and pagination flow through REST `/api/v1/notifications/*`.

**Tech Stack:**
- **Backend:** NestJS 11, TypeScript 5.7, Drizzle ORM, PostgreSQL (port 5433), Redis 7 (port 6379, Streams + Pub/Sub), Socket.IO, `@socket.io/redis-adapter`
- **Frontend:** Next.js 16 (App Router), React 19, Socket.IO Client 4.x, TanStack React Query v5, Zustand 5, Tailwind CSS v4, Lucide Icons

**Spec:**
- `feature-spec/notification/01-architecture-overview.md`
- `feature-spec/notification/02-flutter-notifications.md`
- `feature-spec/notification/03-nextjs-web-notifications.md`
- `feature-spec/notification/04-backend-notifications.md`

## Global Constraints
- Single Source of Truth (SSOT): Backend is authoritative for notifications, read states, unread counts, and recipient resolution ("Push is a hint, REST is truth").
- Zero Mock Data: Eliminate hardcoded JSON fixtures (`clinic-notifications.json`) from runtime rendering.
- No New UI: Reuse existing navbar `<NotificationCenter />` (`src/features/notifications/components/notification-center.tsx`) and `<NotificationCard />`.
- Handshake Authentication: WebSocket connects only with authenticated credentials; never allow anonymous connections or client-specified room joining.
- File Size Ceiling: Keep every file strictly under 500 lines of code (LOC).
- Clean Code: Zero emojis in code comments/logs, descriptive types, maximum 3 function arguments where feasible.

---

## File Structure & Responsibilities

### Backend (`D:\Amanah-healthcare-backend`)
- Modify: `src/modules/appointments/domain/constants/appointment-lifecycle.constants.ts` — Add `CREATED` and `NEW_BOOKING_ALERT` event types.
- Modify: `src/modules/appointments/application/appointments.service.ts` — Inject `NOTIFICATION_PUBLISHER` and publish domain event on appointment creation.
- Modify: `src/modules/appointments/appointments.notifications.ts` — Register notification rules for appointment creation (patient confirmation and staff/admin alerts).
- Create: `src/modules/appointments/infrastructure/resolvers/appointment-recipient.resolver.ts` — Query helper to resolve clinic staff and admin recipient IDs.
- Modify: `src/modules/notifications/infrastructure/realtime/socket-io-realtime.gateway.ts` — Add cookie-based handshake token extraction and automatic role-room joins (`role:admin`, `role:staf`).
- Modify: `src/modules/notifications/application/services/notification-orchestrator.service.ts` — Support asynchronous `resolveRecipients` in rules.
- Modify: `src/modules/notifications/notifications.constants.ts` — Add role room constants (`role: (name: string) => string`).

### Frontend (`D:\manage-stock`)
- Modify: `src/features/notifications/api/notification-api-service.ts` — Add `markAllAsRead` endpoint call and robust response typings.
- Modify: `src/features/notifications/types.ts` — Align `BackendNotification` to `ClinicNotification` mapper utilities.
- Modify: `src/features/notifications/hooks/use-notification-socket.ts` — Pass auth credentials, join reconnection reconciliation, trigger React Query invalidation and Zustand sync.
- Modify: `src/features/notifications/utils/store.ts` — Replace `localStorage` persistence with backend REST sync + live socket merge.
- Modify: `src/features/notifications/model/useNotificationCenter.ts` — Connect to REST API on mount and sync with live socket events.
- Create: `src/components/providers/notification-provider.tsx` — App-shell level provider mounting the socket connection once per authenticated session.
- Modify: `src/app/dashboard/layout.tsx` — Wrap dashboard with `NotificationProvider`.

---

## Bite-Sized Implementation Tasks

### Task 1: Backend Domain Event Publishing on Appointment Creation

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\domain\constants\appointment-lifecycle.constants.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\application\appointments.service.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\application\appointments.service.spec.ts`

**Interfaces:**
- Consumes: `NOTIFICATION_PUBLISHER` from `src/modules/notifications/notifications.constants.ts`
- Produces: `DomainEvent` with `eventType: APPOINTMENT_EVENTS.CREATED` published to Redis Streams

- [x] **Step 1: Write failing test in `appointments.service.spec.ts`**
Verify that when `createAppointment` succeeds, `publisher.publish(...)` is called with `appointment.created.v1` containing `appointmentId`, `patientUserId`, `queueNumber`, and clinic details.

- [x] **Step 2: Run test to verify it fails**
Run: `bun test src/modules/appointments/application/appointments.service.spec.ts`
Expected: FAIL.

- [x] **Step 3: Implement domain event publishing**
1. In `appointment-lifecycle.constants.ts`, add `CREATED` and `NEW_BOOKING_ALERT`.
2. In `appointments.service.ts`, inject `NOTIFICATION_PUBLISHER`.
3. In `createAppointment()`, after `appointmentRepo.create()`, publish the event to Redis Streams.

- [x] **Step 4: Run test to verify it passes**
Run: `bun test src/modules/appointments/application/appointments.service.spec.ts`
Expected: PASS.

- [x] **Step 5: Commit backend appointment creation event**

---

### Task 2: Backend Appointment Notification Rules & Staff Recipient Resolver

**Files:**
- Create: `D:\Amanah-healthcare-backend\src\modules\appointments\infrastructure\resolvers\appointment-recipient.resolver.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\appointments.notifications.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\appointments.notifications.spec.ts`

**Interfaces:**
- Consumes: `NotificationRulesRegistry` from `src/modules/notifications/registry/notification-rules-registry.ts`
- Produces: Rules for `APPOINTMENT_EVENTS.CREATED` targeting both the patient and clinic staff/admins

- [x] **Step 1: Write failing test in `appointments.notifications.spec.ts`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement recipient resolver and notification rule registration**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit notification rules**

---

### Task 3: Backend Socket.IO Handshake Cookie Extraction & Role Rooms

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\notifications\notifications.constants.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\notifications\infrastructure\realtime\socket-io-realtime.gateway.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\notifications\infrastructure\realtime\socket-io-realtime.gateway.spec.ts`

**Interfaces:**
- Consumes: Handshake cookies (`amanah_access_token`) and `auth.token`
- Produces: Authenticated socket client joined to `user:${userId}` and `role:${roleName}`

- [x] **Step 1: Write failing test in `socket-io-realtime.gateway.spec.ts`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement cookie parsing and role-room joins**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit gateway improvements**

---

### Task 4: Backend Async Recipient Resolution in Orchestrator Service

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\notifications\domain\entities\notification-rule.entity.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\notifications\application\services\notification-orchestrator.service.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\notifications\application\services\notification-orchestrator.service.spec.ts`

**Interfaces:**
- Consumes: `rule.resolveRecipients` (synchronous or `Promise<string | string[]>`)
- Produces: Iterates and persists notifications for each recipient, fanning out in-app pushes

- [x] **Step 1: Write failing test in `notification-orchestrator.service.spec.ts`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Update `resolveRecipients` handling**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit orchestrator async resolution**

---

### Task 5: Frontend Notification API Service & Mapper Layer

**Files:**
- Modify: `D:\manage-stock\src\features\notifications\api\notification-api-service.ts`
- Modify: `D:\manage-stock\src\features\notifications\types.ts`
- Create: `D:\manage-stock\src\features\notifications\utils\notification-mapper.ts`
- Test: `D:\manage-stock\src\features\notifications\utils\notification-mapper.test.ts`

**Interfaces:**
- Consumes: Backend REST `/api/v1/notifications/*` responses
- Produces: Normalized `ClinicNotification` objects conforming to UI `<NotificationCard />`

- [x] **Step 1: Write failing unit test in `notification-mapper.test.ts`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement mapper and add `markAllAsRead` to `notification-api-service.ts`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit frontend mapper and API service**

---

### Task 6: Frontend Notification Socket Hook & Reconnect Reconciliation

**Files:**
- Modify: `D:\manage-stock\src\features\notifications\hooks\use-notification-socket.ts`
- Test: `D:\manage-stock\src\features\notifications\hooks\use-notification-socket.test.ts`

**Interfaces:**
- Consumes: Socket.IO events (`notification:new`, `notification:read`, `notification:unread_count`)
- Produces: Updates TanStack Query cache `['notifications', 'me']` and `['notifications', 'unread-count']` and Zustand store

- [x] **Step 1: Write test for `useNotificationSocket` event handling**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement reconnection reconciliation and credentialed handshake**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit socket hook improvements**

---

### Task 7: Frontend Real-Time Store & Navbar Hook Integration

**Files:**
- Modify: `D:\manage-stock\src\features\notifications\utils\store.ts`
- Modify: `D:\manage-stock\src\features\notifications\model\useNotificationCenter.ts`
- Test: `D:\manage-stock\src\features\notifications\model\useNotificationCenter.test.ts`

**Interfaces:**
- Consumes: `notificationApiService` and `useNotificationStore`
- Produces: Reactive state for `<NotificationCenter />` with real unread count and real notifications list

- [x] **Step 1: Write failing test in `useNotificationCenter.test.ts`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement real data fetching and store synchronization**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit store and hook integration**

---

### Task 8: Notification Provider Mounting & Purging Dummy Fixtures

**Files:**
- Create: `D:\manage-stock\src\components\providers\notification-provider.tsx`
- Modify: `D:\manage-stock\src\app\dashboard\layout.tsx`
- Modify: `D:\manage-stock\src\features\notifications\data\clinic-notifications.json` (empty or deprecate)
- Test: Build and lint verification

- [x] **Step 1: Write test for `NotificationProvider`**
- [x] **Step 2: Implement `NotificationProvider`**
- [x] **Step 3: Wrap dashboard layout**
- [x] **Step 4: Verify build and test suite**
- [x] **Step 5: Commit provider mounting**

---

### Task 9: End-to-End Flow Verification & Docker Health Check

**Files:**
- End-to-end verification of Patient Booking -> Backend Event -> Redis Streams -> Socket.IO -> Admin Navbar Notification

- [x] **Step 1: Run NestJS backend test suite in Docker**
- [x] **Step 2: Run Next.js frontend test suite**
- [x] **Step 3: Verify no TypeScript errors or regressions**

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-29-realtime-notification-system.md`.
