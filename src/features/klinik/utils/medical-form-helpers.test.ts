import { describe, expect, it } from 'bun:test';
import {
  buildComplaintText,
  buildRegistrationPrefill,
  checkCurrentStepValid,
  isHistoryRecordEmpty,
  normalizeBirthDate,
  normalizeBloodType,
  pruneEmptyValues
} from './medical-form-helpers';
import type { MedicalFormSection } from '../constants/medical-appointment-schemas';
import type { Patient } from '@/features/data-pasien/api/types';
import { FLOW_NAMES, GENDER_CHOICE, STEP_DESCRIPTOR_TYPES } from '../constants/kia-constants';

describe('medical-form-helpers', () => {
  it('normalizes birth date formats correctly without regex fragility', () => {
    expect(normalizeBirthDate('1990-05-12')).toBe('1990-05-12');
    expect(normalizeBirthDate('12/05/1990')).toBe('1990-05-12');
    expect(normalizeBirthDate('invalid')).toBe('');
    expect(normalizeBirthDate('')).toBe('');
  });

  it('normalizes blood type with Rh stripping without regex fragility', () => {
    expect(normalizeBloodType('A+')).toBe('A');
    expect(normalizeBloodType('B-')).toBe('B');
    expect(normalizeBloodType('AB+')).toBe('AB');
    expect(normalizeBloodType('O')).toBe('O');
    expect(normalizeBloodType('XYZ')).toBe('');
  });

  it('prunes empty values from objects', () => {
    const input = {
      name: 'Budi',
      empty: '',
      whitespace: '   ',
      valid: 'value'
    };
    expect(pruneEmptyValues(input)).toEqual({
      name: 'Budi',
      valid: 'value'
    });
  });

  it('builds registration prefill for pregnancy flow', () => {
    const patient: Patient = {
      id: 1,
      patient_id: 'P001',
      name: 'Siti Rahma',
      nik_ktp: '3201234567890001',
      birth_date: '1995-04-10',
      blood_type: 'O+',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10',
      gender: GENDER_CHOICE.FEMALE,
      age: 29,
      pekerjaan: 'Guru'
    };

    const prefill = buildRegistrationPrefill(FLOW_NAMES.PREGNANCY, patient);
    expect(prefill.motherName).toBe('Siti Rahma');
    expect(prefill.motherNik).toBe('3201234567890001');
    expect(prefill.motherBirthDate).toBe('1995-04-10');
    expect(prefill.motherBloodType).toBe('O');
    expect(prefill.motherAge).toBe('29 tahun');
  });

  it('builds registration prefill for immunization flow', () => {
    const patient: Patient = {
      id: 2,
      patient_id: 'P002',
      name: 'Ahmad Faiz',
      nik_ktp: '3201234567890002',
      birth_date: '2024-01-15',
      phone: '081234567891',
      address: 'Jl. Sudirman No. 5',
      gender: GENDER_CHOICE.MALE,
      nama_ibu_kandung: 'Siti Rahma'
    };

    const prefill = buildRegistrationPrefill(FLOW_NAMES.IMMUNIZATION, patient);
    expect(prefill.childName).toBe('Ahmad Faiz');
    expect(prefill.childNik).toBe('3201234567890002');
    expect(prefill.childBirthDate).toBe('2024-01-15');
    expect(prefill.childSex).toBe(GENDER_CHOICE.MALE);
    expect(prefill.motherName).toBe('Siti Rahma');
  });

  it('builds complaint text fallback when complaint is empty', () => {
    expect(buildComplaintText('complaint', { complaint: 'Mual muntah' })).toBe('Mual muntah');
    expect(buildComplaintText('complaint', { complaint: '   ' })).toBe('');
  });

  it('detects empty history section records', () => {
    const section: MedicalFormSection = {
      id: 'section1',
      title: 'Riwayat 1',
      layout: 'stack',
      fields: [
        { id: 'f1', label: 'Field 1', type: 'text' },
        { id: 'f2', label: 'Field 2', type: 'text' }
      ]
    };

    expect(isHistoryRecordEmpty(section, { f1: '', f2: '   ' })).toBe(true);
    expect(isHistoryRecordEmpty(section, { f1: 'data', f2: '' })).toBe(false);
  });

  it('checks current step validity for date and time steps', () => {
    const schedule = { doctor: 'dr. Siti', dateStr: '2026-10-02', timeSlot: '08:00 - 08:30' };
    expect(checkCurrentStepValid({ type: STEP_DESCRIPTOR_TYPES.DATE }, [], {}, schedule)).toBe(
      true
    );
    expect(
      checkCurrentStepValid(
        { type: STEP_DESCRIPTOR_TYPES.DATE },
        [],
        {},
        { ...schedule, dateStr: '' }
      )
    ).toBe(false);
    expect(checkCurrentStepValid({ type: STEP_DESCRIPTOR_TYPES.TIME }, [], {}, schedule)).toBe(
      true
    );
    expect(
      checkCurrentStepValid(
        { type: STEP_DESCRIPTOR_TYPES.TIME },
        [],
        {},
        { ...schedule, timeSlot: '' }
      )
    ).toBe(false);
  });
});
