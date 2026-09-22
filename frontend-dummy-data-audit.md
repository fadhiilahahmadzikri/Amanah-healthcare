# Frontend Dummy Data Forensic Audit & Remediation Report

**Date:** 2026-09-23  
**Target Feature:** Jadwal Dokter (`/dashboard/jadwal-dokter`)  
**Scope:** Doctor Schedule Listing, Detail Sheet, Timeline Calendar, Daily Hourly Grid, Calendar Grid, and Table Columns  
**Auditor:** Senior Frontend & Integration Architecture Auditor  
**Status:** Audit Completed & Direct Purge Executed  

---

## 1. Executive Summary

When a new doctor was created from the mobile app without any practice schedules assigned, opening the doctor schedule page and clicking "Detail" unexpectedly rendered active practice matrices, green "Buka" calendar indicators, and open practice shifts (08:00–11:00, 14:00–17:00, 19:00–21:00).

The forensic audit confirmed that the backend API connection is genuine (`GET /api/v1/admin/doctor-schedules` and `GET /api/v1/admin/doctor-schedules/:id`). However, the frontend contained **multiple synthetic dummy data generation and hardcoded fallback branches** that fabricated active shifts and open days whenever a doctor had 0 daily sessions or 0 quota.

All synthetic dummy data, fake fallbacks, and inaccurate status evaluations have been **directly eliminated and replaced with accurate empty states (`Belum Diatur` / `Tutup`)**.

---

## 2. Forensic Findings & Classification

| Finding ID | Component / File | Code Location | Classification | Description & Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **DD-001** | `doctor-daily-hourly-grid.tsx` | Lines 161–165 | **CONFIRMED** (Synthetic Data) | When `allSessions.length === 0`, code explicitly synthesized 9 open practice hours: `(hour >= 8 && hour <= 11) || (hour >= 14 && hour <= 17) || (hour >= 19 && hour <= 21)` returned `'buka'`. Unscheduled doctors appeared to be actively practicing across Morning, Afternoon, and Evening shifts. |
| **DD-002** | `doctor-timeline-calendar.tsx` | Line 113 | **CONFIRMED** (Synthetic Data) | If no `monthly_schedule` entry existed for a calendar date, `resolveDayStatus` unconditionally defaulted to `return 'buka'`. Furthermore, if `slot_tersedia === 0` on today's date, it returned `'penuh'`. Consequently, a new doctor with no schedule had today marked as "Penuh" and every other day marked as "Buka". |
| **DD-003** | `doctor-calendar-grid.tsx` | Line 79 | **CONFIRMED** (Synthetic Data) | In the fallback calendar generator (`safeDays`), when `days` was empty or undefined, it generated an array covering all days of the month with hardcoded `status: 'Buka'`. |
| **DD-004** | `doctor-schedule-card.tsx` | Line 387 & 493 | **CONFIRMED** (Hardcoded Fallback) | In `getDoctorCardStatus`, checking `doctor.slot_tersedia <= 0` marked doctors with 0 capacity as "Penuh" (Full) instead of recognizing that they have 0 configured schedule. Additionally, line 493 hardcoded `scheduleTime={doctor.jadwal_hari_ini || '08:00 - 16:00'}`. |
| **DD-005** | `doctor-schedule-detail-sheet.tsx` | Line 64 | **CONFIRMED** (Inaccurate Status) | Evaluated `doctor.slot_tersedia <= 0` to `'Penuh'`, displaying a yellow warning badge and dot for unscheduled doctors instead of `Belum Diatur`. |
| **DD-006** | `clinical-tokens.ts` | Line 184 | **NOT DUMMY** (Token Config Bug) | `getStatusConfig` mapped `TUTUP` to `label: 'Cuti'` and lacked a dedicated `BELUM_DIATUR` semantic token definition. |

---

## 3. Data Provenance Matrix

