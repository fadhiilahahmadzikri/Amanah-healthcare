import { useQuery } from '@tanstack/react-query';
import { scheduleReferenceOptionsQueryOptions } from '../api/queries';
import type { ScheduleReferenceShiftOption } from '@/server/contracts/schedules/doctor-schedules.dto';

export function useScheduleReferenceOptions() {
  const query = useQuery(scheduleReferenceOptionsQueryOptions());
  const shifts: ScheduleReferenceShiftOption[] = query.data?.shifts || [];

  const getShiftBounds = (shiftKey?: string | null) => {
    if (!shiftKey) return undefined;
    const norm = shiftKey.toLowerCase().trim();
    return shifts.find(
      (s) =>
        s.shift.toLowerCase() === norm ||
        s.id.toLowerCase() === norm ||
        s.code?.toLowerCase() === norm
    );
  };

  return {
    ...query,
    shifts,
    effectiveConsultationDurationMinutes: query.data?.effectiveConsultationDurationMinutes,
    getShiftBounds
  };
}
