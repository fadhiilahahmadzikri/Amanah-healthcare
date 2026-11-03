import { fakerID_ID as faker } from '@faker-js/faker';
import type { AutofillSchedule } from '../types';
import { IndonesianIdentityGenerator } from '../core';

export class ImmunizationFakerFactory {
  private constructor() {}

  private static generateNik(birthDateStr: string, isFemale: boolean = false): string {
    return IndonesianIdentityGenerator.generateNik(birthDateStr, isFemale);
  }

  private static generateIndonesianPhone(): string {
    return IndonesianIdentityGenerator.generatePhone();
  }

  public static generate(): {
    values: Record<string, string>;
    schedule: AutofillSchedule;
  } {
    const isFemale = faker.datatype.boolean();
    const childSex = isFemale ? 'Perempuan' : 'Laki-laki';
    const childName = faker.person.fullName({ sex: isFemale ? 'female' : 'male' });

    const birthYear = faker.number.int({ min: 2024, max: 2025 });
    const birthMonth = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const birthDay = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
    const childBirthDate = `${birthYear}-${birthMonth}-${birthDay}`;
    const childNik = this.generateNik(childBirthDate, isFemale);

    const fatherName = faker.person.fullName({ sex: 'male' });
    const motherName = faker.person.fullName({ sex: 'female' });
    const parentPhone = this.generateIndonesianPhone();

    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const childAddress = `${street}, ${city}`;

    const vaccinePresets = [
      'HB 0 saat lahir, BCG dan Polio 1 saat usia 1 bulan.',
      'HB 0, BCG, Polio 1, DPT-HB-Hib 1, Polio 2 sudah lengkap.',
      'Sudah mendapatkan imunisasi dasar lengkap sampai usia 9 bulan (Campak/MR).',
      'HB 0 dan BCG sudah diberikan di puskesmas, belum Polio 1.'
    ];
    const previousVaccineHistory =
      vaccinePresets[faker.number.int({ min: 0, max: vaccinePresets.length - 1 })];

    const allergyPresets = [
      'Tidak ada riwayat alergi',
      'Tidak ada',
      'Alergi dingin ringan',
      'Riwayat kemerahan setelah obat amoxicillin'
    ];
    const childAllergyHistory =
      allergyPresets[faker.number.int({ min: 0, max: allergyPresets.length - 1 })];

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + faker.number.int({ min: 1, max: 5 }));
    const scheduleDateStr = targetDate.toISOString().split('T')[0];
    const sessions = ['DINI_HARI', 'PAGI', 'SIANG', 'MALAM'];
    const session = sessions[faker.number.int({ min: 0, max: sessions.length - 1 })];

    const values: Record<string, string> = {
      childName,
      childNik,
      childBirthDate,
      childSex,
      parentPhone,
      fatherName,
      motherName,
      childAddress,
      hasVaccineHistory: 'Ya, pernah',
      vaccine_HB_0_status: 'Sudah',
      vaccine_HB_0_date: childBirthDate,
      vaccine_BCG_status: 'Sudah',
      vaccine_PENTA_1_status: 'Sudah',
      vaccine_IPV_1_status: 'Sudah',
      vaccine_PCV_1_status: 'Sudah',
      vaccine_RV_1_status: 'Sudah',
      vaccine_PENTA_2_status: 'Belum',
      vaccine_IPV_2_status: 'Belum',
      vaccine_PCV_2_status: 'Belum',
      hasAllergyHistory: 'Tidak ada alergi',
      previousVaccineHistory,
      childAllergyHistory
    };

    return {
      values,
      schedule: {
        dateStr: scheduleDateStr,
        session
      }
    };
  }
}
