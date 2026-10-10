import type { DoctorDailySession, DoctorSchedule } from '../api/types';
import { SCHEDULE_STATUS } from '../constants/schedule-shift.constants';

export const DOCTOR_CARD_STATUS = {
  BUKA: 'Buka',
  isOnLeave: 'isOnLeave',
  TERISI: 'Terisi',
  BELUM_DIATUR: 'Belum Diatur',
  TUTUP: 'Tutup',
  SELESAI: 'Selesai'
} as const;

export type DoctorCardStatus = (typeof DOCTOR_CARD_STATUS)[keyof typeof DOCTOR_CARD_STATUS] | null;

export const UNCONFIGURED_SCHEDULE_VALUES = new Set(['', '-', 'belum diatur', 'belum dijadwalkan']);

export function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.replace('.', ':');
  const [h, m] = clean.split(':').map((v) => Number.parseInt(v, 10) || 0);
  return h * 60 + m;
}

export function isSessionClosed(session: { status_sesi?: string | null }): boolean {
  const st = (session.status_sesi || '').toUpperCase();
  return st === 'TUTUP' || st === 'CLOSED';
}

export function isSessionAvailable(session: {
  status_sesi?: string | null;
  slot_tersedia?: number;
}): boolean {
  if (isSessionClosed(session)) return false;
  if (typeof session.slot_tersedia === 'number') {
    return session.slot_tersedia > 0;
  }
  return true;
}

export function isDoctorSessionActive(
  session: DoctorDailySession,
  currentMinutes: number
): boolean {
  const sMin = parseTimeToMinutes(session.jam_mulai);
  const eMin = parseTimeToMinutes(session.jam_selesai);
  if (eMin > sMin) {
    return currentMinutes >= sMin && currentMinutes < eMin;
  }
  return currentMinutes >= sMin || currentMinutes < eMin;
}

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
  if (doctor.sesi_harian && doctor.sesi_harian.length > 0) {
    return true;
  }
  const scheduleTime = doctor.jadwal_hari_ini?.trim().toLowerCase() ?? '';
  return !UNCONFIGURED_SCHEDULE_VALUES.has(scheduleTime);
}

export function getDoctorCardStatus(
  doctor: DoctorSchedule,
  referenceDate?: Date,
  targetDate?: string
): DoctorCardStatus {
  if (doctor.isOnLeave) {
    return DOCTOR_CARD_STATUS.isOnLeave;
  }

  const statusDokter = (doctor.status_dokter || '').trim().toUpperCase();
  const statusJadwal = (doctor.status_jadwal || '').trim().toUpperCase();

  if (statusDokter === SCHEDULE_STATUS.isOnLeave || statusJadwal === SCHEDULE_STATUS.isOnLeave) {
    return DOCTOR_CARD_STATUS.isOnLeave;
  }

  if (!hasConfiguredDoctorSchedule(doctor)) {
    return DOCTOR_CARD_STATUS.BELUM_DIATUR;
  }

  if (statusDokter === SCHEDULE_STATUS.CLOSED || statusJadwal === SCHEDULE_STATUS.CLOSED) {
    return DOCTOR_CARD_STATUS.TUTUP;
  }

  const now = referenceDate ?? new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (targetDate && targetDate < todayIso) {
    return DOCTOR_CARD_STATUS.SELESAI;
  }

  const sessions = doctor.sesi_harian;
  if (targetDate && targetDate > todayIso) {
    if (sessions && sessions.length > 0) {
      const allClosed = sessions.every((s) => isSessionClosed(s));
      if (allClosed) {
        return DOCTOR_CARD_STATUS.TUTUP;
      }
    }
    return DOCTOR_CARD_STATUS.BUKA;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (sessions && sessions.length > 0) {
    const allClosed = sessions.every((s) => isSessionClosed(s));
    if (allClosed) {
      return DOCTOR_CARD_STATUS.TUTUP;
    }

    const activeSession = sessions.find((s) => isDoctorSessionActive(s, currentMinutes));

    if (activeSession) {
      if (isSessionClosed(activeSession)) {
        return DOCTOR_CARD_STATUS.TUTUP;
      }

      const activeSessionStatus = (activeSession.status_sesi || '').trim().toUpperCase();
      if (
        activeSessionStatus === SCHEDULE_STATUS.OCCUPIED ||
        activeSessionStatus === 'TERISI' ||
        statusDokter === SCHEDULE_STATUS.OCCUPIED ||
        statusJadwal === SCHEDULE_STATUS.OCCUPIED
      ) {
        return DOCTOR_CARD_STATUS.TERISI;
      }

      if (
        typeof activeSession.slot_tersedia === 'number' &&
        activeSession.slot_tersedia === 0 &&
        (activeSession.kuota_pasien || 0) > 0
      ) {
        return DOCTOR_CARD_STATUS.TERISI;
      }

      return DOCTOR_CARD_STATUS.BUKA;
    }

    const sessionRanges = sessions
      .map((s) => ({
        start: parseTimeToMinutes(s.jam_mulai),
        end: parseTimeToMinutes(s.jam_selesai)
      }))
      .filter((r) => r.start >= 0 && r.end >= 0);

    if (sessionRanges.length > 0) {
      const allElapsed = sessionRanges.every((r) => currentMinutes >= r.end);
      if (allElapsed) {
        return DOCTOR_CARD_STATUS.SELESAI;
      }
      const beforeFirstSession = sessionRanges.every((r) => currentMinutes < r.start);
      if (beforeFirstSession) {
        return DOCTOR_CARD_STATUS.TUTUP;
      }
    }

    return null;
  }

  if (doctor.jadwal_hari_ini && doctor.jadwal_hari_ini.includes('-')) {
    const [startStr, endStr] = doctor.jadwal_hari_ini.split('-');
    if (startStr && endStr) {
      const sMin = parseTimeToMinutes(startStr.trim());
      const eMin = parseTimeToMinutes(endStr.trim());
      const isActive = currentMinutes >= sMin && currentMinutes < eMin;
      if (isActive) {
        if (
          statusDokter === SCHEDULE_STATUS.OCCUPIED ||
          statusJadwal === SCHEDULE_STATUS.OCCUPIED
        ) {
          return DOCTOR_CARD_STATUS.TERISI;
        }
        return DOCTOR_CARD_STATUS.BUKA;
      }
      return null;
    }
  }

  return null;
}

export interface UpcomingScheduleResult {
  upcomingTime: string;
  sessionName?: string;
  activeTime?: string;
  hasActive?: boolean;
  isActiveClosed?: boolean;
  isTomorrow?: boolean;
}

export function formatUpcomingFallback(text?: string): string | undefined {
  if (
    !text ||
    text.trim() === '' ||
    text === DOCTOR_CARD_STATUS.BELUM_DIATUR ||
    text === 'Belum diatur' ||
    text === 'Tidak Ada Jadwal'
  ) {
    return undefined;
  }
  const isSelesai = text.toLowerCase().includes('selesai');
  const match = text.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
  if (match) {
    const sTime = `${match[1].padStart(2, '0')}.${match[2]}`;
    const eTime = `${match[3].padStart(2, '0')}.${match[4]}`;
    const formatted = `${sTime} – ${eTime}`;
    return isSelesai ? `Besok, ${formatted}` : formatted;
  }
  const clean = text.replace(/:/g, '.');
  return isSelesai && !clean.toLowerCase().includes('besok') ? `Besok, ${clean}` : clean;
}

export function parseDateToIso(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const MONTHS: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    mei: '05',
    may: '05',
    jun: '06',
    jul: '07',
    agu: '08',
    aug: '08',
    sep: '09',
    okt: '10',
    oct: '10',
    nov: '11',
    des: '12',
    dec: '12'
  };
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthKey = match[2].toLowerCase().slice(0, 3);
    const month = MONTHS[monthKey] || '01';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return undefined;
}

