# Next.js Admin & Patient Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Next.js Admin & Patient frontend (`D:\manage-stock`) to strictly consume backend SSOT endpoints (schedules, queues, patient affiliations, occupations, notifications), eliminate client-side over-engineering, remove blocking post-auth modal in favor of on-demand pre-service booking, purge all patient avatars and fake fields, and integrate real-time notifications via Socket.IO.

**Architecture:** Transport-agnostic API services binding directly to backend NestJS API (`http://localhost:3001`), Better Auth client session synchronization, modular UI subcomponents strictly adhering to $\le 500$ LOC per file, and real-time Socket.IO notification hooks.

**Tech Stack:** Next.js 15 (App Router), React 19, Better Auth (`better-auth/react`), `@tanstack/react-query`, `socket.io-client`, Tailwind CSS, Radix UI.

**Spec:** User story and standing rules in `GEMINI.md`, `AGENTS.md`, and chat directives.

## Global Constraints

- Backend is the Single Source of Truth (SSOT). No client-side recalculation of backend domain state (durations, queue numbers, statuses, retry counts).
- Zero hardcoding, zero fake fallbacks, zero magic strings.
- Strictly $\le 500$ lines of code per file.
- Presentation only renders; business logic lives in custom hooks, query options, or service layers.
- Zero patient avatars on cards, modals, or tables.
- Zero phantom/fake fields (no fake ratings, etc.).
- Relocate post-auth registration modal to on-demand pre-service form during appointment booking.
- Real-time notifications via `socket.io-client` + REST unread count / list.

---

### Task 1: Install `socket.io-client` & Setup Realtime Notification Hook & Service

**Files:**

- Create: `src/features/notifications/hooks/use-notification-socket.ts`
- Create: `src/features/notifications/api/notification-api-service.ts`
- Modify: `src/components/layout/header.tsx` (wire unread count badge)
- Test: manual / script verification with socket gateway

**Interfaces:**

- Produces: `useNotificationSocket()`, `getNotificationUnreadCount()`, `getMyNotifications()`, `markNotificationRead()`

- [x] **Step 1: Install socket.io-client in Next.js project**
      Run command: `bun add socket.io-client` (or `npm install socket.io-client`) in `D:\manage-stock`.

- [x] **Step 2: Create Notification API Service**
      Create `src/features/notifications/api/notification-api-service.ts` calling:
- `GET /api/v1/notifications/unread-count` -> `{ count: number }`
- `GET /api/v1/notifications/me` -> `Notification[]`
- `PATCH /api/v1/notifications/:id/read` -> updated notification

- [x] **Step 3: Create useNotificationSocket hook**
      Create `src/features/notifications/hooks/use-notification-socket.ts` connecting to `http://localhost:3001/socket.io` with Bearer auth token, listening to `notification:new`, `notification:read`, `notification:unread_count`.

- [x] **Step 4: Update Header notification bell**
      Bind notification bell badge in `src/components/layout/header.tsx` to unread count query.

- [x] **Step 5: Verify task completion and file line limits**
      Verify `src/features/notifications/hooks/use-notification-socket.ts` and `notification-api-service.ts` are strictly $\le 500$ LOC.

---

### Task 2: Backend & Frontend Alignment for Occupations & Booking Options

**Files:**

- Verify/Update: `D:\Amanah-healthcare-backend\src\modules\occupations\`
- Verify/Update: `D:\Amanah-healthcare-backend\src\modules\schedules\`
- Modify: `src/lib/api-client.ts` (if needed for token header persistence)

**Interfaces:**

- Consumes: `GET /api/v1/occupations`, `GET /api/v1/schedules/booking-options`
- Produces: Type-safe endpoints for frontend consumption

- [x] **Step 1: Verify occupations endpoint in backend**
      Verify `curl -s http://127.0.0.1:3001/api/v1/occupations` returns 13 canonical jobs.

- [x] **Step 2: Verify schedules booking-options in backend**
      Verify `curl -s "http://127.0.0.1:3001/api/v1/schedules/booking-options?date=2026-09-28"` returns shifts and quotas.

