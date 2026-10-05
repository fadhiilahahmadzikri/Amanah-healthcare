import type { QueryClient } from '@tanstack/react-query';
import type {
  BookedPatientItem,
  OccupancySlot
} from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession, DoctorSchedule } from '../api/types';
import type { GridSlotData } from '../components/grid/doctor-grid-slot-item';
import { doctorScheduleKeys } from '../api/query-keys';
import { getSessionPatients } from '../api/service';
import {
  bookedPatientToAppointment,
  type SessionContext
} from '@/features/klinik/components/appointment-card/utils/appointment-adapter';
import type { Appointment } from '@/features/klinik/api/types';

/**
 * Resolves a booked patient for a specific grid consultation slot from React Query cache or network.
 */
export async function resolveSlotPatient(
  queryClient: QueryClient,
  doctorId: string,
  session: DoctorDailySession,
  slot: OccupancySlot | GridSlotData
): Promise<BookedPatientItem | null> {
  const cachedData = queryClient.getQueryData<{ patients?: BookedPatientItem[] }>(
    doctorScheduleKeys.sessionPatients(doctorId, session.id, {})
  );

  let foundPatient: BookedPatientItem | undefined;
  if (cachedData?.patients) {
    foundPatient = cachedData.patients.find(
      (p) =>
        (slot.appointmentRef?.appointmentId &&
          p.appointmentId === slot.appointmentRef.appointmentId) ||
        p.timeSlot?.startsWith(slot.startTime) ||
        p.timeSlot?.includes(slot.startTime)
    );
  }

  if (foundPatient) return foundPatient;

  try {
    const fetched = await queryClient.fetchQuery({
      queryKey: doctorScheduleKeys.sessionPatients(doctorId, session.id, {}),
      queryFn: () => getSessionPatients(doctorId, session.id, {}),
      staleTime: 5 * 1000
    });
    if (fetched?.patients) {
      return (
        fetched.patients.find(
          (p) =>
            (slot.appointmentRef?.appointmentId &&
              p.appointmentId === slot.appointmentRef.appointmentId) ||
            p.timeSlot?.startsWith(slot.startTime) ||
            p.timeSlot?.includes(slot.startTime)
        ) || null
      );
    }
  } catch {
    // Network or server error gracefully handled
  }
  return null;
}

/**
 * Constructs a canonical Appointment object from a BookedPatientItem and contextual session info.
 */
export function buildSlotAppointment(
  patient: BookedPatientItem,
  doctor: DoctorSchedule,
  session: DoctorDailySession,
  date: string
): Appointment {
  const sessionContext: SessionContext = {
    doctorName: doctor.nama_dokter,
    doctorSpecialty: doctor.spesialisasi,
    sessionTime: `${session.jam_mulai} - ${session.jam_selesai} WIB`,
    date
  };
  return bookedPatientToAppointment(patient, sessionContext);
}
