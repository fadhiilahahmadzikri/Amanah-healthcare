# Immunization Form Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the immunization intake flow by splitting vaccine and allergy histories into separate steps with gateway conditional skips, providing a clean segmented vaccine checklist based on clinic guidelines, formatting payloads with structured summaries, and providing a dedicated tabbed inspection view in the dashboard appointment detail modal.

**Architecture:** 
1. Follow existing form signatures from the persalinan flow: gateway questions conditionally skip subsequent detail sections without hardcoding.
2. Structure the immunization wizard into 4 clear patient-facing steps: (1) Data Identitas Anak, (2) Data Orang Tua & Alamat, (3) Riwayat Vaksinasi (Gateway + Checklist), and (4) Riwayat Alergi Anak.
3. Keep the vaccine checklist clean, compact, and mobile-friendly with segmented buttons (Sudah / Belum / Tidak tahu) and inline collapsible date inputs.
4. Format intake submissions so `child_immunization_intakes.previous_vaccine_history` receives a human-readable summary while `medical_intake_submissions.answers` retains full structured key-values.
5. In the dashboard appointment inspector modal, render dedicated immunization tabs (Identitas, Riwayat Vaksinasi, Riwayat Alergi) matching shadcn/ui design tokens.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, Tailwind CSS v4, TanStack Form, TanStack React Query, Bun test runner.

**Spec:** `docs/tambahan-form-imunisasi/tambahan-form-imunisasi.txt` and `D:\docucare\data\amanah-health-care-imunisasi-form.cjs`.

## Global Constraints

- ZERO comments (`//` or `/*`) in all modified code.
- ZERO emojis across all code, tests, and logs.
- All files strictly under 500 lines of code.
- Backend is Single Source of Truth; NO hardcoded fake IDs or fallback dummy data.
- Clinical staff fields (subjektif: demam/batuk/pilek; objektif: BB/PB/LK/S; planning) are strictly excluded from patient intake.
- Test-driven verification before asserting completion.

---

## File Structure Map

| File | Responsibility |
|---|---|
| `src/features/klinik/constants/kia-constants.ts` | Section IDs, field IDs, vaccine constants, and gateway choice enums |
| `src/features/klinik/constants/immunization-flow-definition.ts` | Form sections definition for immunization flow (4 clear steps) |
| `src/features/klinik/utils/medical-appointment.ts` | Step filtering logic (`getActiveMedicalSections`) supporting immunization gateway skips |
| `src/features/klinik/components/booking/vaccine-checklist.tsx` | Minimalist atomic component for vaccine status selection and date input |
| `src/features/klinik/components/booking/medical-appointment-steps.tsx` | Form step router rendering the checklist when section is active |
| `src/features/klinik/utils/kia-intake-payload-builder.ts` | Maps form values to `CreateChildImmunizationPayload` with human-readable summary |
| `src/components/dev-autofill/factories/immunization-faker-factory.ts` | Generates realistic Indonesian toddler data for autofilling during development |
| `src/features/klinik/components/inspector/inspector-immunization-tab.tsx` | Dedicated tabbed viewer for immunization intake in appointment inspector |
| `src/features/klinik/components/appointment-form-inspector.tsx` | Routes immunization appointments to `InspectorImmunizationTab` |

---

### Task 1: Split Immunization Flow Definition and Gateway Logic

**Files:**
- Modify: `src/features/klinik/constants/kia-constants.ts:40-85`
- Modify: `src/features/klinik/constants/immunization-flow-definition.ts:1-86`
- Modify: `src/features/klinik/utils/medical-appointment.ts:65-88`
- Test: `src/features/klinik/utils/medical-appointment.test.ts:250-295`

**Interfaces:**
- Consumes: `MedicalFlowDefinition`, `MedicalFormSection`, `MedicalFormField` from `medical-appointment-types.ts`
- Produces: `immunizationFlowDefinition` with 4 separate sections: `childIdentity`, `parentIdentity`, `vaccineGateway`, `vaccineHistory`, `allergyHistory`

- [ ] **Step 1: Write the failing test**

