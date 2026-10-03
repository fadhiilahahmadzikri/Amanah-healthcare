import { describe, expect, it } from 'bun:test';
import { ImmunizationFakerFactory } from './immunization-faker-factory';

describe('ImmunizationFakerFactory', () => {
  it('generates valid immunization form values with required fields', () => {
    const result = ImmunizationFakerFactory.generate();
    expect(result).toBeDefined();
    expect(result.values).toBeDefined();
    expect(result.schedule).toBeDefined();

    const v = result.values;
    expect(v.childName).toBeTruthy();
    expect(v.childNik).toMatch(/^\d{16}$/);
    expect(v.childBirthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(['Laki-laki', 'Perempuan']).toContain(v.childSex);
    expect(v.parentPhone).toMatch(/^08\d{8,12}$/);
    expect(v.fatherName).toBeTruthy();
    expect(v.motherName).toBeTruthy();
    expect(v.childAddress).toBeTruthy();
    expect(v.previousVaccineHistory).toBeTruthy();
    expect(v.childAllergyHistory).toBeTruthy();
    expect(v.hasVaccineHistory).toBe('Ya, pernah');
    expect(v.hasAllergyHistory).toBe('Tidak ada alergi');
    expect(v.vaccine_HB_0_status).toBe('Sudah');

    expect(result.schedule.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.schedule.timeSlot).toBeTruthy();
  });
});
