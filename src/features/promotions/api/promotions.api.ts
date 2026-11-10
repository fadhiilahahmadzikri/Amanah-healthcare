import { clientFetch } from '@/lib/client-fetch';
import type {
  AdminPromotion,
  CreatePromotionPayload,
  PromoGalleryItem,
  PublicPromotion,
  QueryAdminPromotionsParams,
  UpdatePromotionPayload,
} from '../types/promotions.types';

const PUBLIC_PROMOTIONS_TIMEOUT_MS = 3000;

export const promotionsApi = {
  /**
   * Fetches active public promotions with a strict 3-second timeout.
   * If network fails or times out, it gracefully falls back to empty array
   * to guarantee the website never breaks.
   */
  async getPublicPromotions(): Promise<PublicPromotion[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PUBLIC_PROMOTIONS_TIMEOUT_MS);

    try {
      const response = await fetch('/api/v1/public/promotions', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return [];
      }

      const res = await response.json();
      if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
        return res.data as PublicPromotion[];
      }
      return Array.isArray(res) ? (res as PublicPromotion[]) : [];
    } catch {
      // Silent failure fallback per specification (no broken page, no blocking)
      return [];
    } finally {
      clearTimeout(timer);
    }
  },

  /**
   * Admin operations for managing clinic promotions
   */
  async getAdminPromotions(
    params?: QueryAdminPromotionsParams
  ): Promise<AdminPromotion[]> {
    const query: Record<string, unknown> = {};
    if (params?.status && params.status !== 'all') query.status = params.status;
    if (params?.search) query.search = params.search;
    if (params?.serviceId) query.serviceId = params.serviceId;
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;

    const res = await clientFetch<
      { data?: AdminPromotion[]; total?: number } | AdminPromotion[]
    >('/api/v1/admin/promotions', {
      method: 'GET',
      query,
    });
    if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  },

  async getAdminPromotionById(id: string): Promise<AdminPromotion> {
    return clientFetch<AdminPromotion>(`/api/v1/admin/promotions/${id}`, {
      method: 'GET',
    });
  },

  async createPromotion(
    payload: CreatePromotionPayload
  ): Promise<AdminPromotion> {
    return clientFetch<AdminPromotion>('/api/v1/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updatePromotion(
    id: string,
    payload: UpdatePromotionPayload
  ): Promise<AdminPromotion> {
    return clientFetch<AdminPromotion>(`/api/v1/admin/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deletePromotion(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return clientFetch<{ success: boolean; message: string }>(
      `/api/v1/admin/promotions/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Loads the static gallery manifest generated at build time
   */
  async getPromoGalleryManifest(): Promise<PromoGalleryItem[]> {
    try {
      const response = await fetch('/promo/manifest.json');
      if (!response.ok) return [];
      const items = await response.json();
      return Array.isArray(items) ? (items as PromoGalleryItem[]) : [];
    } catch {
      return [];
    }
  },
};
