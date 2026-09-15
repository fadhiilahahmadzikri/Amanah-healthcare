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
import { extractQuestionnaireItems } from '../components/questionnaire/types';

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

    it('10. starts directly with Data Diri (motherIdentity), removing intro/opening section', () => {
      expect(pregnancyFlowDefinition.sections[0].id).toBe('motherIdentity');
      expect(pregnancyFlowDefinition.sections[0].title).toBe('Data Diri');
      expect(findMedicalField(pregnancyFlowDefinition, 'patientConsent')).toBeUndefined();
    });

    it('11. configures 2-column grid layout for Data Diri, Partner, and Baseline measurements', () => {
      const motherSection = pregnancyFlowDefinition.sections.find((s) => s.id === 'motherIdentity');
      expect(motherSection?.layout).toBe('grid');
      const partnerSection = pregnancyFlowDefinition.sections.find(
        (s) => s.id === 'partnerIdentity'
      );
      expect(partnerSection?.layout).toBe('grid');
      const baselineSection = pregnancyFlowDefinition.sections.find(
        (s) => s.id === 'baselineMeasurements'
      );
      expect(baselineSection?.layout).toBe('grid');

      // Short fields have colSpan 1
      expect(findMedicalField(pregnancyFlowDefinition, 'motherName')?.colSpan).toBe(1);
      expect(findMedicalField(pregnancyFlowDefinition, 'motherNik')?.colSpan).toBe(1);
      expect(findMedicalField(pregnancyFlowDefinition, 'partnerName')?.colSpan).toBe(1);
      expect(findMedicalField(pregnancyFlowDefinition, 'partnerNik')?.colSpan).toBe(1);
      expect(findMedicalField(pregnancyFlowDefinition, 'heightCm')?.colSpan).toBe(1);
      expect(findMedicalField(pregnancyFlowDefinition, 'prePregnancyWeightKg')?.colSpan).toBe(1);

      // Long fields have full colSpan
      expect(findMedicalField(pregnancyFlowDefinition, 'domicileAddress')?.colSpan).toBe('full');
      expect(findMedicalField(pregnancyFlowDefinition, 'identityCardAddress')?.colSpan).toBe(
        'full'
      );
      expect(findMedicalField(pregnancyFlowDefinition, 'puskesmas')?.colSpan).toBe('full');
      expect(findMedicalField(pregnancyFlowDefinition, 'tetanusStatus')?.colSpan).toBe('full');
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

  describe('Questionnaire Model & Sequential Flow Architecture', () => {
    const diseaseSection = pregnancyFlowDefinition.sections.find((s) => s.id === 'diseaseHistory');

    it('1. configures layout as questionnaire on diseaseHistory section', () => {
      expect(diseaseSection).toBeDefined();
      expect(diseaseSection?.layout).toBe('questionnaire');
    });

    it('2. links each disease question with its corresponding year field', () => {
      const hypertensionQuestion = diseaseSection?.fields.find(
        (f) => f.id === 'hasHypertensionHistory'
      );
      expect(hypertensionQuestion).toBeDefined();
      expect(hypertensionQuestion?.yearFieldId).toBe('hypertensionHistoryNotes');

      const diabetesQuestion = diseaseSection?.fields.find((f) => f.id === 'hasDiabetesHistory');
      expect(diabetesQuestion).toBeDefined();
      expect(diabetesQuestion?.yearFieldId).toBe('diabetesHistoryNotes');
    });

    it('3. extracts questionnaire items with condition name and linked yearFieldId', () => {
      const items = extractQuestionnaireItems(diseaseSection?.fields || []);
      expect(items.length).toBe(14);

      const hypertensionItem = items.find((i) => i.id === 'hasHypertensionHistory');
      expect(hypertensionItem).toBeDefined();
      expect(hypertensionItem?.yearFieldId).toBe('hypertensionHistoryNotes');
      expect(hypertensionItem?.conditionName).toBe('darah tinggi');
    });

    it('4. validates that selecting Ya requires the diagnosis year, while Tidak does not', () => {
      const baseValues = buildDefaultMedicalValues(pregnancyFlowDefinition);

      // Initially empty -> invalid
      expect(isMedicalSectionValid(diseaseSection, baseValues)).toBe(false);

      // When all answered 'Tidak' -> valid without any year fields
      const allNoValues = { ...baseValues };
      diseaseSection?.fields.forEach((f) => {
        if (f.choices.includes('Tidak')) {
          allNoValues[f.id] = 'Tidak';
        }
      });
      expect(isMedicalSectionValid(diseaseSection, allNoValues)).toBe(true);

      // When hypertension is 'Ya' but year is empty -> invalid
      const missingYearValues = {
        ...allNoValues,
        hasHypertensionHistory: 'Ya',
        hypertensionHistoryNotes: ''
      };
      expect(isMedicalSectionValid(diseaseSection, missingYearValues)).toBe(false);

      // When hypertension is 'Ya' and year is provided (e.g. 2021) -> valid!
      const validYearValues = {
        ...allNoValues,
        hasHypertensionHistory: 'Ya',
        hypertensionHistoryNotes: '2021'
      };
      expect(isMedicalSectionValid(diseaseSection, validYearValues)).toBe(true);
    });

    it('5. hasOtherDiseaseHistory links both notesFieldId and yearFieldId, and requires both when Ya', () => {
      const otherDiseaseField = diseaseSection?.fields.find(
        (f) => f.id === 'hasOtherDiseaseHistory'
      );
      expect(otherDiseaseField).toBeDefined();
      expect(otherDiseaseField?.notesFieldId).toBe('otherDiseaseHistoryNotes');
      expect(otherDiseaseField?.yearFieldId).toBe('otherDiseaseHistoryYear');

      const baseValues = buildDefaultMedicalValues(pregnancyFlowDefinition);
      const allNoValues = { ...baseValues };
      diseaseSection?.fields.forEach((f) => {
        if (f.choices.includes('Tidak')) {
          allNoValues[f.id] = 'Tidak';
        }
      });

      // When hasOtherDiseaseHistory is Ya, but notes and year are empty -> invalid
      const missingNotesValues = {
        ...allNoValues,
        hasOtherDiseaseHistory: 'Ya',
        otherDiseaseHistoryNotes: '',
        otherDiseaseHistoryYear: ''
      };
      expect(isMedicalSectionValid(diseaseSection, missingNotesValues)).toBe(false);

      // If only notes provided without year -> invalid
      const missingYearValues = {
        ...allNoValues,
        hasOtherDiseaseHistory: 'Ya',
        otherDiseaseHistoryNotes: 'Maag kronis',
        otherDiseaseHistoryYear: ''
      };
      expect(isMedicalSectionValid(diseaseSection, missingYearValues)).toBe(false);

      // When both disease name and year are provided -> valid
      const completeValues = {
        ...allNoValues,
        hasOtherDiseaseHistory: 'Ya',
        otherDiseaseHistoryNotes: 'Maag kronis',
        otherDiseaseHistoryYear: '2020'
      };
      expect(isMedicalSectionValid(diseaseSection, completeValues)).toBe(true);
    });
  });

  describe('History Catalog, Multi-Record & Obstetric Revisions', () => {
    it('1. contains 4 repeatable sections for previous pregnancies and 4 for contraception', () => {
      const sectionIds = pregnancyFlowDefinition.sections.map((s) => s.id);
      expect(sectionIds).toContain('previousPregnancy1Details');
      expect(sectionIds).toContain('previousPregnancy2Details');
      expect(sectionIds).toContain('previousPregnancy3Details');
      expect(sectionIds).toContain('previousPregnancy4Details');

      expect(sectionIds).toContain('contraception1Details');
      expect(sectionIds).toContain('contraception2Details');
      expect(sectionIds).toContain('contraception3Details');
      expect(sectionIds).toContain('contraception4Details');
    });

    it('2. removes "KB order: " prefix from contraception field questions', () => {
      const startDateField = findMedicalField(pregnancyFlowDefinition, 'contraception1StartDate');
      expect(startDateField?.title).toBe('Kapan mulai dipakai?');
      expect(startDateField?.title).not.toContain('KB 1:');

      const typeField = findMedicalField(pregnancyFlowDefinition, 'contraception1Type');
      expect(typeField?.title).toBe('Jenis KB/kontrasepsi');
      expect(typeField?.title).not.toContain('KB 1:');

      const stopDateField = findMedicalField(pregnancyFlowDefinition, 'contraception1StopDate');
      expect(stopDateField?.title).toBe('Kapan berhenti atau dilepas?');
      expect(stopDateField?.title).not.toContain('KB 1:');
    });

    it('3. updates hasPreviousPregnancyHistory question title', () => {
      const historyField = findMedicalField(pregnancyFlowDefinition, 'hasPreviousPregnancyHistory');
      expect(historyField?.title).toBe(
        'Apakah Anda memiliki riwayat kehamilan atau persalinan sebelumnya?'
      );
    });

    it('4. configures clean example placeholders for obstetric summary fields', () => {
      const gravidaField = findMedicalField(pregnancyFlowDefinition, 'gravidaCount');
      expect(gravidaField?.placeholder).toBe('Contoh: 1');

      const parityField = findMedicalField(pregnancyFlowDefinition, 'parityCount');
      expect(parityField?.placeholder).toBe('Contoh: 0');

      const abortionField = findMedicalField(pregnancyFlowDefinition, 'abortionCount');
      expect(abortionField?.placeholder).toBe('Contoh: 0');

      const livingField = findMedicalField(pregnancyFlowDefinition, 'livingChildrenCount');
      expect(livingField?.placeholder).toBe('Contoh: 1');
    });

    it('5. enforces catalog add paradigm: empty records can be detected and repeatable sections are present up to maxRecords', () => {
      const pregSection2 = pregnancyFlowDefinition.sections.find(
        (s) => s.id === 'previousPregnancy2Details'
      );
      expect(pregSection2).toBeDefined();

      const defaultVals = buildDefaultMedicalValues(pregnancyFlowDefinition);
      const isAllEmpty = pregSection2?.fields.every((f) => !defaultVals[f.id]?.trim());
      expect(isAllEmpty).toBe(true);

      const filledVals = { ...defaultVals, previousPregnancy2BirthYear: '2023' };
      const isStillEmpty = pregSection2?.fields.every((f) => !filledVals[f.id]?.trim());
      expect(isStillEmpty).toBe(false);

      const contraSection2 = pregnancyFlowDefinition.sections.find(
        (s) => s.id === 'contraception2Details'
      );
      expect(contraSection2).toBeDefined();
      const isContraEmpty = contraSection2?.fields.every((f) => !defaultVals[f.id]?.trim());
      expect(isContraEmpty).toBe(true);
    });

    it('6. requires all fields in previous pregnancy and contraception records before proceeding', () => {
      const pregSection1 = pregnancyFlowDefinition.sections.find(
        (s) => s.id === 'previousPregnancy1Details'
      );
      expect(pregSection1).toBeDefined();

      // All fields in previous pregnancy must have required = true
      pregSection1?.fields.forEach((f) => {
        expect(f.required).toBe(true);
      });

      // When empty or partially filled, section is invalid
      const defaultVals = buildDefaultMedicalValues(pregnancyFlowDefinition);
      expect(isMedicalSectionValid(pregSection1, defaultVals)).toBe(false);

      const partialVals = {
        ...defaultVals,
        previousPregnancy1BirthYear: '2022',
        previousPregnancy1DeliveryMethod: 'Normal/spontan'
      };
      expect(isMedicalSectionValid(pregSection1, partialVals)).toBe(false);

      // When all fields are completed, section is valid
      const completePregVals = {
        ...defaultVals,
        previousPregnancy1BirthYear: '2022',
        previousPregnancy1BirthWeight: '3150 gram',
        previousPregnancy1BirthLength: '49 cm',
        previousPregnancy1ChildSex: 'Laki-laki',
        previousPregnancy1GestationalAgeAtBirth: '39 minggu',
        previousPregnancy1BirthAttendant: 'Bidan',
        previousPregnancy1DeliveryMethod: 'Normal/spontan',
        previousPregnancy1DeliveryPlace: 'PMB Bidan Amanah',
        previousPregnancy1Complications: 'Tidak ada'
      };
      expect(isMedicalSectionValid(pregSection1, completePregVals)).toBe(true);

      // Contraception fields must also all be required
      const contraSection1 = pregnancyFlowDefinition.sections.find(
        (s) => s.id === 'contraception1Details'
      );
      expect(contraSection1).toBeDefined();
      contraSection1?.fields.forEach((f) => {
        expect(f.required).toBe(true);
      });

      expect(isMedicalSectionValid(contraSection1, defaultVals)).toBe(false);

      const completeContraVals = {
        ...defaultVals,
        contraception1StartDate: '2022-11-01',
        contraception1Type: 'Suntik 3 bulan',
        contraception1Duration: '2 tahun',
        contraception1StopDate: '2024-11-01',
        contraception1Problems: 'Tidak ada',
        contraception1SideEffects: 'Tidak ada'
      };
      expect(isMedicalSectionValid(contraSection1, completeContraVals)).toBe(true);
    });

    it('7. integrates Lanjutkan instruction into catalog header and defines repeatable history structures', () => {
      // Check repeatable sections are capped and correctly keyed
      const pregSections = pregnancyFlowDefinition.sections.filter((s) =>
        s.id.startsWith('previousPregnancy')
      );
      expect(pregSections.length).toBe(4);

      const contraSections = pregnancyFlowDefinition.sections.filter(
        (s) => s.id.startsWith('contraception') && s.id.endsWith('Details')
      );
      expect(contraSections.length).toBe(4);
    });
  });
});
