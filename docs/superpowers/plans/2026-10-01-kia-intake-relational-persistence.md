# Maternal Health & Child Immunization Relational Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement normalized backend persistence, relational schemas, programmatic factory seeds, Midwifery/KIA service categorization guards, and full-fidelity drawer/modal presentation for Maternal Health (Kehamilan & Persalinan) and Child Immunization (Imunisasi Anak) patient forms.

**Architecture:** Extend Drizzle ORM schema with normalized tables (`maternal_health_intakes`, `maternal_previous_pregnancies`, `maternal_contraceptive_histories`, and `child_immunization_intakes`) alongside the base `medical_intake_submissions` table. Enforce KIA service categorization and practitioner boundaries in NestJS `AppointmentsService` and `MedicalRecordsController`, seed dynamic data via programmatic factories, and bind frontend specialized booking modal (`useMedicalAppointmentForm.ts`) and schedule inspection drawers (`booked-patient-detail-modal.tsx`, `details-modal.tsx`) to canonical backend endpoints.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, Tailwind CSS v4, NestJS 11, Drizzle ORM, PostgreSQL, class-validator, Swagger/OpenAPI.

**Spec:** [kia_intake_relational_persistence_api_spec.md](file:///C:/Users/User/.gemini/antigravity-cli/brain/c3882a6a-847b-49a8-8167-21464037fb1b/kia_intake_relational_persistence_api_spec.md)

## Global Constraints

- Backend directory: `D:\Amanah-healthcare-backend`
- Frontend directory: `D:\manage-stock`
- All created or modified files must strictly stay under 500 lines of code (< 500 LOC).
- Zero code comments and zero emojis in newly written code.
- No magic strings; strictly utilize canonical enums, DTOs, and constants.
- Programmatic seeding must use dynamic UUID generation (`crypto.randomUUID()`), never hardcoded copy-paste IDs.
- Midwifery & Childbirth services (`persalinan_normal`, `pregnancy_checkup`, `child_immunization`) must be strictly bound to `categoryCode: 'layanan_kebidanan'` and assigned exclusively to KIA practitioners (`maternal_child_health`), never general practitioners.

---

### Task 1: Backend Drizzle Schema Definitions for Maternal Health & Child Immunization Tables

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\database\schema\amanah.schema.ts`
- Test: `D:\Amanah-healthcare-backend\src\database\verify-foundation.ts`

**Interfaces:**
- Produces: `maternalHealthIntakes`, `maternalPreviousPregnancies`, `maternalContraceptiveHistories`, `childImmunizationIntakes` table exports.

- [ ] **Step 1: Write verification test for schema tables**

```typescript
import {
  maternalHealthIntakes,
  maternalPreviousPregnancies,
  maternalContraceptiveHistories,
  childImmunizationIntakes,
} from './schema/amanah.schema';

describe('Maternal & Immunization Schemas', () => {
  it('exports all 4 normalized KIA intake tables', () => {
    expect(maternalHealthIntakes).toBeDefined();
    expect(maternalPreviousPregnancies).toBeDefined();
    expect(maternalContraceptiveHistories).toBeDefined();
    expect(childImmunizationIntakes).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/database/verify-foundation.ts`
Expected: FAIL with "Cannot find name 'maternalHealthIntakes'".

- [ ] **Step 3: Implement normalized Drizzle tables in `amanah.schema.ts`**

Define `maternalHealthIntakes`, `maternalPreviousPregnancies`, `maternalContraceptiveHistories`, and `childImmunizationIntakes` with exact column types, numeric precisions, foreign keys to `medicalIntakeSubmissions`, `patientProfiles`, and `appointments`, and composite indexes as detailed in the API spec.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/database/verify-foundation.ts`
Expected: PASS.

- [ ] **Step 5: Format and lint backend code**

```bash
bun run format:check
bun run lint
```

---

### Task 2: Backend Drizzle Relations & Database Migration Generation

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\database\schema\amanah.relations.ts`
- Modify: `D:\Amanah-healthcare-backend\src\database\schema\index.ts`
- Create: Migration via Drizzle Kit

**Interfaces:**
- Consumes: Tables from `amanah.schema.ts`.
- Produces: Drizzle relation bindings connecting `medicalIntakeSubmissions` to `maternalHealthIntakes` and `childImmunizationIntakes`, and `maternalHealthIntakes` to `maternalPreviousPregnancies` and `maternalContraceptiveHistories`.

- [ ] **Step 1: Write test verifying Drizzle relations**

```typescript
import { relations } from 'drizzle-orm';
import * as schema from './schema';

describe('KIA Intake Relations', () => {
  it('binds maternal and immunization relations to submissions', () => {
    expect(schema.maternalHealthIntakesRelations).toBeDefined();
    expect(schema.childImmunizationIntakesRelations).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/database/verify-foundation.ts`
Expected: FAIL.

- [ ] **Step 3: Define relations in `amanah.relations.ts` and re-export in `index.ts`**

Add one-to-one and one-to-many relation declarations between `medicalIntakeSubmissions`, `maternalHealthIntakes`, `maternalPreviousPregnancies`, `maternalContraceptiveHistories`, and `childImmunizationIntakes`.

- [ ] **Step 4: Run Drizzle Kit migration generation**

```bash
bun run db:generate
```
Expected: New migration file generated under `drizzle/` containing `CREATE TABLE maternal_health_intakes`, `CREATE TABLE maternal_previous_pregnancies`, `CREATE TABLE maternal_contraceptive_histories`, and `CREATE TABLE child_immunization_intakes`.

- [ ] **Step 5: Apply migration to local development database**

```bash
bun run db:migrate
```
Expected: Database updated successfully with 0 errors.

---

### Task 3: Backend Relational DTOs & Validation Schemas

**Files:**
- Create: `D:\Amanah-healthcare-backend\src\modules\medical-records\presentation\dto\create-maternity-intake.dto.ts`
- Create: `D:\Amanah-healthcare-backend\src\modules\medical-records\presentation\dto\create-child-immunization-intake.dto.ts`
- Create: `D:\Amanah-healthcare-backend\src\modules\medical-records\presentation\dto\maternal-intake-response.dto.ts`
- Create: `D:\Amanah-healthcare-backend\src\modules\medical-records\presentation\dto\child-immunization-response.dto.ts`

**Interfaces:**
- Produces: Strongly typed class-validator DTOs for maternal health (mother, partner, measurements, current pregnancy, GPA, risk factors, previous pregnancies, contraceptive history, disease history) and child immunization (child identity, parents, previous vaccines, allergies).

- [ ] **Step 1: Write DTO validation unit tests**

```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMaternityIntakeDto } from '../../src/modules/medical-records/presentation/dto/create-maternity-intake.dto';

describe('CreateMaternityIntakeDto', () => {
  it('validates required mother NIK length 16 and valid UUIDs', async () => {
    const dto = plainToInstance(CreateMaternityIntakeDto, {
      patientId: 'invalid-uuid',
      motherNik: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test test/dto/kia-intake-dto.spec.ts`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement DTO classes with full Swagger decorators (< 500 LOC per file)**

Implement `CreateMaternityIntakeDto`, `CreateChildImmunizationIntakeDto`, `MaternalIntakeResponseDto`, and `ChildImmunizationResponseDto` strictly adhering to the schema and field names from the API spec.

- [ ] **Step 4: Run test to verify passes**

Run: `bun test test/dto/kia-intake-dto.spec.ts`
Expected: PASS.

---

### Task 4: Backend Medical Records Repository & Relational Mapper

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\medical-records\domain\repositories\medical-record.repository.ts`
- Modify: `D:\Amanah-healthcare-backend\src\modules\medical-records\infrastructure\drizzle\medical-record.drizzle-repository.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\medical-records\infrastructure\drizzle\medical-record.repository.spec.ts`

**Interfaces:**
- Consumes: DTOs from Task 3, Drizzle database instance.
- Produces: `createMaternalIntake()`, `createImmunizationIntake()`, `findMaternalIntakeByAppointmentId()`, `findImmunizationIntakeByAppointmentId()`, `findUnifiedIntakeByAppointmentId()`.

- [ ] **Step 1: Write unit/integration tests for relational intake persistence**

```typescript
describe('MedicalRecordDrizzleRepository - KIA Intakes', () => {
  it('creates maternal health intake with nested previous pregnancies and contraception', async () => {
    // repository test asserting atomic dual-write to medicalIntakeSubmissions + maternalHealthIntakes
  });
  it('creates child immunization intake atomic dual-write', async () => {
    // repository test asserting atomic dual-write to childImmunizationIntakes
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/modules/medical-records/infrastructure/drizzle/medical-record.repository.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement repository methods in `medical-record.drizzle-repository.ts`**

Implement atomic transaction:
1. Insert generic `medicalIntakeSubmissions` record.
2. For maternal flow, insert `maternalHealthIntakes`, iterate and batch insert `maternalPreviousPregnancies` and `maternalContraceptiveHistories`.
3. For immunization flow, insert `childImmunizationIntakes`.
4. Provide retrieval queries including nested relational children.

- [ ] **Step 4: Run test to verify passes**

Run: `bun test src/modules/medical-records/infrastructure/drizzle/medical-record.repository.spec.ts`
Expected: PASS.

---

### Task 5: Backend Midwifery/KIA Practitioner Guard in Appointments Service

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\application\appointments.service.ts`
- Test: `D:\Amanah-healthcare-backend\src\modules\appointments\application\appointments.service.spec.ts`

**Interfaces:**
- Consumes: `CreateAppointmentDto`.
- Produces: Validation check preventing non-KIA doctors from being scheduled for `layanan_kebidanan` (Persalinan, Kehamilan, Imunisasi).

- [ ] **Step 1: Write test for KIA practitioner boundary**

```typescript
it('rejects booking maternal or immunization appointment with general practice doctor', async () => {
  const payload = {
    poliklinikId: 'poli_umum_id',
    layananId: 'persalinan_normal_id',
    staffId: 'general_doctor_id',
    appointmentDate: '2026-10-15',
    session: 'PAGI',
  };
  await expect(service.create(payload, user)).rejects.toThrow(
    /Layanan KIA hanya dapat ditangani oleh Bidan atau Dokter Spesialis KIA/
  );
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/modules/appointments/application/appointments.service.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement qualification check in `AppointmentsService`**

Check the service category of `layananId`. If `categoryCode === 'layanan_kebidanan'`, verify that `practitioner.specialtyCode === 'maternal_child_health'` or `staff.primaryUnitCode === 'poli_kia'`. If not, throw `UnprocessableEntityException`.

- [ ] **Step 4: Run test to verify passes**

Run: `bun test src/modules/appointments/application/appointments.service.spec.ts`
Expected: PASS.

---

### Task 6: Backend Medical Records Controller Endpoints

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\medical-records\presentation\medical-records.controller.ts`
- Test: `D:\Amanah-healthcare-backend\test\medical-records.e2e-spec.ts`

**Interfaces:**
- Produces:
  - `POST /api/v1/medical-records/intakes/maternity`
  - `POST /api/v1/medical-records/intakes/immunization`
  - `GET /api/v1/medical-records/intakes/by-appointment/:appointmentId`
  - `GET /api/v1/medical-records/intakes/maternity/:id`
  - `GET /api/v1/medical-records/intakes/immunization/:id`

- [ ] **Step 1: Write controller endpoint tests**

```typescript
it('POST /medical-records/intakes/maternity returns 201 with relational ID', async () => {
  // test POST
});
it('GET /medical-records/intakes/by-appointment/:appointmentId returns unified intake payload', async () => {
  // test GET
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test test/medical-records.e2e-spec.ts`
Expected: FAIL (404 Not Found).

- [ ] **Step 3: Implement controller routes with `@Roles('PATIENT', 'STAF', 'ADMIN')` and Swagger metadata**

Expose the endpoints in `MedicalRecordsController`, delegating to repository methods with versioning and security decorators.

- [ ] **Step 4: Run test to verify passes**

Run: `bun test test/medical-records.e2e-spec.ts`
Expected: PASS.

---

### Task 7: Backend Programmatic Factory Seeding for Maternal & Immunization Records

**Files:**
- Create: `D:\Amanah-healthcare-backend\src\database\seeds\drizzle\factories\maternal-intake.factory.ts`
- Create: `D:\Amanah-healthcare-backend\src\database\seeds\drizzle\factories\child-immunization-intake.factory.ts`
- Modify: `D:\Amanah-healthcare-backend\src\database\seeds\drizzle\seed.ts`

**Interfaces:**
- Produces: Programmatic generator functions using `crypto.randomUUID()` that produce valid seed rows linked to existing seed patients, KIA practitioners (`Bdn. Siti Rahmawati`, `dr. Rizky Maulana`, `Bdn. Laras Wulandari`), and appointments.

- [ ] **Step 1: Write unit test for factories**

```typescript
describe('KIA Intake Factories', () => {
  it('generates valid dynamic maternal intake with unique UUIDs', () => {
    const record = createMaternalIntakeSeed({ patientId: crypto.randomUUID() });
    expect(record.motherNik).toHaveLength(16);
    expect(record.gravidaCount).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/database/seeds/drizzle/factories/maternal-intake.factory.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement factories and integrate into `seed.ts`**

Generate realistic seed records for pregnancy, childbirth, and child immunization. Run `seed.ts` without hardcoded static UUID clashes.

- [ ] **Step 4: Run dev seed command to verify clean execution**

```bash
bun run db:seed:dev
```
Expected: Seed completes with 0 errors and logs created KIA records.

---

### Task 8: Backend Automated Integration & E2E Verification Suite

**Files:**
- Create: `D:\Amanah-healthcare-backend\scripts\e2e\test-kia-intakes-relational.ps1`

- [ ] **Step 1: Write comprehensive PowerShell E2E test script**

Cover:
1. Patient login.
2. Booking appointment for `persalinan_normal` with Bidan `Bdn. Siti Rahmawati`.
3. Submitting structured maternal intake via `POST /api/v1/medical-records/intakes/maternity`.
4. Doctor/Midwife retrieving intake via `GET /api/v1/medical-records/intakes/by-appointment/{appointmentId}`.
5. Booking appointment for `child_immunization`.
6. Submitting child immunization intake via `POST /api/v1/medical-records/intakes/immunization`.
7. Retrieval and validation of relational fields.
8. Negative test: Attempting to book `child_immunization` with general doctor `dr. Budi Santoso` (assert 422 rejected).

- [ ] **Step 2: Run E2E script against running backend**

Run: `powershell -ExecutionPolicy Bypass -File D:\Amanah-healthcare-backend\scripts\e2e\test-kia-intakes-relational.ps1`
Expected: ALL TESTS PASS (100% green).

---

### Task 9: Frontend API Client & Service Integration for Specialized Medical Intake

**Files:**
- Create: `D:\manage-stock\src\features\klinik\api\kia-intake-service.ts`
- Modify: `D:\manage-stock\src\features\klinik\model\useMedicalAppointmentForm.ts`
- Test: `D:\manage-stock\src\features\klinik\api\kia-intake-service.test.ts`

**Interfaces:**
- Consumes: Backend endpoints from Task 6.
- Produces: `kiaIntakeService.createMaternityIntake()`, `kiaIntakeService.createImmunizationIntake()`, `kiaIntakeService.getIntakeByAppointmentId()`.

- [ ] **Step 1: Write frontend service unit tests**

```typescript
describe('kiaIntakeService', () => {
  it('posts maternity intake and returns response', async () => {
    // mock clientFetch and assert contract
  });
  it('posts child immunization intake and returns response', async () => {
    // mock clientFetch and assert contract
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/features/klinik/api/kia-intake-service.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `kia-intake-service.ts` (< 500 LOC)**

Implement strongly typed methods using `clientFetch` targeting `/api/v1/medical-records/intakes/*`.

- [ ] **Step 4: Update `useMedicalAppointmentForm.ts` to submit to backend API**

Replace local mock storage `createAppointmentRecordWithQueue` with:
1. `patientAffiliationService.createAppointment(...)` targeting `poli_kia` and the corresponding service (`persalinan_normal` or `child_immunization`).
2. `kiaIntakeService.createMaternityIntake(...)` or `kiaIntakeService.createImmunizationIntake(...)` linking to the created appointment.
3. Preserve state for queue success modal.

- [ ] **Step 5: Run tests to verify passes**

Run: `bun test src/features/klinik/api/kia-intake-service.test.ts`
Expected: PASS.

---

### Task 10: Frontend Doctor Schedule Drawer (`booked-patient-detail-modal.tsx`) KIA Intake Presentation

**Files:**
- Create: `D:\manage-stock\src\features\jadwal-dokter\components\booked-patient-kia-intake.tsx`
- Modify: `D:\manage-stock\src\features\jadwal-dokter\components\booked-patient-detail-modal.tsx`
- Test: `D:\manage-stock\src\features\jadwal-dokter\components\booked-patient-kia-intake.test.tsx`

**Interfaces:**
- Consumes: `appointmentId` from `patient`.
- Produces: Clean, accessible, un-truncated presentation card with collapsible sections for Maternal Obstetric History (G-P-Ab-Ah, HPHT, HPL, Ukur Antropometri Awal, Riwayat Persalinan Lalu, Riwayat KB, Faktor Risiko) or Child Immunization History (Vaksin Lalu, Alergi, Orang Tua).

- [ ] **Step 1: Write test for `BookedPatientKiaIntake` component**

```typescript
describe('BookedPatientKiaIntake', () => {
  it('renders maternal obstetric summary and previous pregnancies when data is present', () => {
    // render component with mock intake data
    // assert G2P1A0, HPHT, and previous pregnancy details are displayed
  });
  it('renders child immunization history when flow is immunization', () => {
    // assert vaccine history and parent info are displayed
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/features/jadwal-dokter/components/booked-patient-kia-intake.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `booked-patient-kia-intake.tsx` (< 500 LOC)**

Build structured, theme-aware component consuming semantic tokens (`--card`, `--muted`, `--border`, `--foreground`). Use Radix Collapsible or accordions for dense medical history sections.

- [ ] **Step 4: Integrate into `booked-patient-detail-modal.tsx`**

Mount `<BookedPatientKiaIntake appointmentId={patient.appointmentId} />` directly between the Demographic section and Complaint section.

- [ ] **Step 5: Run tests to verify passes**

Run: `bun test src/features/jadwal-dokter/components/booked-patient-kia-intake.test.tsx`
Expected: PASS.

---

### Task 11: Frontend Clinic Details Modal (`details-modal.tsx`) Un-truncated Intake Rendering

**Files:**
- Modify: `D:\manage-stock\src\features\klinik\components\details-modal.tsx`
- Test: `D:\manage-stock\src\features\klinik\components\details-modal.test.tsx`

- [ ] **Step 1: Write test for un-truncated intake rendering**

```typescript
it('renders full medical intake questions and answers without artificial height restrictions', () => {
  // test details-modal with 20 questions
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/features/klinik/components/details-modal.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Refactor `MedicalIntakeSummary` in `details-modal.tsx`**

Remove the cramped `h-[160px]` scroll constraint. Use fluid collapsible sections grouped by schema section titles (`Data Diri`, `Data Pasien/Suami`, `Ukuran Tubuh`, `Kehamilan Saat Ini`, `Riwayat Kesehatan`, `Riwayat Persalinan Lalu`, `Riwayat KB`) with clear key-value typography.

- [ ] **Step 4: Run test to verify passes**

Run: `bun test src/features/klinik/components/details-modal.test.tsx`
Expected: PASS.

---

### Task 12: End-to-End Verification (Typecheck, Lint, Backend Suite, Frontend Tests)

**Files:**
- All workspace files

- [ ] **Step 1: Run backend tests and linting**

```bash
cd D:\Amanah-healthcare-backend
bun test
bun run lint
bun run format:check
```
Expected: 0 errors.

- [ ] **Step 2: Run frontend tests and linting**

```bash
cd D:\manage-stock
bun test src/features/klinik src/features/jadwal-dokter
bun run lint
bun run typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Run comprehensive verification script**

Execute live booking of pregnancy and immunization flow, verify database rows in PostgreSQL via Drizzle studio or SQL query, verify drawer rendering.
