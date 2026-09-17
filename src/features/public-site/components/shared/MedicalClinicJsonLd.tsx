import { getBaseUrl } from '@/features/public-site/lib/helpers';
import { healthcareContactItems, healthcareFooter } from './data';

const availableServiceNames = [
  'Persalinan 24 Jam',
  'Khitan Modern',
  'Pemeriksaan Dokter Umum',
  'Pemeriksaan Kehamilan & Kebidanan',
  'Imunisasi & Tumbuh Kembang Anak'
];

const medicalSpecialties = ['Obstetric', 'Pediatric', 'PrimaryCare'];

export function MedicalClinicJsonLd() {
  const baseUrl = getBaseUrl();
  const phone = healthcareContactItems.find((item) => item.href.startsWith('tel:'))?.value;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': `${baseUrl}/#clinic`,
        name: 'Klinik Pratama Amanah Healthcare',
        alternateName: ['Klinik Amanah', 'Klinik Pratama Amanah'],
        url: baseUrl,
        logo: `${baseUrl}/healthcare/assets/images/logo_healthcare_1_7a4161db.webp`,
        image: [
          `${baseUrl}/healthcare/assets/images/amanah-pratama-healthcare.webp`,
          `${baseUrl}/healthcare/assets/images/amanah-building-front.webp`
        ],
        description:
          'Klinik Pratama Amanah Healthcare melayani dokter umum, kebidanan & persalinan 24 jam, imunisasi anak, dan khitan modern di Condongcatur, Sleman, Yogyakarta.',
        ...(phone ? { telephone: phone } : {}),
        address: healthcareFooter.address,
        sameAs: healthcareFooter.socialLinks.map((link) => link.href),
        medicalSpecialty: medicalSpecialties,
        availableService: availableServiceNames.map((name) => ({
          '@type': 'MedicalProcedure',
          name
        }))
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Klinik Pratama Amanah Healthcare',
        description:
          'Pelayanan kesehatan profesional, ramah, dan terpercaya untuk Anda dan keluarga di Yogyakarta.',
        publisher: {
          '@id': `${baseUrl}/#clinic`
        },
        inLanguage: 'id-ID'
      }
    ]
  };

  return (
    <script
      type='application/ld+json'
      // eslint-disable-next-line react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replaceAll('<', '\\u003c')
      }}
    />
  );
}
