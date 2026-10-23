import type { RegulerFormConfig, RegulerFormData } from '../types';

export const defaultRegulerConfig: RegulerFormConfig = {
  header: {
    clinicName: 'KLINIK PRATAMA AMANAH HEALTHCARE',
    clinicTagline: 'Pelayanan Kesehatan Profesional, Islami & Terpercaya',
    clinicAddress: 'Jl. Kaliurang KM 10 No. 786, Sinduharjo, Ngaglik, Sleman, D.I. Yogyakarta 55581',
    clinicContact: 'Telp: (0274) 889900 | WhatsApp: 0812-0000-0099 | Email: info@amanah.health',
    formTitle: 'FORMULIR PENDAFTARAN & REKAM MEDIS RAWAT JALAN',
    formSubtitle: 'POLIKLINIK UMUM & KONSULTASI MEDIS',
  },
};

export const sampleRegulerData: RegulerFormData = {
  medicalRecordNumber: 'RM-202610-0004',
  registrationDate: '17 Oktober 2026',
  bookingCode: 'BOOK-MVC49HZ4-32',
  queueNumber: 'USG-S001',
  serviceName: 'Pemeriksaan Poli Umum & USG',
  doctorName: 'dr. Ahmad Santoso',
  scheduledTime: '12:00 - 18:00 WIB (Sesi Siang)',
  identity: {
    nik: '2322323232232323',
    fullName: 'Riza Fachrurrozi',
    gender: 'Laki-laki',
    birthDate: '08 Oktober 1995',
    birthPlace: 'Yogyakarta',
    age: '31 Tahun',
    bloodType: 'O',
    motherName: 'Maryam Salsabila',
    occupation: 'Karyawan Swasta',
    religion: 'Islam',
    phoneNumber: '0813-1122-3344',
    email: 'lexguarddidier@gmail.com',
    address: 'Jl. Kaliurang KM 10 No. 45, Huraba, Angkola Timur, Sleman',
    relationship: 'Diri Sendiri',
  },
  emergencyContact: {
    name: 'Fauzi Rahmat',
    relationship: 'Saudara Kandung',
    phoneNumber: '0812-9876-5432',
  },
  clinical: {
    chiefComplaint: 'Demam 3 hari disertai batuk kering dan sakit kepala ringan',
    allergyHistory: 'Tidak ada riwayat alergi obat maupun makanan (Bebas Alergi)',
    vitalHeightCm: '170 cm',
    vitalWeightKg: '65 kg',
    vitalBloodPressure: '120/80 mmHg',
    additionalNotes: 'Pasien datang dengan kondisi sadar penuh (Compos Mentis), orientasi baik.',
  },
};
