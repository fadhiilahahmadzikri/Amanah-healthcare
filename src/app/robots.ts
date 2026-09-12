import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/features/public-site/lib/helpers';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/auth/', '/api/', '/monitoring/']
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
