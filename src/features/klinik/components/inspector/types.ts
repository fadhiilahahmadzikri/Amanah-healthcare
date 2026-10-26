import type { Appointment } from '../../api/types';
import type {
  MaternalIntakeResponse,
  ChildImmunizationResponse
} from '../../api/kia-intake-service';

export interface UnifiedInspectorPatient {
  id?: string;
  medicalRecordNumber?: string;
  nik?: string;
  fullName?: string;
  motherName?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  address?: string;
  villageName?: string;
  districtName?: string;
  regencyName?: string;
  provinceName?: string;
  relationshipType?: string;
  relationLabel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface UnifiedInspectorData {
  flow?: string;
  answers: Record<string, any>;
  automatic: Record<string, any>;
  maternal?: MaternalIntakeResponse;
  child?: ChildImmunizationResponse;
  patient?: UnifiedInspectorPatient;
  appointmentId?: string;
  bookingCode?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  complaint?: string;
  serviceName?: string;
}

export interface InspectorTabProps {
  appointment: Appointment;
  data: UnifiedInspectorData;
}
