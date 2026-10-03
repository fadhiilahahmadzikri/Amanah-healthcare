# Immunization Domain Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden and fully prepare the Immunization (Imunisasi Anak) domain across backend (`D:\Amanah-healthcare-backend`) and frontend (`D:\manage-stock`) with zero hardcoding, zero comments, zero emojis, strict LOC under 500 lines per file, resolving the new patient submission bug, unifying doctor assignment to KIA, refining field diction, and integrating the dev-autofill tool.

**Architecture:**
- Frontend acts strictly as an API consumer with backend as the single source of truth (SSOT).
- Relational persistence in PostgreSQL `child_immunization_intakes` and `medical_intake_submissions` with normalized schemas.
- Flow-aware patient affiliation creation in `useMedicalAppointmentSubmit.ts` dynamically resolving child versus mother identifiers based on `definition.flow`.
- Dynamic doctor assignment in backend appointment creation handler routing both `pregnancy` and `immunization` flows to KIA unit (`poli_kia`) and practitioners (`midwife` or `maternal_child_health` specialty).
- Dev-autofill registry extended with `ImmunizationFakerFactory` and preset for one-click testing of realistic Indonesian child immunization data.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, TanStack Form, TanStack React Query, NestJS, Drizzle ORM, PostgreSQL, Faker.js (`@faker-js/faker`).

**Spec:** System requirement to prepare Immunization flow with same level of architectural hardening as Childbirth flow while preserving existing UI, navigation, and conventions.

## Global Constraints
- ZERO comments (`//` or `/*` strictly forbidden) in all modified code.
- ZERO emojis across all code, tests, and CLI outputs.
- All files strictly under 500 lines of code (LOC).
- Backend is SSOT: NO hardcoded UUIDs, doctor IDs, or fake fallback data.
- NO code edits before user approves the plan.
- Backward compatibility: preserve existing childbirth/pregnancy flow, patient affiliations, and reservation lifecycle.

---

## File Structure & Responsibility Map

### Backend (`D:\Amanah-healthcare-backend`)
- Modify: `src/modules/appointments/infrastructure/drizzle/appointment-creation.handler.ts`
  - Responsibility: Route appointment creation to `poli_kia` and filter practitioner schedule sessions for `medicalFlow === 'immunization'` alongside `pregnancy` and `layanan_kebidanan`.

### Frontend (`D:\manage-stock`)
- Modify: `src/features/klinik/constants/immunization-flow-definition.ts`
  - Responsibility: Refine diction from `Nomor WhatsApp/HP orang tua` to `Nomor HP orang tua/wali` and short label to `Nomor HP`.
- Modify: `src/features/klinik/model/useMedicalAppointmentSubmit.ts`
  - Responsibility: Make patient affiliation creation flow-aware so `childName` and `childNik` are used when registering a new patient under the `immunization` flow, preventing empty name/NIK submission failures.
- Create: `src/components/dev-autofill/factories/immunization-faker-factory.ts`
  - Responsibility: Generate randomized Indonesian child identity, dates, parent contacts, and vaccine history for dev-autofill.
- Create: `src/components/dev-autofill/factories/immunization-faker-factory.test.ts`
  - Responsibility: Verify generated immunization fake data conforms to required types and Indonesian formats.
- Create: `src/components/dev-autofill/presets/immunization-preset.ts`
  - Responsibility: Provide preset generator functions for immunization form.
- Modify: `src/components/dev-autofill/registry.ts`
  - Responsibility: Register immunization definition into dev-autofill registry for auto-detection and execution.
- Create: `src/features/klinik/model/useMedicalAppointmentSubmit.test.ts`
  - Responsibility: Test suite verifying flow-aware patient affiliation mapping and intake submission for both pregnancy and immunization flows.

---

## Bite-Sized Implementation Tasks

### Task 1: Backend Doctor Assignment & Unit Routing for Immunization

**Files:**
- Modify: `D:\Amanah-healthcare-backend\src\modules\appointments\infrastructure\drizzle\appointment-creation.handler.ts:80-92`
- Test: `D:\Amanah-healthcare-backend` test runner or Docker build check

**Interfaces:**
- Consumes: `clinicServices.medicalFlow` from Drizzle query.
- Produces: `isLayananKebidanan = true` when `service.medicalFlow === 'immunization'`, automatically setting `unitId` to `poli_kia` and selecting KIA practitioners (`midwife` or `maternal_child_health` specialty).

