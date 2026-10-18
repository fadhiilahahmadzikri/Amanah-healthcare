import type { AttendanceFilterParams } from '../api/types';

export function getCurrentAttendanceFilterDate(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Jakarta'
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
