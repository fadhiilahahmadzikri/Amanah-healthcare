import type { FacilityResource } from '../types/clinic-essentials.types';

export type FacetType = 'unit' | 'status' | 'promo-status' | 'faq-category';

export interface ResourceToolbarConfig {
  searchPlaceholder: string;
  searchAriaLabel: string;
  createButtonLabel: string;
  createButtonTitle: string;
  supportedFacets: FacetType[];
  getDisabledState?: (context: {
    unitTypesCount: number;
    unitsCount: number;
    categoriesCount: number;
  }) => { isDisabled: boolean; reason?: string };
}

export const CLINIC_ESSENTIALS_TOOLBAR_REGISTRY: Record<FacilityResource, ResourceToolbarConfig> = {
  'unit-types': {
    searchPlaceholder: 'Cari klasifikasi fasilitas (nama, kode)...',
    searchAriaLabel: 'Cari klasifikasi fasilitas',
    createButtonLabel: 'Tambah Klasifikasi',
    createButtonTitle: 'Tambah klasifikasi fasilitas baru',
    supportedFacets: ['status'],
  },
  'units': {
    searchPlaceholder: 'Cari poliklinik & departemen (nama, kode, lantai)...',
    searchAriaLabel: 'Cari poliklinik dan departemen',
    createButtonLabel: 'Tambah Poliklinik',
    createButtonTitle: 'Tambah unit poliklinik baru',
    supportedFacets: ['status'],
  },
  'rooms': {
    searchPlaceholder: 'Cari ruang periksa (nama, kode, lokasi)...',
    searchAriaLabel: 'Cari ruang periksa',
    createButtonLabel: 'Tambah Ruang Periksa',
    createButtonTitle: 'Tambah ruang periksa baru',
    supportedFacets: ['unit', 'status'],
    getDisabledState: ({ unitsCount }) => ({
      isDisabled: unitsCount === 0,
      reason: 'Tambah unit poliklinik terlebih dahulu',
    }),
  },
  'categories': {
    searchPlaceholder: 'Cari kelompok layanan (nama, kode, prefix)...',
    searchAriaLabel: 'Cari kelompok layanan',
    createButtonLabel: 'Tambah Kelompok',
    createButtonTitle: 'Tambah kelompok layanan baru',
    supportedFacets: ['unit', 'status'],
    getDisabledState: ({ unitsCount }) => ({
      isDisabled: unitsCount === 0,
      reason: 'Tambah unit poliklinik terlebih dahulu',
    }),
  },
  'services': {
    searchPlaceholder: 'Cari service & tindakan medis (nama, kode, deskripsi)...',
    searchAriaLabel: 'Cari service medis',
    createButtonLabel: 'Tambah Service',
    createButtonTitle: 'Tambah service medis baru',
    supportedFacets: ['unit', 'status'],
    getDisabledState: ({ categoriesCount }) => ({
      isDisabled: categoriesCount === 0,
      reason: 'Tambah kelompok layanan terlebih dahulu',
    }),
  },
  'facilities': {
    searchPlaceholder: 'Cari fasilitas unggulan (judul, layanan)...',
    searchAriaLabel: 'Cari fasilitas unggulan',
    createButtonLabel: 'Tambah Fasilitas',
    createButtonTitle: 'Tambah fasilitas unggulan landing page',
    supportedFacets: ['status'],
  },
  'faqs': {
    searchPlaceholder: 'Cari pertanyaan FAQ atau solusi langkah...',
    searchAriaLabel: 'Cari pertanyaan FAQ',
    createButtonLabel: 'Tambah FAQ',
    createButtonTitle: 'Tambah pertanyaan FAQ baru',
    supportedFacets: ['faq-category', 'status'],
  },
  'promotions': {
    searchPlaceholder: 'Cari promosi, voucher, atau pengumuman...',
    searchAriaLabel: 'Cari promosi aktif',
    createButtonLabel: 'Tambah Promosi',
    createButtonTitle: 'Tambah promosi atau pengumuman baru',
    supportedFacets: ['promo-status'],
  },
  'relationships': {
    searchPlaceholder: 'Cari tipe relasi pasien (nama, kode)...',
    searchAriaLabel: 'Cari tipe relasi pasien',
    createButtonLabel: 'Tambah Relasi',
    createButtonTitle: 'Tambah relasi pasien baru',
    supportedFacets: ['status'],
  },
  'blood-types': {
    searchPlaceholder: 'Cari simbol golongan darah...',
    searchAriaLabel: 'Cari golongan darah',
    createButtonLabel: 'Tambah Golongan Darah',
    createButtonTitle: 'Tambah simbol golongan darah baru',
    supportedFacets: ['status'],
  },
  'education-levels': {
    searchPlaceholder: 'Cari jenjang pendidikan formal...',
    searchAriaLabel: 'Cari jenjang pendidikan',
    createButtonLabel: 'Tambah Pendidikan',
    createButtonTitle: 'Tambah jenjang pendidikan baru',
    supportedFacets: ['status'],
  },
  'religions': {
    searchPlaceholder: 'Cari data agama resmi...',
    searchAriaLabel: 'Cari agama resmi',
    createButtonLabel: 'Tambah Agama',
    createButtonTitle: 'Tambah data agama resmi baru',
    supportedFacets: ['status'],
  },
  'occupations': {
    searchPlaceholder: 'Cari nama profesi & pekerjaan...',
    searchAriaLabel: 'Cari nama pekerjaan',
    createButtonLabel: 'Tambah Pekerjaan',
    createButtonTitle: 'Tambah nama pekerjaan baru',
    supportedFacets: ['status'],
  },
};
