import { describe, expect, it } from 'bun:test';
import {
  validateRegularForm,
  validateMaternalForm,
  validateImmunizationForm,
  getMaternityTabWithErrors,
  getMaternityTabErrorCounts,
  MATERNITY_FIELD_DOM_ID_MAP
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
        phoneNumber: '081234567890',
        currentComplaints: 'Mual dan muntah ringan di pagi hari'
      });
      expect(res.isValid).toBe(true);
    });

    it('should reject empty currentComplaints', () => {
      const res = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherNik: '3201234567890001',
        currentComplaints: ''
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.currentComplaints).toBe('Keluhan saat ini wajib diisi');
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

    it('should reject when motherNik and partnerNik are identical', () => {
      const res = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherNik: '3201234567890001',
        partnerNik: '3201234567890001',
        currentComplaints: 'Kontrol kehamilan'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.partnerNik).toBe('NIK Suami tidak boleh sama dengan NIK Ibu');
    });

    it('should accurately calculate error counts across all 4 tabs', () => {
      const mockErrors = {
        motherName: 'Nama wajib diisi',
        marriageDate: 'Tanggal menikah tidak valid',
        parityCount: 'Paritas melebihi riwayat kehamilan',
        heightCm: 'Tinggi badan minimal 0',
        condition_HYPERTENSION_year: 'Tahun diagnosis tidak valid'
      };

      const counts = getMaternityTabErrorCounts(mockErrors);
      expect(counts.identitas).toBe(2);
      expect(counts.obstetri).toBe(1);
      expect(counts.klinis).toBe(1);
      expect(counts.skrining).toBe(1);
    });

    it('should map first error tab correctly to obstetri when only obstetric errors exist', () => {
      const mockErrors = {
        parityCount: 'Paritas tidak boleh melebihi riwayat kehamilan'
      };
      expect(getMaternityTabWithErrors(mockErrors)).toBe('obstetri');
    });

    it('should provide DOM element IDs for all standard maternity fields', () => {
      expect(MATERNITY_FIELD_DOM_ID_MAP.motherName).toBe('maternity-mother-name');
      expect(MATERNITY_FIELD_DOM_ID_MAP.marriageDate).toBe('maternity-marriage-date');
      expect(MATERNITY_FIELD_DOM_ID_MAP.parityCount).toBe('maternity-parity');
      expect(MATERNITY_FIELD_DOM_ID_MAP.heightCm).toBe('maternity-height');
      expect(MATERNITY_FIELD_DOM_ID_MAP.dasawisma).toBe('maternity-dasawisma');
    });

    it('should pass validation when saving partial edits on an intake with legacy dates', () => {
      const res = validateMaternalForm({
        motherName: 'Angelina Saputri',
        motherNik: '9999999999999999',
        phoneNumber: '0877777777777',
        dasawisma: 'Mawar',
        posyandu: 'Melati',
        puskesmas: 'Depok III',
        gravidaCount: 2,
        parityCount: 1,
        abortionCount: 0,
        livingChildrenCount: 0,
        gestationalAgeWeeks: 323,
        currentComplaints: 'Pusing dan lemas'
      });
      expect(res.isValid).toBe(true);
    });

    it('should validate contraceptive history start and stop dates', () => {
      // 1. Future start date rejected
      const futureRes = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherBirthDate: '1995-04-12',
        currentComplaints: 'Kontrol rutin',
        contraceptiveHistories: [
          {
            orderNumber: 1,
            startDate: '2099-01-01',
            contraceptiveType: 'Pil'
          }
        ]
      });
      expect(futureRes.isValid).toBe(false);
      expect(futureRes.errors.contra_0_startDate).toBe('Tanggal mulai KB tidak boleh di masa depan');

      // 2. Stop date earlier than start date rejected
      const invertedRes = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherBirthDate: '1995-04-12',
        currentComplaints: 'Kontrol rutin',
        contraceptiveHistories: [
          {
            orderNumber: 1,
            startDate: '2021-01-01',
            stopDate: '2020-01-01',
            contraceptiveType: 'Pil'
          }
        ]
      });
      expect(invertedRes.isValid).toBe(false);
      expect(invertedRes.errors.contra_0_stopDate).toBe(
        'Tanggal lepas KB tidak boleh lebih awal dari tanggal mulai pemakaian'
      );

      // 3. Valid contraceptive history passes
      const validRes = validateMaternalForm({
        motherName: 'Siti Aminah',
        motherBirthDate: '1995-04-12',
        currentComplaints: 'Kontrol rutin',
        contraceptiveHistories: [
          {
            orderNumber: 1,
            startDate: '2018-01-01',
            stopDate: '2020-01-01',
            contraceptiveType: 'Pil'
          }
        ]
      });
      expect(validRes.isValid).toBe(true);
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
