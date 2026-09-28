import { clientFetch } from '@/lib/client-fetch';

export interface PatientAffiliationProfile {
  id: string;
  fullName: string;
  nik: string;
  motherName?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  gender: 'L' | 'P' | 'LAKI_LAKI' | 'PEREMPUAN' | string;
  bloodType?: 'A' | 'B' | 'AB' | 'O' | string | null;
  address?: string | null;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'relative' | 'other' | string;
  relationshipLabel?: string;
  occupationCode?: string | null;
  occupationName?: string | null;
  phoneNumber?: string | null;
  isSelf?: boolean;
}

export interface OccupationItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  displayOrder: number;
}

export interface CreateAffiliationPayload {
  fullName: string;
  nik: string;
  motherName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: 'L' | 'P' | 'LAKI_LAKI' | 'PEREMPUAN';
  bloodType: 'A' | 'B' | 'AB' | 'O';
  address: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'relative' | 'other';
  occupationCode: string;
  phoneNumber?: string;
}

export interface BookingOptionShift {
  session: 'DINI_HARI' | 'PAGI' | 'SIANG' | 'MALAM' | string;
  label: string;
  timeRange: string;
  isAvailable: boolean;
  availableQuota: number;
  totalQuota: number;
  poliklinikId: string;
  poliklinikName: string;
  layananId: string;
  layananName: string;
  staffId: string;
  doctorName: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  poliklinikId: string;
  layananId: string;
  appointmentDate: string;
  session: 'DINI_HARI' | 'PAGI' | 'SIANG' | 'MALAM' | string;
  visitType: string;
  complaint: string;
}

export interface BackendAppointmentItem {
  id: string;
  patientId: string;
  poliklinikId: string;
  poliklinikName?: string;
  layananId: string;
  layananName?: string;
  staffId?: string;
  doctorName?: string;
  appointmentDate: string;
  session: string;
  queueNumber?: string;
  status: string;
  visitType?: string;
  complaint?: string;
  patientName?: string;
  createdAt: string;
}

export const patientAffiliationService = {
  async getMyAffiliations(): Promise<PatientAffiliationProfile[]> {
    try {
      const res = await clientFetch<
        { success?: boolean; data?: PatientAffiliationProfile[] } | PatientAffiliationProfile[]
      >('/api/v1/patients/affiliations/me');
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Failed to get patient affiliations:', err);
      return [];
    }
  },

  async createAffiliation(payload: CreateAffiliationPayload): Promise<PatientAffiliationProfile> {
    const res = await clientFetch<
      { success?: boolean; data?: PatientAffiliationProfile } | PatientAffiliationProfile
    >('/api/v1/patients/affiliations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if ('data' in res && res.data) return res.data;
    return res as PatientAffiliationProfile;
  },

  async getOccupations(): Promise<OccupationItem[]> {
    try {
      const res = await clientFetch<
        { success?: boolean; data?: OccupationItem[] } | OccupationItem[]
      >('/api/v1/occupations');
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Failed to get occupations:', err);
      return [];
    }
  },

  async getBookingOptions(date: string): Promise<BookingOptionShift[]> {
    try {
      const res = await clientFetch<
        { success?: boolean; data?: BookingOptionShift[] } | BookingOptionShift[]
      >(`/api/v1/schedules/booking-options?date=${date}`);
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Failed to get booking options:', err);
      return [];
    }
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<BackendAppointmentItem> {
    const res = await clientFetch<
      { success?: boolean; data?: BackendAppointmentItem } | BackendAppointmentItem
    >('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if ('data' in res && res.data) return res.data;
    return res as BackendAppointmentItem;
  },

  async getMyAppointments(): Promise<BackendAppointmentItem[]> {
    try {
      const res = await clientFetch<
        { success?: boolean; data?: BackendAppointmentItem[] } | BackendAppointmentItem[]
      >('/api/v1/appointments/me');
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Failed to get my appointments:', err);
      return [];
    }
  },

  async rescheduleAppointment(
    appointmentId: string,
    payload: { targetDate: string; targetSession: string; reason?: string }
  ): Promise<BackendAppointmentItem> {
    const res = await clientFetch<
      { success?: boolean; data?: BackendAppointmentItem } | BackendAppointmentItem
    >(`/api/v1/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if ('data' in res && res.data) return res.data;
    return res as BackendAppointmentItem;
  },

  async cancelAppointment(appointmentId: string, reason = 'Dibatalkan oleh pasien'): Promise<void> {
    await clientFetch(`/api/v1/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }
};