- [x] **Step 3: Ensure persistent token access in api-client.ts**
      Ensure `src/lib/api-client.ts` can retrieve access token from memory or `localStorage('amanah_token')` so server & client requests have Bearer auth.

---

### Task 3: Admin Doctor Schedule: Refactor to Backend SSOT & Split Card Component

**Files:**

- Modify: `src/features/jadwal-dokter/api/service.ts` (replace fake data with `apiClient`)
- Modify: `src/features/jadwal-dokter/api/types.ts` (align with backend schedule schema)
- Create: `src/features/jadwal-dokter/components/doctor-schedule-card-header.tsx`
- Create: `src/features/jadwal-dokter/components/doctor-schedule-card-shifts.tsx`
- Modify: `src/features/jadwal-dokter/components/doctor-schedule-card.tsx` (refactor down to $< 300$ LOC)

**Interfaces:**

- Consumes: `GET /api/v1/schedules`, `PATCH /api/v1/schedules/rules/:ruleId/status`
- Produces: Clean, pure presentation card consuming backend data without fake recalculations

- [x] **Step 1: Update Doctor Schedule API Service**
      Refactor `src/features/jadwal-dokter/api/service.ts` to call backend endpoints via `apiClient`.

- [x] **Step 2: Extract subcomponents from doctor-schedule-card.tsx**
      Extract header and shift badges into modular subcomponents so `doctor-schedule-card.tsx` shrinks from 533 LOC to $\le 300$ LOC.

- [x] **Step 3: Enforce canonical status constants**
      Use canonical status constants (`BUKA`, `TUTUP`, `LIBUR`, `PENUH`, `SELESAI`) and 4 shift names (`DINI_HARI`, `PAGI`, `SIANG`, `MALAM`).

- [x] **Step 4: Verify lines of all touched files $\le 500$ LOC**
      Check line counts for `service.ts`, `doctor-schedule-card.tsx`, and newly created subcomponents.

---

### Task 4: Admin Queue: Refactor to Backend Daily Queue Endpoints & Split Components

**Files:**

- Modify: `src/features/klinik/api/service.ts` (replace faker/mock with `apiClient`)
- Modify: `src/features/klinik/components/queue-view.tsx` (split into $\le 500$ LOC)
- Create: `src/features/klinik/components/queue-patient-badge.tsx` (replaces avatar with clean badge)
- Modify: `src/features/klinik/components/queue-calling-card.tsx` (remove patient avatar)
- Modify: `src/features/klinik/components/queue-seat-card.tsx` (remove patient avatar)
- Modify: `src/features/klinik/components/queue-list-card.tsx` (remove patient avatar)

**Interfaces:**

- Consumes: `GET /api/v1/appointments/queue/daily`, `POST /api/v1/appointments/:id/call`, `POST /api/v1/appointments/:id/respond`, `POST /api/v1/appointments/:id/no-show`
- Produces: 100% backend-driven queue view with live actions (max 3 calls)

- [x] **Step 1: Update Klinik API Service for queues**
      Replace faker and JSON storage with real backend calls to `/api/v1/appointments/queue/daily`, `/call`, `/respond`, and `/no-show`.

- [x] **Step 2: Remove patient avatars from all queue cards**
      Replace avatar images with clean patient initials/ID badges in `queue-calling-card.tsx`, `queue-seat-card.tsx`, and `queue-list-card.tsx`.

- [x] **Step 3: Refactor queue-view.tsx to $< 400$ LOC**
      Extract any modal or helper logic so `queue-view.tsx` is strictly under 500 lines.

- [x] **Step 4: Verify lines of all touched queue files $\le 500$ LOC**

---

### Task 5: Eliminate Blocking Post-Auth Registration in Dashboard Layout

**Files:**

- Modify: `src/app/dashboard/layout.tsx`

**Interfaces:**

- Consumes: `auth.api.getSession` or `authLoader`
- Produces: Immediate dashboard access without blocking modal or redirect

