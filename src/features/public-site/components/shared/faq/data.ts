import type {
  HealthcareFAQItem,
  HealthcareFAQJsonLd,
  HealthcareFAQPath,
  HealthcareFAQSectionCopy
} from './types';
import { getBaseUrl, getI18nPath } from '@/features/public-site/lib/helpers';

export const healthcareFAQSectionCopy = {
  eyebrow: 'FAQ',
  title: 'Pertanyaan yang Sering Diajukan',
  description:
    'Informasi singkat seputar layanan, fasilitas, lokasi, dan cara menghubungi Klinik Amanah Healthcare.'
} satisfies HealthcareFAQSectionCopy;

const commonFAQItems: HealthcareFAQItem[] = [
  {
    id: 'alamat-klinik-amanah',
    question: 'Di mana alamat Klinik Amanah Healthcare?',
    answer:
      'Klinik Amanah HealthCare (Persalinan 24 Jam) berlokasi di Jl. Anyelir 1 No.243, Perumnas Condong Catur, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281.'
  },
  {
    id: 'layanan-utama-klinik-amanah',
    question: 'Apa saja layanan utama yang tersedia di Klinik Amanah Healthcare?',
    answer:
      'Layanan utama meliputi dokter umum, pemeriksaan kesehatan dasar, EKG, pemeriksaan laboratorium, nebulizer, pemeriksaan kehamilan, USG, persalinan, perawatan nifas, imunisasi, keluarga berencana, dan konsultasi kesehatan reproduksi.'
  },
  {
    id: 'persalinan-24-jam',
    question: 'Apakah layanan persalinan tersedia 24 jam?',
    answer:
      'Klinik Amanah HealthCare dikenal sebagai fasilitas persalinan 24 jam. Untuk memastikan kesiapan layanan dan arahan kedatangan, pasien tetap disarankan menghubungi kontak klinik sebelum datang.'
  },
  {
    id: 'hubungi-klinik-amanah',
    question: 'Bagaimana cara menghubungi Klinik Amanah Healthcare?',
    answer:
      'Anda dapat menghubungi Klinik Amanah Healthcare melalui telepon di +62 813-9245-6664, email klinikamanahhealthcare@gmail.com, atau Instagram @amanahhealthcare.'
  },
  {
    id: 'perlu-janji-temu',
    question: 'Apakah perlu membuat janji sebelum datang?',
    answer:
      'Untuk konsultasi, pemeriksaan kehamilan, USG, dan layanan yang membutuhkan jadwal tenaga medis, sebaiknya hubungi klinik terlebih dahulu agar kunjungan lebih tertata.'
  },
  {
    id: 'pasien-keluarga',
    question: 'Apakah layanan Klinik Amanah cocok untuk keluarga?',
    answer:
      'Ya. Klinik Amanah Healthcare melayani kebutuhan kesehatan keluarga, mulai dari keluhan umum, pemeriksaan ibu hamil, persalinan, imunisasi, sampai pemantauan tumbuh kembang anak.'
  }
];

