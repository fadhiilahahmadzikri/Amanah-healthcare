import type { FacilitySectionData, ServiceCategorySection, ServiceHeroData } from './types';

export const servicesHeroData: ServiceHeroData = {
  eyebrow: 'Fasilitas & Layanan',
  title: 'Mendukung Kesehatan Anda Sepenuhnya',
  description:
    'Klinik Amanah hadir dengan berbagai pilihan layanan dan fasilitas kesehatan yang dirancang untuk memberikan pelayanan terbaik bagi Anda dan keluarga.',
  highlights: [
    {
      id: 'highlight-1',
      title: 'Pelayanan Ramah dan Profesional'
    },
    {
      id: 'highlight-2',
      title: 'Tenaga Medis Berpengalaman'
    },
    {
      id: 'highlight-3',
      title: 'Fasilitas Lengkap dan Nyaman'
    }
  ],
  image: {
    src: '/healthcare/assets/images/asset_hero_sec_service.webp',
    alt: 'Layanan dan Fasilitas Kesehatan Klinik Amanah'
  }
};

export const generalPractitionerSection: ServiceCategorySection = {
  id: 'pelayanan-umum',
  contextKey: 'general-practitioner',
  indicatorLabel: 'Dokter umum',
  eyebrow: 'Pelayanan Umum',
  title: 'Dokter Umum',
  description:
    'Pemeriksaan dan penanganan kesehatan dasar oleh dokter umum untuk membantu menjaga kondisi tubuh Anda tetap optimal.',
  layout: 'bento-left',
  services: [
    {
      id: 'pemeriksaan-umum',
      title: 'Pemeriksaan Dokter Umum',
      description: 'Konsultasi dan pemeriksaan awal untuk mengetahui kondisi kesehatan Anda.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-pemeriksaan.webp',
        alt: 'Pemeriksaan Dokter Umum'
      },
      colSpanClass: 'col-span-12 md:col-span-5',
      heightClass: 'min-h-[220px] md:min-h-[240px]'
    },
    {
      id: 'pengobatan-keluhan',
      title: 'Pengobatan Keluhan Ringan',
      description: 'Penanganan demam, batuk, flu, sakit kepala, nyeri, dan keluhan harian lainnya.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-keluhan.webp',
        alt: 'Pengobatan Keluhan Ringan'
      },
      colSpanClass: 'col-span-12 md:col-span-7',
      heightClass: 'min-h-[220px] md:min-h-[240px]'
    },
    {
      id: 'cek-tekanan-darah',
      title: 'Cek Tekanan Darah',
      description: 'Pemeriksaan tekanan darah untuk memantau risiko hipertensi.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-tekanan-darah.webp',
        alt: 'Cek Tekanan Darah'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'umum-ekg',
      title: 'EKG',
      description:
        'Pemeriksaan elektrokardiografi untuk membantu mengevaluasi aktivitas dan kondisi jantung sesuai indikasi medis.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-pemantauan.webp',
        alt: 'Pemeriksaan EKG'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'pemeriksaan-laboratorium',
      title: 'Pemeriksaan Laboratorium',
      description: 'Pemeriksaan penunjang untuk membantu dokter menentukan diagnosis.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-laboratorium.webp',
        alt: 'Pemeriksaan Laboratorium'
      },
      colSpanClass: 'col-span-12 sm:col-span-12 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'umum-nebulizer',
      title: 'Nebulizer',
      description:
        'Fasilitas terapi nebulisasi untuk membantu penanganan pasien dengan keluhan saluran pernapasan sesuai anjuran tenaga medis.',
      image: {
        src: '/healthcare/assets/images/dokumentasi/nebulizer.webp',
        alt: 'Fasilitas Terapi Nebulizer'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-7',
      heightClass: 'min-h-[210px] md:min-h-[230px]'
    },
    {
      id: 'kehamilan-umum',
      title: 'Pemeriksaan Kehamilan',
      description: 'Pemeriksaan kondisi ibu hamil dan perkembangan kehamilan secara berkala.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-kehamilan.webp',
        alt: 'Pemeriksaan Kehamilan'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-5',
      heightClass: 'min-h-[210px] md:min-h-[230px]'
    },
    {
      id: 'konsultasi-kesehatan',
      title: 'Konsultasi Kesehatan',
      description: 'Diskusi keluhan dan saran perawatan sesuai kondisi pasien.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-konsultasi.webp',
        alt: 'Konsultasi Kesehatan'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-6',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'surat-keterangan',
      title: 'Surat Keterangan Sehat',
      description:
        'Pemeriksaan dasar untuk kebutuhan administrasi sekolah, kerja, atau perjalanan.',
      image: {
        src: '/healthcare/assets/images/layanan-umum-keterangan.webp',
        alt: 'Surat Keterangan Sehat'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-6',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    }
  ]
};

