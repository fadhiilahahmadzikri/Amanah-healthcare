import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PATIENT_REGISTRATION_STEPS } from '../constants/registration-options';
import { patientRegistrationSchema } from '../schemas/patient-registration-schema';
import {
  buildPatientMutationPayload,
  calculateAgeFromBirthDate,
  getPatientRegistrationRedirectPath,
  hasCompletedPatientRegistration
} from './registration-mapper';

const validRegistrationValues = {
  name: 'Budi Santoso',
  nik: '3271012345670001',
  nama_ibu_kandung: 'Siti Aminah',
  tempat_lahir: 'Jakarta',
  birth_date: '1992-09-08',
  gender: 'Laki-laki',
  blood_type: 'Belum Tahu',
  provinsi: 'DKI Jakarta',
  provinsi_id: '31',
  kabupaten: 'Kota Jakarta Selatan',
  kabupaten_id: '3174',
  kecamatan: 'Setiabudi',
  kecamatan_id: '317401',
  kelurahan: 'Karet',
  kelurahan_id: '3174011001',
  alamat_detail: 'Jl. Mawar No. 5',
  pekerjaan: 'Wiraswasta'
} as const;

describe('patient registration schema', () => {
  test('requires a 16 digit NIK', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validRegistrationValues,
      nik: '327101'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('NIK harus 16 digit angka');
    }
  });

  test('accepts the minimum complete registration payload', () => {
    const result = patientRegistrationSchema.safeParse(validRegistrationValues);

    expect(result.success).toBe(true);
  });
});

describe('patient registration POC alignment', () => {
  test('keeps the step copy aligned with the minimalist POC', () => {
    expect(PATIENT_REGISTRATION_STEPS).toEqual([
      {
        title: 'halo kak! kenalan dulu yuk 😊',
        description: 'siapa nama lengkap kamu sesuai KTP / KK?'
      },
      {
        title: 'sip! minta NIK kamu ya 🪪',
        description: 'masukkan 16 digit NIK KTP kamu untuk identifikasi rekam medis.'
      },
      {
        title: 'siapa nama ibu kandung kamu? 👩‍👧',
        description: 'data nama ibu kandung diperlukan untuk verifikasi identitas & rekam medis.'
      },
      {
        title: 'asik! di mana & kapan kamu lahir? 🎂',
        description: 'data tanggal lahir membantu dokter menghitung usia & konsultasi.'
      },
      {
        title: 'pilih jenis kelamin kamu 🚻',
        description: 'opsi ini digunakan untuk mencocokkan dokter & rekam medis.'
      },
      {
        title: 'apa golongan darah kamu? 🩸',
        description: 'data ini penting untuk catatan medis & penanganan darurat.'
      },
      {
        title: 'sekarang kamu tinggal dimana? 🏡',
        description: 'data domisili dipakai untuk pengiriman resep & surat rujukan.'
      },
      {
        title: 'dikit lagi kelar nih! 💼',
        description: 'apa pekerjaan atau kegiatan kamu sehari-hari?'
      },
      {
        title: 'hore! data kamu udah rapi 🎉',
        description: 'yuk periksa sekali lagi sebelum pendaftaran disimpan.'
      }
    ]);
  });

  test('renders registration as a forced modal instead of a standalone card page', () => {
    const modalSource = readFileSync(
      join(
        process.cwd(),
        'src/features/data-pasien/components/registration/patient-registration-modal.tsx'
      ),
      'utf8'
    );

    expect(modalSource).toContain('ModalWrapper');
    expect(modalSource).toContain('dismissible={false}');
    expect(modalSource).toContain('showCloseButton={false}');
    expect(modalSource).toContain('gsap');
    expect(modalSource).toContain('triggerPatientRegistrationConfetti');
    expect(modalSource).not.toContain('next/image');
    expect(modalSource).not.toContain('<Card');
  });
});

