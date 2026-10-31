import { clientFetch } from '@/lib/client-fetch';
import type {
  ClinicService,
  ClinicalIntakeForm,
  CreateCategoryPayload,
  CreateIntakeFormPayload,
  CreateRoomPayload,
  CreateServicePayload,
  CreateUnitPayload,
  FacilityRoom,
  FacilityUnit,
  ServiceCategory
} from '../types/clinic-essentials.types';

export interface FacilityQueryParams {
  search?: string;
  status?: string;
}

export const clinicEssentialsApi = {
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

  deleteUnit: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/units/${id}`, {
      method: 'DELETE'
    }),

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

  deleteCategory: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/categories/${id}`, {
      method: 'DELETE'
    }),

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

  deleteForm: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/forms/${id}`, {
      method: 'DELETE'
    })
};
