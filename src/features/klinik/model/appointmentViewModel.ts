import type { Appointment, AppointmentFormData, AppointmentStatus } from '../api/types';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Ags',
  'Sep',
  'Okt',
  'Nov',
  'Des'
];

export type AppointmentFormMode = 'create' | 'edit';

export interface AppointmentFilterState {
  searchQuery: string;
  monthFilter: string;
  dateFilter: Date | undefined;
  selectedServices: string[];
  selectedStatuses: AppointmentStatus[];
}

export function filterAppointments(
  appointments: Appointment[],
  filters: AppointmentFilterState
): Appointment[] {
  return appointments.filter((item) => {
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toLowerCase();
      const timeDots = (item.time || '').toLowerCase().replace(/:/g, '.');
      const timeColons = (item.time || '').toLowerCase().replace(/\./g, ':');

      const searchableFields = [
        item.patient_name,
        item.patient_email,
        item.id,
        item.booking_code,
        item.doctor_name,
        item.service,
        item.date,
        item.time,
        timeDots,
        timeColons,
        item.status,
        item.complaint,
        item.visit_type
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableFields.includes(query)) {
        return false;
      }
    }

    if (filters.monthFilter && filters.monthFilter !== 'ALL') {
      const monthKey = filters.monthFilter.split(' ')[0];
      if (!item.date.includes(monthKey)) {
        return false;
      }
    }

    if (filters.dateFilter) {
      const datePattern = toAppointmentDatePattern(filters.dateFilter);
      if (!item.date.includes(datePattern)) {
        return false;
      }
    }

    if (filters.selectedServices.length > 0) {
      if (!item.service || !filters.selectedServices.includes(item.service)) {
        return false;
      }
    }

    if (filters.selectedStatuses.length > 0) {
      if (!filters.selectedStatuses.includes(item.status)) {
        return false;
      }
    }

    return true;
  });
}

export function paginateAppointments<T>(items: T[], currentPage: number, pageSize: number): T[] {
  const startIndex = (currentPage - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

export function updateAppointmentList(
  appointments: Appointment[],
  id: string,
  formData: AppointmentFormData,
  updatedAt: string
): Appointment[] {
  return appointments.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      doctor_name: formData.doctor,
      date: formData.dateStr,
      time: formData.timeSlot,
      complaint: formData.complaint,
      visit_type: formData.visitType,
      service: formData.service,
      updated_at: updatedAt
    };
  });
}

function toAppointmentDatePattern(date: Date): string {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}