describe('patient registration mapper', () => {
  test('calculates age using whether the birthday has passed this year', () => {
    const referenceDate = new Date('2026-09-07T08:00:00.000Z');

    expect(calculateAgeFromBirthDate('1992-09-07', referenceDate)).toBe(34);
    expect(calculateAgeFromBirthDate('1992-09-08', referenceDate)).toBe(33);
  });

  test('maps wizard values into the existing patient mutation payload', () => {
    const payload = buildPatientMutationPayload({
      values: validRegistrationValues,
      user: {
        email: 'budi@example.com',
        imageUrl: 'https://example.com/avatar.png',
        phone: '081234567890'
      },
      now: new Date('2026-09-07T02:15:00.000Z'),
      nextRecordNumber: 42
    });

    expect(payload).toEqual({
      name: 'Budi Santoso',
      patient_id: 'RM-2026-0042',
      nik: '3271012345670001',
      nik_ktp: '3271012345670001',
      nama_ibu_kandung: 'Siti Aminah',
      tempat_lahir: 'Jakarta',
      pekerjaan: 'Wiraswasta',
      domisili:
        'Jl. Mawar No. 5, Kel. Karet, Kec. Setiabudi, Kota Jakarta Selatan, Prov. DKI Jakarta',
      nomor_telepon_wa: '081234567890',
      email_pasien: 'budi@example.com',
      phone: '081234567890',
      email: 'budi@example.com',
      gender: 'Laki-laki',
      age: 33,
      birth_date: '1992-09-08',
      tanggal_lahir: '08/09/1992',
      blood_type: 'Belum Tahu',
      address:
        'Jl. Mawar No. 5, Kel. Karet, Kec. Setiabudi, Kota Jakarta Selatan, Prov. DKI Jakarta',
      avatar: 'https://example.com/avatar.png',
      allergies: [],
      emergency_contact: '',
      medical_history: '',
      account_status: 'Aktif',
      tanggal_registrasi_akun: '07/09/2026',
      login_pertama_kali: '7 September 2026, 09:15 WIB',
      kunjungan_terakhir: 'Belum ada kunjungan',
      total_kunjungan: 0
    });
  });
});

describe('patient registration completion status', () => {
  test('treats Clerk metadata and the local completion cookie as completed sources', () => {
    expect(
      hasCompletedPatientRegistration({
        unsafeMetadata: { patientRegistrationCompleted: true },
        publicMetadata: {},
        completionCookie: null
      })
    ).toBe(true);

    expect(
      hasCompletedPatientRegistration({
        unsafeMetadata: {},
        publicMetadata: { patientRegistrationCompleted: true },
        completionCookie: null
      })
    ).toBe(true);

    expect(
      hasCompletedPatientRegistration({
        unsafeMetadata: {},
        publicMetadata: {},
        completionCookie: 'true'
      })
    ).toBe(true);
  });

  test('treats missing or malformed sources as incomplete', () => {
    expect(
      hasCompletedPatientRegistration({
        unsafeMetadata: { patientRegistrationCompleted: 'yes' },
        publicMetadata: {},
        completionCookie: '1'
      })
    ).toBe(false);
  });
});

describe('patient registration route policy', () => {
  test('leaves incomplete authenticated users on dashboard to let modal barrier intercept', () => {
    expect(
      getPatientRegistrationRedirectPath({
        isAuthenticated: true,
        isRegistrationComplete: false,
        pathname: '/dashboard/overview'
      })
    ).toBe(null);
  });

  test('redirects direct hits to /patient-registration to /dashboard/overview', () => {
    expect(
      getPatientRegistrationRedirectPath({
        isAuthenticated: true,
        isRegistrationComplete: false,
        pathname: '/patient-registration'
      })
    ).toBe('/dashboard/overview');

    expect(
      getPatientRegistrationRedirectPath({
        isAuthenticated: true,
        isRegistrationComplete: true,
        pathname: '/patient-registration'
      })
    ).toBe('/dashboard/overview');
  });

  test('leaves matching authenticated routes in place', () => {
    expect(
      getPatientRegistrationRedirectPath({
        isAuthenticated: true,
        isRegistrationComplete: true,
        pathname: '/dashboard/data-pasien'
      })
    ).toBe(null);
  });

  test('redirects unauthenticated users to sign-in', () => {
    expect(
      getPatientRegistrationRedirectPath({
        isAuthenticated: false,
        isRegistrationComplete: false,
        pathname: '/dashboard/overview'
      })
    ).toBe('/auth/sign-in');
  });
});