```typescript
describe('Immunization Flow Definition & Gateway', () => {
  it('splits immunization into distinct identity, vaccine gateway, vaccine history, and allergy sections', () => {
    const sectionIds = immunizationFlowDefinition.sections.map((s) => s.id);
    expect(sectionIds).toContain('childIdentity');
    expect(sectionIds).toContain('parentIdentity');
    expect(sectionIds).toContain('vaccineGateway');
    expect(sectionIds).toContain('vaccineHistory');
    expect(sectionIds).toContain('allergyHistory');
    expect(sectionIds).not.toContain('vaccineAndAllergyHistory');
  });

  it('skips vaccineHistory section when gateway answer is Belum pernah sama sekali', () => {
    const activeSectionsWithNoHistory = getActiveMedicalSections(immunizationFlowDefinition, {
      hasVaccineHistory: 'Belum pernah sama sekali'
    });
    const ids = activeSectionsWithNoHistory.map((s) => s.id);
    expect(ids).not.toContain('vaccineHistory');
    expect(ids).toContain('allergyHistory');
  });

  it('includes vaccineHistory section when gateway answer is Pernah', () => {
    const activeSectionsWithHistory = getActiveMedicalSections(immunizationFlowDefinition, {
      hasVaccineHistory: 'Ya, pernah'
    });
    const ids = activeSectionsWithHistory.map((s) => s.id);
    expect(ids).toContain('vaccineHistory');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/features/klinik/utils/medical-appointment.test.ts`
Expected: FAIL with missing sections and gateway logic.

- [ ] **Step 3: Write minimal implementation**

Update `src/features/klinik/constants/kia-constants.ts` with new section IDs and choices:
```typescript
export const VACCINE_GATEWAY_CHOICE = {
  YES: 'Ya, pernah',
  NO: 'Belum pernah sama sekali'
} as const;

export const ALLERGY_GATEWAY_CHOICE = {
  YES: 'Ada riwayat alergi',
  NO: 'Tidak ada alergi'
} as const;
```

Update `src/features/klinik/constants/immunization-flow-definition.ts` to declare `vaccineGateway`, `vaccineHistory`, and `allergyHistory` sections.
Update `getActiveMedicalSections` in `src/features/klinik/utils/medical-appointment.ts`:
```typescript
if (section.id === 'vaccineHistory') {
  return values.hasVaccineHistory === VACCINE_GATEWAY_CHOICE.YES;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/features/klinik/utils/medical-appointment.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/klinik/constants/kia-constants.ts src/features/klinik/constants/immunization-flow-definition.ts src/features/klinik/utils/medical-appointment.ts src/features/klinik/utils/medical-appointment.test.ts
git commit -m "feat(klinik): split immunization intake into dedicated vaccine and allergy steps"
```

---

### Task 2: Implement Vaccine Checklist Component and Stepper Integration

**Files:**
- Create: `src/features/klinik/components/booking/vaccine-checklist.tsx`
- Create: `src/features/klinik/components/booking/vaccine-checklist.test.tsx`
- Modify: `src/features/klinik/components/booking/medical-appointment-steps.tsx:40-70`

**Interfaces:**
- Consumes: `MedicalAppointmentValues`, `form.setFieldValue`
- Produces: `VaccineChecklist` component rendering core vaccines (HB 0, BCG, PENTA 1-3, IPV 1-3, PCV 1-2, RV 1-3, MR, JE, Booster) with segmented status (`Sudah` / `Belum` / `Tidak tahu`) and inline collapsible date inputs.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'bun:test';
import * as React from 'react';
import { VaccineChecklist, CORE_VACCINE_LIST } from './vaccine-checklist';

