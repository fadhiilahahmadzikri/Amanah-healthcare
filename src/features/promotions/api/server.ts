import 'server-only';

import { paths } from '@/server/api/paths';
import type { PublicPromotion } from '../types/promotions.types';

export async function getPublicPromotionByIdOnServer(
  id: string
): Promise<PublicPromotion | null> {
  try {
    const res = await fetch(paths.promotions.publicById(id), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as PublicPromotion;
    }
    return json as PublicPromotion;
  } catch {
    return null;
  }
}

export async function getLivePublicPromotionsOnServer(): Promise<PublicPromotion[]> {
  try {
    const res = await fetch(paths.promotions.publicList(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    if (json && typeof json === 'object' && 'data' in json && Array.isArray(json.data)) {
      return json.data as PublicPromotion[];
    }
    return Array.isArray(json) ? (json as PublicPromotion[]) : [];
  } catch {
    return [];
  }
}
