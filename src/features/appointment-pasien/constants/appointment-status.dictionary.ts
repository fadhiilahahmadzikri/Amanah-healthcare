import {
  APPOINTMENT_STATUS_REGISTRY,
  AppointmentStatusDescriptor
} from '@/constants/appointment-status.constants';
import type { AppointmentStatus } from '../api/types';

export interface StatusPresentationConfig {
  label: string;
  description: string;
  pillBg: string;
  pillBorder: string;
  textGradient: string;
  dotGradient: string;
  hex: string;
}

export const APPOINTMENT_STATUS_MAP: Record<AppointmentStatus, StatusPresentationConfig> = {
  BOOKED: {
    label: APPOINTMENT_STATUS_REGISTRY.BOOKED.label,
    description: APPOINTMENT_STATUS_REGISTRY.BOOKED.description,
    ...APPOINTMENT_STATUS_REGISTRY.BOOKED.styling
  },
  WAITING: {
    label: APPOINTMENT_STATUS_REGISTRY.WAITING.label,
    description: APPOINTMENT_STATUS_REGISTRY.WAITING.description,
    ...APPOINTMENT_STATUS_REGISTRY.WAITING.styling
  },
  IN_SERVICE: {
    label: APPOINTMENT_STATUS_REGISTRY.IN_SERVICE.label,
    description: APPOINTMENT_STATUS_REGISTRY.IN_SERVICE.description,
    ...APPOINTMENT_STATUS_REGISTRY.IN_SERVICE.styling
  },
  COMPLETED: {
    label: APPOINTMENT_STATUS_REGISTRY.COMPLETED.label,
    description: APPOINTMENT_STATUS_REGISTRY.COMPLETED.description,
    ...APPOINTMENT_STATUS_REGISTRY.COMPLETED.styling
  },
  CANCELLED: {
    label: APPOINTMENT_STATUS_REGISTRY.CANCELLED.label,
    description: APPOINTMENT_STATUS_REGISTRY.CANCELLED.description,
    ...APPOINTMENT_STATUS_REGISTRY.CANCELLED.styling
  },
  LATE: {
    label: APPOINTMENT_STATUS_REGISTRY.LATE.label,
    description: APPOINTMENT_STATUS_REGISTRY.LATE.description,
    ...APPOINTMENT_STATUS_REGISTRY.LATE.styling
  }
};

export const APPOINTMENT_STATUS_OPTIONS = (
  Object.keys(APPOINTMENT_STATUS_MAP) as AppointmentStatus[]
).map((status) => ({
  value: status,
  label: APPOINTMENT_STATUS_MAP[status].label,
  description: APPOINTMENT_STATUS_MAP[status].description
}));

export const normalizeToAppointmentStatus = (status?: string | null): AppointmentStatus =>
  AppointmentStatusDescriptor.from(status).domainStatus;

export function getAppointmentStatusConfig(
  status?: AppointmentStatus | string | null
): StatusPresentationConfig {
  const canonical = normalizeToAppointmentStatus(status);
  return APPOINTMENT_STATUS_MAP[canonical];
}
