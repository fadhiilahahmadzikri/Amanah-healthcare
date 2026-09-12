import type { Metadata } from 'next';
import { reviewsPageContent } from '@/features/public-site/pages/reviews/data';
import { getBaseUrl, getI18nPath } from '@/features/public-site/lib/helpers';
import { defaultOgImages, defaultTwitterCard } from '@/features/public-site/lib/seo';

type PublicSiteMetadataOptions = {
  description: string;
  openGraphDescription?: string;
  openGraphTitle?: string;
  path: string;
  title: string;
};

function createPublicSiteMetadata({
  description,
  openGraphDescription,
  openGraphTitle,
  path,
  title
}: PublicSiteMetadataOptions): Metadata {
  const canonical = getI18nPath(path, 'id');
  const socialTitle = openGraphTitle ?? title;
  const socialDescription = openGraphDescription ?? description;

  return {
    metadataBase: new URL(getBaseUrl()),
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: 'Klinik Pratama Amanah Healthcare',
      title: socialTitle,
      description: socialDescription,
      url: canonical,
      images: defaultOgImages
    },
    twitter: {
      ...defaultTwitterCard,
      title: socialTitle,
      description: socialDescription
    }
  };
}

export const homeMetadata = createPublicSiteMetadata({
  title: 'Klinik Pratama Amanah Healthcare - Klinik Persalinan dan Umum Yogyakarta',
  description:
    'Layanan dokter umum, kebidanan & persalinan 24 jam, imunisasi anak, dan khitan ramah trauma di Condongcatur, Sleman, Yogyakarta.',
  openGraphDescription:
    'Layanan dokter umum, kebidanan & persalinan 24 jam, imunisasi, dan khitan anak ramah trauma di Condongcatur, Sleman, Yogyakarta.',
  path: '/'
});

export const aboutMetadata = createPublicSiteMetadata({
  title: 'Tentang Kami',
  description:
    'Kenali Klinik Amanah Pratama Healthcare lebih dekat. Pelayanan kesehatan yang ramah, profesional, nyaman, dan terpercaya untuk keluarga Anda di Yogyakarta.',
  openGraphTitle: 'Tentang Kami - Klinik Amanah Pratama Healthcare',
  openGraphDescription:
    'Kenali Klinik Amanah Pratama Healthcare lebih dekat. Pelayanan kesehatan ramah, profesional, dan berdedikasi untuk keluarga Anda.',
  path: '/tentang-kami'
});

export const servicesMetadata = createPublicSiteMetadata({
  title: 'Layanan Medis & Kesehatan',
  description:
    'Pelayanan dokter umum, kebidanan & persalinan 24 jam, khitan modern, dan imunisasi profesional di Klinik Amanah Yogyakarta.',
  openGraphTitle: 'Layanan Medis & Kesehatan - Klinik Amanah Healthcare',
  openGraphDescription:
    'Pelayanan dokter umum, kebidanan & persalinan 24 jam, khitan modern, dan imunisasi profesional untuk keluarga Anda.',
  path: '/layanan'
});

export const facilitiesMetadata = createPublicSiteMetadata({
  title: 'Fasilitas Medis',
  description:
    'Fasilitas ruang tindakan, apotek terpadu, USG kehamilan, ruang bersalin 24 jam, dan ruang tunggu ramah anak di Klinik Amanah Yogyakarta.',
  openGraphTitle: 'Fasilitas Medis - Klinik Amanah Healthcare',
  openGraphDescription:
    'Fasilitas kesehatan modern, higienis, dan nyaman untuk menunjang kenyamanan pemulihan Anda dan keluarga.',
  path: '/fasilitas'
});

export const testimonialsMetadata = createPublicSiteMetadata({
  title: 'Testimoni Pasien',
  description:
    'Cerita dan pengalaman nyata para keluarga, ayah, bunda, dan si kecil saat menjalani perawatan medis dan persalinan di Klinik Amanah Healthcare Yogyakarta.',
  openGraphTitle: 'Testimoni Pasien - Klinik Amanah Healthcare',
  openGraphDescription:
    'Cerita nyata para pasien yang merasakan langsung pelayanan hangat, profesional, dan bersahabat di Klinik Amanah.',
  path: '/testimoni'
});

export const reviewsMetadata = createPublicSiteMetadata({
  title: 'Ulasan Pasien',
  description: `Baca ${reviewsPageContent.summary.totalReviewsClaimed} Google Maps untuk ${reviewsPageContent.summary.placeTitle}.`,
  openGraphTitle: 'Ulasan Pasien - Klinik Amanah Healthcare',
  openGraphDescription: `Rating ${reviewsPageContent.summary.overallRatingLabel}/5 dari Google Maps untuk ${reviewsPageContent.summary.placeTitle}.`,
  path: '/ulasan'
});

export const contactMetadata = createPublicSiteMetadata({
  title: 'Kontak Kami',
  description:
    'Hubungi Klinik Amanah Healthcare Yogyakarta untuk informasi layanan, jadwal dokter, reservasi kunjungan, dan konsultasi kesehatan keluarga.',
  openGraphTitle: 'Kontak Kami - Klinik Amanah Healthcare',
  openGraphDescription:
    'Hubungi Klinik Amanah Healthcare Yogyakarta untuk informasi layanan, jadwal dokter, dan reservasi janji temu.',
  path: '/kontak'
});
