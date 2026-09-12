import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Klinik Pratama Amanah Healthcare',
    short_name: 'Amanah Healthcare',
    description:
      'Layanan dokter umum, persalinan 24 jam, kebidanan, imunisasi anak, dan khitan modern di Condongcatur, Sleman, Yogyakarta.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#13195c',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}