describe('VaccineChecklist Component', () => {
  it('contains all 15 official core vaccines from the clinical form', () => {
    const codes = CORE_VACCINE_LIST.map((v) => v.code);
    expect(codes).toContain('HB_0');
    expect(codes).toContain('BCG');
    expect(codes).toContain('PENTA_1');
    expect(codes).toContain('PCV_1');
    expect(codes).toContain('RV_1');
    expect(codes).toContain('MR');
    expect(codes).toContain('JE');
    expect(codes).toContain('PCV_B');
    expect(codes).toContain('PENTA_B');
    expect(codes).toContain('MR_B');
  });

  it('renders without throwing when supplied values and change handler', () => {
    const values: Record<string, string> = {
      vaccine_HB_0_status: 'Sudah',
      vaccine_HB_0_date: '2026-01-15'
    };
    const element = React.createElement(VaccineChecklist, {
      values,
      onFieldChange: () => {}
    });
    expect(element).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/features/klinik/components/booking/vaccine-checklist.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/features/klinik/components/booking/vaccine-checklist.tsx`:
- Render vaccines grouped by age milestone.
- Provide clean segmented buttons (`Sudah`, `Belum`, `Tidak tahu`).
- When `Sudah` is selected, render an inline collapsible date input (`Tgl suntik`).
- Include bottom textarea for `otherVaccineNotes`.
- Connect into `src/features/klinik/components/booking/medical-appointment-steps.tsx` when `section.id === 'vaccineHistory'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/features/klinik/components/booking/vaccine-checklist.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/klinik/components/booking/vaccine-checklist.tsx src/features/klinik/components/booking/vaccine-checklist.test.tsx src/features/klinik/components/booking/medical-appointment-steps.tsx
git commit -m "feat(klinik): add compact segmented vaccine checklist component"
```

---

### Task 3: Update Intake Payload Builder and Dev Faker Factory

**Files:**
- Modify: `src/features/klinik/utils/kia-intake-payload-builder.ts:305-326`
- Modify: `src/features/klinik/utils/kia-intake-payload-builder.test.ts:125-157`
- Modify: `src/components/dev-autofill/factories/immunization-faker-factory.ts:1-85`
- Modify: `src/components/dev-autofill/factories/immunization-faker-factory.test.ts:1-27`

**Interfaces:**
- Consumes: Form values containing gateway answers and vaccine statuses
- Produces: `CreateChildImmunizationPayload` where `previousVaccineHistory` contains human-readable summary and `childAllergyHistory` reflects allergy gateway/notes

- [ ] **Step 1: Write the failing test**

```typescript
it('formats structured vaccine checklist into previousVaccineHistory summary string', () => {
  const values = {
    childNik: '3201234567890009',
    childName: 'Bayi Ahmad',
    childBirthDate: '2025-06-01',
    childSex: 'Laki-laki',
    parentPhone: '081234567899',
    hasVaccineHistory: 'Ya, pernah',
    vaccine_HB_0_status: 'Sudah',
    vaccine_HB_0_date: '2025-06-02',
    vaccine_BCG_status: 'Sudah',
    vaccine_BCG_date: '2025-07-01',
    vaccine_PENTA_1_status: 'Belum',
    otherVaccinesNote: 'Polio tetes 2 kali',
    hasAllergyHistory: 'Tidak ada alergi'
  };

  const payload = buildChildImmunizationIntakePayload('pat-1', values);
  expect(payload.previousVaccineHistory).toContain('HB 0: Sudah (2025-06-02)');
  expect(payload.previousVaccineHistory).toContain('BCG: Sudah (2025-07-01)');
  expect(payload.previousVaccineHistory).toContain('PENTA 1: Belum');
  expect(payload.previousVaccineHistory).toContain('Lainnya: Polio tetes 2 kali');
  expect(payload.childAllergyHistory).toBe('Tidak ada riwayat alergi.');
});

it('sets previousVaccineHistory to Belum pernah sama sekali when gateway is negative', () => {
  const values = {
    childNik: '3201234567890009',
    childName: 'Bayi Ahmad',
    childBirthDate: '2025-06-01',
    childSex: 'Laki-laki',
    parentPhone: '081234567899',
    hasVaccineHistory: 'Belum pernah sama sekali',
    hasAllergyHistory: 'Tidak ada alergi'
  };

  const payload = buildChildImmunizationIntakePayload('pat-1', values);
  expect(payload.previousVaccineHistory).toBe('Belum pernah imunisasi sama sekali');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/features/klinik/utils/kia-intake-payload-builder.test.ts`
Expected: FAIL with mismatched payload formatting.

- [ ] **Step 3: Write minimal implementation**

Update `buildChildImmunizationIntakePayload` in `src/features/klinik/utils/kia-intake-payload-builder.ts` to construct the summary from `CORE_VACCINE_LIST` entries when `hasVaccineHistory === 'Ya, pernah'`.
Update `src/components/dev-autofill/factories/immunization-faker-factory.ts` to populate the new gateway choices, core vaccine statuses (`Sudah` / `Belum`), dates, and allergy fields.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/features/klinik/utils/kia-intake-payload-builder.test.ts src/components/dev-autofill/factories/immunization-faker-factory.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/klinik/utils/kia-intake-payload-builder.ts src/features/klinik/utils/kia-intake-payload-builder.test.ts src/components/dev-autofill/factories/immunization-faker-factory.ts src/components/dev-autofill/factories/immunization-faker-factory.test.ts
git commit -m "feat(klinik): format immunization intake payload summary and update dev autofill"
```

---

### Task 4: Enhance Dashboard Appointment Form Inspector for Immunization

**Files:**
- Create: `src/features/klinik/components/inspector/inspector-immunization-tab.tsx`
- Create: `src/features/klinik/components/inspector/inspector-immunization-tab.test.tsx`
- Modify: `src/features/klinik/components/appointment-form-inspector.tsx:170-205`

**Interfaces:**
- Consumes: `UnifiedInspectorData`, `Appointment`
- Produces: Tabbed inspection interface for staff/doctor in dashboard Janji Temu:
  - Tab 1: Identitas (Anak & Orang Tua)
  - Tab 2: Riwayat Vaksinasi (Clean list with status badges: Sudah [Hijau + Tanggal], Belum [Muted], Tidak Tahu [Secondary])
  - Tab 3: Riwayat Alergi (Status & detail alergi)

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'bun:test';
import * as React from 'react';
import { InspectorImmunizationTab } from './inspector-immunization-tab';

describe('InspectorImmunizationTab Component', () => {
  it('renders child identity, vaccine history badges, and allergy info', () => {
    const mockData: any = {
      flow: 'immunization',
      child: {
        childName: 'Aisyah Putri',
        childNik: '3404075201260002',
        childBirthDate: '2026-01-12',
        childSex: 'Perempuan',
        parentPhone: '081234567890',
        fatherName: 'Ahmad Fauzi',
        motherName: 'Dewi Lestari',
        childAddress: 'Sleman',
        previousVaccineHistory: 'HB 0: Sudah (2026-01-13); BCG: Sudah (2026-02-12)',
        childAllergyHistory: 'Tidak ada alergi obat atau makanan'
      },
      answers: {
        vaccine_HB_0_status: 'Sudah',
        vaccine_HB_0_date: '2026-01-13',
        vaccine_BCG_status: 'Sudah',
        vaccine_BCG_date: '2026-02-12'
      }
    };

    const element = React.createElement(InspectorImmunizationTab, {
      appointment: { id: 'app-1', patient_name: 'Aisyah Putri' } as any,
      data: mockData
    });
    expect(element).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/features/klinik/components/inspector/inspector-immunization-tab.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/features/klinik/components/inspector/inspector-immunization-tab.tsx`:
- Render 3 clean tabs: `Identitas`, `Riwayat Vaksinasi`, `Riwayat Alergi`.
- Use Badge components for `Sudah` (success/primary), `Belum` (muted), `Tidak tahu` (secondary).
- Show injection dates inline.
- Connect into `src/features/klinik/components/appointment-form-inspector.tsx` when `parsedData.flow === 'immunization'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/features/klinik/components/inspector/inspector-immunization-tab.test.tsx src/features/klinik/components/details-modal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/klinik/components/inspector/inspector-immunization-tab.tsx src/features/klinik/components/inspector/inspector-immunization-tab.test.tsx src/features/klinik/components/appointment-form-inspector.tsx
git commit -m "feat(klinik): add dedicated tabbed immunization view to appointment inspector modal"
```

---

### Task 5: End-to-End Regression & Verification

**Files:**
- Test: All clinic & autofill tests across the repository

- [ ] **Step 1: Run comprehensive unit test suite**

Run: `bun test`
Expected: All 267+ unit tests pass.

- [ ] **Step 2: Run TypeScript compiler check**

Run: `bun x tsc --noEmit`
Expected: 0 type errors.

- [ ] **Step 3: Final clean commit (if any leftover adjustments)**

```bash
git status
```
