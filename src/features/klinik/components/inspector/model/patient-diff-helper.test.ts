import { describe, expect, it } from 'bun:test';
import {
  getRegularPatientDiff,
  getMaternalPatientDiff,
  getImmunizationPatientDiff
} from './patient-diff-helper';
import type { EditableRegularData, EditableMaternalData, EditableImmunizationData } from '../types';

describe('patient-diff-helper', () => {
  it('should include empty string when NIK is cleared in regular data', () => {
    const initial: EditableRegularData = {
      fullName: 'Budi Santoso',
      nik: '3201234567890001',
      medicalRecordNumber: 'RM-001',
      birthPlace: 'Jakarta',
      birthDate: '1990-01-01',
      gender: 'male',
      bloodType: 'A',
      motherName: 'Siti',
      occupation: 'PNS',
      phone: '081234567890',
      email: 'budi@test.com',
      line1: 'Jl. Merdeka',
      provinceName: 'Jawa Barat',
      provinceCode: '32',
      regencyName: 'Bogor',
      regencyCode: '3201',
      districtName: 'Cibinong',
      districtCode: '320101',
      villageName: 'Tengah',
      villageCode: '32010101',
      emergencyContactName: 'Ani',
      emergencyContactPhone: '081298765432',
      emergencyContactRelationship: 'Istri',
      complaint: 'Batuk'
    };

    const updated: EditableRegularData = {
      ...initial,
      nik: '',
      phone: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    };

    const diff = getRegularPatientDiff(updated, initial);

    expect(diff.nik).toBe('');
    expect(diff.phone).toBe('');
    expect(diff.emergencyContactName).toBe('');
    expect(diff.emergencyContactPhone).toBe('');
    expect(diff.emergency_contact).toBe('');
    expect(diff.name).toBeUndefined();
    expect(diff.birth_date).toBeUndefined();
  });

  it('should return empty object if nothing changed', () => {
    const initial: EditableRegularData = {
      fullName: 'Budi Santoso',
      nik: '3201234567890001',
      medicalRecordNumber: 'RM-001',
      birthPlace: 'Jakarta',
      birthDate: '1990-01-01',
      gender: 'male',
      bloodType: 'A',
      motherName: 'Siti',
      occupation: 'PNS',
      phone: '081234567890',
      email: 'budi@test.com',
      line1: 'Jl. Merdeka',
      provinceName: 'Jawa Barat',
      provinceCode: '32',
      regencyName: 'Bogor',
      regencyCode: '3201',
      districtName: 'Cibinong',
      districtCode: '320101',
      villageName: 'Tengah',
      villageCode: '32010101',
      emergencyContactName: 'Ani',
      emergencyContactPhone: '081298765432',
      emergencyContactRelationship: 'Istri',
      complaint: 'Batuk'
    };

    const diff = getRegularPatientDiff(initial, initial);
    expect(Object.keys(diff).length).toBe(0);
  });

  it('should include empty string when maternal optional fields are cleared', () => {
    const initial = {
      motherName: 'Siti Aminah',
      motherNik: '3201234567890001',
      birthPlace: 'Bandung',
      phoneNumber: '081234567890',
      motherJob: 'Guru'
    } as EditableMaternalData;

    const updated = {
      ...initial,
      birthPlace: '',
      phoneNumber: '',
      motherJob: ''
    } as EditableMaternalData;

    const diff = getMaternalPatientDiff(updated, initial);

    expect(diff.birth_place).toBe('');
    expect(diff.phone).toBe('');
    expect(diff.occupation).toBe('');
    expect(diff.name).toBeUndefined();
  });

  it('should include empty string when immunization optional fields are cleared', () => {
    const initial = {
      childName: 'Rayyan',
      childNik: '3201234567890002',
      birthPlace: 'Surabaya',
      motherName: 'Fatimah',
      parentPhone: '081234567890'
    } as EditableImmunizationData;

    const updated = {
      ...initial,
      birthPlace: '',
      motherName: ''
    } as EditableImmunizationData;

    const diff = getImmunizationPatientDiff(updated, initial);

    expect(diff.birth_place).toBe('');
    expect(diff.mother_name).toBe('');
    expect(diff.name).toBeUndefined();
  });
});
