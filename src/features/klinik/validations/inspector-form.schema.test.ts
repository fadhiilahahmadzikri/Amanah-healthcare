import { describe, expect, it } from 'bun:test';
import {
  validatePatientIdentityForm,
  validateRegularForm,
  validateMaternalForm,
  validateImmunizationForm,
  getMaternityTabWithErrors,
  getMaternityTabErrorCounts,
  MATERNITY_FIELD_DOM_ID_MAP,
  getImmunizationTabWithErrors,
  getImmunizationTabErrorCounts,
  getImmunizationDomIdForErrorKey
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

    it('should reject empty complaint when explicitly empty', () => {
      const res = validateRegularForm({
        fullName: 'Budi Santoso',
        complaint: ''
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.complaint).toBe('Keluhan utama wajib diisi');
    });

    it('should reject missing emergency contact phone when name is provided', () => {
      const res = validateRegularForm({
        fullName: 'Budi Santoso',
        emergencyContactName: 'Ahmad Fauzi',
        emergencyContactPhone: ''
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.emergencyContactPhone).toBe(
        'Nomor telepon kontak darurat wajib diisi jika nama diisi'
      );
    });

    it('should reject missing emergency contact name when phone is provided', () => {
      const res = validateRegularForm({
        fullName: 'Budi Santoso',
        emergencyContactName: '',
        emergencyContactPhone: '081234567890'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.emergencyContactName).toBe(
        'Nama kontak darurat wajib diisi jika nomor telepon diisi'
      );
    });

    it('should pass when both emergency contact name and phone are empty', () => {
      const res = validateRegularForm({
        fullName: 'Budi Santoso',
        emergencyContactName: '',
        emergencyContactPhone: ''
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });
  });

  describe('validatePatientIdentityForm', () => {
    it('should pass even when complaint is empty string', () => {
      const res = validatePatientIdentityForm({
        fullName: 'Budi Santoso',
        complaint: '',
        nik: '3201234567890001'
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });

    it('should reject empty fullName', () => {
      const res = validatePatientIdentityForm({
        fullName: '',
        nik: '3201234567890001'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.fullName).toBe('Nama lengkap wajib diisi');
    });

    it('should reject invalid 18-digit NIK', () => {
      const res = validatePatientIdentityForm({
        fullName: 'Budi Santoso',
        nik: '123456789012345678'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.nik).toBe('NIK harus berupa 16 digit angka');
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
      expect(futureRes.errors.contra_0_startDate).toBe(
        'Tanggal mulai KB tidak boleh di masa depan'
      );

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

    it('should reject invalid childNik format', () => {
      const res = validateImmunizationForm({
        childName: 'Rayyan Al-Fatih',
        childNik: '12345',
        parentPhone: '081234567890'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.childNik).toBe('NIK anak harus berupa 16 digit angka');
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

    it('should correctly count errors per tab without double counting', () => {
      const errors = {
        childName: 'Nama wajib diisi',
        parentPhone: 'Nomor HP wajib diisi',
        entry_0_weightKg: 'BB minimal 0.5 kg',
        entry_1_temperatureCelsius: 'Suhu minimal 30 C',
        entries: 'Ada data yang salah'
      };
      const counts = getImmunizationTabErrorCounts(errors);
      expect(counts.identitas).toBe(1);
      expect(counts['orang-tua']).toBe(1);
      expect(counts.riwayat).toBe(0);
      expect(counts.trajektori).toBe(2);
    });

    it('should resolve correct tab with errors in priority order', () => {
      expect(getImmunizationTabWithErrors({ childName: 'Error' })).toBe('identitas');
      expect(getImmunizationTabWithErrors({ parentPhone: 'Error' })).toBe('orang-tua');
      expect(getImmunizationTabWithErrors({ entry_0_weightKg: 'Error' })).toBe('trajektori');
      expect(getImmunizationTabWithErrors({})).toBeNull();
    });

    it('should reject non-numeric string in weightKg with valid error message', () => {
      const res = validateImmunizationForm({
        childName: 'Rayyan',
        parentPhone: '081234567890',
        entries: [
          {
            rowIndex: 0,
            weightKg: 'abc' as any
          }
        ]
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.entry_0_weightKg).toBe('Berat badan harus berupa angka valid');
    });

    it('should allow numeric values without arbitrary min max blocking', () => {
      const res = validateImmunizationForm({
        childName: 'Rayyan',
        parentPhone: '081234567890',
        entries: [
          {
            rowIndex: 0,
            weightKg: 0.3 as any, // previously blocked by min 0.5
            temperatureCelsius: 29.5 as any // previously blocked by min 30
          }
        ]
      });
      expect(res.isValid).toBe(true);
    });

    it('should reject ageDisplay when it exceeds age from birth date to today', () => {
      const res = validateImmunizationForm({
        childName: 'Rayyan',
        parentPhone: '081234567890',
        childBirthDate: '2026-01-01', // approximately a few months old
        entries: [
          {
            rowIndex: 0,
            ageDisplay: '23 thn' // 23 years exceeds infant age
          }
        ]
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.entry_0_ageDisplay).toBe(
        'Umur saat suntik melebihi usia anak dari tanggal lahir hingga saat ini'
      );
    });

    it('should allow ageDisplay within reasonable age from birth date', () => {
      const res = validateImmunizationForm({
        childName: 'Rayyan',
        parentPhone: '081234567890',
        childBirthDate: '2024-01-01', // ~2 years old
        entries: [
          {
            rowIndex: 0,
            ageDisplay: '1 thn' // within age
          }
        ]
      });
      expect(res.isValid).toBe(true);
    });

    it('should resolve correct DOM IDs for error keys', () => {
      expect(getImmunizationDomIdForErrorKey('childName')).toBe('admin-child-name-input');
      expect(getImmunizationDomIdForErrorKey('parentPhone')).toBe('admin-parent-phone');
      expect(getImmunizationDomIdForErrorKey('entry_0_weightKg')).toBe('edit-weight-0');
      expect(getImmunizationDomIdForErrorKey('entry_2_temperatureCelsius')).toBe('edit-temp-2');
      expect(getImmunizationDomIdForErrorKey('entry_1_injectionDate')).toBe(
        'edit-injection-date-1'
      );
    });
  });
});
