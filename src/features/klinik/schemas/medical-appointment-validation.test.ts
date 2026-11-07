import { describe, expect, it } from 'bun:test';
import {
  getMedicalFieldFormat,
  getMedicalFieldValidationSchema,
  isMedicalSectionValid,
  validateQuestionnaireYear,
  validateContraceptiveEntry,
  validatePregnancyHistoryEntry,
  validateImmunizationDateEntry
} from './medical-appointment-validation';
import {
  baselineMeasurementsSection,
  currentPregnancySection,
  diseaseHistorySection,
  riskFactorsBehaviorSection
} from '../constants/pregnancy-sections/clinical-sections';
import {
  domicileHealthCoverageSection,
  motherDomicileSection,
  motherIdentitySection,
  partnerIdentitySection
} from '../constants/pregnancy-sections/identity-sections';
import {
  createContraceptionSection,
  createPreviousPregnancySection,
  obstetricSummarySection
} from '../constants/pregnancy-sections/history-sections';
import {
  calculateContraceptiveDuration,
  getActiveMedicalSections
} from '../utils/medical-appointment';
import { getMedicalFlowDefinition } from '../constants/medical-appointment-schemas';

describe('Medical Appointment Validation - Non-blocking Optional Fields', () => {
  it('should allow baseline measurements section to be valid even when empty', () => {
    const emptyValues = {};
    const isValid = isMedicalSectionValid(baselineMeasurementsSection, emptyValues);
    expect(isValid).toBe(true);
  });

  it('should allow domicile and health coverage section to be valid when empty', () => {
    const emptyValues = {};
    const isValid = isMedicalSectionValid(domicileHealthCoverageSection, emptyValues);
    expect(isValid).toBe(true);
  });

  it('should allow mother domicile section to be valid when empty initially', () => {
    const emptyValues = {};
    const isValid = isMedicalSectionValid(motherDomicileSection, emptyValues);
    expect(isValid).toBe(true);
  });

  it('should allow partner identity section to be valid when empty', () => {
    const emptyValues = {};
    const isValid = isMedicalSectionValid(partnerIdentitySection, emptyValues);
    expect(isValid).toBe(true);
  });

  it('should allow risk factors behavior section to be valid when checkboxes are untouched', () => {
    const emptyValues = {};
    const isValid = isMedicalSectionValid(riskFactorsBehaviorSection, emptyValues);
    expect(isValid).toBe(true);
  });

  it('should allow disease history questionnaire to be valid when untouched', () => {
    const emptyValues = {};
    const isValid = isMedicalSectionValid(diseaseHistorySection, emptyValues);
    expect(isValid).toBe(true);
  });

  it('should NOT block patient if disease status is "Ya" but year notes is empty', () => {
    const values = {
      hasHypertensionHistory: 'Ya',
      hypertensionHistoryNotes: '' // Patient does not remember the year
    };
    const isValid = isMedicalSectionValid(diseaseHistorySection, values);
    expect(isValid).toBe(true);
  });

  it('should validate format if a year IS provided', () => {
    const validYearValues = {
      hasHypertensionHistory: 'Ya',
      hypertensionHistoryNotes: '2021'
    };
    expect(isMedicalSectionValid(diseaseHistorySection, validYearValues)).toBe(true);

    const invalidYearValues = {
      hasHypertensionHistory: 'Ya',
      hypertensionHistoryNotes: 'invalid_year'
    };
    expect(isMedicalSectionValid(diseaseHistorySection, invalidYearValues)).toBe(false);

    const futureYearValues = {
      hasHypertensionHistory: 'Ya',
      hypertensionHistoryNotes: '2099'
    };
    expect(isMedicalSectionValid(diseaseHistorySection, futureYearValues)).toBe(false);
  });

  it('should still enforce core patient identity fields in motherIdentitySection', () => {
    const emptyValues = {};
    expect(isMedicalSectionValid(motherIdentitySection, emptyValues)).toBe(false);

    const validCoreValues = {
      motherName: 'Siti Aminah',
      motherNik: '3201234567890001',
      motherBirthDate: '1995-04-12',
      phoneNumber: '081234567890'
    };
    expect(isMedicalSectionValid(motherIdentitySection, validCoreValues)).toBe(true);
  });

  it('should validate HPHT date (rejecting date before birth and future dates)', () => {
    // 1. HPHT before patient's birth date must be rejected
    const beforeBirthValues = {
      motherBirthDate: '1995-04-12',
      hpht: '1990-01-01'
    };
    expect(isMedicalSectionValid(currentPregnancySection, beforeBirthValues)).toBe(false);

    // 2. HPHT equal to patient's birth date must be rejected
    const equalBirthValues = {
      motherBirthDate: '1995-04-12',
      hpht: '1995-04-12'
    };
    expect(isMedicalSectionValid(currentPregnancySection, equalBirthValues)).toBe(false);

    // 3. HPHT far in the future must be rejected
    const futureValues = {
      motherBirthDate: '1995-04-12',
      hpht: '2099-01-01'
    };
    expect(isMedicalSectionValid(currentPregnancySection, futureValues)).toBe(false);

    // 4. HPHT validly after birth date and not in the future with mandatory complaint
    const validHphtValues = {
      motherBirthDate: '1995-04-12',
      hpht: '2025-11-01',
      currentComplaints: 'Mual ringan di pagi hari'
    };
    expect(isMedicalSectionValid(currentPregnancySection, validHphtValues)).toBe(true);
  });

  it('should enforce currentComplaints in currentPregnancySection', () => {
    const withoutComplaints = {
      motherBirthDate: '1995-04-12',
      hpht: '2025-11-01',
      currentComplaints: ''
    };
    expect(isMedicalSectionValid(currentPregnancySection, withoutComplaints)).toBe(false);

    const withComplaints = {
      motherBirthDate: '1995-04-12',
      hpht: '2025-11-01',
      currentComplaints: 'Mual dan pusing'
    };
    expect(isMedicalSectionValid(currentPregnancySection, withComplaints)).toBe(true);
  });

  it('should validate questionnaire disease history year with inline error helper', () => {
    const currentYear = new Date().getFullYear();
    const patientBirthYear = 1998;

    // 1. Empty year is valid (optional field: patient does not remember)
    expect(validateQuestionnaireYear('', patientBirthYear)).toBeUndefined();
    expect(validateQuestionnaireYear('   ', patientBirthYear)).toBeUndefined();

    // 2. Year earlier than patient birth year returns informative error
    const beforeBirthError = validateQuestionnaireYear('1990', patientBirthYear);
    expect(beforeBirthError).toContain('tidak boleh lebih awal dari tahun kelahiran pasien');

    // 3. Year in the future returns error
    const futureError = validateQuestionnaireYear('2099', patientBirthYear);
    expect(futureError).toContain(`tidak boleh melebihi tahun saat ini (${currentYear})`);

    // 4. Year < 1900 returns error
    const ancientError = validateQuestionnaireYear('1850', patientBirthYear);
    expect(ancientError).toContain('tidak boleh lebih awal dari 1900');

    // 5. Incomplete / non-4-digit input returns error
    const incompleteError = validateQuestionnaireYear('202', patientBirthYear);
    expect(incompleteError).toContain('Tahun harus berupa 4 digit angka');

    // 6. Valid year between patient birth and current year
    expect(validateQuestionnaireYear('2021', patientBirthYear)).toBeUndefined();
    expect(validateQuestionnaireYear(String(currentYear), patientBirthYear)).toBeUndefined();
    expect(validateQuestionnaireYear(String(patientBirthYear), patientBirthYear)).toBeUndefined();
  });

  it('should validate obstetric counts correlation (G, P, Ab, Ah)', () => {
    // 1. G=2 (Prior = 1). P=1, Ab=0, Ah=1 -> VALID
    const validCounts = {
      gravidaCount: '2',
      parityCount: '1',
      abortionCount: '0',
      livingChildrenCount: '1'
    };
    expect(isMedicalSectionValid(obstetricSummarySection, validCounts)).toBe(true);

    // 2. G=2 (Prior = 1). P=1, Ab=1 -> INVALID (P + Ab = 2 > Prior = 1)
    const excessSum = {
      gravidaCount: '2',
      parityCount: '1',
      abortionCount: '1',
      livingChildrenCount: '1'
    };
    expect(isMedicalSectionValid(obstetricSummarySection, excessSum)).toBe(false);

    // 3. G=2 (Prior = 1). P=0, Ab=2 -> INVALID (Ab = 2 > Prior = 1)
    const excessAbortion = {
      gravidaCount: '2',
      parityCount: '0',
      abortionCount: '2',
      livingChildrenCount: '0'
    };
    expect(isMedicalSectionValid(obstetricSummarySection, excessAbortion)).toBe(false);

    // 4. G=2 (Prior = 1). P=0, Ab=1, Ah=1 -> INVALID (Ah = 1 when P = 0)
    const excessLiving = {
      gravidaCount: '2',
      parityCount: '0',
      abortionCount: '1',
      livingChildrenCount: '1'
    };
    expect(isMedicalSectionValid(obstetricSummarySection, excessLiving)).toBe(false);
  });

  it('should format and validate previous pregnancy birth year dynamically without hardcoding', () => {
    const prevPregSection = createPreviousPregnancySection(1);
    const birthYearField = prevPregSection.fields.find(
      (f) => f.id === 'previousPregnancy1BirthYear'
    );
    expect(birthYearField).toBeDefined();
    expect(getMedicalFieldFormat(birthYearField!)).toBe('year');

    const allValues = {
      motherBirthDate: '1998-05-15'
    };

    // 1. Empty birth year is valid (optional field, patient can skip)
    const schema = getMedicalFieldValidationSchema(birthYearField!, null, allValues);
    expect(schema.safeParse('').success).toBe(true);

    // 2. Year before mother was born (1990 < 1998) is rejected
    const beforeBirthResult = schema.safeParse('1990');
    expect(beforeBirthResult.success).toBe(false);
    expect(beforeBirthResult.error?.issues[0]?.message).toContain(
      'tidak boleh lebih awal dari tahun kelahiran pasien'
    );

    // 3. Year in the future (2099) is rejected dynamically
    const futureResult = schema.safeParse('2099');
    expect(futureResult.success).toBe(false);
    expect(futureResult.error?.issues[0]?.message).toContain('tidak boleh melebihi tahun saat ini');

    // 4. Valid year (e.g. 2021) is accepted
    const validResult = schema.safeParse('2021');
    expect(validResult.success).toBe(true);
  });

  it('should auto-skip redundant obstetric gateway when parity is 0 or > 0', () => {
    const definition = getMedicalFlowDefinition('pregnancy');
    expect(definition).toBeDefined();

    // 1. When parityCount is '0', obstetricGateway and previousPregnancy are omitted
    const zeroParityValues = {
      gravidaCount: '1',
      parityCount: '0',
      abortionCount: '0',
      livingChildrenCount: '0'
    };
    const zeroSections = getActiveMedicalSections(definition!, zeroParityValues);
    expect(zeroSections.some((s) => s.id === 'obstetricGateway')).toBe(false);
    expect(zeroSections.some((s) => s.id.startsWith('previousPregnancy'))).toBe(false);

    // 2. When parityCount is '1', obstetricGateway is omitted (delivery count is already known)
    const oneParityValues = {
      gravidaCount: '2',
      parityCount: '1',
      abortionCount: '0',
      livingChildrenCount: '1',
      hasPreviousPregnancyHistory: 'Ya, ada'
    };
    const oneSections = getActiveMedicalSections(definition!, oneParityValues);
    expect(oneSections.some((s) => s.id === 'obstetricGateway')).toBe(false);
    expect(oneSections.some((s) => s.id.startsWith('previousPregnancy'))).toBe(true);
  });

  it('should validate contraception start date and stop date boundaries', () => {
    const contraceptionSection = createContraceptionSection(1);
    const startDateField = contraceptionSection.fields.find((f) => f.id === 'contraception1StartDate')!;
    const stopDateField = contraceptionSection.fields.find((f) => f.id === 'contraception1StopDate')!;

    expect(startDateField).toBeDefined();
    expect(stopDateField).toBeDefined();

    const patientValues = {
      motherBirthDate: '1995-04-12'
    };

    // 1. Empty values are valid (optional fields)
    expect(isMedicalSectionValid(contraceptionSection, patientValues)).toBe(true);

    // 2. Start date in the future (2099) is rejected
    const futureStartSchema = getMedicalFieldValidationSchema(startDateField, 1995, {
      ...patientValues,
      contraception1StartDate: '2099-01-01'
    });
    const futureStartRes = futureStartSchema.safeParse('2099-01-01');
    expect(futureStartRes.success).toBe(false);
    expect(futureStartRes.error?.issues[0]?.message).toBe('Tanggal mulai KB tidak boleh di masa depan');

    // 3. Start date before patient birth date (1990 < 1995) is rejected
    const beforeBirthSchema = getMedicalFieldValidationSchema(startDateField, 1995, {
      ...patientValues,
      contraception1StartDate: '1990-01-01'
    });
    const beforeBirthRes = beforeBirthSchema.safeParse('1990-01-01');
    expect(beforeBirthRes.success).toBe(false);
    expect(beforeBirthRes.error?.issues[0]?.message).toBe(
      'Tanggal mulai KB tidak boleh lebih awal dari tanggal lahir pasien'
    );

    // 4. Start date when patient is under 10 years old (1995 birth, 2000 start -> age 4/5) is rejected
    const underAgeSchema = getMedicalFieldValidationSchema(startDateField, 1995, {
      ...patientValues,
      contraception1StartDate: '2000-01-01'
    });
    const underAgeRes = underAgeSchema.safeParse('2000-01-01');
    expect(underAgeRes.success).toBe(false);
    expect(underAgeRes.error?.issues[0]?.message).toBe('Usia saat mulai menggunakan KB minimal 10 tahun');

    // 5. Stop date in the future is rejected
    const futureStopSchema = getMedicalFieldValidationSchema(stopDateField, 1995, {
      ...patientValues,
      contraception1StopDate: '2099-01-01'
    });
    const futureStopRes = futureStopSchema.safeParse('2099-01-01');
    expect(futureStopRes.success).toBe(false);
    expect(futureStopRes.error?.issues[0]?.message).toBe('Tanggal lepas KB tidak boleh di masa depan');

    // 6. Stop date earlier than start date (start: 2020-01-01, stop: 2018-01-01) is rejected
    const invalidStopSchema = getMedicalFieldValidationSchema(stopDateField, 1995, {
      ...patientValues,
      contraception1StartDate: '2020-01-01',
      contraception1StopDate: '2018-01-01'
    });
    const invalidStopRes = invalidStopSchema.safeParse('2018-01-01');
    expect(invalidStopRes.success).toBe(false);
    expect(invalidStopRes.error?.issues[0]?.message).toBe(
      'Tanggal lepas KB tidak boleh lebih awal dari tanggal mulai pemakaian'
    );

    // 7. Start date later than stop date (start: 2022-01-01, stop: 2020-01-01) is rejected
    const invalidStartSchema = getMedicalFieldValidationSchema(startDateField, 1995, {
      ...patientValues,
      contraception1StartDate: '2022-01-01',
      contraception1StopDate: '2020-01-01'
    });
    const invalidStartRes = invalidStartSchema.safeParse('2022-01-01');
    expect(invalidStartRes.success).toBe(false);
    expect(invalidStartRes.error?.issues[0]?.message).toBe(
      'Tanggal mulai KB tidak boleh melebihi tanggal lepas atau berhenti'
    );

    // 8. Valid start date and stop date pass validation
    const validContraceptionValues = {
      ...patientValues,
      contraception1StartDate: '2018-05-10',
      contraception1StopDate: '2021-06-20',
      contraception1Type: 'Suntik 3 Bulan',
      contraception1Duration: '3 tahun 1 bulan'
    };
    expect(isMedicalSectionValid(contraceptionSection, validContraceptionValues)).toBe(true);
  });

  it('should arrange contraception start and stop dates side-by-side with auto-calculated duration', () => {
    const section = createContraceptionSection(1);
    const fields = section.fields;

    // Field 0: StartDate (colSpan: 1)
    expect(fields[0].id).toBe('contraception1StartDate');
    expect(fields[0].colSpan).toBe(1);

    // Field 1: StopDate (colSpan: 1)
    expect(fields[1].id).toBe('contraception1StopDate');
    expect(fields[1].colSpan).toBe(1);

    // Field 3: Duration (colSpan: 1, disabled for auto-calc)
    expect(fields[3].id).toBe('contraception1Duration');
    expect(fields[3].colSpan).toBe(1);
    expect(fields[3].disabled).toBe(true);

    // Test duration calculator
    expect(calculateContraceptiveDuration('2020-01-01', '2021-01-01')).toBe('1 tahun');
    expect(calculateContraceptiveDuration('2020-01-01', '2021-06-01')).toBe('1 tahun 5 bulan');
    expect(calculateContraceptiveDuration('2020-01-01', '2020-07-01')).toBe('6 bulan');
    expect(calculateContraceptiveDuration('2020-01-01', '2020-01-22')).toBe('3 minggu');
    expect(calculateContraceptiveDuration('2020-01-01', '2020-01-06')).toBe('5 hari');
    expect(calculateContraceptiveDuration('', '2020-01-01')).toBe('');
    expect(calculateContraceptiveDuration('2021-01-01', '2020-01-01')).toBe('');
  });

  describe('Reusable Modal & Entry Validations', () => {
    it('validateContraceptiveEntry should validate start and stop date boundaries dynamically', () => {
      const motherBirth = '1998-05-15';

      // 1. Valid entry
      const valid = validateContraceptiveEntry(
        { startDate: '2020-01-01', stopDate: '2021-01-01' },
        motherBirth
      );
      expect(valid.isValid).toBe(true);

      // 2. Future start date
      const futureStart = validateContraceptiveEntry(
        { startDate: '2099-01-01' },
        motherBirth
      );
      expect(futureStart.isValid).toBe(false);
      expect(futureStart.errors.startDate).toContain('tidak boleh di masa depan');

      // 3. Start date before mother born
      const beforeBirth = validateContraceptiveEntry(
        { startDate: '1990-01-01' },
        motherBirth
      );
      expect(beforeBirth.isValid).toBe(false);
      expect(beforeBirth.errors.startDate).toContain('tidak boleh lebih awal dari tanggal lahir');

      // 3b. User exact case: mother born 2004-08-23, input 1999-07-23 (23071999)
      const userCase = validateContraceptiveEntry(
        { startDate: '1999-07-23' },
        '2004-08-23'
      );
      expect(userCase.isValid).toBe(false);
      expect(userCase.errors.startDate).toBe('Tanggal mulai KB tidak boleh lebih awal dari tanggal lahir pasien');

      // 4. Age < 10 years
      const youngStart = validateContraceptiveEntry(
        { startDate: '2005-01-01' },
        motherBirth
      );
      expect(youngStart.isValid).toBe(false);
      expect(youngStart.errors.startDate).toContain('minimal 10 tahun');

      // 5. Stop date before start date
      const inverted = validateContraceptiveEntry(
        { startDate: '2021-01-01', stopDate: '2020-01-01' },
        motherBirth
      );
      expect(inverted.isValid).toBe(false);
      expect(inverted.errors.stopDate).toContain('tidak boleh lebih awal dari tanggal mulai');
    });

    it('validatePregnancyHistoryEntry should validate birth year dynamically', () => {
      const motherBirth = '1998-05-15';

      // 1. Valid birth year
      const valid = validatePregnancyHistoryEntry({ birthYear: '2021' }, motherBirth);
      expect(valid.isValid).toBe(true);

      // 2. Future year
      const future = validatePregnancyHistoryEntry({ birthYear: '2099' }, motherBirth);
      expect(future.isValid).toBe(false);
      expect(future.errors.birthYear).toContain('tidak boleh melebihi tahun saat ini');

      // 3. Before mother born
      const beforeBirth = validatePregnancyHistoryEntry({ birthYear: '1990' }, motherBirth);
      expect(beforeBirth.isValid).toBe(false);
      expect(beforeBirth.errors.birthYear).toContain('tidak boleh lebih awal dari tahun kelahiran');
    });

    it('validateImmunizationDateEntry should validate injection date against child birth date', () => {
      const childBirth = '2024-01-10';

      // 1. Valid date
      const valid = validateImmunizationDateEntry('2024-02-15', childBirth);
      expect(valid.isValid).toBe(true);

      // 2. Future date
      const future = validateImmunizationDateEntry('2099-01-01', childBirth);
      expect(future.isValid).toBe(false);
      expect(future.errors.injectionDate).toContain('tidak boleh di masa depan');

      // 3. Before child born
      const beforeBirth = validateImmunizationDateEntry('2023-12-01', childBirth);
      expect(beforeBirth.isValid).toBe(false);
      expect(beforeBirth.errors.injectionDate).toContain('tidak boleh lebih awal dari tanggal lahir anak');
    });
  });
});