- [ ] **Step 1: Inspect appointment-creation.handler.ts lines 80-92**
Confirm current condition:
```typescript
if (
  service &&
  (service.serviceCategory?.code === 'layanan_kebidanan' ||
    service.medicalFlow === 'pregnancy')
) {
```

- [ ] **Step 2: Update condition to include immunization flow**
Modify `appointment-creation.handler.ts`:
```typescript
if (
  service &&
  (service.serviceCategory?.code === 'layanan_kebidanan' ||
    service.medicalFlow === 'pregnancy' ||
    service.medicalFlow === 'immunization')
) {
```
Ensure ZERO comments and ZERO emojis are added.

- [ ] **Step 3: Verify backend TypeScript compilation**
Run:
```powershell
docker exec amanah-healthcare-backend-api-1 npm run build
```
Expected: Compilation successful with exit code 0.

- [ ] **Step 4: Commit backend changes**
```bash
git add src/modules/appointments/infrastructure/drizzle/appointment-creation.handler.ts
git commit -m "fix(appointments): route immunization flow to kia unit and practitioners"
```

---

### Task 2: Diction Refinement in Immunization Flow Definition

**Files:**
- Modify: `src/features/klinik/constants/immunization-flow-definition.ts:38-43`
- Test: `src/features/klinik/utils/medical-appointment.test.ts`

**Interfaces:**
- Consumes: `field()` helper from `medical-appointment-field-builders`.
- Produces: Updated field configuration for `parentPhone` with label `'Nomor HP orang tua/wali'` and short label `'Nomor HP'`.

- [ ] **Step 1: Check existing immunization definition tests**
Run:
```powershell
bun test src/features/klinik/utils/medical-appointment.test.ts
```
Expected: PASS.

- [ ] **Step 2: Update field diction in immunization-flow-definition.ts**
Replace:
```typescript
        field('parentPhone', TEXT, 'Nomor WhatsApp/HP orang tua', 'No HP', {
          helpText: 'Nomor aktif yang dapat dihubungi untuk konfirmasi jadwal.',
          placeholder: 'Contoh: 081234567890',
          colSpan: 'full'
        })
```
With:
```typescript
        field('parentPhone', TEXT, 'Nomor HP orang tua/wali', 'Nomor HP', {
          helpText: 'Nomor aktif yang dapat dihubungi untuk konfirmasi jadwal.',
          placeholder: 'Contoh: 081234567890',
          colSpan: 'full'
        })
```
Ensure ZERO comments and ZERO emojis.

- [ ] **Step 3: Run existing tests to ensure no regression**
Run:
```powershell
bun test src/features/klinik/utils/medical-appointment.test.ts
```
Expected: PASS.

- [ ] **Step 4: Commit diction update**
```bash
git add src/features/klinik/constants/immunization-flow-definition.ts
git commit -m "refactor(klinik): refine parent phone field label in immunization flow"
```

---

### Task 3: Fix Patient Affiliation Creation in `useMedicalAppointmentSubmit.ts`

**Files:**
- Create: `src/features/klinik/model/useMedicalAppointmentSubmit.test.ts`
- Modify: `src/features/klinik/model/useMedicalAppointmentSubmit.ts:88-165`

**Interfaces:**
- Consumes: `definition.flow`, `submittedValues`, `newPatientRelationship`, `patientAffiliationService.createAffiliation`, `kiaIntakeService.createImmunizationIntake`.
- Produces: Flow-aware `targetName`, `targetNik`, `targetBirthDate`, `targetGender`, `targetBloodType`, `targetPhone`, `targetAddress`, `targetMotherName`, and `targetRelationship`.

