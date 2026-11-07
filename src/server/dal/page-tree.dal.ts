import 'server-only';
import { cache } from 'react';
import { getBaseApiUrl } from '@/server/api/base-url';
import { getAccessTokenCookie } from '@/server/auth/token-store';
import type { DynamicPageNode } from '@/lib/rbac/navigation';

/**
 * Fetches the canonical application page hierarchy directly from the backend API during SSR.
 * Cached per request cycle via React cache().
 */
export const getServerPageTree = cache(
  async (audience?: string): Promise<DynamicPageNode[]> => {
    try {
      const baseUrl = getBaseApiUrl();
      const accessToken = await getAccessTokenCookie();
      const audienceQuery = audience ? `?audience=${encodeURIComponent(audience)}` : '';
      const url = `${baseUrl}/api/v1/admin/pages/tree${audienceQuery}`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        cache: 'no-store'
      });

      if (!res.ok) {
        return [];
      }

      return (await res.json()) as DynamicPageNode[];
    } catch {
      return [];
    }
  }
);
