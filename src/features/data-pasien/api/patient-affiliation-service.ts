import { clientFetch } from '@/lib/client-fetch';

export interface PatientAffiliationProfile {
  id: string;
  affiliationId?: string;
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

export type PatientRelationshipType =
  | 'self'
  | 'parent'
  | 'child'
  | 'spouse'
  | 'relative'
  | 'friend'
  | 'other';

export type PatientGender = 'Laki-laki' | 'Perempuan';

export type PatientBloodType = 'A' | 'B' | 'AB' | 'O' | 'Belum Tahu';

export interface CreatePatientAffiliationDto {
  patient_id?: string;
  relationship_type: PatientRelationshipType;
  relation_label?: string;
  is_primary?: boolean;
  name: string;
  nik: string;
  tempat_lahir: string;
  birth_date: string;
  gender: PatientGender;
  blood_type: PatientBloodType;
  nama_ibu_kandung: string;
  occupation_id?: string;
  pekerjaan?: string;
  phone?: string;
  provinsi?: string;
  provinsi_id?: string;
  kabupaten?: string;
  kabupaten_id?: string;
  kecamatan?: string;
  kecamatan_id?: string;
  kelurahan?: string;
  kelurahan_id?: string;
  alamat_detail?: string;
}

export type CreateAffiliationPayload = CreatePatientAffiliationDto;

function mapAffiliationEntityToProfile(entity: any): PatientAffiliationProfile {
  const patient = entity?.patient;
  const addresses = Array.isArray(patient?.patientAddresses) ? patient.patientAddresses : [];
  const primaryAddress = addresses.find((a: any) => a.isPrimary) || addresses[0];

  return {
    id: entity.patientId,
    affiliationId: entity.id,
    fullName: patient?.fullName ?? '',
    nik: patient?.nik ?? '',
    motherName: patient?.namaIbuKandung ?? null,
    placeOfBirth: patient?.birthPlace ?? null,
    dateOfBirth: patient?.birthDate ?? null,
    gender: (patient?.gender === 'female' || patient?.gender === 'Perempuan' || patient?.gender === 'P') ? 'P' : 'L',
    bloodType: (patient?.bloodType as PatientBloodType) ?? null,
    address: primaryAddress?.fullAddress ?? primaryAddress?.line1 ?? patient?.address ?? null,
    relationship: entity.relationshipType,
    relationshipLabel: entity.relationLabel ?? (entity.relationshipType === 'self' ? 'Diri Sendiri' : entity.relationshipType),
    occupationCode: null,
    occupationName: patient?.pekerjaan ?? null,
    phoneNumber: patient?.phoneNumber ?? null,
    isSelf: entity.relationshipType === 'self' || Boolean(entity.isPrimary)
  };
}

export interface BookingPractitioner {
  id: string;
  staffProfileId?: string;
  sessionId: string;
  name: string;
  avatarUrl?: string | null;
  specialty: string;
  roomName: string;
  startTime: string;
  endTime: string;
}

export interface BookingOptionShift {
  session: 'DINI_HARI' | 'PAGI' | 'SIANG' | 'MALAM' | string;
  shift: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSlots: number;
  bookedSlots: number;
  isDisabled: boolean;
  disabledReason: string | null;
  practitioners: BookingPractitioner[];
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
  doctorSpecialty?: string;
  roomName?: string;
  roomLocation?: string;
  appointmentDate: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  estimatedDurationMinutes?: number;
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
      const res = await clientFetch<{
        success: boolean;
        data: any[];
      }>('/api/v1/patients/affiliations/me');
      const list = Array.isArray(res?.data) ? res.data : [];
      return list.map(mapAffiliationEntityToProfile);
    } catch (err) {
      console.error('Failed to get patient affiliations:', err);
      return [];
    }
  },

  async createAffiliation(dto: CreatePatientAffiliationDto): Promise<PatientAffiliationProfile> {
    const res = await clientFetch<{
      success: boolean;
      message: string;
      data: any;
    }>('/api/v1/patients/affiliations', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return mapAffiliationEntityToProfile(res.data);
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

  async getBookingOptions(date: string, poliklinikId?: string): Promise<BookingOptionShift[]> {
    try {
      const params = new URLSearchParams({ date });
      if (poliklinikId) {
        params.append('poliklinikId', poliklinikId);
      }
      const res = await clientFetch<{
        success?: boolean;
        data?: {
          sessions?: BookingOptionShift[];
        } | BookingOptionShift[];
      }>(`/api/v1/schedules/booking-options?${params.toString()}`);

      if (res && typeof res === 'object') {
        if ('data' in res && res.data) {
          if ('sessions' in res.data && Array.isArray(res.data.sessions)) {
            return res.data.sessions;
          }
          if (Array.isArray(res.data)) {
            return res.data;
          }
        }
        if (Array.isArray(res)) {
          return res;
        }
      }
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
    payload: {
      targetDate: string;
      targetSessionId?: string;
      targetSession?: string;
      reason?: string;
    }
  ): Promise<BackendAppointmentItem> {
    const body: Record<string, any> = {
      target_date: payload.targetDate,
      reason: payload.reason || 'Reschedule jadwal pasien'
    };
    if (payload.targetSessionId) {
      body.target_session_id = payload.targetSessionId;
    }
    const res = await clientFetch<
      { success?: boolean; data?: BackendAppointmentItem } | BackendAppointmentItem
    >(`/api/v1/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(body)
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
