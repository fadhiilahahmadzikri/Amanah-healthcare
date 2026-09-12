export type HealthcareFAQPath = '/' | '/tentang-kami' | '/fasilitas' | '/kontak';

export type HealthcareFAQItem = {
  answer: string;
  id: string;
  paths?: HealthcareFAQPath[];
  question: string;
};

export type HealthcareFAQJsonLd = {
  '@context': 'https://schema.org';
  '@id': string;
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
    name: string;
  }[];
};

export type HealthcareFAQSectionCopy = {
  description: string;
  eyebrow: string;
  title: string;
};