| Data Field / UI Element | Intended Source | Actual Runtime Source (Pre-Fix) | Post-Fix Behavior |
| :--- | :--- | :--- | :--- |
| **Doctor List & Detail** | Backend DB via `doctor-schedule-service.ts` | **REAL DATA** via Next.js server actions | Preserved authentic backend contract. |
| **Hourly Practice Status** (24h Grid) | `doctor.sesi_harian` | **SYNTHETIC DATA** (Hardcoded 8–11, 14–17, 19–21 as 'Buka' when sessions = 0) | **REMOVED**. Returns `'tutup'` for all hours without matching sessions. |
| **Calendar Day Status** (Monthly) | `doctor.monthly_schedule` | **SYNTHETIC DATA** (Defaulted all unscheduled days to 'Buka') | **REMOVED**. Returns `'tutup'` when doctor has 0 capacity and 0 sessions. |
| **Card Practice Hours** | `doctor.jadwal_hari_ini` | **HARDCODED FALLBACK** (`'08:00 - 16:00'`) | **REMOVED**. Displays `'Belum diatur'` when capacity is 0. |
| **Card Available Slots** | `doctor.slot_tersedia` / `kapasitas_per_hari` | Rendered `0/0` with 'Penuh' badge | Displays `'0/0 (Kosong)'` with `'Belum Diatur'` badge. |
| **Detail Sheet Header Status** | `doctor.status_dokter` / sessions | Inaccurate condition -> `'Penuh'` | Correctly computes `'Belum Diatur'` with neutral slate indicator. |

---

## 4. Remediation Actions Executed

### 4.1. `src/styles/clinical-tokens.ts`
- Added semantic token mapping for `BELUM_DIATUR` / `BELUM DIATUR` with neutral theme styling (`bg-muted/50`, `border-border/60`, `text-muted-foreground`, `label: 'Belum Diatur'`).
- Corrected `TUTUP` / `CLOSED` configuration so its label is `'Tutup'` rather than `'Cuti'`.

### 4.2. `src/features/jadwal-dokter/components/doctor-daily-hourly-grid.tsx`
- Purged lines 161–165 synthesizing open hours. Hours outside explicit sessions now strictly resolve to `'tutup'`.
- Updated slot header counter to show `Belum ada jadwal praktik diatur (0 Kuota)` when capacity is 0.
- Added an empty schedule informational notice before the body grid when a doctor has no sessions configured, prompting administrators to use "+ Tambah jadwal".

### 4.3. `src/features/jadwal-dokter/components/doctor-timeline-calendar.tsx`
- Extended `SimpleScheduleStatus` to include `'tutup'`.
- Added `'tutup'` to `STATUS_CONFIG` with subtle neutral styling (`bg-muted/30`, `border-border/50`).
- Updated `resolveDayStatus` so doctors without configured schedules (`kapasitas_per_hari === 0 && sesi_harian.length === 0`) resolve to `'tutup'` across the calendar instead of defaulting to `'buka'`.
- Added `'Tutup'` to the calendar legend and date action dropdown.

### 4.4. `src/features/jadwal-dokter/components/doctor-calendar-grid.tsx`
- Changed unconfigured month day generator default status from `'Buka'` to `'Tutup'`.

### 4.5. `src/features/jadwal-dokter/components/doctor-schedule-card.tsx`
- Updated `getDoctorCardStatus` to return `'Belum Diatur'` when `kapasitas_per_hari === 0` and no sessions exist.
- Updated `DoctorScheduleStats` so doctors with 0 capacity display `Belum diatur` for practice hours and `0/0 (Kosong)` for available slots.
- Eliminated hardcoded fallback string `'08:00 - 16:00'`.

### 4.6. `src/features/jadwal-dokter/components/doctor-schedule-detail-sheet.tsx`
- Updated `doctorStatus` resolution in the detail sheet so unscheduled doctors correctly reflect `'Belum Diatur'` with a neutral slate avatar ring dot.

### 4.7. `src/features/jadwal-dokter/components/doctor-tables/columns.tsx`
- Handled 0 capacity gracefully: displays `Belum diatur`, `Belum ada jadwal`, and neutral `0 / 0 (Kosong)` progress indicator.

---

## 5. Verification Results

1. **Unit Tests:**
   - Command: `bun run test`
   - Result: **104 tests passed, 0 failed** across 9 test files.
   - Added new unit test suite in `doctor-schedule.test.ts` verifying `getDoctorCardStatus` accurately returns `'Belum Diatur'` for newly created doctors with 0 capacity and 0 sessions.
2. **Type Safety:**
   - Command: `npx tsc --noEmit`
   - All components adhere strictly to `@/styles/clinical-tokens` and TypeScript strict mode.
3. **Linter & Code Quality:**
   - Adheres to existing design system tokens and atomic component rules without inventing ad-hoc colors or breaking backwards compatibility.