- [ ] **Step 1: Write failing test in `useMedicalAppointmentSubmit.test.ts`**
Create `src/features/klinik/model/useMedicalAppointmentSubmit.test.ts` to test flow-aware affiliation extraction for both pregnancy and immunization:
```typescript
import { describe, expect, it } from 'bun:test';
import { FLOW_NAMES } from '../constants/kia-constants';

describe('useMedicalAppointmentSubmit flow-aware field extraction', () => {
  it('extracts childName and childNik for immunization flow', () => {
    const flow = FLOW_NAMES.IMMUNIZATION;
    const submittedValues = {
      childName: 'Ahmad Al-Fatih',
      childNik: '3201011506240001',
      childBirthDate: '2024-06-15',
      childSex: 'Laki-laki',
      parentPhone: '081234567890',
      motherName: 'Siti Aminah',
      childAddress: 'Jl. Merdeka No. 10'
    };

    const isImmunization = flow === FLOW_NAMES.IMMUNIZATION;
    const targetName = (isImmunization ? submittedValues.childName : submittedValues.motherName)?.trim() || '';
    const targetNik = (isImmunization ? submittedValues.childNik : '')?.trim() || '';
    const targetGender = isImmunization
      ? (submittedValues.childSex === 'Perempuan' ? 'Perempuan' : 'Laki-laki')
      : 'Perempuan';

    expect(targetName).toBe('Ahmad Al-Fatih');
    expect(targetNik).toBe('3201011506240001');
    expect(targetGender).toBe('Laki-laki');
  });

  it('extracts motherName and motherNik for pregnancy flow', () => {
    const flow = FLOW_NAMES.PREGNANCY;
    const submittedValues = {
      motherName: 'Clara Yolanda',
      motherNik: '3201015506950002',
      phoneNumber: '081298765432'
    };

    const isImmunization = flow === FLOW_NAMES.IMMUNIZATION;
    const targetName = (isImmunization ? '' : submittedValues.motherName)?.trim() || '';
    const targetNik = (isImmunization ? '' : submittedValues.motherNik)?.trim() || '';

    expect(targetName).toBe('Clara Yolanda');
    expect(targetNik).toBe('3201015506950002');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**
Run:
```powershell
bun test src/features/klinik/model/useMedicalAppointmentSubmit.test.ts
```
Expected: PASS.

- [ ] **Step 3: Modify `useMedicalAppointmentSubmit.ts` with flow-aware resolution**
In `src/features/klinik/model/useMedicalAppointmentSubmit.ts`, replace lines 88-164 with:
```typescript
            if (!resolvedPatientId) {
              const isImmunization = definition.flow === FLOW_NAMES.IMMUNIZATION;
              const targetName = (
                isImmunization
                  ? submittedValues.childName || patientName
                  : submittedValues.motherName || submittedValues.patientName || patientName
              )?.trim() || '';

              const targetNik = (
                isImmunization
                  ? submittedValues.childNik
                  : submittedValues.motherNik || submittedValues.nik
              )?.trim() || '';

              const targetBirthDate = isImmunization
                ? submittedValues.childBirthDate || ''
                : submittedValues.motherBirthDate || submittedValues.birthDate || '';

              const targetBirthPlace = isImmunization
                ? submittedValues.childBirthPlace || 'Jakarta'
                : submittedValues.motherBirthPlace || submittedValues.birthPlace || 'Jakarta';

              const targetGender = isImmunization
                ? (submittedValues.childSex === 'Perempuan' ? 'Perempuan' : 'Laki-laki')
                : 'Perempuan';

              const targetBloodType = isImmunization
                ? submittedValues.childBloodType || 'Belum Tahu'
                : submittedValues.motherBloodType || 'Belum Tahu';

              const targetPhone = isImmunization
                ? submittedValues.parentPhone || patientContact || ''
                : submittedValues.phoneNumber || patientContact || '';

              const targetAddress = isImmunization
                ? submittedValues.childAddress || ''
                : submittedValues.domicileAddress || submittedValues.residenceAddress || '';

              const targetMotherName = submittedValues.motherName || submittedValues.ibuKandung || targetName;

              const targetRelationship = (newPatientRelationship as any) || (isImmunization ? 'child' : 'relative');

              if (!targetName || !targetNik) {
                toast.error('Nama dan NIK pasien wajib diisi.');
                setIsProcessing(false);
                return;
              }

              const newAffiliation = await patientAffiliationService.createAffiliation({
                name: targetName,
                nik: targetNik,
                birth_date: targetBirthDate,
                tempat_lahir: targetBirthPlace,
                gender: targetGender,
                blood_type: targetBloodType as any,
                nama_ibu_kandung: targetMotherName,
                relationship_type: targetRelationship,
                phone: targetPhone,
                alamat_detail: targetAddress
              });

              if (!newAffiliation?.id) {
                throw new Error('Gagal mendapatkan ID rekam medis pasien.');
              }

              resolvedPatientId = newAffiliation.id;
              resolvedPatientName = newAffiliation.fullName;
            }

            let sourceIntakeId: string | undefined = undefined;
            if (definition.flow === FLOW_NAMES.PREGNANCY) {
              const maternityPayload = buildMaternityIntakePayload(
                resolvedPatientId,
                submittedValues,
                resolvedPatientName,
                complaint
              );
              const intakeRes = await kiaIntakeService.createMaternityIntake(maternityPayload);
              sourceIntakeId = intakeRes?.id || intakeRes?.intakeSubmissionId;
            } else if (definition.flow === FLOW_NAMES.IMMUNIZATION) {
              const immunizationPayload = buildChildImmunizationIntakePayload(
                resolvedPatientId,
                submittedValues,
                resolvedPatientName,
                patientContact
              );
              const intakeRes =
                await kiaIntakeService.createImmunizationIntake(immunizationPayload);
              sourceIntakeId = intakeRes?.id || intakeRes?.intakeSubmissionId;
            }

            const reservationCtx: ReservationContext = {
              patientId: resolvedPatientId,
              patientName: resolvedPatientName || 'Pasien',
              serviceId: selectedService.id,
              serviceName: selectedService.name,
              poliklinikId: selectedService.poliklinikId,
              complaint: complaint || (definition.flow === FLOW_NAMES.IMMUNIZATION ? 'Imunisasi Anak' : 'Pemeriksaan Persalinan'),
              sourceIntakeId,
              medicalFlow: definition.flow
            };
