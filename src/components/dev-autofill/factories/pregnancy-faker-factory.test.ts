import { describe, expect, it } from 'bun:test';
import { PregnancyFakerFactory } from './pregnancy-faker-factory';
import { pregnancyFlowDefinition } from '@/features/klinik/constants/pregnancy-flow-definition';
import { isMedicalSectionValid } from '@/features/klinik/schemas/medical-appointment-validation';

describe('PregnancyFakerFactory', () => {
  it('guarantees 16 numeric digits for motherNik and partnerNik across 100 generations', () => {
    for (let i = 0; i < 100; i++) {
      const { values } = PregnancyFakerFactory.generate();
      expect(values.motherNik).toMatch(/^\d{16}$/);
      expect(values.partnerNik).toMatch(/^\d{16}$/);
      expect(values.motherNik.length).toBe(16);
      expect(values.partnerNik.length).toBe(16);
    }
  });

  it('generates random and dynamic identity data on subsequent calls', () => {
    const first = PregnancyFakerFactory.generate();
    const second = PregnancyFakerFactory.generate();

    expect(first.values.motherName).toBeDefined();
    expect(second.values.motherName).toBeDefined();
    expect(first.values.motherNik.length).toBe(16);
    expect(second.values.motherNik.length).toBe(16);
    expect(first.values.phoneNumber.startsWith('08')).toBe(true);
    expect(second.values.phoneNumber.startsWith('08')).toBe(true);
  });

  it('generates valid education levels matching maternal catalog', () => {
    const validEducations = ['SMA/SMK', 'D1-D3', 'S1', 'S2/S3'];
    for (let i = 0; i < 20; i++) {
      const { values } = PregnancyFakerFactory.generate();
      expect(validEducations).toContain(values.motherEducation);
      expect(validEducations).toContain(values.partnerEducation);
    }
  });

  it('generates zigzag disease pattern with diagnosis years and no zero counts', () => {
    const result = PregnancyFakerFactory.generate();
    const { values } = result;

    expect(values.hasHypertensionHistory).toBe('Ya');
    expect(values.hypertensionHistoryNotes).toBe('2023');
    expect(values.hasHeartDiseaseHistory).toBe('Tidak');
    expect(values.heartDiseaseHistoryNotes).toBe('');
    expect(values.hasThyroidDiseaseHistory).toBe('Ya');
    expect(values.thyroidDiseaseHistoryNotes).toBe('2022');
    expect(values.hasAutoimmuneHistory).toBe('Tidak');
    expect(values.autoimmuneHistoryNotes).toBe('');

    expect(Number(values.gravidaCount)).toBeGreaterThan(0);
    expect(Number(values.parityCount)).toBeGreaterThan(0);
    expect(Number(values.livingChildrenCount)).toBeGreaterThan(0);

    expect(values.hasPreviousPregnancyHistory).toBe('Ya, ada');
    expect(values.previousPregnancy1BirthYear).toBe('2022');
    expect(values.hasContraceptionHistory).toBe('Ya, pernah');
    expect(values.contraception1Type).toBe('Suntik 3 Bulan');
  });

  it('validates that all essential sections pass Zod validation', () => {
    const sectionsToTest = [
      'motherIdentity',
      'domicileHealthCoverage',
      'partnerIdentity',
      'baselineMeasurements',
      'currentPregnancy',
      'riskFactorsSmoking',
      'riskFactorsBehavior',
      'riskFactorsNotes',
      'diseaseHistory',
      'obstetricSummary',
      'obstetricGateway',
      'contraceptionGateway'
    ];

    const { values } = PregnancyFakerFactory.generate();

    sectionsToTest.forEach((sectionId) => {
      const section = pregnancyFlowDefinition.sections.find((s) => s.id === sectionId);
      expect(section).toBeDefined();
      const isValid = isMedicalSectionValid(section, values);
      expect(isValid).toBe(true);
    });
  });

  it('validates repeatable sections pass Zod when history is active', () => {
    const { values } = PregnancyFakerFactory.generate();
    const preg1Section = pregnancyFlowDefinition.sections.find(
      (s) => s.id === 'previousPregnancy1Details'
    );
    const contra1Section = pregnancyFlowDefinition.sections.find(
      (s) => s.id === 'contraception1Details'
    );

    expect(preg1Section).toBeDefined();
    expect(contra1Section).toBeDefined();
    expect(isMedicalSectionValid(preg1Section, values)).toBe(true);
    expect(isMedicalSectionValid(contra1Section, values)).toBe(true);
  });
});
