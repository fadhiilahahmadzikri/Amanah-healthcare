import { describe, expect, it } from 'bun:test';
import { pregnancyFlowDefinition } from '../constants/pregnancy-flow-definition';
import {
  domicileHealthCoverageSection,
  motherIdentitySection,
  partnerIdentitySection
} from '../constants/pregnancy-sections/identity-sections';
import { baselineMeasurementsSection } from '../constants/pregnancy-sections/clinical-sections';
import { normalizeMedicalFieldInput } from '../schemas/medical-appointment-validation';
import type { MedicalFormField } from '../constants/medical-appointment-schemas';
import { findMedicalField } from './medical-appointment';

describe('Childbirth Form Refactoring Validations', () => {
  describe('Input Normalization and Digit Filtering', () => {
    it('strips non-digits from NIK field and caps at 16 digits', () => {
      const field: MedicalFormField = {
        id: 'motherNik',
        type: 'TEXT',
        title: 'NIK',
        label: 'NIK',
        required: true,
        choices: []
      };

      expect(normalizeMedicalFieldInput(field, '3201ABC1234567890123')).toBe('3201123456789012');
    });

    it('strips non-digits from WhatsApp phone number and caps at 15 digits', () => {
      const field: MedicalFormField = {
        id: 'phoneNumber',
        type: 'TEXT',
        title: 'Nomor WhatsApp',
        label: 'No. telp',
        required: true,
        choices: []
      };

      expect(normalizeMedicalFieldInput(field, '0812-ABCD-3456-7890')).toBe('081234567890');
      expect(normalizeMedicalFieldInput(field, 'text only')).toBe('');
      expect(normalizeMedicalFieldInput(field, '08123456789012345678')).toBe('081234567890123');
    });

    it('strips non-digits from marriageOrder and caps at 2 digits', () => {
      const field: MedicalFormField = {
        id: 'marriageOrder',
        type: 'TEXT',
        title: 'Pernikahan ke berapa?',
        label: 'Pernikahan ke',
        required: true,
        choices: []
      };

      expect(normalizeMedicalFieldInput(field, 'pertama')).toBe('');
      expect(normalizeMedicalFieldInput(field, 'ke-1')).toBe('1');
      expect(normalizeMedicalFieldInput(field, '123')).toBe('12');
    });

    it('strips non-digits from pregnancy birth year and caps at 4 digits', () => {
      const field: MedicalFormField = {
        id: 'pregnancy1BirthYear',
        type: 'TEXT',
        title: 'Tahun lahir',
        label: 'Tahun',
        required: true,
        choices: []
      };

      expect(normalizeMedicalFieldInput(field, 'Tahun 2024')).toBe('2024');
      expect(normalizeMedicalFieldInput(field, '20245')).toBe('2024');
    });

    it('preserves text in general text fields', () => {
      const field: MedicalFormField = {
        id: 'motherName',
        type: 'TEXT',
        title: 'Nama lengkap',
        label: 'Nama',
        required: true,
        choices: []
      };

      expect(normalizeMedicalFieldInput(field, 'Siti Aminah')).toBe('Siti Aminah');
    });
  });

  describe('Section Separation: Data Diri vs Wilayah & Faskes Domisili', () => {
    it('removes dasawisma, posyandu, puskesmas from motherIdentitySection', () => {
      const motherFieldIds = motherIdentitySection.fields.map((f) => f.id);
      expect(motherFieldIds).not.toContain('dasawisma');
      expect(motherFieldIds).not.toContain('posyandu');
      expect(motherFieldIds).not.toContain('puskesmas');
    });

    it('houses dasawisma, posyandu, and puskesmas in domicileHealthCoverageSection', () => {
      const coverageFieldIds = domicileHealthCoverageSection.fields.map((f) => f.id);
      expect(coverageFieldIds).toContain('dasawisma');
      expect(coverageFieldIds).toContain('posyandu');
      expect(coverageFieldIds).toContain('puskesmas');
      expect(domicileHealthCoverageSection.title).toBe('Di mana kamu tinggal dan faskes terdekat?');
    });

    it('places domicileHealthCoverageSection immediately following motherIdentity in flow definition', () => {
      const motherIndex = pregnancyFlowDefinition.sections.findIndex(
        (s) => s.id === 'motherIdentity'
      );
      const coverageIndex = pregnancyFlowDefinition.sections.findIndex(
        (s) => s.id === 'domicileHealthCoverage'
      );

      expect(motherIndex).toBe(0);
      expect(coverageIndex).toBe(1);
    });

    it('marks motherAge as disabled and automated', () => {
      const motherAgeField = findMedicalField(pregnancyFlowDefinition, 'motherAge');
      expect(motherAgeField).toBeDefined();
      expect(motherAgeField?.disabled).toBe(true);
    });
  });

  describe('Spouse Identity and Blood Type Separation', () => {
    it('houses partnerBloodType in partnerIdentitySection', () => {
      const partnerBloodField = partnerIdentitySection.fields.find(
        (f) => f.id === 'partnerBloodType'
      );
      expect(partnerBloodField).toBeDefined();
      expect(partnerBloodField?.type).toBe('LIST');
      expect(partnerBloodField?.choices).toEqual(['A', 'B', 'AB', 'O']);
    });

    it('removes partnerBloodType from baselineMeasurementsSection', () => {
      const baselineFieldIds = baselineMeasurementsSection.fields.map((f) => f.id);
      expect(baselineFieldIds).not.toContain('partnerBloodType');
      expect(baselineFieldIds).toContain('motherBloodType');
    });
  });

  describe('Date Field Full Width & Column Sizing Validation', () => {
    it('sets motherBirthDate and marriageDate to full colSpan', () => {
      const birthDateField = findMedicalField(pregnancyFlowDefinition, 'motherBirthDate');
      const marriageDateField = findMedicalField(pregnancyFlowDefinition, 'marriageDate');

      expect(birthDateField?.colSpan).toBe('full');
      expect(marriageDateField?.colSpan).toBe('full');
    });

    it('sets partnerBirthDate to full colSpan', () => {
      const partnerBirthDateField = findMedicalField(pregnancyFlowDefinition, 'partnerBirthDate');
      expect(partnerBirthDateField?.colSpan).toBe('full');
    });

    it('pairs motherAge with marriageOrder as colSpan 1', () => {
      const ageField = findMedicalField(pregnancyFlowDefinition, 'motherAge');
      const orderField = findMedicalField(pregnancyFlowDefinition, 'marriageOrder');

      expect(ageField?.colSpan).toBe(1);
      expect(orderField?.colSpan).toBe(1);
    });

    it('pairs partnerAge with partnerBloodType as colSpan 1', () => {
      const partnerAge = findMedicalField(pregnancyFlowDefinition, 'partnerAge');
      const partnerBlood = findMedicalField(pregnancyFlowDefinition, 'partnerBloodType');

      expect(partnerAge?.colSpan).toBe(1);
      expect(partnerBlood?.colSpan).toBe(1);
    });
  });
});