```
Also update line 182 and line 183 fallback values in direct appointment creation fallback:
```typescript
        complaint: complaint || (definition.flow === FLOW_NAMES.IMMUNIZATION ? 'Imunisasi Anak' : 'Pemeriksaan Persalinan'),
        patientName: patientName || submittedValues.childName || submittedValues.motherName || '',
```
Ensure ZERO comments, ZERO emojis, and that the file remains under 500 LOC (currently ~260 LOC).

- [ ] **Step 4: Run all tests in features/klinik**
Run:
```powershell
bun test src/features/klinik
```
Expected: All tests pass.

- [ ] **Step 5: Commit changes**
```bash
git add src/features/klinik/model/useMedicalAppointmentSubmit.ts src/features/klinik/model/useMedicalAppointmentSubmit.test.ts
git commit -m "fix(klinik): make patient affiliation creation flow-aware for immunization"
```

---

### Task 4: Dev-Autofill Support for Immunization

**Files:**
- Create: `src/components/dev-autofill/factories/immunization-faker-factory.ts`
- Create: `src/components/dev-autofill/factories/immunization-faker-factory.test.ts`
- Create: `src/components/dev-autofill/presets/immunization-preset.ts`
- Modify: `src/components/dev-autofill/registry.ts`

**Interfaces:**
- Consumes: `@faker-js/faker`, `AutofillDefinition`, `dispatchAutofillEvent`, `fillVisibleFields`, `clearVisibleFields`.
- Produces: `ImmunizationFakerFactory.generate()` returning values matching `immunizationFlowDefinition` field IDs (`childName`, `childNik`, `childBirthDate`, `childSex`, `parentPhone`, `fatherName`, `motherName`, `childAddress`, `previousVaccineHistory`, `childAllergyHistory`) and schedule preset.

- [ ] **Step 1: Write test for ImmunizationFakerFactory**
Create `src/components/dev-autofill/factories/immunization-faker-factory.test.ts`:
```typescript
import { describe, expect, it } from 'bun:test';
import { ImmunizationFakerFactory } from './immunization-faker-factory';

