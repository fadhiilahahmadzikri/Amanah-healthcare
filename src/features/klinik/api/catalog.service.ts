import { clientFetch } from '@/lib/client-fetch';
import {
  ServiceCatalogResponseSchema,
  type ServiceCatalogItem,
  type ServiceCategoryCatalog,
  type ServiceCatalogResponse
} from '../schemas/service-catalog.schema';

export type { ServiceCatalogItem, ServiceCategoryCatalog, ServiceCatalogResponse };

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
        const rawRes = await clientFetch<unknown>('/api/v1/clinics/services/catalog', {
          method: 'GET'
        });

        // Strict Zod runtime contract validation (fail-fast SSOT)
        const parsed = ServiceCatalogResponseSchema.parse(rawRes);
        const rawList = parsed.categories ?? [];
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
