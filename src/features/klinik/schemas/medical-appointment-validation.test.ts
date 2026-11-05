import { describe, expect, it } from 'bun:test';
import { isMedicalSectionValid } from './medical-appointment-validation';
import {
  baselineMeasurementsSection,
  diseaseHistorySection,
  riskFactorsBehaviorSection
} from '../constants/pregnancy-sections/clinical-sections';
import {
  domicileHealthCoverageSection,
  motherIdentitySection,
  partnerIdentitySection
} from '../constants/pregnancy-sections/identity-sections';

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
});
