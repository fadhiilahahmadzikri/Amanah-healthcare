import { clientFetch } from '@/lib/client-fetch';
import type {
  CreateMaternityIntakePayload,
  MaternityHistoryQuery,
  MaternityHistoryResponse,
  MaternityIntake,
  UpdateMaternityIntakePayload,
} from '../types/maternity.types';

export const maternityService = {
  async createIntake(
    payload: CreateMaternityIntakePayload,
  ): Promise<MaternityIntake> {
    return clientFetch<MaternityIntake>('/api/v1/maternity/intakes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateIntake(
    id: string,
    payload: UpdateMaternityIntakePayload,
  ): Promise<MaternityIntake> {
    return clientFetch<MaternityIntake>(`/api/v1/maternity/intakes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getIntakeById(id: string): Promise<MaternityIntake> {
    return clientFetch<MaternityIntake>(`/api/v1/maternity/intakes/${id}`);
  },

  async getIntakeByAppointmentId(
    appointmentId: string,
  ): Promise<MaternityIntake> {
    return clientFetch<MaternityIntake>(
      `/api/v1/maternity/appointment/${appointmentId}`,
    );
  },

  async getHistory(
    params: MaternityHistoryQuery,
  ): Promise<MaternityHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params.patientId) searchParams.set('patientId', params.patientId);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const qs = searchParams.toString();
    const endpoint = `/api/v1/maternity/history${qs ? `?${qs}` : ''}`;
    return clientFetch<MaternityHistoryResponse>(endpoint);
  },

  async getPatientPregnancies(patientId: string): Promise<MaternityIntake[]> {
    return clientFetch<MaternityIntake[]>(
      `/api/v1/maternity/patient/${patientId}/pregnancies`,
    );
  },
};