- [x] **Step 1: Remove blocking modal and redirect logic from layout**
      In `src/app/dashboard/layout.tsx`, remove the check `isPatient && !registrationContext.isComplete` and remove `<PatientRegistrationModal isOpen={true} />`.

- [x] **Step 2: Verify dashboard loads without blocking dialog**
      Ensure layout passes clean user context to `AuthorizationProvider`.

---

### Task 6: On-Demand Pre-Service & Patient Affiliations in Appointment Booking Flow

**Files:**

- Create: `src/features/klinik/components/booking/booking-patient-selection-step.tsx`
- Create: `src/features/klinik/components/booking/booking-on-demand-patient-form.tsx`
- Create: `src/features/klinik/components/booking/booking-schedule-slot-step.tsx`
- Modify: `src/features/klinik/components/medical-appointment-modal.tsx` (refactor down from 1422 LOC to $< 350$ LOC)

**Interfaces:**

- Consumes: `GET /api/v1/patients/affiliations/me`, `POST /api/v1/patients/affiliations`, `GET /api/v1/occupations`, `GET /api/v1/schedules/booking-options`, `POST /api/v1/appointments`
- Produces: Intuitive on-demand booking wizard with affiliation reuse

- [x] **Step 1: Create Patient Affiliation Selection Step**
      Fetch `GET /api/v1/patients/affiliations/me`. Display existing patient cards. Provide "+ Tambah Pasien / Afiliasi Baru" toggle.

- [x] **Step 2: Create On-Demand Pre-Service Form**
      Form fields: Nama, NIK, Nama Ibu, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Gol Darah, Alamat/Domisili, Pekerjaan (fetched from `GET /api/v1/occupations`). Submits via `POST /api/v1/patients/affiliations`.

- [x] **Step 3: Create Schedule & Slot Selection Step**
      Select Poli, Doctor, Date, and Shift (`DINI_HARI`, `PAGI`, `SIANG`, `MALAM`) via `GET /api/v1/schedules/booking-options?date=YYYY-MM-DD`.

- [x] **Step 4: Refactor medical-appointment-modal.tsx to $< 350$ LOC**
      Wire the subcomponents as steps in `medical-appointment-modal.tsx` and submit `POST /api/v1/appointments`.

- [x] **Step 5: Verify all booking files are strictly $\le 500$ LOC**

---

### Task 7: Patient Appointment Cards & Modals: Strip Avatars and Fake Fields

**Files:**

- Modify: `src/features/klinik/components/appointment-card.tsx`
- Modify: `src/features/appointment-pasien/components/appointment-detail-modal.tsx`
- Modify: `src/features/appointment-pasien/components/appointment-tables/columns.tsx`

**Interfaces:**

- Produces: Clean cards and modals with zero avatars and zero fake ratings

- [x] **Step 1: Remove fake rating and avatar from appointment-card.tsx**
      Remove `docInfo.rating = '4.9'` and star rating badge. Remove patient avatar references.

- [x] **Step 2: Remove patient avatar from appointment-detail-modal.tsx**
      Replace avatar circle with clean patient name & identity header.

- [x] **Step 3: Remove avatar from appointment-tables/columns.tsx**
      Remove avatar rendering from patient appointment table column definitions.

- [x] **Step 4: Verify lines of touched files $\le 500$ LOC**

---

### Task 8: Verification & E2E Validation

**Files:**

- Test: `scripts/e2e/test-patient-affiliations-and-booking.ps1`
- Test: Linter / build check in `D:\manage-stock`

- [x] **Step 1: Run Backend E2E validation script**
      Confirm backend responds with 100% success on patient affiliations, booking, and queues.

- [x] **Step 2: Run frontend lint & type checks**
      Run `bun run lint` (or `oxlint`) in `D:\manage-stock`.

- [x] **Step 3: Confirm all modified files meet strict $\le 500$ LOC rule**
      Run ripgrep / line count check on all modified files.
