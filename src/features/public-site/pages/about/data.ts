import type {
  AboutHeroData,
  AboutSlide,
  AboutVisionMissionData,
  AboutVisualBandData,
  EditorialStoryData,
  PixelFeatureIcon
} from './types';

export const aboutPixelIcons: PixelFeatureIcon[] = [
  {
    alt: 'Ikon kotak P3K pixel art',
    id: 'pixel-kotak-p3k',
    name: 'Kotak P3K',
    src: '/healthcare/assets/svg/kotak-p3k-pixel.svg'
  },
  {
    alt: 'Ikon kapsul obat medis pixel art',
    id: 'pixel-obat',
    name: 'Kapsul Medis',
    src: '/healthcare/assets/svg/obat-pixel.svg'
  },
  {
    alt: 'Ikon bunga herbal pixel art',
    id: 'pixel-bunga-herbal',
    name: 'Bunga Herbal',
    src: '/healthcare/assets/svg/bunga-herbal-pixel.svg'
  }
];

export const aboutHeroData: AboutHeroData = {
  headline: 'Sehat Lebih Mudah, Nyaman, dan Terpercaya Bersama Kami.',
  icons: aboutPixelIcons,
  initialDescription:
    'Kenali Klinik Amanah Healthcare lebih dekat, dan temukan cara kami hadir untuk kesehatan Anda dan keluarga.',
  description:
    'Kami berkomitmen memberikan pengalaman pelayanan kesehatan yang mudah dipahami dan dekat dengan kebutuhan setiap pasien.'
};

export const aboutVisualBandData: AboutVisualBandData = {
  image: {
    src: '/healthcare/assets/images/about-hero-doctor.webp',
    alt: 'Dokter profesional Klinik Amanah Pratama Healthcare tersenyum ramah siap melayani keluarga Anda'
  }
};

export const aboutSlides = [
  {
    eyebrow: 'Cara Kami Melayani',
    title: 'Ramah, Nyaman, dan Mengayomi',
    description:
      'Setiap pasien kami perlakukan seperti keluarga sendiri, mulai dari pendaftaran hingga konsultasi dengan dokter. Kebersihan klinik dijaga ketat agar Anda tetap nyaman selama berkunjung.',
    image: {
      src: '/healthcare/assets/images/asset-index-1.webp',
      alt: 'Cara Kami Melayani - Ramah, Nyaman, dan Mengayomi'
    }
  },
  {
    eyebrow: 'Tujuan Kami',
    title: 'Menjadi Pilihan Utama Warga Sleman',
    description:
      'Kami ingin menjadi tempat berobat yang paling Anda percaya — mulai dari pemeriksaan kesehatan umum, konsultasi KB, hingga layanan ibu dan anak, semua ditangani dengan cepat dan tepat.',
    image: {
      src: '/healthcare/assets/images/asset-index-2.webp',
      alt: 'Tujuan Kami - Menjadi Pilihan Utama Warga Sleman'
    }
  },
  {
    eyebrow: 'Cakupan Pelayanan',
    title: 'Melayani Pasien BPJS dan Umum',
    description:
      'Soal biaya, Anda tidak perlu khawatir. Klinik Amanah resmi melayani pasien BPJS Kesehatan maupun umum, dengan proses administrasi yang cepat dan tidak berbelit.',
    image: {
      src: '/healthcare/assets/images/asset-index-3.webp',
      alt: 'Cakupan Pelayanan - Melayani Pasien BPJS dan Umum'
    }
  },
  {
    eyebrow: 'Fasilitas & Layanan',
    title: 'Persalinan 24 Jam & Beragam Fasilitas',
    description:
      'Layanan persalinan normal kami siagakan 24 jam penuh. Klinik ini juga dilengkapi USG kandungan, pemeriksaan laboratorium, khitan laser, serta jadwal vaksinasi rutin untuk bayi dan anak.',
    image: {
      src: '/healthcare/assets/images/asset-index-4.webp',
      alt: 'Fasilitas & Layanan - Persalinan 24 Jam & Beragam Fasilitas'
    }
  },
  {
    eyebrow: 'Profil Klinik',
    title: 'Klinik Kesehatan Keluarga di Condongcatur',
    description:
      'Klinik Pratama Amanah berlokasi di Jalan Anyelir, Perumnas Condongcatur, Sleman, melayani pemeriksaan dokter umum, konsultasi kandungan, dan kebidanan untuk kebutuhan kesehatan harian keluarga Anda.',
    image: {
      src: '/healthcare/assets/images/asset-index-5.webp',
      alt: 'Profil Klinik - Klinik Kesehatan Keluarga di Condongcatur'
    }
  }
] satisfies AboutSlide[];

export const aboutVisionMissionData: AboutVisionMissionData = {
  vision: {
    title: 'Visi',
    description:
      'Menghadirkan pelayanan kesehatan yang ramah, profesional, mudah diakses, dan terpercaya, serta terus berkomitmen meningkatkan kualitas kesehatan masyarakat.',
    icon: {
      alt: 'Ikon hati medis pixel art',
      id: 'pixel-visi-hati',
      name: 'Hati Sehat',
      src: '/healthcare/assets/svg/hati-sehat-pixel.svg'
    }
  },
  mission: {
    title: 'Misi',
    description:
      'Memberikan pelayanan kesehatan yang profesional, ramah, dan berkualitas, membangun kepercayaan melalui komunikasi yang baik, serta terus meningkatkan kualitas pelayanan dan kompetensi tenaga kesehatan.',
    icon: {
      alt: 'Ikon stetoskop medis pixel art',
      id: 'pixel-misi-stetoskop',
      name: 'Stetoskop Medis',
      src: '/healthcare/assets/svg/stetoskop-pixel.svg'
    }
  }
};

export const aboutEditorialStories: EditorialStoryData[] = [
  {
    id: 'editorial-story-approach',
    title: 'Hadir lebih dekat untuk kesehatan keluarga.',
    description:
      'Klinik Amanah Pratama Healthcare hadir sebagai mitra kesehatan keluarga yang memberikan pelayanan dengan pendekatan yang ramah, profesional, dan mudah dipahami. Kami ingin menciptakan suasana pelayanan yang nyaman sehingga setiap pasien dapat merasa didengar, dipahami, dan mendapatkan perhatian yang sesuai dengan kebutuhannya.',
    image: {
      src: '/healthcare/assets/images/asset-index-1.webp',
      alt: 'Konsultasi medis dan pelayanan penuh perhatian tenaga kesehatan Klinik Amanah Pratama Healthcare'
    },
    imagePosition: 'left'
  },
  {
    id: 'editorial-story-personalized',
    title: 'Setiap keluarga punya kebutuhan yang berbeda.',
    description:
      'Kami memahami bahwa setiap keluarga memiliki kebutuhan, kondisi, dan perjalanan kesehatan yang berbeda. Karena itu, pelayanan kami dirancang untuk memberikan perhatian secara personal, dengan proses yang mudah dipahami dan suasana yang nyaman. Kami ingin menjadi bagian dari perjalanan kesehatan keluarga melalui pelayanan yang ramah, profesional, dan penuh kepedulian.',
    image: {
      src: '/healthcare/assets/images/asset-index-2.webp',
      alt: 'Pelayanan kesehatan yang berorientasi pada kenyamanan pasien dan keluarga di Klinik Amanah Pratama Healthcare'
    },
    imagePosition: 'right'
  }
];
