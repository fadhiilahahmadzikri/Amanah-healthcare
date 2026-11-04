import { clientFetch } from '@/lib/client-fetch';
import type {
  BulkFacilityActionPayload,
  BulkFacilityActionResult,
  ClinicService,
  ClinicalIntakeForm,
  CreateCategoryPayload,
  CreateDemographicPayload,
  CreateIntakeFormPayload,
  CreateRelationshipPayload,
  CreateRoomPayload,
  CreateServicePayload,
  CreateUnitPayload,
  CreateUnitTypePayload,
  DemographicMasterItem,
  FacilityRoom,
  FacilityUnit,
  FacilityUnitType,
  PatientRelationshipTypeItem,
  ServiceCategory,
  UpdateCategoryPayload,
  UpdateDemographicPayload,
  UpdateIntakeFormPayload,
  UpdateRelationshipPayload,
  UpdateRoomPayload,
  UpdateServicePayload,
  UpdateUnitPayload,
  UpdateUnitTypePayload
} from '../types/clinic-essentials.types';

export interface FacilityQueryParams {
  search?: string;
  status?: string;
}

export const clinicEssentialsApi = {
  // Unit Types (Master Tipe Unit)
  getUnitTypes: (): Promise<FacilityUnitType[]> =>
    clientFetch<FacilityUnitType[]>('/api/v1/admin/facilities/unit-types'),

  createUnitType: (payload: CreateUnitTypePayload): Promise<FacilityUnitType> =>
    clientFetch<FacilityUnitType>('/api/v1/admin/facilities/unit-types', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateUnitType: (id: string, payload: UpdateUnitTypePayload): Promise<FacilityUnitType> =>
    clientFetch<FacilityUnitType>(`/api/v1/admin/facilities/unit-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteUnitType: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/unit-types/${id}`, {
      method: 'DELETE'
    }),

  // Units (Poliklinik)
  getUnits: (params?: FacilityQueryParams): Promise<FacilityUnit[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    return clientFetch<FacilityUnit[]>(
      qs ? `/api/v1/admin/facilities/units?${qs}` : '/api/v1/admin/facilities/units'
    );
  },

  createUnit: (payload: CreateUnitPayload): Promise<FacilityUnit> =>
    clientFetch<FacilityUnit>('/api/v1/admin/facilities/units', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateUnit: (id: string, payload: UpdateUnitPayload): Promise<FacilityUnit> =>
    clientFetch<FacilityUnit>(`/api/v1/admin/facilities/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteUnit: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/units/${id}`, {
      method: 'DELETE'
    }),

  linkCategoriesToUnit: (unitId: string, categoryIds: string[]): Promise<{ linked: number }> =>
    clientFetch<{ linked: number }>(`/api/v1/admin/facilities/units/${unitId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ categoryIds })
    }),

  unlinkCategoryFromUnit: (unitId: string, categoryId: string): Promise<{ unlinked: boolean }> =>
    clientFetch<{ unlinked: boolean }>(
      `/api/v1/admin/facilities/units/${unitId}/categories/${categoryId}`,
      {
        method: 'DELETE'
      }
    ),

  // Rooms (Ruang Periksa)
  getRooms: (unitId?: string, params?: FacilityQueryParams): Promise<FacilityRoom[]> => {
    const sp = new URLSearchParams();
    if (unitId) sp.append('unitId', unitId);
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    return clientFetch<FacilityRoom[]>(
      qs ? `/api/v1/admin/facilities/rooms?${qs}` : '/api/v1/admin/facilities/rooms'
    );
  },

  createRoom: (payload: CreateRoomPayload): Promise<FacilityRoom> =>
    clientFetch<FacilityRoom>('/api/v1/admin/facilities/rooms', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateRoom: (id: string, payload: UpdateRoomPayload): Promise<FacilityRoom> =>
    clientFetch<FacilityRoom>(`/api/v1/admin/facilities/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteRoom: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/rooms/${id}`, {
      method: 'DELETE'
    }),

  // Categories (Kategori Layanan)
  getCategories: (unitId?: string, params?: FacilityQueryParams): Promise<ServiceCategory[]> => {
    const sp = new URLSearchParams();
    if (unitId) sp.append('unitId', unitId);
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    return clientFetch<ServiceCategory[]>(
      qs ? `/api/v1/admin/facilities/categories?${qs}` : '/api/v1/admin/facilities/categories'
    );
  },

  createCategory: (payload: CreateCategoryPayload): Promise<ServiceCategory> =>
    clientFetch<ServiceCategory>('/api/v1/admin/facilities/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateCategory: (id: string, payload: UpdateCategoryPayload): Promise<ServiceCategory> =>
    clientFetch<ServiceCategory>(`/api/v1/admin/facilities/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteCategory: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/categories/${id}`, {
      method: 'DELETE'
    }),

  linkServicesToCategory: (categoryId: string, serviceIds: string[]): Promise<{ linked: number }> =>
    clientFetch<{ linked: number }>(`/api/v1/admin/facilities/categories/${categoryId}/services`, {
      method: 'POST',
      body: JSON.stringify({ serviceIds })
    }),

  unlinkServiceFromCategory: (
    categoryId: string,
    serviceId: string
  ): Promise<{ unlinked: boolean }> =>
    clientFetch<{ unlinked: boolean }>(
      `/api/v1/admin/facilities/categories/${categoryId}/services/${serviceId}`,
      {
        method: 'DELETE'
      }
    ),

  // Services (Layanan Medis)
  getServices: (
    categoryId?: string,
    unitId?: string,
    params?: FacilityQueryParams
  ): Promise<ClinicService[]> => {
    const sp = new URLSearchParams();
    if (categoryId) sp.append('categoryId', categoryId);
    if (unitId) sp.append('unitId', unitId);
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    return clientFetch<ClinicService[]>(
      qs ? `/api/v1/admin/facilities/services?${qs}` : '/api/v1/admin/facilities/services'
    );
  },

  createService: (payload: CreateServicePayload): Promise<ClinicService> =>
    clientFetch<ClinicService>('/api/v1/admin/facilities/services', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateService: (id: string, payload: UpdateServicePayload): Promise<ClinicService> =>
    clientFetch<ClinicService>(`/api/v1/admin/facilities/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteService: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/services/${id}`, {
      method: 'DELETE'
    }),

  // Forms (Clinical Intake Forms)
  getForms: (params?: FacilityQueryParams): Promise<ClinicalIntakeForm[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    return clientFetch<ClinicalIntakeForm[]>(
      qs ? `/api/v1/admin/facilities/forms?${qs}` : '/api/v1/admin/facilities/forms'
    );
  },

  createForm: (payload: CreateIntakeFormPayload): Promise<ClinicalIntakeForm> =>
    clientFetch<ClinicalIntakeForm>('/api/v1/admin/facilities/forms', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateForm: (id: string, payload: UpdateIntakeFormPayload): Promise<ClinicalIntakeForm> =>
    clientFetch<ClinicalIntakeForm>(`/api/v1/admin/facilities/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  updateFormSchema: (id: string, schema: Record<string, any>): Promise<ClinicalIntakeForm> =>
    clientFetch<ClinicalIntakeForm>(`/api/v1/admin/facilities/forms/${id}/schema`, {
      method: 'PUT',
      body: JSON.stringify({ schema })
    }),

  deleteForm: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/forms/${id}`, {
      method: 'DELETE'
    }),

  // Patient Relationship Types (Relasi Pasien)
  getRelationships: (params?: FacilityQueryParams): Promise<PatientRelationshipTypeItem[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    return clientFetch<PatientRelationshipTypeItem[]>(
      qs ? `/api/v1/admin/facilities/relationships?${qs}` : '/api/v1/admin/facilities/relationships'
    );
  },

  createRelationship: (payload: CreateRelationshipPayload): Promise<PatientRelationshipTypeItem> =>
    clientFetch<PatientRelationshipTypeItem>('/api/v1/admin/facilities/relationships', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateRelationship: (
    id: string,
    payload: UpdateRelationshipPayload
  ): Promise<PatientRelationshipTypeItem> =>
    clientFetch<PatientRelationshipTypeItem>(`/api/v1/admin/facilities/relationships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteRelationship: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/relationships/${id}`, {
      method: 'DELETE'
    }),

  setDefaultRelationship: (id: string): Promise<PatientRelationshipTypeItem> =>
    clientFetch<PatientRelationshipTypeItem>(
      `/api/v1/admin/facilities/relationships/${id}/default`,
      {
        method: 'PATCH'
      }
    ),

  // Demographic Masters: Blood Types
  getBloodTypes: async (params?: FacilityQueryParams): Promise<DemographicMasterItem[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem[] } | DemographicMasterItem[]
    >(qs ? `/api/v1/admin/facilities/blood-types?${qs}` : '/api/v1/admin/facilities/blood-types');
    if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  },

  createBloodType: async (payload: CreateDemographicPayload): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >('/api/v1/admin/facilities/blood-types', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  updateBloodType: async (
    id: string,
    payload: UpdateDemographicPayload
  ): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >(`/api/v1/admin/facilities/blood-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  deleteBloodType: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/blood-types/${id}`, {
      method: 'DELETE'
    }),

  // Demographic Masters: Education Levels
  getEducationLevels: async (params?: FacilityQueryParams): Promise<DemographicMasterItem[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem[] } | DemographicMasterItem[]
    >(
      qs
        ? `/api/v1/admin/facilities/education-levels?${qs}`
        : '/api/v1/admin/facilities/education-levels'
    );
    if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  },

  createEducationLevel: async (
    payload: CreateDemographicPayload
  ): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >('/api/v1/admin/facilities/education-levels', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  updateEducationLevel: async (
    id: string,
    payload: UpdateDemographicPayload
  ): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >(`/api/v1/admin/facilities/education-levels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  deleteEducationLevel: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/education-levels/${id}`, {
      method: 'DELETE'
    }),

  // Demographic Masters: Religions
  getReligions: async (params?: FacilityQueryParams): Promise<DemographicMasterItem[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem[] } | DemographicMasterItem[]
    >(qs ? `/api/v1/admin/facilities/religions?${qs}` : '/api/v1/admin/facilities/religions');
    if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  },

  createReligion: async (payload: CreateDemographicPayload): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >('/api/v1/admin/facilities/religions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  updateReligion: async (
    id: string,
    payload: UpdateDemographicPayload
  ): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >(`/api/v1/admin/facilities/religions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  deleteReligion: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/religions/${id}`, {
      method: 'DELETE'
    }),

  // Demographic Masters: Occupations
  getOccupations: async (params?: FacilityQueryParams): Promise<DemographicMasterItem[]> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString();
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem[] } | DemographicMasterItem[]
    >(qs ? `/api/v1/admin/facilities/occupations?${qs}` : '/api/v1/admin/facilities/occupations');
    if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    return Array.isArray(res) ? res : [];
  },

  createOccupation: async (payload: CreateDemographicPayload): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >('/api/v1/admin/facilities/occupations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  updateOccupation: async (
    id: string,
    payload: UpdateDemographicPayload
  ): Promise<DemographicMasterItem> => {
    const res = await clientFetch<
      { success?: boolean; data?: DemographicMasterItem } | DemographicMasterItem
    >(`/api/v1/admin/facilities/occupations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && typeof res === 'object' && 'data' in res && res.data) {
      return res.data as DemographicMasterItem;
    }
    return res as DemographicMasterItem;
  },

  deleteOccupation: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/occupations/${id}`, {
      method: 'DELETE'
    }),

  // Bulk Actions
  bulkAction: (payload: BulkFacilityActionPayload): Promise<BulkFacilityActionResult> =>
    clientFetch<BulkFacilityActionResult>('/api/v1/admin/facilities/bulk', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
