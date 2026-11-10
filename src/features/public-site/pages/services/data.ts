import type { FacilitySectionData, ServiceHeroData } from './types';

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

export const facilitiesSectionData: FacilitySectionData = {
  eyebrow: 'Fasilitas',
  title: 'Ruang Nyaman untuk Anda dan Keluarga',
  description:
    'Klinik Amanah menyediakan fasilitas yang nyaman dan lengkap untuk mendukung kebutuhan kesehatan Anda dan keluarga.',
  items: []
};
