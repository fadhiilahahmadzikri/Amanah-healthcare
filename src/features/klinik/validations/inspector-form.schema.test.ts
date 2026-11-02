import { describe, expect, it } from 'bun:test';
import {
  validateRegularForm,
  validateMaternalForm,
  validateImmunizationForm
} from './inspector-form.schema';

describe('Inspector Form Zod Validation', () => {
  describe('validateRegularForm', () => {
    it('should pass on valid 16-digit NIK and valid name', () => {
      const res = validateRegularForm({
        fullName: 'Budi Santoso',
        nik: '3201234567890001',
        phone: '081234567890',
        email: 'budi@example.com'
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });

    it('should reject invalid NIK > 16 digits', () => {
      const res = validateRegularForm({
        fullName: 'Budi Santoso',
        nik: '123456789012345678' // 18 digits
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.nik).toBe('NIK harus berupa 16 digit angka');
    });

    it('should reject empty fullName', () => {
      const res = validateRegularForm({
        fullName: '',
        nik: '3201234567890001'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.fullName).toBe('Nama lengkap wajib diisi');
    });
  });

  describe('validateMaternalForm', () => {
    it('should pass on valid maternal data', () => {
      const res = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherNik: '3201234567890001',
        partnerNik: '3201234567890002',
        phoneNumber: '081234567890'
      });
      expect(res.isValid).toBe(true);
    });

    it('should reject motherNik with letters or wrong length', () => {
      const res = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherNik: '320123456789ABCD'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.motherNik).toBe('NIK ibu harus berupa 16 digit angka');
    });

    it('should reject partnerNik > 16 digits', () => {
      const res = validateMaternalForm({
        motherName: 'Siti Aminah',
        partnerNik: '1234567890123456789'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.partnerNik).toBe('NIK suami harus berupa 16 digit angka');
    });
  });

  describe('validateImmunizationForm', () => {
    it('should pass on valid child immunization data', () => {
      const res = validateImmunizationForm({
        childName: 'Rayyan Al-Fatih',
        childNik: '3201234567890003',
        parentPhone: '081234567890'
      });
      expect(res.isValid).toBe(true);
    });

    it('should reject empty childName or empty parentPhone', () => {
      const res = validateImmunizationForm({
        childName: '',
        parentPhone: ''
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.childName).toBe('Nama lengkap anak wajib diisi');
      expect(res.errors.parentPhone).toBe('Nomor HP orang tua wajib diisi');
    });
  });
});
