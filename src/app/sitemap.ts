import type { MetadataRoute } from 'next';
import { getBaseUrl, getI18nPath } from '@/features/public-site/lib/helpers';

const marketingRoutes: Array<{
  path: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/tentang-kami', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/layanan', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/fasilitas', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/testimoni', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/ulasan', changeFrequency: 'daily', priority: 0.9 },
  { path: '/kontak', changeFrequency: 'monthly', priority: 0.8 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  return marketingRoutes.map((route) => {
    const path = getI18nPath(route.path, 'id');
    const url = `${baseUrl}${path}`;

    return {
      url,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          'id-ID': url
        }
      }
    };
  });
}