const pageFAQItems: HealthcareFAQItem[] = [
  {
    id: 'beranda-keunggulan',
    paths: ['/'],
    question: 'Apa keunggulan Klinik Amanah Healthcare?',
    answer:
      'Klinik Amanah Healthcare menekankan pelayanan yang ramah, profesional, mudah dijangkau, dan nyaman untuk kebutuhan kesehatan keluarga di area Condongcatur dan sekitarnya.'
  },
  {
    id: 'beranda-fasilitas',
    paths: ['/'],
    question: 'Fasilitas apa yang bisa ditemukan di Klinik Amanah?',
    answer:
      'Fasilitas yang ditampilkan meliputi ruang persalinan 24 jam, ruang tunggu nyaman, apotek, dan area baby care untuk mendukung pengalaman berobat yang lebih praktis.'
  },
  {
    id: 'tentang-komitmen',
    paths: ['/tentang-kami'],
    question: 'Apa komitmen Klinik Amanah dalam melayani pasien?',
    answer:
      'Klinik Amanah berkomitmen menghadirkan pelayanan kesehatan yang ramah, mudah dipahami, profesional, dan dekat dengan kebutuhan setiap pasien serta keluarga.'
  },
  {
    id: 'tentang-pendekatan-pasien',
    paths: ['/tentang-kami'],
    question: 'Bagaimana pendekatan Klinik Amanah terhadap pasien?',
    answer:
      'Pendekatan layanan dibuat personal dan komunikatif. Pasien dibantu memahami keluhan, pilihan pemeriksaan, dan arahan perawatan sesuai kondisi masing-masing.'
  },
  {
    id: 'dokter-umum-layanan',
    paths: ['/fasilitas'],
    question: 'Apa saja layanan dokter umum di Klinik Amanah?',
    answer:
      'Layanan dokter umum mencakup pemeriksaan dokter, pengobatan keluhan ringan, cek tekanan darah, EKG, laboratorium, nebulizer, konsultasi kesehatan, dan surat keterangan sehat.'
  },
  {
    id: 'layanan-bidan',
    paths: ['/fasilitas'],
    question: 'Apa saja layanan bidan dan kesehatan ibu anak?',
    answer:
      'Layanan bidan meliputi pemeriksaan kehamilan, USG, persalinan, perawatan nifas, imunisasi, keluarga berencana, pemeriksaan tumbuh kembang, dan konsultasi kesehatan reproduksi.'
  },
  {
    id: 'pemeriksaan-usg',
    paths: ['/fasilitas'],
    question: 'Apakah tersedia pemeriksaan USG?',
    answer:
      'Ya, Klinik Amanah menyediakan fasilitas USG sebagai pemeriksaan penunjang untuk membantu evaluasi kondisi medis sesuai kebutuhan pasien.'
  },
  {
    id: 'surat-keterangan-sehat',
    paths: ['/fasilitas'],
    question: 'Apakah bisa membuat surat keterangan sehat?',
    answer:
      'Ya, tersedia layanan surat keterangan sehat setelah pemeriksaan dasar, sesuai kebutuhan administrasi sekolah, kerja, atau perjalanan.'
  },
  {
    id: 'kontak-jadwal',
    paths: ['/kontak'],
    question: 'Bagaimana cara menanyakan jadwal layanan atau dokter?',
    answer:
      'Jadwal layanan dapat ditanyakan melalui telepon, email, atau Instagram resmi Klinik Amanah Healthcare agar tim klinik dapat memberikan informasi yang paling sesuai.'
  },
  {
    id: 'kontak-petunjuk-arah',
    paths: ['/kontak'],
    question: 'Bagaimana cara mendapatkan petunjuk arah ke Klinik Amanah?',
    answer:
      'Gunakan tautan Petunjuk Arah pada footer untuk membuka Google Maps menuju Klinik Amanah HealthCare (Persalinan 24 Jam) di Jl. Anyelir 1 No.243.'
  }
];

export const healthcareFAQItems: HealthcareFAQItem[] = [...commonFAQItems, ...pageFAQItems];

export function getHealthcareFAQItems(activePath: string) {
  const normalizedPath = normalizeFAQPath(activePath);

  return healthcareFAQItems.filter((item) => {
    if (!item.paths) {
      return true;
    }

    return item.paths.includes(normalizedPath);
  });
}

export function createHealthcareFAQJsonLd({
  activePath,
  items,
  locale
}: {
  activePath: string;
  items: HealthcareFAQItem[];
  locale: string;
}): HealthcareFAQJsonLd {
  const normalizedPath = normalizeFAQPath(activePath);
  const url = new URL(getI18nPath(normalizedPath, locale), getBaseUrl()).toString();

  return {
    '@context': 'https://schema.org',
    '@id': `${url}#faq`,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      },
      name: item.question
    }))
  };
}

function normalizeFAQPath(activePath: string): HealthcareFAQPath {
  if (
    activePath === '/' ||
    activePath === '/tentang-kami' ||
    activePath === '/fasilitas' ||
    activePath === '/kontak'
  ) {
    return activePath;
  }

  if (activePath === '/layanan') {
    return '/fasilitas';
  }

  return '/';
}
