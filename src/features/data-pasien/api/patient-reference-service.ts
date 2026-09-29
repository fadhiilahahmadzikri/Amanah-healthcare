import { clientFetch } from '@/lib/client-fetch';
import type { RegistrationProvince } from '../constants/registration-options';

export interface ReferenceOptionItem {
  label: string;
  value: string;
  description?: string;
}

export interface RegionReferenceItem {
  id: string;
  name: string;
  label: string;
  value: string;
  provinceId?: string;
  regencyId?: string;
  districtId?: string;
}

export interface PatientFormReferenceData {
  bloodTypes: ReferenceOptionItem[];
  genders: ReferenceOptionItem[];
  relationships: ReferenceOptionItem[];
  provinces?: RegionReferenceItem[];
  regions?: RegistrationProvince[];
  occupations: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    displayOrder: number;
  }[];
}

class PatientReferenceService {
  private cache: PatientFormReferenceData | null = null;
  private cachePromise: Promise<PatientFormReferenceData> | null = null;

  // Region caches
  private provincesCache: RegionReferenceItem[] | null = null;
  private readonly regenciesCache = new Map<string, RegionReferenceItem[]>();
  private readonly districtsCache = new Map<string, RegionReferenceItem[]>();
  private readonly villagesCache = new Map<string, RegionReferenceItem[]>();

  async getFormReferenceOptions(forceRefresh = false): Promise<PatientFormReferenceData> {
    if (!forceRefresh && this.cache) {
      return this.cache;
    }

    if (!forceRefresh && this.cachePromise) {
      return this.cachePromise;
    }

    this.cachePromise = (async () => {
      try {
        const res = await clientFetch<{
          success?: boolean;
          data: PatientFormReferenceData;
        }>('/api/v1/patients/reference/options');

        const data = res?.data ?? res;
        this.cache = data as PatientFormReferenceData;
        if (this.cache.provinces && this.cache.provinces.length > 0) {
          this.provincesCache = this.cache.provinces;
        }
        return this.cache;
      } catch (error) {
        console.error('Failed to load patient form references from backend:', error);
        throw error;
      } finally {
        this.cachePromise = null;
      }
    })();

    return this.cachePromise;
  }

  async getProvinces(): Promise<RegionReferenceItem[]> {
    if (this.provincesCache && this.provincesCache.length > 0) {
      return this.provincesCache;
    }

    try {
      const res = await clientFetch<{
        success?: boolean;
        data: RegionReferenceItem[];
      }>('/api/v1/patients/reference/provinces');

      const items = res?.data ?? (Array.isArray(res) ? res : []);
      this.provincesCache = items;
      return items;
    } catch (error) {
      console.error('Failed to load provinces from backend:', error);
      return [];
    }
  }

  async getRegencies(provinceId: string): Promise<RegionReferenceItem[]> {
    if (!provinceId) return [];

    const cached = this.regenciesCache.get(provinceId);
    if (cached) return cached;

    try {
      const res = await clientFetch<{
        success?: boolean;
        data: RegionReferenceItem[];
      }>(`/api/v1/patients/reference/regencies?provinceId=${encodeURIComponent(provinceId)}`);

      const items = res?.data ?? (Array.isArray(res) ? res : []);
      this.regenciesCache.set(provinceId, items);
      return items;
    } catch (error) {
      console.error(`Failed to load regencies for province ${provinceId} from backend:`, error);
      return [];
    }
  }

  async getDistricts(regencyId: string): Promise<RegionReferenceItem[]> {
    if (!regencyId) return [];

    const cached = this.districtsCache.get(regencyId);
    if (cached) return cached;

    try {
      const res = await clientFetch<{
        success?: boolean;
        data: RegionReferenceItem[];
      }>(`/api/v1/patients/reference/districts?regencyId=${encodeURIComponent(regencyId)}`);

      const items = res?.data ?? (Array.isArray(res) ? res : []);
      this.districtsCache.set(regencyId, items);
      return items;
    } catch (error) {
      console.error(`Failed to load districts for regency ${regencyId} from backend:`, error);
      return [];
    }
  }

  async getVillages(districtId: string): Promise<RegionReferenceItem[]> {
    if (!districtId) return [];

    const cached = this.villagesCache.get(districtId);
    if (cached) return cached;

    try {
      const res = await clientFetch<{
        success?: boolean;
        data: RegionReferenceItem[];
      }>(`/api/v1/patients/reference/villages?districtId=${encodeURIComponent(districtId)}`);

      const items = res?.data ?? (Array.isArray(res) ? res : []);
      this.villagesCache.set(districtId, items);
      return items;
    } catch (error) {
      console.error(`Failed to load villages for district ${districtId} from backend:`, error);
      return [];
    }
  }

  getCachedProvinces(): RegionReferenceItem[] {
    return this.provincesCache ?? [];
  }

  getCachedRegencies(provinceId: string): RegionReferenceItem[] | undefined {
    return this.regenciesCache.get(provinceId);
  }

  getCachedDistricts(regencyId: string): RegionReferenceItem[] | undefined {
    return this.districtsCache.get(regencyId);
  }

  getCachedVillages(districtId: string): RegionReferenceItem[] | undefined {
    return this.villagesCache.get(districtId);
  }

  clearCache(): void {
    this.cache = null;
    this.cachePromise = null;
    this.provincesCache = null;
    this.regenciesCache.clear();
    this.districtsCache.clear();
    this.villagesCache.clear();
  }
}

export const patientReferenceService = new PatientReferenceService();
