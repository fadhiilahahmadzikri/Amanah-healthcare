import { describe, expect, it } from 'bun:test';
import {
  IndonesianIdentityGenerator,
  PatientProfileGenerator
} from '@/components/dev-autofill/core';
import { RegularPatientFakerFactory } from '@/components/dev-autofill/factories/regular-patient-faker-factory';
import { getRegularPatientAutofillPreset } from '@/components/dev-autofill/presets/regular-patient-preset';
import { getAutofillDefinitions } from '@/components/dev-autofill/registry';

describe('DevTool AutoFill Core Module', () => {
  describe('IndonesianIdentityGenerator', () => {
    it('generates a valid 16-digit numeric NIK', () => {
      const birthDate = '2016-05-14';
      const nik = IndonesianIdentityGenerator.generateNik(birthDate, false);
      expect(nik).toBeDefined();
      expect(nik.length).toBe(16);
      expect(/^\d{16}$/.test(nik)).toBe(true);
    });

    it('applies female day offset (+40) correctly in NIK', () => {
      const birthDate = '2018-07-12';
      const femaleNik = IndonesianIdentityGenerator.generateNik(birthDate, true, '320101');
      // Position 6..8 is adjusted day
      const dayStr = femaleNik.slice(6, 8);
      expect(parseInt(dayStr, 10)).toBe(52); // 12 + 40
    });

    it('generates a valid Indonesian phone number', () => {
      const phone = IndonesianIdentityGenerator.generatePhone();
      expect(phone.startsWith('08')).toBe(true);
      expect(phone.length).toBeGreaterThanOrEqual(10);
      expect(phone.length).toBeLessThanOrEqual(13);
      expect(/^\d+$/.test(phone)).toBe(true);
    });

    it('generates a complete Indonesian regional address', () => {
      const addr = IndonesianIdentityGenerator.generateAddress();
      expect(addr.provinceName).toBeDefined();
      expect(addr.provinceCode).toBeDefined();
      expect(addr.regencyName).toBeDefined();
      expect(addr.regencyCode).toBeDefined();
      expect(addr.districtName).toBeDefined();
      expect(addr.villageName).toBeDefined();
      expect(addr.line1).toBeDefined();
      expect(addr.fullAddress).toBeDefined();
    });
  });

  describe('PatientProfileGenerator (Dynamic Agnostic)', () => {
    it('generates a child profile by default when relationship is anak', () => {
      const profile = PatientProfileGenerator.generate({ relationship: 'anak' });
      expect(profile.relationship).toBe('anak');
      expect(profile.relationshipLabel).toBe('Anak');
      expect(profile.fullName.length).toBeGreaterThanOrEqual(3);
      expect(profile.nik.length).toBe(16);
      expect(profile.occupationCode).toBe('pelajar_mahasiswa');
      expect(profile.emergencyContactRelationship).toBe('Ayah Kandung');
      expect(['male', 'female']).toContain(profile.gender);
      expect(['a', 'b', 'ab', 'o']).toContain(profile.bloodType);
    });

    it('dynamically adapts to spouse (pasangan) options', () => {
      const profile = PatientProfileGenerator.generate({
        relationship: 'pasangan',
        gender: 'female'
      });
      expect(profile.relationship).toBe('pasangan');
      expect(profile.gender).toBe('female');
      expect(profile.emergencyContactRelationship).toBe('Suami');
    });

    it('dynamically adapts to parent (orang_tua) options', () => {
      const profile = PatientProfileGenerator.generate({
        relationship: 'orang_tua'
      });
      expect(profile.relationship).toBe('orang_tua');
      expect(profile.emergencyContactRelationship).toBe('Anak Kandung');
    });

    it('converts profile to a flat record for autofill event payloads', () => {
      const profile = PatientProfileGenerator.generate({ relationship: 'anak' });
      const record = PatientProfileGenerator.toRecord(profile);
      expect(record.fullName).toBe(profile.fullName);
      expect(record.nik).toBe(profile.nik);
      expect(record.motherName).toBe(profile.motherName);
      expect(record.placeOfBirth).toBe(profile.placeOfBirth);
      expect(record.dateOfBirth).toBe(profile.dateOfBirth);
      expect(record.gender).toBe(profile.gender);
      expect(record.bloodType).toBe(profile.bloodType);
      expect(record.phone).toBe(profile.phone);
      expect(record.line1).toBe(profile.line1);
      expect(record.occupationCode).toBe(profile.occupationCode);
      // TanStack modal aliases
      expect(record.name).toBe(profile.fullName);
      expect(record.nama_ibu_kandung).toBe(profile.motherName);
    });
  });

  describe('Factory, Preset and Registry Integration', () => {
    it('RegularPatientFakerFactory generates valid payload values', () => {
      const { values } = RegularPatientFakerFactory.generate();
      expect(values.fullName).toBeDefined();
      expect(values.nik.length).toBe(16);
      expect(values.relationship).toBe('anak');
    });

    it('getRegularPatientAutofillPreset returns valid preset', () => {
      const preset = getRegularPatientAutofillPreset();
      expect(preset.values).toBeDefined();
      expect(preset.values.fullName).toBeDefined();
    });

    it('registers regular-patient in getAutofillDefinitions', () => {
      const definitions = getAutofillDefinitions();
      const regularDef = definitions.find((d) => d.id === 'regular-patient');
      expect(regularDef).toBeDefined();
      expect(regularDef?.name).toBe('Form Pasien Standar');
      expect(regularDef?.flow).toBe('regular-patient');
      expect(typeof regularDef?.fillFull).toBe('function');
      expect(typeof regularDef?.fillCurrentStep).toBe('function');
      expect(typeof regularDef?.clear).toBe('function');
    });
  });
});
