import type { AttendanceFilterParams } from '../api/types';

export function getCurrentAttendanceFilterDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function createDefaultAttendanceFilters(limit: number): AttendanceFilterParams {
  return {
    date: getCurrentAttendanceFilterDate(),
    shift: 'all',
    status: 'all',
    category: 'all',
    search: '',
    page: 1,
    limit
  };
}
