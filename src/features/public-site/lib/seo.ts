import type { Metadata } from 'next';

export const defaultOgImages = [
  {
    url: '/healthcare/opengraph-image.webp',
    width: 1200,
    height: 630,
    type: 'image/webp',
    alt: 'Klinik Pratama Amanah Healthcare - Klinik Persalinan dan Umum Yogyakarta'
  },
  {
    url: '/healthcare/assets/images/amanah-pratama-healthcare.webp',
    width: 1804,
    height: 872,
    type: 'image/webp',
    alt: 'Klinik Pratama Amanah Healthcare Yogyakarta'
  }
];

export const defaultTwitterCard: Metadata['twitter'] = {
  card: 'summary_large_image',
  images: ['/healthcare/twitter-image.webp']
};
