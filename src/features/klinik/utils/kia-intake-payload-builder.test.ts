import { describe, expect, it } from 'bun:test';
import {
  buildChildImmunizationIntakePayload,
  buildMaternityIntakePayload
} from './kia-intake-payload-builder';
import {
  CONTRACEPTION_CHOICE,
  GENDER_CHOICE,
  PREVIOUS_PREGNANCY_CHOICE
} from '../constants/kia-constants';

describe('kia-intake-payload-builder', () => {
  it('correctly maps form values to maternal intake payload with previous pregnancies and contraceptives', () => {
    const values = {
      motherNik: '3201234567890001',
      motherName: 'Ny. Siti',
      motherBirthDate: '1995-05-10',
      motherAge: '29',
      phoneNumber: '081234567890',
      partnerName: 'Tn. Budi Setiawan',
      partnerNik: '3201234567890002',
      partnerAge: '32 tahun',
      partnerJob: 'Wiraswasta / Pengusaha',
      partnerEducation: 'S1',
      partnerBloodType: 'O',
      heightCm: '160.5 cm',
      prePregnancyWeightKg: '55.2 KG',
      upperArmCircumferenceCm: '23.5 CM',
      initialBmi: '21.4',
      gravidaCount: '2',
      parityCount: '1',
      smokedBeforePregnancy: 'Aktif',
      alcoholBeforePregnancy: 'Tidak',
      concerningEnvironmentNotes: 'Bebas polusi',
      hasHypertensionHistory: 'Ya',
      hypertensionHistoryNotes: '2021',
      hasAsthmaHistory: 'Tidak',
      hasOtherDiseaseHistory: 'Ya',
      otherDiseaseHistoryNotes: 'Maag kronis',
      otherDiseaseHistoryYear: '2020',
      hasPreviousPregnancyHistory: PREVIOUS_PREGNANCY_CHOICE.YES,
      hasContraceptionHistory: CONTRACEPTION_CHOICE.YES,
      previousPregnancy1BirthYear: '2022',
      previousPregnancy1BirthWeight: '3200 gram',
      previousPregnancy1BirthLength: '49.5 cm',
      previousPregnancy1ChildSex: GENDER_CHOICE.FEMALE,
      contraceptive1Type: 'IUD',
      contraceptive1StartDate: '2022-08-01',
      contraceptive1Duration: '2 tahun'
    };

    const payload = buildMaternityIntakePayload('pat-123', values, 'Ny. Siti', 'Mual');

    expect(payload.patientId).toBe('pat-123');
    expect(payload.motherNik).toBe('3201234567890001');
    expect(payload.motherName).toBe('Ny. Siti');
    expect(payload.motherAge).toBe(29);
    expect(payload.heightCm).toBe(160.5);
    expect(payload.prePregnancyWeightKg).toBe(55.2);
    expect(payload.upperArmCircumferenceCm).toBe(23.5);
    expect(payload.initialBmi).toBe(21.4);
    expect(payload.gravidaCount).toBe(2);
    expect(payload.hasPreviousPregnancyHistory).toBe(true);
    expect(payload.hasContraceptionHistory).toBe(true);
    expect(payload.currentComplaints).toBe('Mual');

    expect(payload.husband).toEqual({
      fullName: 'Tn. Budi Setiawan',
      nik: '3201234567890002',
      birthDate: null,
      age: 32,
      job: 'Wiraswasta / Pengusaha',
      education: 'S1',
      bloodType: 'O',
      phoneNumber: null
    });

    const smoking = payload.anamnesisResponses?.find((r) => r.questionCode === 'SMOKING_HABIT');
    expect(smoking?.selectedOptionCode).toBe('aktif');

    const alcohol = payload.anamnesisResponses?.find(
      (r) => r.questionCode === 'ALCOHOL_CONSUMPTION'
    );
    expect(alcohol?.selectedOptionCode).toBe('tidak');

    const envNotes = payload.anamnesisResponses?.find(
      (r) => r.questionCode === 'CONCERNING_ENVIRONMENT_NOTES'
    );
    expect(envNotes?.answerText).toBe('Bebas polusi');

    const hypertension = payload.healthConditions?.find((c) => c.conditionCode === 'HYPERTENSION');
    expect(hypertension?.hasCondition).toBe(true);
    expect(hypertension?.diagnosisYear).toBe(2021);

    const asthma = payload.healthConditions?.find((c) => c.conditionCode === 'ASTHMA');
    expect(asthma?.hasCondition).toBe(false);

    const other = payload.healthConditions?.find((c) => c.conditionCode === 'OTHER');
    expect(other?.hasCondition).toBe(true);
    expect(other?.diagnosisYear).toBe(2020);
    expect(other?.notes).toBe('Maag kronis');

    expect(payload.previousPregnancies).toHaveLength(1);
    expect(payload.previousPregnancies[0]).toEqual({
      orderNumber: 1,
      birthYear: '2022',
      birthWeightGrams: 3200,
      birthLengthCm: 49.5,
      childSex: GENDER_CHOICE.FEMALE,
      gestationalAgeAtBirth: undefined,
      birthAttendant: undefined,
      deliveryMethod: undefined,
      deliveryPlace: undefined,
      complications: undefined
    });

    expect(payload.contraceptiveHistories).toHaveLength(1);
    expect(payload.contraceptiveHistories[0]).toEqual({
      orderNumber: 1,
      contraceptiveType: 'IUD',
      startDate: '2022-08-01',
      durationText: '2 tahun',
      stopDate: undefined,
      problems: undefined,
      sideEffects: undefined
    });
  });

  it('correctly maps form values to child immunization payload', () => {
    const values = {
      childNik: '3201234567890009',
      childName: 'Bayi Ahmad',
      childBirthDate: '2025-06-01',
      childSex: GENDER_CHOICE.MALE,
      parentPhone: '081234567899',
      motherName: 'Ny. Siti',
      fatherName: 'Tn. Budi'
    };

    const payload = buildChildImmunizationIntakePayload(
      'pat-456',
      values,
      'Bayi Ahmad',
      '081234567899'
    );

    expect(payload.patientId).toBe('pat-456');
    expect(payload.childNik).toBe('3201234567890009');
    expect(payload.childName).toBe('Bayi Ahmad');
    expect(payload.childBirthDate).toBe('2025-06-01');
    expect(payload.childSex).toBe(GENDER_CHOICE.MALE);
    expect(payload.parentPhone).toBe('081234567899');
    expect(payload.motherName).toBe('Ny. Siti');
    expect(payload.fatherName).toBe('Tn. Budi');
  });

  it('formats structured vaccine checklist into previousVaccineHistory summary string', () => {
    const values = {
      childNik: '3201234567890009',
      childName: 'Bayi Ahmad',
      childBirthDate: '2025-06-01',
      childSex: GENDER_CHOICE.MALE,
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
    expect(payload.previousVaccineHistory).toContain('PENTA 1 / Heksavalen 1: Belum');
    expect(payload.previousVaccineHistory).toContain('Lainnya: Polio tetes 2 kali');
    expect(payload.childAllergyHistory).toBe('Tidak ada riwayat alergi.');
  });

  it('sets previousVaccineHistory to Belum pernah sama sekali when gateway is negative', () => {
    const values = {
      childNik: '3201234567890009',
      childName: 'Bayi Ahmad',
      childBirthDate: '2025-06-01',
      childSex: GENDER_CHOICE.MALE,
      parentPhone: '081234567899',
      hasVaccineHistory: 'Belum pernah sama sekali',
      hasAllergyHistory: 'Tidak ada alergi'
    };

    const payload = buildChildImmunizationIntakePayload('pat-1', values);
    expect(payload.previousVaccineHistory).toBe('Belum pernah imunisasi sama sekali');
  });
});
