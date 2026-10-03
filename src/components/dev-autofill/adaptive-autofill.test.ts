import { describe, expect, it } from 'bun:test';
import type { FormRequirementData } from '@/features/klinik/api/kia-intake-service';
import {
  getCanonicalDatabaseValue,
  isFieldOmitted,
  resolveAdaptiveAutofillValues,
  resolveAdaptiveClearValues
} from './adaptive-autofill';

describe('Adaptive Autofill Service', () => {
  const mockImmunizationRequirement: FormRequirementData = {
    flow: 'immunization',
    serviceId: 'srv_imunisasi',
    serviceName: 'Layanan Imunisasi Anak',
    isExistingPatient: true,
    patientId: 'pt_elvina',
    patientName: 'Elvina Hana',
    reusableIdentity: {
      childName: 'Elvina Hana',
      childNik: '3201015506230001',
      childBirthDate: '2023-06-15',
      childSex: 'Perempuan'
    },
    prefilledValues: {
      parentPhone: '081234567890',
      childAddress: 'Jl. Melati No. 12, Bandung',
      fatherName: 'Hendra',
      motherName: 'Siti'
    },
    omittedFieldIds: ['childName', 'childNik', 'childBirthDate', 'childSex']
  };

  const rawImmunizationValues: Record<string, string> = {
    childName: 'Fake Child',
    childNik: '3201011111110000',
    childBirthDate: '2024-01-01',
    childSex: 'Laki-laki',
    parentPhone: '089999999999',
    childAddress: 'Jl. Fake Address',
    fatherName: 'Fake Father',
    motherName: 'Fake Mother',
    hasVaccineHistory: 'Ya, pernah',
    vaccine_HB_0_status: 'Sudah',
    previousVaccineHistory: 'HB 0 saat lahir',
    hasAllergyHistory: 'Tidak ada alergi',
    childAllergyHistory: 'Tidak ada riwayat alergi'
  };

  it('returns raw values unmodified when requirement is null or undefined', () => {
    const result = resolveAdaptiveAutofillValues('immunization', rawImmunizationValues, null);
    expect(result).toEqual(rawImmunizationValues);
  });

  it('returns raw values unmodified when patient is new (isExistingPatient is false)', () => {
    const newPatientRequirement: FormRequirementData = {
      ...mockImmunizationRequirement,
      isExistingPatient: false,
      patientId: null,
      patientName: null,
      omittedFieldIds: []
    };
    const result = resolveAdaptiveAutofillValues(
      'immunization',
      rawImmunizationValues,
      newPatientRequirement
    );
    expect(result).toEqual(rawImmunizationValues);
  });

  it('returns raw values unmodified when requirement flow does not match target flow', () => {
    const pregnancyRequirement: FormRequirementData = {
      ...mockImmunizationRequirement,
      flow: 'pregnancy'
    };
    const result = resolveAdaptiveAutofillValues(
      'immunization',
      rawImmunizationValues,
      pregnancyRequirement
    );
    expect(result).toEqual(rawImmunizationValues);
  });

  it('omits identity fields that are in omittedFieldIds for existing patient', () => {
    const result = resolveAdaptiveAutofillValues(
      'immunization',
      rawImmunizationValues,
      mockImmunizationRequirement
    );

    expect(result.childName).toBeUndefined();
    expect(result.childNik).toBeUndefined();
    expect(result.childBirthDate).toBeUndefined();
    expect(result.childSex).toBeUndefined();
  });

  it('preserves canonical database values instead of overwriting with faker data', () => {
    const result = resolveAdaptiveAutofillValues(
      'immunization',
      rawImmunizationValues,
      mockImmunizationRequirement
    );

    expect(result.parentPhone).toBe('081234567890');
    expect(result.childAddress).toBe('Jl. Melati No. 12, Bandung');
    expect(result.fatherName).toBe('Hendra');
    expect(result.motherName).toBe('Siti');
  });

  it('adaptively fills non-predefined intake fields with generated values', () => {
    const result = resolveAdaptiveAutofillValues(
      'immunization',
      rawImmunizationValues,
      mockImmunizationRequirement
    );

    expect(result.hasVaccineHistory).toBe('Ya, pernah');
    expect(result.vaccine_HB_0_status).toBe('Sudah');
    expect(result.previousVaccineHistory).toBe('HB 0 saat lahir');
    expect(result.hasAllergyHistory).toBe('Tidak ada alergi');
    expect(result.childAllergyHistory).toBe('Tidak ada riwayat alergi');
  });

  it('handles pregnancy flow adaptive autofill correctly', () => {
    const pregnancyRequirement: FormRequirementData = {
      flow: 'pregnancy',
      serviceId: 'srv_persalinan',
      serviceName: 'Layanan Persalinan & KIA',
      isExistingPatient: true,
      patientId: 'pt_rahma',
      patientName: 'Rahmawati',
      reusableIdentity: {
        motherName: 'Rahmawati',
        motherNik: '3201014506950002',
        motherBirthDate: '1995-06-05'
      },
      prefilledValues: {
        phoneNumber: '081288888888',
        domicileAddress: 'Jl. Mawar No. 4, Cimahi',
        partnerName: 'Bambang'
      },
      omittedFieldIds: ['motherName', 'motherNik', 'motherBirthDate']
    };

    const rawPregnancyValues: Record<string, string> = {
      motherName: 'Fake Mother',
      motherNik: '3201010000000000',
      motherBirthDate: '2000-01-01',
      phoneNumber: '089999999999',
      domicileAddress: 'Fake Street',
      partnerName: 'Fake Partner',
      heightCm: '160',
      prePregnancyWeightKg: '55',
      hpht: '2026-02-10',
      currentComplaints: 'Mual ringan',
      gravidaCount: '2'
    };

    const result = resolveAdaptiveAutofillValues(
      'pregnancy',
      rawPregnancyValues,
      pregnancyRequirement
    );

    expect(result.motherName).toBeUndefined();
    expect(result.motherNik).toBeUndefined();
    expect(result.motherBirthDate).toBeUndefined();
    expect(result.phoneNumber).toBe('081288888888');
    expect(result.domicileAddress).toBe('Jl. Mawar No. 4, Cimahi');
    expect(result.partnerName).toBe('Bambang');
    expect(result.heightCm).toBe('160');
    expect(result.prePregnancyWeightKg).toBe('55');
    expect(result.hpht).toBe('2026-02-10');
    expect(result.currentComplaints).toBe('Mual ringan');
    expect(result.gravidaCount).toBe('2');
  });

  it('correctly resolves helper functions isFieldOmitted and getCanonicalDatabaseValue', () => {
    expect(isFieldOmitted('childName', mockImmunizationRequirement)).toBe(true);
    expect(isFieldOmitted('hasVaccineHistory', mockImmunizationRequirement)).toBe(false);

    expect(getCanonicalDatabaseValue('childName', mockImmunizationRequirement)).toBe('Elvina Hana');
    expect(getCanonicalDatabaseValue('parentPhone', mockImmunizationRequirement)).toBe(
      '081234567890'
    );
    expect(getCanonicalDatabaseValue('hasVaccineHistory', mockImmunizationRequirement)).toBeNull();
  });

  it('adaptively clears fields while preserving canonical data for existing patients', () => {
    const cleared = resolveAdaptiveClearValues(
      'immunization',
      rawImmunizationValues,
      mockImmunizationRequirement
    );

    expect(cleared.childName).toBeUndefined();
    expect(cleared.parentPhone).toBe('081234567890');
    expect(cleared.childAddress).toBe('Jl. Melati No. 12, Bandung');
    expect(cleared.hasVaccineHistory).toBe('');
    expect(cleared.vaccine_HB_0_status).toBe('');
  });

  it('clears all fields to empty string when not an existing patient', () => {
    const cleared = resolveAdaptiveClearValues('immunization', rawImmunizationValues, null);

    expect(cleared.childName).toBe('');
    expect(cleared.parentPhone).toBe('');
    expect(cleared.hasVaccineHistory).toBe('');
  });
});