export function getUpcomingScheduleTime(
  scheduleTime: string,
  sessions?: DoctorDailySession[],
  _doctor?: DoctorSchedule,
  referenceDate?: Date
): UpcomingScheduleResult {
  const now = referenceDate ?? new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let activeTime: string | undefined;
  let hasActive = false;
  let isActiveClosed = false;

  if (sessions && sessions.length > 0) {
    const activeSession = sessions.find((s) => isDoctorSessionActive(s, currentMinutes));
    if (activeSession) {
      hasActive = true;
      isActiveClosed = isSessionClosed(activeSession);
      const sTime = activeSession.jam_mulai.replace(':', '.');
      const eTime = activeSession.jam_selesai.replace(':', '.');
      activeTime = `${sTime} – ${eTime}`;
    }

    const upcomingSession = sessions.find(
      (s) => parseTimeToMinutes(s.jam_mulai) > currentMinutes && !isSessionClosed(s)
    );

    if (upcomingSession) {
      const sTime = upcomingSession.jam_mulai.replace(':', '.');
      const eTime = upcomingSession.jam_selesai.replace(':', '.');
      return {
        upcomingTime: `${sTime} – ${eTime}`,
        sessionName: upcomingSession.nama_sesi,
        activeTime,
        hasActive,
        isActiveClosed,
        isTomorrow: false
      };
    }

    const firstSession = sessions.find((s) => !isSessionClosed(s)) || sessions[0];
    if (firstSession) {
      const sTime = firstSession.jam_mulai.replace(':', '.');
      const eTime = firstSession.jam_selesai.replace(':', '.');
      const isPastSession =
        parseTimeToMinutes(firstSession.jam_selesai) <= currentMinutes ||
        parseTimeToMinutes(firstSession.jam_mulai) <= currentMinutes;
      const rawUpcoming = `${sTime} – ${eTime}`;
      return {
        upcomingTime: isPastSession ? `Besok, ${rawUpcoming}` : rawUpcoming,
        sessionName: firstSession.nama_sesi,
        activeTime,
        hasActive,
        isActiveClosed,
        isTomorrow: isPastSession
      };
    }
  }

  if (scheduleTime && scheduleTime.trim() !== '') {
    const formattedUpcoming = formatUpcomingFallback(scheduleTime);
    const cleanTime = formattedUpcoming || scheduleTime.replace(/:/g, '.');
    return {
      upcomingTime: cleanTime,
      activeTime,
      hasActive,
      isActiveClosed,
      isTomorrow: false
    };
  }

  return {
    upcomingTime: DOCTOR_CARD_STATUS.BELUM_DIATUR,
    activeTime,
    hasActive,
    isActiveClosed,
    isTomorrow: false
  };
}
