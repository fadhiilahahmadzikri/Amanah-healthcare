import { queryOptions } from '@tanstack/react-query';
import { attendanceService } from './service';
import type { AttendanceFilterParams } from './types';

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: AttendanceFilterParams) => [...attendanceKeys.lists(), params] as const
};

export const attendanceQueries = {
  list: (params: AttendanceFilterParams) =>
    queryOptions({
      queryKey: attendanceKeys.list(params),
      queryFn: () => attendanceService.getAttendanceList(params),
      placeholderData: (prev) => prev
    })
};
