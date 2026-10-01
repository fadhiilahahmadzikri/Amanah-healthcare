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
      heightCm: '160',
      prePregnancyWeightKg: '55',
      gravidaCount: '2',
      parityCount: '1',
      hasPreviousPregnancyHistory: PREVIOUS_PREGNANCY_CHOICE.YES,
      hasContraceptionHistory: CONTRACEPTION_CHOICE.YES,
      prevPregnancy1BirthYear: '2022',
      prevPregnancy1Weight: '3200',
      prevPregnancy1Height: '49',
      prevPregnancy1ChildSex: GENDER_CHOICE.FEMALE,
      contraceptive1Type: 'IUD',
      contraceptive1StartDate: '2022-08-01',
      contraceptive1Duration: '2 tahun'
    };

    const payload = buildMaternityIntakePayload('pat-123', values, 'Ny. Siti', 'Mual');

    expect(payload.patientId).toBe('pat-123');
    expect(payload.motherNik).toBe('3201234567890001');
    expect(payload.motherName).toBe('Ny. Siti');
    expect(payload.motherAge).toBe(29);
    expect(payload.heightCm).toBe(160);
    expect(payload.prePregnancyWeightKg).toBe(55);
    expect(payload.gravidaCount).toBe(2);
    expect(payload.hasPreviousPregnancyHistory).toBe(true);
    expect(payload.hasContraceptionHistory).toBe(true);
    expect(payload.currentComplaints).toBe('Mual');

    expect(payload.previousPregnancies).toHaveLength(1);
    expect(payload.previousPregnancies[0]).toEqual({
      orderNumber: 1,
      birthYear: '2022',
      birthWeightGrams: 3200,
      birthLengthCm: 49,
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
});
