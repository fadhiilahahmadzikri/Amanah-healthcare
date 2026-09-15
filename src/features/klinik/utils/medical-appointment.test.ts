import { describe, expect, it } from 'bun:test';
import {
  getMedicalFlowDefinition,
  pregnancyFlowDefinition,
  immunizationFlowDefinition
} from '../constants/medical-appointment-schemas';
import {
  buildAutomaticRecord,
  buildDefaultMedicalValues,
  buildMedicalIntakeRecord,
  calculateAgeInYears,
  calculateBmi,
  findMedicalField
} from './medical-appointment';
import {
  getReservationMedicalFlow,
  getReservationServiceByTitle
} from '../constants/appointment-reservation-services';
import { isMedicalSectionValid } from '../schemas/medical-appointment-validation';

describe('Medical Appointment Flows', () => {
  it('loads pregnancy and immunization flow definitions correctly', () => {
    expect(pregnancyFlowDefinition.flow).toBe('pregnancy');
    expect(pregnancyFlowDefinition.serviceName).toBe('Kebidanan & Kandungan');
    expect(pregnancyFlowDefinition.sections.length).toBeGreaterThan(0);

    expect(immunizationFlowDefinition.flow).toBe('immunization');
    expect(immunizationFlowDefinition.serviceName).toBe('Spesialis Anak');
    expect(immunizationFlowDefinition.sections.length).toBeGreaterThan(0);

    const fromGetter = getMedicalFlowDefinition('pregnancy');
    expect(fromGetter.flow).toBe('pregnancy');
  });

  it('calculates HPL (estimated due date) and gestational age accurately for pregnancy', () => {
    const referenceDate = new Date('2026-09-14T00:00:00Z');
    const values = {
      ...buildDefaultMedicalValues(pregnancyFlowDefinition),
      hpht: '2026-01-01'
    };

    const automatic = buildAutomaticRecord('pregnancy', values, referenceDate);
    expect(automatic.estimatedDueDate).toBe('8 Oktober 2026');
    expect(automatic.gestationalAgeAtSubmit).toContain('minggu');
  });

  it('calculates child age accurately for immunization', () => {
    const referenceDate = new Date('2026-09-14T00:00:00Z');
    const values = {
      ...buildDefaultMedicalValues(immunizationFlowDefinition),
      childBirthDate: '2025-09-14'
    };

    const automatic = buildAutomaticRecord('immunization', values, referenceDate);
    expect(automatic.childAgeAtSubmit).toContain('1 tahun');
  });

  it('correctly maps reservation services to medical flows', () => {
    const pregnancyService = getReservationServiceByTitle('Pemeriksaan Kehamilan');
    expect(pregnancyService).toBeDefined();
    expect(getReservationMedicalFlow(pregnancyService!)).toBe('pregnancy');

    const immunizationService = getReservationServiceByTitle('Imunisasi');
    expect(immunizationService).toBeDefined();
    expect(getReservationMedicalFlow(immunizationService!)).toBe('immunization');

    const generalService = getReservationServiceByTitle('Pemeriksaan Umum');
    expect(generalService).toBeDefined();
    expect(getReservationMedicalFlow(generalService!)).toBeUndefined();
  });

  it('builds full medical intake record', () => {
    const values = {
      ...buildDefaultMedicalValues(immunizationFlowDefinition),
      childName: 'Ahmad Junior',
      childBirthDate: '2026-01-01'
    };

    const record = buildMedicalIntakeRecord({
      definition: immunizationFlowDefinition,
      values
    });

    expect(record.flow).toBe('immunization');
    expect(record.schemaTitle).toBe(immunizationFlowDefinition.formTitle);
    expect(record.answersByFieldId.childName).toBe('Ahmad Junior');
    expect(record.automatic.childAgeAtSubmit).toBeDefined();
  });

  it('validates section inputs using medical field schemas', () => {
    const firstSection = immunizationFlowDefinition.sections[0];
    const emptyValues = buildDefaultMedicalValues(immunizationFlowDefinition);

    expect(isMedicalSectionValid(firstSection, emptyValues)).toBe(false);
  });

  // Test suite specifically covering user revisions 1 - 7:
  describe('Midwifery Form Revisions', () => {
    it('1. formats partner birth date as DATE (theme calendar)', () => {
      const field = findMedicalField(pregnancyFlowDefinition, 'partnerBirthDate');
      expect(field).toBeDefined();
      expect(field!.type).toBe('DATE');
    });

    it('2. removes "Belum tahu" from partner education choices', () => {
      const field = findMedicalField(pregnancyFlowDefinition, 'partnerEducation');
      expect(field).toBeDefined();
      expect(field!.choices).not.toContain('Belum tahu');
      expect(field!.choices).toContain('SMA/SMK');
      expect(field!.choices).toContain('S1');
    });

    it('3. calculates IMT accurately using the standard formula (weight / height^2)', () => {
      // User example: BB 50 kg, TB 150 cm -> 50 / (1.5 * 1.5) = 22.2
      expect(calculateBmi('50', '150')).toBe('22.2');
      expect(calculateBmi('50 kg', '150 cm')).toBe('22.2');
      expect(calculateBmi('52', '156')).toBe('21.4');
      expect(calculateBmi('60', '1.6')).toBe('23.4');
      expect(calculateBmi('', '150')).toBe('');

      // Test automatic record includes IMT
      const values = {
        ...buildDefaultMedicalValues(pregnancyFlowDefinition),
        prePregnancyWeightKg: '50',
        heightCm: '150'
      };
      const automatic = buildAutomaticRecord('pregnancy', values);
      expect(automatic.imtAtSubmit).toBe('22.2 kg/m²');
    });

    it('4. updates riskFactors: removes "Belum tahu", sets smoking choices to Aktif/Pasif/Tidak, updates cosmetic question', () => {
      const smokedField = findMedicalField(pregnancyFlowDefinition, 'smokedBeforePregnancy');
      expect(smokedField).toBeDefined();
      expect(smokedField!.choices).toEqual(['Aktif', 'Pasif', 'Tidak']);

      const cosmeticField = findMedicalField(
        pregnancyFlowDefinition,
        'concerningCosmeticUseBeforePregnancy'
      );
      expect(cosmeticField).toBeDefined();
      expect(cosmeticField!.title).toBe(
        'Dalam 1 bulan sebelum hamil, apakah Anda menggunakan kosmetik atau produk perawatan tubuh yang Anda khawatirkan dapat memengaruhi kehamilan?'
      );
      expect(cosmeticField!.choices).toEqual(['Tidak', 'Ya']);

      const alcoholField = findMedicalField(pregnancyFlowDefinition, 'alcoholBeforePregnancy');
      expect(alcoholField!.choices).toEqual(['Tidak', 'Ya']);
    });

    it('6. removes "Belum tahu" from diseaseHistory and allows adding other disease history', () => {
      const hypertensionField = findMedicalField(pregnancyFlowDefinition, 'hasHypertensionHistory');
      expect(hypertensionField).toBeDefined();
      expect(hypertensionField!.choices).toEqual(['Tidak', 'Ya']);

      const otherDiseaseField = findMedicalField(pregnancyFlowDefinition, 'hasOtherDiseaseHistory');
      expect(otherDiseaseField).toBeDefined();
      expect(otherDiseaseField!.choices).toEqual(['Tidak', 'Ya']);

      const otherNotesField = findMedicalField(pregnancyFlowDefinition, 'otherDiseaseHistoryNotes');
      expect(otherNotesField).toBeDefined();
    });

    it('7. uses DATE (calendar format) for contraception start and stop dates', () => {
      const startField = findMedicalField(pregnancyFlowDefinition, 'contraception1StartDate');
      expect(startField).toBeDefined();
      expect(startField!.type).toBe('DATE');

      const stopField = findMedicalField(pregnancyFlowDefinition, 'contraception1StopDate');
      expect(stopField).toBeDefined();
      expect(stopField!.type).toBe('DATE');
    });

    it('8. calculates age in years accurately for mother and partner', () => {
      const reference = new Date('2026-09-15T00:00:00Z');
      // Birthday already passed this year (born March 10, 1996 -> 30 years old)
      expect(calculateAgeInYears('1996-03-10', reference)).toBe('30 tahun');
      // Birthday not yet passed this year (born November 20, 1996 -> 29 years old)
      expect(calculateAgeInYears('1996-11-20', reference)).toBe('29 tahun');
      // Supports DD/MM/YYYY format as well
      expect(calculateAgeInYears('10/03/1996', reference)).toBe('30 tahun');
      // Empty or invalid returns empty string
      expect(calculateAgeInYears('', reference)).toBe('');
      expect(calculateAgeInYears('invalid-date', reference)).toBe('');

      // Check motherAge field exists and has auto-calculation help text
      const motherAgeField = findMedicalField(pregnancyFlowDefinition, 'motherAge');
      expect(motherAgeField).toBeDefined();
      expect(motherAgeField!.helpText).toContain('Otomatis terhitung');
    });

    it('9. removes "Belum tahu" across blood type, tetanus, previous pregnancy, and contraception choices', () => {
      const motherBloodTypeField = findMedicalField(pregnancyFlowDefinition, 'motherBloodType');
      expect(motherBloodTypeField!.choices).toEqual(['A', 'B', 'AB', 'O']);

      const partnerBloodTypeField = findMedicalField(pregnancyFlowDefinition, 'partnerBloodType');
      expect(partnerBloodTypeField!.choices).toEqual(['A', 'B', 'AB', 'O']);

      const tetanusField = findMedicalField(pregnancyFlowDefinition, 'tetanusStatus');
      expect(tetanusField!.choices).not.toContain('Belum tahu');
      expect(tetanusField!.choices).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'Belum pernah']);

      const childSexField = findMedicalField(pregnancyFlowDefinition, 'previousPregnancy1ChildSex');
      expect(childSexField!.choices).toEqual(['Laki-laki', 'Perempuan']);

      const deliveryMethodField = findMedicalField(
        pregnancyFlowDefinition,
        'previousPregnancy1DeliveryMethod'
      );
      expect(deliveryMethodField!.choices).not.toContain('Belum tahu');

      const contraceptionTypeField = findMedicalField(
        pregnancyFlowDefinition,
        'contraception1Type'
      );
      expect(contraceptionTypeField!.choices).not.toContain('Belum tahu');
    });
  });

  describe('Immunization Form Registration Design', () => {
    it('structures immunization form into exactly 3 patient-filled sections', () => {
      expect(immunizationFlowDefinition.sections.length).toBe(3);
      expect(immunizationFlowDefinition.sections.map((s) => s.id)).toEqual([
        'childIdentity',
        'parentIdentity',
        'vaccineAndAllergyHistory'
      ]);
    });

    it('contains all required patient/parent registration fields', () => {
      const fieldIds = immunizationFlowDefinition.sections.flatMap((s) =>
        s.fields.map((f) => f.id)
      );
      expect(fieldIds).toContain('childName');
      expect(fieldIds).toContain('childNik');
      expect(fieldIds).toContain('childBirthDate');
      expect(fieldIds).toContain('childSex');
      expect(fieldIds).toContain('parentPhone');
      expect(fieldIds).toContain('fatherName');
      expect(fieldIds).toContain('motherName');
      expect(fieldIds).toContain('childAddress');
      expect(fieldIds).toContain('previousVaccineHistory');
      expect(fieldIds).toContain('childAllergyHistory');

      // Uses DATE picker for childBirthDate
      const birthDateField = findMedicalField(immunizationFlowDefinition, 'childBirthDate');
      expect(birthDateField?.type).toBe('DATE');
    });

    it('excludes clinical staff examination fields from patient registration', () => {
      const fieldIds = immunizationFlowDefinition.sections.flatMap((s) =>
        s.fields.map((f) => f.id)
      );
      // Clinical observation / physical measurement fields must not be present
      expect(fieldIds).not.toContain('weightKg');
      expect(fieldIds).not.toContain('heightCm');
      expect(fieldIds).not.toContain('bodyTemperature');
      expect(fieldIds).not.toContain('headCircumference');
      expect(fieldIds).not.toContain('feverSymptom');
      expect(fieldIds).not.toContain('coughSymptom');
    });
  });
});
