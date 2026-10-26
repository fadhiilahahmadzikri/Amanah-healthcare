import { clientFetch } from '@/lib/client-fetch';

export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  prefix: string;
  description?: string | null;
  imageUrl?: string | null;
  specialtyCode?: string | null;
  medicalFlow?: 'general' | 'pregnancy' | 'immunization' | null;
  displayOrder: number;
  categoryId?: string;
  poliklinikId: string;
  poliklinikName: string;
  complaints: string[];
}

export interface ServiceCategoryCatalog {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  poliklinikId: string;
  poliklinikName: string;
  services: ServiceCatalogItem[];
}

export interface ServiceCatalogResponse {
  success: boolean;
  categories: ServiceCategoryCatalog[];
}

class CatalogService {
  private cache: ServiceCategoryCatalog[] | null = null;
  private cachePromise: Promise<ServiceCategoryCatalog[]> | null = null;

  async getServiceCatalog(forceRefresh = false): Promise<ServiceCategoryCatalog[]> {
    if (!forceRefresh && this.cache) {
      return this.cache;
    }

    if (!forceRefresh && this.cachePromise) {
      return this.cachePromise;
    }

    this.cachePromise = (async () => {
      try {
        const res = await clientFetch<ServiceCatalogResponse>('/api/v1/clinics/services/catalog', {
          method: 'GET'
        });

        const rawList = res.categories ?? [];
        const validCategories = rawList.filter(
          (c) => Array.isArray(c.services) && c.services.length > 0
        );
        this.cache = validCategories;
        return this.cache;
      } catch (error) {
        console.error('Failed to load clinic service catalog from backend:', error);
        throw error;
      } finally {
        this.cachePromise = null;
      }
    })();

    return this.cachePromise;
  }

  clearCache(): void {
    this.cache = null;
    this.cachePromise = null;
  }
}

export const catalogService = new CatalogService();
