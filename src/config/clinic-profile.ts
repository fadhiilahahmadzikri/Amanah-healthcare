/**
 * Profiling & Knowledge Base Data
 * Klinik Pratama Amanah Healthcare
 * Catatan: Data kontak & alamat disamarkan untuk lingkungan Staging / Development sesuai arahan.
 */

export interface DoctorSchedule {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  doctor: string;
  time: string;
  usg: boolean;
  notes?: string;
}

export const CLINIC_PROFILE = {
  name: 'Klinik Pratama Amanah Healthcare',
  shortName: 'Klinik Amanah',
  tagline: 'Layanan Kesehatan Keluarga Terpadu, Islami, dan Terpercaya',
  operationalHours: 'Buka Setiap Hari (24 Jam)',
  contact: {
    phone: '+62 12345678910',
    whatsapp: '12345678910',
    email: 'kontak@amanahhealthcare.id',
    website: 'https://www.amanahhealthcare.id',
    instagram: '@amanahhealthcare',
    address:
      'Jl. Anyelir No. XX, Kawasan Condong Catur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281',
    region: 'Condongcatur, Sleman, D.I. Yogyakarta',
    disclaimer:
      'Informasi kontak dan nomor telepon disamarkan untuk kebutuhan pengembangan (Staging Mode).'
  },
  values: [
    'Profesional: Pelayanan medis sesuai standar operasional dan etika kedokteran.',
    'Ramah: Sikap sopan, empatik, dan nyaman untuk setiap pasien.',
    'Cepat: Meminimalkan waktu tunggu tanpa mengurangi kualitas medis.',
    'Aman: Keselamatan dan higienitas pasien menjadi prioritas utama.',
    'Transparan: Rincian biaya dan prosedur dijelaskan secara terbuka.',
    'Terpercaya: Privasi dan kerahasiaan rekam medis terlindungi (UU PDP).'
  ],
  doctors: [
    {
      name: 'dr. Ika Fenti',
      specialization: 'Dokter Umum & Praktisi USG',
      role: 'Dokter Tetap',
      days: 'Senin, Selasa, Rabu, Kamis, Jumat'
    },
    {
      name: 'dr. Bella',
      specialization: 'Dokter Umum & Praktisi USG',
      role: 'Dokter Tetap',
      days: 'Selasa, Kamis, Jumat, Sabtu, Minggu'
    },
    {
      name: 'dr. Jaga',
      specialization: 'Dokter Jaga Umum',
      role: 'Dokter Jaga Shift Malam',
      days: 'Sabtu Malam'
    }
  ],
  schedules: [
    {
      day: 'Senin',
      doctor: 'dr. Ika Fenti',
      time: '08.00–13.00 WIB',
      usg: true,
      notes: 'Pagi - USG ON'
    },
    {
      day: 'Senin',
      doctor: 'dr. Ika Fenti',
      time: '15.30–20.00 WIB',
      usg: true,
      notes: 'Sore - USG ON'
    },
    {
      day: 'Selasa',
      doctor: 'dr. Ika Fenti',
      time: '08.00–14.00 WIB',
      usg: true,
      notes: 'Pagi - USG ON'
    },
    {
      day: 'Selasa',
      doctor: 'dr. Bella',
      time: '14.00–20.00 WIB',
      usg: true,
      notes: 'Siang/Sore - USG ON'
    },
    {
      day: 'Rabu',
      doctor: 'dr. Ika Fenti',
      time: '08.00–13.00 WIB',
      usg: true,
      notes: 'Pagi - USG ON'
    },
    {
      day: 'Rabu',
      doctor: 'dr. Ika Fenti',
      time: '15.30–20.00 WIB',
      usg: true,
      notes: 'Sore - USG ON'
    },
    {
      day: 'Kamis',
      doctor: 'dr. Bella',
      time: '08.00–14.00 WIB',
      usg: true,
      notes: 'Pagi - USG ON'
    },
    {
      day: 'Kamis',
      doctor: 'dr. Ika Fenti',
      time: '14.00–20.00 WIB',
      usg: true,
      notes: 'Siang/Sore - USG ON'
    },
    {
      day: 'Jumat',
      doctor: 'dr. Ika Fenti',
      time: '08.00–14.00 WIB',
      usg: true,
      notes: 'Pagi - USG ON'
    },
    {
      day: 'Jumat',
      doctor: 'dr. Bella',
      time: '14.00–20.00 WIB',
      usg: true,
      notes: 'Siang/Sore - USG ON'
    },
    {
      day: 'Sabtu',
      doctor: 'dr. Bella',
      time: '08.00–11.00 WIB',
      usg: true,
      notes: 'Pagi - USG ON'
    },
    {
      day: 'Sabtu',
      doctor: 'dr. Jaga',
      time: '17.00–20.00 WIB',
      usg: false,
      notes: 'Malam - USG OFF'
    },
    {
      day: 'Minggu',
      doctor: 'dr. Bella',
      time: '15.00–20.00 WIB',
      usg: true,
      notes: 'Sore/Malam - USG ON'
    }
  ] as DoctorSchedule[],
  services: [
    {
      category: 'Pelayanan Medis Utama & Kehamilan',
      items: [
        'Pemeriksaan Dokter Umum (Sesuai jadwal dokter harian)',
        'USG Kehamilan & Abdomen (Tersedia layanan USG Umum dan USG dengan BPJS Kesehatan)',
        'Persalinan 24 Jam (Persalinan Umum, BPJS, & Paket Persalinan Full Bonus)',
        'Khitan Modern (Metode inovatif, minim rasa nyeri, pemulihan lebih cepat)',
        'Imunisasi Bayi & Anak (Sesuai jadwal dan ketersediaan vaksin resmi)'
      ]
    },
    {
      category: 'Surat Keterangan & Laboratorium',
      items: [
        'Surat Keterangan Dokter / Surat Keterangan Sehat',
        'Surat Keterangan Bebas Buta Warna (Tes Ishihara)',
        'Pemeriksaan Laboratorium Sederhana (Gula Darah, Asam Urat, Kolesterol, Hemoglobin)'
      ]
    },
    {
      category: 'Layanan Khusus Ibu & Bayi',
      items: [
        'Cukur Rambut Bayi Higienis',
        'Tindik Bayi Aman, Cepat, & Steril',
        'Pijat Bayi (Baby Massage) Medis Tradisional'
      ]
    }
  ],
  facilities: [
    'Ruang Pendaftaran & Admisi Terpadu',
    'Ruang Tunggu Pasien Nyaman & Ber-AC',
    'Poli Pemeriksaan Dokter Umum',
    'Ruang USG Kebidanan Modern',
    'Ruang Persalinan (VK) Steril 24 Jam',
    'Ruang Tindakan & Khitan Modern',
    'Laboratorium Sederhana & Apotek / Farmasi 24 Jam',
    'Ruang Laktasi / Menyusui & Area Bermain Anak',
    'Area Parkir Luas & Fasilitas Ramah Disabilitas'
  ],
  insurance: {
    bpjsSupport: true,
    bpjsServices: [
      'Rawat Jalan Tingkat Pertama (RJTP) Dokter Umum',
      'Pelayanan USG Kebidanan BPJS (Sesuai indikasi medis & rujukan)',
      'Persalinan Normal BPJS 24 Jam',
      'Pemberian Obat Farmasi BPJS Sesuai Formularium Nasional'
    ]
  },
  emergencyProtocol: {
    warning:
      'Untuk kondisi darurat mengancam jiwa (sesak napas berat, nyeri dada hebat, kejang, perdarahan masif, penurunan kesadaran), pasien harus segera dibawa ke IGD Rumah Sakit terdekat atau hubungi nomor darurat 119/118.'
  }
};