export const midwiferySection: ServiceCategorySection = {
  id: 'layanan-ibu-dan-anak',
  contextKey: 'midwifery',
  indicatorLabel: 'Bidan',
  eyebrow: 'Pelayanan Bidan',
  title: 'Kesehatan Ibu dan Anak',
  description:
    'Untuk mendukung kehamilan yang sehat, persalinan yang aman, dan tumbuh kembang buah hati yang optimal.',
  layout: 'bento-right',
  services: [
    {
      id: 'bidan-pemeriksaan-kehamilan',
      title: 'Pemeriksaan Kehamilan',
      description: 'Memantau kesehatan ibu dan janin secara rutin.',
      image: {
        src: '/healthcare/assets/images/asset_pemeriksaankehamilan.webp',
        alt: 'Pemeriksaan Kehamilan Bidan'
      },
      colSpanClass: 'col-span-12 md:col-span-7',
      heightClass: 'min-h-[220px] md:min-h-[240px]'
    },
    {
      id: 'bidan-usg',
      title: 'USG',
      description:
        'Pemeriksaan ultrasonografi sebagai fasilitas penunjang untuk membantu dokter melakukan evaluasi kondisi medis sesuai kebutuhan pasien.',
      image: {
        src: '/healthcare/assets/images/asset-index-6.webp',
        alt: 'Pemeriksaan USG'
      },
      colSpanClass: 'col-span-12 md:col-span-5',
      heightClass: 'min-h-[220px] md:min-h-[240px]'
    },
    {
      id: 'bidan-persalinan',
      title: 'Persalinan',
      description: 'Didampingi tenaga bidan berpengalaman dan fasilitas aman.',
      image: {
        src: '/healthcare/assets/images/asset_persalinan.webp',
        alt: 'Persalinan'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'bidan-perawatan-nifas',
      title: 'Perawatan Nifas',
      description: 'Membantu pemulihan ibu setelah melahirkan.',
      image: {
        src: '/healthcare/assets/images/asset-perawatannifas.webp',
        alt: 'Perawatan Nifas'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'bidan-imunisasi',
      title: 'Imunisasi',
      description: 'Melindungi buah hati dari berbagai penyakit.',
      image: {
        src: '/healthcare/assets/images/asset_imunisasi.webp',
        alt: 'Imunisasi Anak'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'bidan-keluarga-berencana',
      title: 'Keluarga Berencana',
      description: 'Membantu merencanakan keluarga yang sehat dan sejahtera.',
      image: {
        src: '/healthcare/assets/images/asset_kb.webp',
        alt: 'Keluarga Berencana'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'bidan-tumbuh-kembang',
      title: 'Pemeriksaan Tumbuh Kembang',
      description: 'Memastikan anak tumbuh sehat dan optimal.',
      image: {
        src: '/healthcare/assets/images/asset_tumbuhkembanganak.webp',
        alt: 'Pemeriksaan Tumbuh Kembang'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    },
    {
      id: 'bidan-konsultasi-reproduksi',
      title: 'Konsultasi Kesehatan Reproduksi',
      description: 'Informasi dan solusi untuk kesehatan reproduksi Anda.',
      image: {
        src: '/healthcare/assets/images/asset_konsul_kb.webp',
        alt: 'Konsultasi Kesehatan Reproduksi'
      },
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-4',
      heightClass: 'min-h-[200px] md:min-h-[220px]'
    }
  ]
};

export const facilitiesSectionData: FacilitySectionData = {
  eyebrow: 'Fasilitas',
  title: 'Ruang Nyaman untuk Anda dan Keluarga',
  description:
    'Klinik Amanah menyediakan fasilitas yang nyaman dan lengkap untuk mendukung kebutuhan kesehatan Anda dan keluarga.',
  items: [
    {
      id: 'facility-apotek',
      title: 'Apotek',
      summary:
        'Menyediakan kebutuhan obat-obatan dan resep medis Anda dengan cepat tanpa perlu pindah tempat.',
      url: '/kontak',
      image: '/healthcare/assets/images/fasilitas-apotek.webp'
    },
    {
      id: 'facility-ruang-bersalin',
      title: 'Ruang Persalinan 24 Jam',
      summary:
        'Siaga setiap saat untuk mendampingi proses melahirkan dengan aman, nyaman, dan ditangani tenaga medis profesional.',
      url: '/kontak',
      image: '/healthcare/assets/images/asset-index-8.webp'
    },
    {
      id: 'facility-ruang-tunggu',
      title: 'Ruang Tunggu Nyaman',
      summary:
        'Area tunggu yang bersih, sejuk, dan ramah keluarga agar Anda dan kerabat tetap merasa rileks saat berobat.',
      url: '/kontak',
      image: '/healthcare/assets/images/fasilitas-ruangtunggu.webp'
    },
    {
      id: 'facility-baby-care',
      title: 'Baby Care Center',
      summary:
        'Area khusus perawatan dan stimulasi bayi yang aman, bersih, dan nyaman bagi si kecil.',
      url: '/kontak',
      image: '/healthcare/assets/images/asset-index-1.webp'
    }
  ]
};
