import { getBaseUrl } from '@/features/public-site/lib/helpers';

export function MedicalClinicJsonLd() {
  const baseUrl = getBaseUrl();

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
        telephone: '+62-274-885775',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jl. Anyelir No. 1, Perumnas Condong Catur',
          addressLocality: 'Sleman',
          addressRegion: 'D.I. Yogyakarta',
          postalCode: '55283',
          addressCountry: 'ID'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -7.7618,
          longitude: 110.4082
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday'
            ],
            opens: '00:00',
            closes: '23:59'
          }
        ],
        medicalSpecialty: ['Obstetric', 'Pediatric', 'PrimaryCare'],
        availableService: [
          {
            '@type': 'MedicalProcedure',
            name: 'Persalinan 24 Jam'
          },
          {
            '@type': 'MedicalProcedure',
            name: 'Khitan Modern'
          },
          {
            '@type': 'MedicalProcedure',
            name: 'Pemeriksaan Dokter Umum'
          },
          {
            '@type': 'MedicalProcedure',
            name: 'Pemeriksaan Kehamilan & Kebidanan'
          },
          {
            '@type': 'MedicalProcedure',
            name: 'Imunisasi & Tumbuh Kembang Anak'
          }
        ]
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