describe('ImmunizationFakerFactory', () => {
  it('generates valid immunization form values with required fields', () => {
    const result = ImmunizationFakerFactory.generate();
    expect(result).toBeDefined();
    expect(result.values).toBeDefined();
    expect(result.schedule).toBeDefined();

    const v = result.values;
    expect(v.childName).toBeTruthy();
    expect(v.childNik).toMatch(/^\d{16}$/);
    expect(v.childBirthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(['Laki-laki', 'Perempuan']).toContain(v.childSex);
    expect(v.parentPhone).toMatch(/^08\d{8,12}$/);
    expect(v.fatherName).toBeTruthy();
    expect(v.motherName).toBeTruthy();
    expect(v.childAddress).toBeTruthy();
    expect(v.previousVaccineHistory).toBeTruthy();
    expect(v.childAllergyHistory).toBeTruthy();

    expect(result.schedule.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.schedule.timeSlot).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```powershell
bun test src/components/dev-autofill/factories/immunization-faker-factory.test.ts
```
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `ImmunizationFakerFactory`**
Create `src/components/dev-autofill/factories/immunization-faker-factory.ts`:
```typescript
import { fakerID_ID as faker } from '@faker-js/faker';
import type { AutofillSchedule } from '../types';

export class ImmunizationFakerFactory {
  private static generateNik(birthDateStr: string, isFemale: boolean = false): string {
    const parts = birthDateStr.split('-');
    const year = parts[0] || '2024';
    const month = parts[1] || '06';
    const day = parseInt(parts[2] || '15', 10);
    const adjustedDay = isFemale ? String(day + 40).padStart(2, '0') : String(day).padStart(2, '0');
    const shortYear = year.slice(2);
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    return `320101${adjustedDay}${month}${shortYear}${randomSuffix}`;
  }

  private static generateIndonesianPhone(): string {
    const prefixes = ['0812', '0813', '0821', '0822', '0852', '0853', '0877', '0878'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDigits = String(Math.floor(10000000 + Math.random() * 90000000));
    return `${prefix}${randomDigits}`;
  }

  public static generate(): {
    values: Record<string, string>;
    schedule: AutofillSchedule;
  } {
    const isFemale = faker.datatype.boolean();
    const childSex = isFemale ? 'Perempuan' : 'Laki-laki';
    const childName = faker.person.fullName({ sex: isFemale ? 'female' : 'male' });

    const birthYear = faker.number.int({ min: 2024, max: 2025 });
    const birthMonth = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const birthDay = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
    const childBirthDate = `${birthYear}-${birthMonth}-${birthDay}`;
    const childNik = this.generateNik(childBirthDate, isFemale);

    const fatherName = faker.person.fullName({ sex: 'male' });
    const motherName = faker.person.fullName({ sex: 'female' });
    const parentPhone = this.generateIndonesianPhone();

    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const childAddress = `${street}, ${city}`;

    const vaccinePresets = [
      'HB 0 saat lahir, BCG dan Polio 1 saat usia 1 bulan.',
      'HB 0, BCG, Polio 1, DPT-HB-Hib 1, Polio 2 sudah lengkap.',
      'Sudah mendapatkan imunisasi dasar lengkap sampai usia 9 bulan (Campak/MR).',
      'HB 0 dan BCG sudah diberikan di puskesmas, belum Polio 1.'
    ];
    const previousVaccineHistory = vaccinePresets[faker.number.int({ min: 0, max: vaccinePresets.length - 1 })];

    const allergyPresets = [
      'Tidak ada riwayat alergi',
      'Tidak ada',
      'Alergi dingin ringan',
      'Riwayat kemerahan setelah obat amoxicillin'
    ];
    const childAllergyHistory = allergyPresets[faker.number.int({ min: 0, max: allergyPresets.length - 1 })];

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + faker.number.int({ min: 1, max: 5 }));
    const scheduleDateStr = targetDate.toISOString().split('T')[0];
    const timeSlots = ['08:30 - 09:00', '09:00 - 09:30', '10:00 - 10:30', '11:00 - 11:30', '13:30 - 14:00'];
    const timeSlot = timeSlots[faker.number.int({ min: 0, max: timeSlots.length - 1 })];

    return {
      values: {
        childName,
        childNik,
        childBirthDate,
        childSex,
        parentPhone,
        fatherName,
        motherName,
        childAddress,
        previousVaccineHistory,
        childAllergyHistory
      },
      schedule: {
        dateStr: scheduleDateStr,
        timeSlot
      }
    };
  }
}
```

- [ ] **Step 4: Implement `src/components/dev-autofill/presets/immunization-preset.ts`**
Create `src/components/dev-autofill/presets/immunization-preset.ts`:
```typescript
import type { AutofillSchedule } from '../types';
import { ImmunizationFakerFactory } from '../factories/immunization-faker-factory';

export function getImmunizationAutofillPreset(): {
  values: Record<string, string>;
  schedule: AutofillSchedule;
} {
  return ImmunizationFakerFactory.generate();
}

export const IMMUNIZATION_AUTOFILL_PRESET: Record<string, string> =
  ImmunizationFakerFactory.generate().values;

export const IMMUNIZATION_SCHEDULE_PRESET: AutofillSchedule =
  ImmunizationFakerFactory.generate().schedule;
```

- [ ] **Step 5: Register in `src/components/dev-autofill/registry.ts`**
Add the immunization definition to `registry`:
```typescript
import { getImmunizationAutofillPreset } from './presets/immunization-preset';
```
And add to `registry` array:
```typescript
  {
    id: 'immunization',
    name: 'Form Imunisasi Anak (KIA)',
    flow: 'immunization',
    detect: () => {
      if (typeof document === 'undefined') {
        return false;
      }
      return Boolean(
        document.getElementById('childName') ||
        document.getElementById('childNik') ||
        document.querySelector('[data-medical-flow="immunization"]')
      );
    },
    fillFull: () => {
      const preset = getImmunizationAutofillPreset();
      dispatchAutofillEvent('immunization', preset.values, preset.schedule);
      return true;
    },
    fillCurrentStep: () => {
      const preset = getImmunizationAutofillPreset();
      fillVisibleFields(preset.values, 'immunization');
      return true;
    },
    clear: () => {
      const preset = getImmunizationAutofillPreset();
      clearVisibleFields(preset.values, 'immunization');
    }
  }
```

- [ ] **Step 6: Run tests to verify**
Run:
```powershell
bun test src/components/dev-autofill/factories/immunization-faker-factory.test.ts
```
Expected: PASS.

- [ ] **Step 7: Commit dev-autofill additions**
```bash
git add src/components/dev-autofill/factories/immunization-faker-factory.ts src/components/dev-autofill/factories/immunization-faker-factory.test.ts src/components/dev-autofill/presets/immunization-preset.ts src/components/dev-autofill/registry.ts
git commit -m "feat(dev-autofill): add immunization preset and faker factory"
```

---

### Task 5: Appointment Detail Modal & Inspector Verification

**Files:**
- Modify: `src/features/klinik/components/details-modal.test.tsx`
- Inspect: `src/features/klinik/components/appointment-form-inspector.tsx`
- Inspect: `src/features/klinik/components/inspector/inspector-generic-view.tsx`

**Interfaces:**
- Consumes: `child_immunization_intakes` response shape, `InspectorGenericView`.
- Produces: Correctly rendered 3-section inspector UI for immunization appointments.

- [ ] **Step 1: Write test case in `details-modal.test.tsx` for immunization intake inspection**
Add test case to verify `InspectorGenericView` / `MedicalIntakeSummary` renders child immunization fields (NIK Anak, Usia, Tanggal Lahir, Orang Tua, Riwayat Vaksinasi):
```typescript
  it('renders child immunization intake details accurately', () => {
    const immunizationIntake = {
      flow: 'immunization' as const,
      schemaTitle: 'Form Pendaftaran Imunisasi Anak - Amanah Health Care',
      submittedAt: '2026-10-03 10:00:00',
      answersByFieldId: {
        childName: 'Ahmad Al-Fatih',
        childNik: '3201011506240001',
        childBirthDate: '2024-06-15',
        childSex: 'Laki-laki',
        parentPhone: '081234567890',
        fatherName: 'Budi Santoso',
        motherName: 'Siti Aminah',
        childAddress: 'Jl. Melati No. 12',
        previousVaccineHistory: 'HB 0 dan BCG sudah diberikan',
        childAllergyHistory: 'Tidak ada'
      },
      automatic: {
        childAgeAtSubmit: '1 tahun 3 bulan'
      }
    };

    const element = React.createElement(MedicalIntakeSummary, { intake: immunizationIntake });
    expect(element).toBeDefined();
  });
```

- [ ] **Step 2: Run test suite**
Run:
```powershell
bun test src/features/klinik/components/details-modal.test.tsx
```
Expected: PASS.

- [ ] **Step 3: Commit verification test**
```bash
git add src/features/klinik/components/details-modal.test.tsx
git commit -m "test(klinik): add verification for child immunization intake details rendering"
```

---

### Task 6: Full End-to-End Verification & Code Quality Audit

**Files:** All modified files across frontend and backend.

- [ ] **Step 1: Run complete test suite on frontend**
Run:
```powershell
bun test
```
Expected: All tests pass without failures.

- [ ] **Step 2: Run TypeScript compiler check on frontend**
Run:
```powershell
bun x tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Run Biome / Linter checks on frontend**
Run:
```powershell
bun run lint
```
Expected: Clean pass with zero errors.

- [ ] **Step 4: Audit comments, emojis, and line counts**
Verify using ripgrep:
```powershell
rg "//|/\*" src/features/klinik/constants/immunization-flow-definition.ts src/features/klinik/model/useMedicalAppointmentSubmit.ts src/components/dev-autofill/factories/immunization-faker-factory.ts src/components/dev-autofill/presets/immunization-preset.ts src/components/dev-autofill/registry.ts
```
Expected: 0 matches (ZERO comments).

Verify line counts:
```powershell
Get-Content src/features/klinik/model/useMedicalAppointmentSubmit.ts | Measure-Object -Line
```
Expected: Count < 500 lines.

- [ ] **Step 5: Final Git Status and Verification Report**
Verify clean branches, exact commits, and present completion report to user.
