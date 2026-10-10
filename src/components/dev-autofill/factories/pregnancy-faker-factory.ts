import { fakerID_ID as faker } from '@faker-js/faker';
import type { AutofillSchedule } from '../types';

export class PregnancyFakerFactory {
  private static generateNik(birthDateStr: string, isFemale: boolean = false): string {
    const parts = birthDateStr.split('-');
    const year = parts[0] || '1995';
    const month = parts[1] || '06';
    const day = parseInt(parts[2] || '15', 10);
    const adjustedDay = isFemale ? String(day + 40).padStart(2, '0') : String(day).padStart(2, '0');
    const shortYear = year.slice(2);
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    return `320101${adjustedDay}${month}${shortYear}${randomSuffix}`;
  }

  private static generateIndonesianPhone(): string {
    const prefixes = ['0812', '0813', '0821', '0822', '0852', '0853', '0877', '0878'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDigits = String(Math.floor(10000000 + Math.random() * 90000000));
    return `${prefix}${randomDigits}`;
  }

  public static generate(_mode?: string): {
    values: Record<string, string>;
    schedule: AutofillSchedule;
  } {
    const motherBirthYear = faker.number.int({ min: 1992, max: 2002 });
    const motherBirthMonth = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const motherBirthDay = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
    const motherBirthDate = `${motherBirthYear}-${motherBirthMonth}-${motherBirthDay}`;
    const motherName = faker.person.fullName({ sex: 'female' });
    const motherNik = this.generateNik(motherBirthDate, true);

    const partnerBirthYear = faker.number.int({ min: 1988, max: 1999 });
    const partnerBirthMonth = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const partnerBirthDay = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
    const partnerBirthDate = `${partnerBirthYear}-${partnerBirthMonth}-${partnerBirthDay}`;
    const partnerName = faker.person.fullName({ sex: 'male' });
    const partnerNik = this.generateNik(partnerBirthDate, false);

    const marriageYear = faker.number.int({ min: Math.max(motherBirthYear + 19, 2018), max: 2024 });
    const marriageDate = `${marriageYear}-0${faker.number.int({ min: 1, max: 9 })}-15`;

    const hphtMonth = faker.number.int({ min: 1, max: 5 });
    const hpht = `2026-0${hphtMonth}-12`;

    const jobOptions = [
      'Karyawan Swasta',
      'Wiraswasta / Pengusaha',
      'Pegawai Negeri Sipil / TNI / Polri',
      'Ibu Rumah Tangga',
      'Guru / Dosen'
    ];
    const partnerJobOptions = [
      'Karyawan Swasta',
      'Wiraswasta / Pengusaha',
      'Pegawai Negeri Sipil / TNI / Polri',
      'Guru / Dosen'
    ];
    const educationOptions = ['SMA/SMK', 'D1-D3', 'S1', 'S2/S3'];
    const bloodTypes = ['A', 'B', 'AB', 'O'];

    const motherJob = jobOptions[Math.floor(Math.random() * jobOptions.length)];
    const partnerJob = partnerJobOptions[Math.floor(Math.random() * partnerJobOptions.length)];
    const motherEducation = educationOptions[Math.floor(Math.random() * educationOptions.length)];
    const partnerEducation = educationOptions[Math.floor(Math.random() * educationOptions.length)];
    const motherBloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    const partnerBloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];

    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const fullAddress = `${street}, RT 0${faker.number.int({ min: 1, max: 9 })}/RW 0${faker.number.int({ min: 1, max: 9 })}, ${city}`;

    const heightCm = String(faker.number.int({ min: 152, max: 168 }));
    const prePregnancyWeightKg = String(faker.number.int({ min: 48, max: 68 }));
    const upperArmCircumferenceCm = (faker.number.int({ min: 235, max: 285 }) / 10).toFixed(1);
    const heightM = Number(heightCm) / 100;
    const initialBmi = (Number(prePregnancyWeightKg) / (heightM * heightM)).toFixed(1);
    const motherAge = `${2026 - motherBirthYear} tahun`;
    const partnerAge = `${2026 - partnerBirthYear} tahun`;

    const values: Record<string, string> = {
      motherName,
      motherNik,
      motherBirthDate,
      motherAge,
      marriageOrder: '1',
      marriageDate,
      motherJob,
      motherEducation,
      religion: 'Islam',
      phoneNumber: this.generateIndonesianPhone(),
      domicileAddress: fullAddress,
      identityCardAddress: fullAddress,
      dasawisma: `Melati 0${faker.number.int({ min: 1, max: 9 })}`,
      posyandu: `Posyandu Cempaka ${faker.number.int({ min: 1, max: 5 })}`,
      puskesmas: `Puskesmas ${city}`,
      partnerName,
      partnerNik,
      partnerBirthDate,
      partnerAge,
      partnerJob,
      partnerEducation,
      partnerBloodType,
      heightCm,
      prePregnancyWeightKg,
      upperArmCircumferenceCm,
      initialBmi,
      tetanusStatus: 'T2',
      motherBloodType,
      hpht,
      estimatedDueDate: '',
      gestationalAge: '',
      currentComplaints: 'Mual ringan di pagi hari dan sesekali cepat lelah',
      smokedBeforePregnancy: 'Tidak',
      alcoholBeforePregnancy: 'Tidak',
      irregularDietBeforePregnancy: 'Tidak',
      reducedPhysicalActivityBeforePregnancy: 'Tidak',
      unprescribedMedicationBeforePregnancy: 'Tidak',
      concerningCosmeticUseBeforePregnancy: 'Tidak',
      pesticideExposureBeforePregnancy: 'Tidak',
      chemicalExposureBeforePregnancy: 'Tidak',
      smokeExposureBeforePregnancy: 'Tidak',
      concerningEnvironmentNotes: 'Tinggal di lingkungan bersih dan bebas asap rokok',
      allergyInfo: 'Tidak ada riwayat alergi obat maupun makanan',
      otherNotes: 'Pemeriksaan awal kehamilan trimester pertama',
      hasHypertensionHistory: 'Ya',
      hypertensionHistoryNotes: '2023',
      hasHeartDiseaseHistory: 'Tidak',
      heartDiseaseHistoryNotes: '',
      hasThyroidDiseaseHistory: 'Ya',
      thyroidDiseaseHistoryNotes: '2022',
      hasAutoimmuneHistory: 'Tidak',
      autoimmuneHistoryNotes: '',
      hasDiabetesHistory: 'Ya',
      diabetesHistoryNotes: '2021',
      hasAsthmaHistory: 'Tidak',
      asthmaHistoryNotes: '',
      hasTuberculosisHistory: 'Tidak',
      tuberculosisHistoryNotes: '',
      hasHepatitisBHistory: 'Ya',
      hepatitisBHistoryNotes: '2024',
      hasHivOrSyphilisHistory: 'Tidak',
      hivOrSyphilisHistoryNotes: '',
      hasMentalHealthHistory: 'Tidak',
      mentalHealthHistoryNotes: '',
      hasTwinPregnancyHistory: 'Ya',
      twinPregnancyHistoryNotes: '2020',
      hasCystMyomaTumorHistory: 'Tidak',
      cystMyomaTumorHistoryNotes: '',
      hasSurgeryHistory: 'Ya',
      surgeryHistoryNotes: '2019',
      hasOtherDiseaseHistory: 'Tidak',
      otherDiseaseHistoryNotes: '',
      otherDiseaseHistoryYear: '',
      gravidaCount: '2',
      parityCount: '1',
      abortionCount: '0',
      livingChildrenCount: '1',
      hasPreviousPregnancyHistory: 'Ya, ada',
      previousPregnancy1BirthYear: '2022',
      previousPregnancy1BirthWeight: '3150 gram',
      previousPregnancy1BirthLength: '49 cm',
      previousPregnancy1ChildSex: 'Perempuan',
      previousPregnancy1Gender: 'Perempuan',
      previousPregnancy1GestationalAgeAtBirth: '39 minggu',
      previousPregnancy1GestationalAgeWeeks: '39 minggu',
      previousPregnancy1BirthAttendant: 'Bidan',
      previousPregnancy1DeliveryAttendant: 'Bidan',
      previousPregnancy1DeliveryMethod: 'Normal / Spontan',
      previousPregnancy1DeliveryPlace: 'Puskesmas',
      previousPregnancy1Complications: 'Tidak ada komplikasi',
      previousPregnancy1ChildCurrentCondition: 'Hidup dan sehat',
      hasContraceptionHistory: 'Ya, pernah',
      contraception1StartDate: '2023-01-15',
      contraception1Type: 'Suntik 3 Bulan',
      contraception1Duration: '1 tahun',
      contraception1StopDate: '2024-01-20',
      contraception1Problems: 'Tidak ada keluhan saat pemakaian',
      contraception1SideEffects: 'Pusing ringan di awal pemakaian',
      contraception1StopReason: 'Merencanakan kehamilan berikutnya'
    };

    const futureDays = faker.number.int({ min: 1, max: 5 });
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + futureDays);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const sessions = ['DINI_HARI', 'PAGI', 'SIANG', 'MALAM'];
    const session = sessions[Math.floor(Math.random() * sessions.length)];

    return {
      values,
      schedule: {
        dateStr,
        session
      }
    };
  }
}
