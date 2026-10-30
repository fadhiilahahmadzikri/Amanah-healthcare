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

export const clinicEssentialsApi = {
  // Units (Poliklinik)
  getUnits: (): Promise<FacilityUnit[]> =>
    clientFetch<FacilityUnit[]>('/api/v1/admin/facilities/units'),

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
  getRooms: (unitId?: string): Promise<FacilityRoom[]> => {
    const url = unitId
      ? `/api/v1/admin/facilities/rooms?unitId=${encodeURIComponent(unitId)}`
      : '/api/v1/admin/facilities/rooms';
    return clientFetch<FacilityRoom[]>(url);
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
  getCategories: (unitId?: string): Promise<ServiceCategory[]> => {
    const url = unitId
      ? `/api/v1/admin/facilities/categories?unitId=${encodeURIComponent(unitId)}`
      : '/api/v1/admin/facilities/categories';
    return clientFetch<ServiceCategory[]>(url);
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
  getServices: (categoryId?: string, unitId?: string): Promise<ClinicService[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (unitId) params.append('unitId', unitId);
    const qs = params.toString();
    const url = qs
      ? `/api/v1/admin/facilities/services?${qs}`
      : '/api/v1/admin/facilities/services';
    return clientFetch<ClinicService[]>(url);
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
  getForms: (): Promise<ClinicalIntakeForm[]> =>
    clientFetch<ClinicalIntakeForm[]>('/api/v1/admin/facilities/forms'),

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
