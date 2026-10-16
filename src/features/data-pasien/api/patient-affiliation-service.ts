import { clientFetch } from '@/lib/client-fetch';
import { normalizeGender } from '@/constants/gender.constants';
import type { QueueLoadStatus } from '@/features/klinik/constants/queue-load.constants';

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
  alamatDetail?: string | null;
  provinsi?: string | null;
  provinsiId?: string | null;
  kabupaten?: string | null;
  kabupatenId?: string | null;
  kecamatan?: string | null;
  kecamatanId?: string | null;
  kelurahan?: string | null;
  kelurahanId?: string | null;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'relative' | 'other' | string;
  relationshipLabel?: string;
  occupationCode?: string | null;
  occupationName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  status?: string;
  isActive?: boolean;
  isSelf?: boolean;
  hasExistingIntake?: boolean;
  latestIntakeId?: string | null;
  latestIntakeDate?: string | null;
}

export interface BookingContextPatient {
  id: string;
  affiliationId: string;
  fullName: string;
  nik: string;
  gender: string;
  bloodType: string | null;
  motherName?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  address?: string | null;
  alamatDetail?: string | null;
  provinsi?: string | null;
  provinsiId?: string | null;
  kabupaten?: string | null;
  kabupatenId?: string | null;
  kecamatan?: string | null;
  kecamatanId?: string | null;
  kelurahan?: string | null;
  kelurahanId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  relationship: string;
  relationshipLabel: string;
  occupationName: string | null;
  occupationCode?: string | null;
  status?: string;
  isActive?: boolean;
  hasExistingIntake: boolean;
  latestIntakeId: string | null;
  latestIntakeDate: string | null;
}

export interface BookingContextAllowedRelationship {
  value: string;
  label: string;
}

export interface BookingServiceContextResponse {
  serviceId: string;
  serviceName: string;
  medicalFlow: 'pregnancy' | 'immunization' | 'general';
  formType: 'pregnancy' | 'immunization' | 'regular';
  allowedRelationships: BookingContextAllowedRelationship[];
  patients: BookingContextPatient[];
  totalPatients: number;
  hasExistingPatient: boolean;
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
  email?: string;
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
    motherName: patient?.namaIbuKandung ?? patient?.motherName ?? null,
    placeOfBirth: patient?.birthPlace ?? null,
    dateOfBirth: patient?.birthDate ?? null,
    gender: normalizeGender(patient?.gender) === 'female' ? 'P' : 'L',
    bloodType: (patient?.bloodType as PatientBloodType) ?? null,
    address: primaryAddress?.fullAddress ?? primaryAddress?.line1 ?? patient?.address ?? null,
    alamatDetail: primaryAddress?.line1 ?? patient?.alamatDetail ?? null,
    provinsi: primaryAddress?.provinceName ?? patient?.provinsi ?? null,
    provinsiId: primaryAddress?.provinceCode ?? patient?.provinsiId ?? null,
    kabupaten: primaryAddress?.regencyName ?? patient?.kabupaten ?? null,
    kabupatenId: primaryAddress?.regencyCode ?? patient?.kabupatenId ?? null,
    kecamatan: primaryAddress?.districtName ?? patient?.kecamatan ?? null,
    kecamatanId: primaryAddress?.districtCode ?? patient?.kecamatanId ?? null,
    kelurahan: primaryAddress?.villageName ?? patient?.kelurahan ?? null,
    kelurahanId: primaryAddress?.villageCode ?? patient?.kelurahanId ?? null,
    relationship: entity.relationshipType,
    relationshipLabel:
      entity.relationLabel ??
      (entity.relationshipType === 'self' ? 'Diri Sendiri' : entity.relationshipType),
    occupationCode: null,
    occupationName: patient?.pekerjaan ?? null,
    phoneNumber: patient?.phoneNumber ?? null,
    email: patient?.email ?? null,
    status: patient?.status ?? 'active',
    isActive: (patient?.status ?? 'active') === 'active',
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
  session: string;
  shift: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isPast?: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  loadStatus?: QueueLoadStatus;
  practitioners: BookingPractitioner[];
}

export interface CreateAppointmentPayload {
  patientId: string;
  poliklinikId: string;
  layananId: string;
  staffId?: string;
  appointmentDate: string;
  session: string;
  visitType: string;
  complaint: string;
  sourceIntakeId?: string;
}

export interface BackendAppointmentItem {
  id: string;
  bookingCode?: string;
  medicalFlow?: string;
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
  actualStartedAt?: string | null;
  actualCompletedAt?: string | null;
  consultationElapsedSeconds?: number | null;
  consultationDurationFormatted?: string | null;
  session: string;
  sessionName?: string | null;
  queueNumber?: string;
  status: string;
  visitType?: string;
  complaint?: string;
  patientName?: string;
  etaRange?: string | null;
  aheadCount?: number | null;
  allowedActions?: string[];
  createdAt: string;
}

export interface ActiveTicketConflictInfo {
  id: string;
  appointmentId?: string | null;
  queueNumber: string;
  status: string;
  categoryId?: string | null;
  sessionId?: string | null;
  queueDate: string;
  waitingPosition?: number | null;
  estimatedCalledAt?: string | null;
  projectedStart?: string | null;
  projectedEnd?: string | null;
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

  async getBookingOptions(
    date: string,
    poliklinikId?: string,
    staffId?: string
  ): Promise<BookingOptionShift[]> {
    try {
      const params = new URLSearchParams({ date });
      if (poliklinikId) {
        params.append('poliklinikId', poliklinikId);
      }
      if (staffId) {
        params.append('staffId', staffId);
      }
      const res = await clientFetch<{
        success?: boolean;
        data?: {
          sessions?: BookingOptionShift[];
        };
      }>(`/api/v1/schedules/booking-options?${params.toString()}`);

      return res?.data?.sessions ?? [];
    } catch (err) {
      console.error('Failed to get booking options:', err);
      return [];
    }
  },

  async checkActiveTicket(params: {
    patientId: string;
    categoryId?: string;
    date: string;
  }): Promise<{ hasActiveTicket: boolean; activeTicket: ActiveTicketConflictInfo | null }> {
    try {
      const res = await clientFetch<{
        hasActiveTicket: boolean;
        activeTicket: ActiveTicketConflictInfo | null;
      }>('/api/v1/appointments/active-ticket', {
        query: {
          patientId: params.patientId,
          categoryId: params.categoryId,
          date: params.date
        }
      });
      return res;
    } catch {
      return { hasActiveTicket: false, activeTicket: null };
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
      >('/api/v1/appointments/me', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      });
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Failed to get my appointments:', err);
      return [];
    }
  },

  async getBookingContext(serviceId: string): Promise<BookingServiceContextResponse | null> {
    try {
      const res = await clientFetch<{
        success: boolean;
        data: BookingServiceContextResponse;
      }>(
        `/api/v1/patients/affiliations/booking-context?serviceId=${encodeURIComponent(serviceId)}`
      );
      return res?.data ?? null;
    } catch (err) {
      console.error('Failed to get booking context from backend:', err);
      return null;
    }
  },

  async cancelAppointment(appointmentId: string, reason = 'Dibatalkan oleh pasien'): Promise<void> {
    await clientFetch(`/api/v1/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }
};
