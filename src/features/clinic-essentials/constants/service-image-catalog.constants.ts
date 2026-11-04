export interface PredefinedServiceImage {
  path: string;
  label: string;
  category: 'Umum' | 'KIA' | 'Kebidanan' | 'Anak' | 'Tindakan' | 'Fasilitas' | 'Lainnya';
}

/**
 * Katalog gambar layanan predefined yang tersimpan di direktori public/assets/services/
 * Gambar diakses via path relatif universal /assets/services/... tanpa upload ke VPS.
 */
export const PREDEFINED_SERVICE_IMAGES: PredefinedServiceImage[] = [
  // Pelayanan Umum
  {
    path: '/assets/services/layanan-umum-pemeriksaan.webp',
    label: 'Pemeriksaan Dokter Umum',
    category: 'Umum'
  },
  {
    path: '/assets/services/layanan-umum-konsultasi.webp',
    label: 'Konsultasi Medis & Keluhan',
    category: 'Umum'
  },
  {
    path: '/assets/services/layanan-umum-keluhan.webp',
    label: 'Pengobatan Keluhan Ringan',
    category: 'Umum'
  },
  {
    path: '/assets/services/layanan-umum-tekanan-darah.webp',
    label: 'Pemeriksaan Tekanan Darah',
    category: 'Umum'
  },
  {
    path: '/assets/services/layanan-umum-pemantauan.webp',
    label: 'Pemantauan & EKG Jantung',
    category: 'Umum'
  },
  {
    path: '/assets/services/layanan-umum-laboratorium.webp',
    label: 'Pemeriksaan Laboratorium Dasar',
    category: 'Umum'
  },
  {
    path: '/assets/services/layanan-umum-keterangan.webp',
    label: 'Surat Keterangan Sehat',
    category: 'Umum'
  },

  // KIA, Kebidanan & Kandungan
  {
    path: '/assets/services/asset_pemeriksaankehamilan.webp',
    label: 'Pemeriksaan Kehamilan (ANC)',
    category: 'Kebidanan'
  },
  {
    path: '/assets/services/layanan-umum-kehamilan.webp',
    label: 'Pemeriksaan Kehamilan Umum',
    category: 'Kebidanan'
  },
  {
    path: '/assets/services/asset_persalinan.webp',
    label: 'Persalinan Normal 24 Jam',
    category: 'Kebidanan'
  },
  {
    path: '/assets/services/asset-perawatannifas.webp',
    label: 'Perawatan Nifas & Menyusui',
    category: 'Kebidanan'
  },
  {
    path: '/assets/services/asset-index-6.webp',
    label: 'USG Kandungan / Ultrasonografi',
    category: 'Kebidanan'
  },
  {
    path: '/assets/services/asset_kb.webp',
    label: 'Pelayanan KB (Suntik, Pil, IUD, Implan)',
    category: 'KIA'
  },
  {
    path: '/assets/services/asset_konsul_kb.webp',
    label: 'Konsultasi KB & Reproduksi',
    category: 'KIA'
  },

  // Anak & Imunisasi
  {
    path: '/assets/services/asset_imunisasi.webp',
    label: 'Imunisasi Dasar & Lanjutan',
    category: 'Anak'
  },
  {
    path: '/assets/services/asset_tumbuhkembanganak.webp',
    label: 'Pemeriksaan Tumbuh Kembang Anak',
    category: 'Anak'
  },

  // Tindakan Medis
  {
    path: '/assets/services/dokumentasi/nebulizer.webp',
    label: 'Terapi Nebulizer Inhalasi',
    category: 'Tindakan'
  },
  {
    path: '/assets/services/ChatGPT_Image_Aug_14__2026__08_21_37_PM_1_eb18f970.webp',
    label: 'Layanan Khitanan / Sirkumsisi',
    category: 'Tindakan'
  },

  // Fasilitas & Ruangan
  {
    path: '/assets/services/fasilitas-apotek.webp',
    label: 'Instalasi Farmasi & Apotek',
    category: 'Fasilitas'
  },
  {
    path: '/assets/services/fasilitas-ruangtunggu.webp',
    label: 'Ruang Tunggu & Observasi',
    category: 'Fasilitas'
  },
  {
    path: '/assets/services/amanah-building-front.webp',
    label: 'Gedung Utama Klinik Amanah',
    category: 'Fasilitas'
  },
  {
    path: '/assets/services/amanah-pratama-healthcare.webp',
    label: 'Layanan Klinik Pratama',
    category: 'Fasilitas'
  }
];
