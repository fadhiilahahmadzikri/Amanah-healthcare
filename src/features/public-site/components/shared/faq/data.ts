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

export const healthcareFAQItems: HealthcareFAQItem[] = [];

export function getHealthcareFAQItems(_activePath: string): HealthcareFAQItem[] {
  return [];
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
