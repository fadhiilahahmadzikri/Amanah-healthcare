import { clientFetch } from '@/lib/client-fetch';
import type {
  BulkFacilityActionPayload,
  BulkFacilityActionResult,
  ClinicService,
  ClinicalIntakeForm,
  CreateCategoryPayload,
  CreateIntakeFormPayload,
  CreateRoomPayload,
  CreateServicePayload,
  CreateUnitPayload,
  CreateUnitTypePayload,
  FacilityRoom,
  FacilityUnit,
  FacilityUnitType,
  ServiceCategory,
  UpdateCategoryPayload,
  UpdateIntakeFormPayload,
  UpdateRoomPayload,
  UpdateServicePayload,
  UpdateUnitPayload,
  UpdateUnitTypePayload
} from '../types/clinic-essentials.types';

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
  getUnits: (): Promise<FacilityUnit[]> =>
    clientFetch<FacilityUnit[]>('/api/v1/admin/facilities/units'),

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

  updateCategory: (id: string, payload: UpdateCategoryPayload): Promise<ServiceCategory> =>
    clientFetch<ServiceCategory>(`/api/v1/admin/facilities/categories/${id}`, {
      method: 'PATCH',
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
  getForms: (): Promise<ClinicalIntakeForm[]> =>
    clientFetch<ClinicalIntakeForm[]>('/api/v1/admin/facilities/forms'),

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

  deleteForm: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/facilities/forms/${id}`, {
      method: 'DELETE'
    }),

  // Bulk Actions
  bulkAction: (payload: BulkFacilityActionPayload): Promise<BulkFacilityActionResult> =>
    clientFetch<BulkFacilityActionResult>('/api/v1/admin/facilities/bulk', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
