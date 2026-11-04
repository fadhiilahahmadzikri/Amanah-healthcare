import { clientFetch } from '@/lib/client-fetch';
import type {
  ImmunizationClinicalEntry,
  ImmunizationIntakeRecord,
  ImmunizationRegistrationPayload
} from '../types/immunization.types';

export interface SaveClinicalEntriesPayload {
  patientId: string;
  intakeId: string;
  appointmentId?: string | null;
  administeredBy?: string | null;
  entries: ImmunizationClinicalEntry[];
}

export interface ImmunizationHistoryQuery {
  patientId?: string;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedImmunizationHistoryResponse {
  data: ImmunizationIntakeRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const immunizationService = {
  async createIntake(payload: ImmunizationRegistrationPayload): Promise<ImmunizationIntakeRecord> {
    return clientFetch<ImmunizationIntakeRecord>('/api/v1/immunization/intakes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateIntake(
    id: string,
    payload: Partial<ImmunizationRegistrationPayload>
  ): Promise<ImmunizationIntakeRecord> {
    return clientFetch<ImmunizationIntakeRecord>(`/api/v1/immunization/intakes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async getIntakeById(id: string): Promise<ImmunizationIntakeRecord> {
    return clientFetch<ImmunizationIntakeRecord>(`/api/v1/immunization/intakes/${id}`);
  },

  async getIntakeByAppointmentId(appointmentId: string): Promise<ImmunizationIntakeRecord> {
    return clientFetch<ImmunizationIntakeRecord>(
      `/api/v1/immunization/intakes/by-appointment/${appointmentId}`
    );
  },

  async getChildCumulativeLedger(patientId: string): Promise<ImmunizationClinicalEntry[]> {
    return clientFetch<ImmunizationClinicalEntry[]>(`/api/v1/immunization/patient/${patientId}/ledger`);
  },

  async saveClinicalEntries(payload: SaveClinicalEntriesPayload): Promise<ImmunizationClinicalEntry[]> {
    return clientFetch<ImmunizationClinicalEntry[]>(
      `/api/v1/immunization/patient/${payload.patientId}/entries`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  },

  async getHistory(params: ImmunizationHistoryQuery): Promise<PaginatedImmunizationHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params.patientId) searchParams.set('patientId', params.patientId);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const qs = searchParams.toString();
    const endpoint = `/api/v1/immunization/history${qs ? `?${qs}` : ''}`;
    return clientFetch<PaginatedImmunizationHistoryResponse>(endpoint);
  }
};
