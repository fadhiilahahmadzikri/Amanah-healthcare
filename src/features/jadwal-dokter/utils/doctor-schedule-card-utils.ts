import type { DoctorSchedule, DoctorDailySession } from '../api/types';

export function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.replace('.', ':');
  const [h, m] = clean.split(':').map((v) => Number.parseInt(v, 10) || 0);
  return h * 60 + m;
}

export const UNCONFIGURED_SCHEDULE_VALUES = new Set(['', '-', 'belum diatur', 'belum dijadwalkan']);

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
  if (doctor.sesi_harian && doctor.sesi_harian.length > 0) {
    return true;
  }

  const scheduleTime = doctor.jadwal_hari_ini?.trim().toLowerCase() ?? '';
  return !UNCONFIGURED_SCHEDULE_VALUES.has(scheduleTime);
}

export interface UpcomingScheduleResult {
  labelTime: string;
  sessionName?: string;
  activeTime?: string;
  upcomingTime?: string;
  hasActive?: boolean;
  isActiveClosed?: boolean;
}

export function isSlotClosed(slot: {
  status?: string | null;
  availabilityState?: string | null;
  effectiveStatus?: string | null;
  uiStatus?: string | null;
  closure?: unknown;
  closureInfo?: unknown;
  closedReason?: string | null;
}): boolean {
  const status = (slot.status || '').toUpperCase();
  const avail = (slot.availabilityState || '').toUpperCase();
  const eff = (slot.effectiveStatus || '').toUpperCase();
  const ui = (slot.uiStatus || '').toUpperCase();
  return (
    status === 'CLOSED' ||
    status === 'CLOSED_LEAVE' ||
    status === 'TUTUP' ||
    avail === 'CLOSED' ||
    eff === 'CLOSED' ||
    ui.startsWith('CLOSED') ||
    Boolean(slot.closure) ||
    Boolean(slot.closureInfo) ||
    Boolean(slot.closedReason)
  );
}

export function isSlotAvailable(slot: {
  isAvailable?: boolean;
  status?: string | null;
  availabilityState?: string | null;
  effectiveStatus?: string | null;
  isOccupied?: boolean;
}): boolean {
  if (slot.isOccupied) return false;
  if (typeof slot.isAvailable === 'boolean') return slot.isAvailable;
  const status = (slot.status || '').toUpperCase();
  const avail = (slot.availabilityState || '').toUpperCase();
  const eff = (slot.effectiveStatus || '').toUpperCase();
  return (
    status === 'AVAILABLE' ||
    status === 'OPEN' ||
    status === 'BUKA' ||
    avail === 'AVAILABLE' ||
    eff === 'AVAILABLE'
  );
}

export function formatUpcomingFallback(text?: string): string | undefined {
  if (!text || text.trim() === '' || text === 'Belum diatur' || text === 'Tidak Ada Jadwal') {
    return undefined;
  }
  const match = text.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
  if (match) {
    const startH = Number.parseInt(match[1], 10);
    const startM = Number.parseInt(match[2], 10);
    const totalStartMin = startH * 60 + startM;
    const totalEndMin = totalStartMin + 30;
    const sTime = `${String(Math.floor(totalStartMin / 60)).padStart(2, '0')}.${String(totalStartMin % 60).padStart(2, '0')}`;
    const eTime = `${String(Math.floor(totalEndMin / 60)).padStart(2, '0')}.${String(totalEndMin % 60).padStart(2, '0')}`;
    return `${sTime} – ${eTime}`;
  }
  return text.replace(/:/g, '.');
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
  doctor?: DoctorSchedule,
  referenceDate?: Date
): UpcomingScheduleResult {
  const now = referenceDate ?? new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const allSlots: Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isOpen: boolean;
    sessionName?: string;
  }> = [];

  if (doctor?.shifts && doctor.shifts.length > 0) {
    for (const shift of doctor.shifts) {
      for (const slot of shift.slots) {
        const closed = isSlotClosed(slot);
        allSlots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: !closed && isSlotAvailable(slot),
          isOpen: !closed,
          sessionName: shift.contextLabel
        });
      }
    }
  } else if (doctor?.timeline_intervals && doctor.timeline_intervals.length > 0) {
    for (const it of doctor.timeline_intervals) {
      const closed = isSlotClosed(it);
      allSlots.push({
        startTime: it.startTime,
        endTime: it.endTime,
        isAvailable: !closed && isSlotAvailable(it),
        isOpen: !closed
      });
    }
  } else if (sessions && sessions.length > 0) {
    const sorted = sessions.toSorted(
      (a, b) => parseTimeToMinutes(a.jam_mulai) - parseTimeToMinutes(b.jam_mulai)
    );
    for (const s of sorted) {
      const isSessionOpen =
        s.status_sesi?.toUpperCase() === 'OPEN' || s.status_sesi?.toUpperCase() === 'BUKA';
      const hasSlot = (s.slot_tersedia ?? 1) > 0;
      const sMin = parseTimeToMinutes(s.jam_mulai);
      const eMin = parseTimeToMinutes(s.jam_selesai);
      for (let m = sMin; m < eMin; m += 30) {
        const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        const slotEndMin = m + 30;
        const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`;
        allSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: isSessionOpen && hasSlot,
          isOpen: isSessionOpen,
          sessionName: s.nama_sesi
        });
      }
    }
  }

  let activeTime: string | undefined;
  let hasActive = false;
  let isActiveClosed = false;

  const currentMatchingSlot = allSlots.find(
    (slot) =>
      parseTimeToMinutes(slot.startTime) <= currentMinutes &&
      parseTimeToMinutes(slot.endTime) > currentMinutes
  );

  if (currentMatchingSlot) {
    hasActive = true;
    activeTime = `${currentMatchingSlot.startTime.replace(':', '.')} – ${currentMatchingSlot.endTime.replace(':', '.')}`;
    isActiveClosed = !currentMatchingSlot.isOpen;
  } else if (sessions && sessions.length > 0 && allSlots.length === 0) {
    const activeSession = sessions.find(
      (s) =>
        parseTimeToMinutes(s.jam_mulai) <= currentMinutes &&
        parseTimeToMinutes(s.jam_selesai) > currentMinutes
    );
    if (activeSession) {
      hasActive = true;
      isActiveClosed = isSlotClosed({ status: activeSession.status_sesi });
      const sStart = parseTimeToMinutes(activeSession.jam_mulai);
      const offset = Math.floor((currentMinutes - sStart) / 30) * 30;
      const winStart = sStart + offset;
      const winEnd = winStart + 30;
      const sTime = `${String(Math.floor(winStart / 60)).padStart(2, '0')}.${String(winStart % 60).padStart(2, '0')}`;
      const eTime = `${String(Math.floor(winEnd / 60)).padStart(2, '0')}.${String(winEnd % 60).padStart(2, '0')}`;
      activeTime = `${sTime} – ${eTime}`;
    }
  }

  const futureAvailableSlot = allSlots.find(
    (slot) =>
      slot.isAvailable &&
      slot.isOpen === true &&
      parseTimeToMinutes(slot.startTime) > currentMinutes
  );

  if (futureAvailableSlot) {
    const sTime = futureAvailableSlot.startTime.replace(':', '.');
    const eTime = futureAvailableSlot.endTime.replace(':', '.');
    const formattedUpcoming = `${sTime} – ${eTime}`;
    return {
      labelTime: formattedUpcoming,
      upcomingTime: formattedUpcoming,
      sessionName: futureAvailableSlot.sessionName,
      activeTime,
      hasActive,
      isActiveClosed
    };
  }

  const firstAvailableSlot = allSlots.find((slot) => slot.isAvailable && slot.isOpen === true);
  if (firstAvailableSlot) {
    const sTime = firstAvailableSlot.startTime.replace(':', '.');
    const eTime = firstAvailableSlot.endTime.replace(':', '.');
    const formattedUpcoming = `${sTime} – ${eTime}`;
    return {
      labelTime: formattedUpcoming,
      upcomingTime: formattedUpcoming,
      sessionName: firstAvailableSlot.sessionName,
      activeTime,
      hasActive,
      isActiveClosed
    };
  }

  if (sessions && sessions.length > 0) {
    const upcomingSession =
      sessions.find(
        (s) =>
          parseTimeToMinutes(s.jam_mulai) > currentMinutes &&
          s.status_sesi?.toUpperCase() !== 'CLOSED' &&
          s.status_sesi?.toUpperCase() !== 'TUTUP'
      ) ||
      sessions.find(
        (s) => s.status_sesi?.toUpperCase() !== 'CLOSED' && s.status_sesi?.toUpperCase() !== 'TUTUP'
      ) ||
      sessions[0];

    if (upcomingSession) {
      const sMin = parseTimeToMinutes(upcomingSession.jam_mulai);
      const eMin = sMin + 30;
      const sTime = upcomingSession.jam_mulai.replace(':', '.');
      const eTime = `${String(Math.floor(eMin / 60)).padStart(2, '0')}.${String(eMin % 60).padStart(2, '0')}`;
      const formattedUpcoming = `${sTime} – ${eTime}`;
      return {
        labelTime: formattedUpcoming,
        upcomingTime: formattedUpcoming,
        sessionName: upcomingSession.nama_sesi,
        activeTime,
        hasActive,
        isActiveClosed
      };
    }
  }

  if (scheduleTime && scheduleTime.trim() !== '') {
    const parts = scheduleTime.split('-').map((p) => p.trim());
    if (parts.length === 2 && parts[0]) {
      const sMin = parseTimeToMinutes(parts[0]);
      const eMin = sMin + 30;
      const sTime = parts[0].replace(':', '.');
      const eTime = `${String(Math.floor(eMin / 60)).padStart(2, '0')}.${String(eMin % 60).padStart(2, '0')}`;
      const formattedUpcoming = `${sTime} – ${eTime}`;
      return {
        labelTime: formattedUpcoming,
        upcomingTime: formattedUpcoming,
        activeTime,
        hasActive,
        isActiveClosed
      };
    }
    const cleanTime = scheduleTime.replace(/:/g, '.');
    return {
      labelTime: cleanTime,
      upcomingTime: cleanTime,
      activeTime,
      hasActive,
      isActiveClosed
    };
  }

  return {
    labelTime: 'Belum diatur',
    upcomingTime: 'Belum diatur',
    activeTime,
    hasActive,
    isActiveClosed
  };
}

export function getDoctorCardStatus(
  doctor: DoctorSchedule
): 'Buka' | 'Cuti' | 'Terisi' | 'Belum Diatur' | 'Tutup' {
  const statusDokter = (doctor.status_dokter || '').trim().toUpperCase();
  const statusJadwal = (doctor.status_jadwal || '').trim().toUpperCase();

  if (doctor.is_cuti || statusDokter === 'CUTI' || statusJadwal === 'CUTI') {
    return 'Cuti';
  }

  if (
    statusDokter === 'CLOSED' ||
    statusDokter === 'TUTUP' ||
    statusJadwal === 'CLOSED' ||
    statusJadwal === 'TUTUP'
  ) {
    return 'Tutup';
  }

  if (!hasConfiguredDoctorSchedule(doctor)) {
    return 'Belum Diatur';
  }

  if (
    statusDokter === 'OCCUPIED' ||
    statusDokter === 'TERISI' ||
    statusJadwal === 'OCCUPIED' ||
    statusJadwal === 'TERISI' ||
    doctor.slot_tersedia <= 0
  ) {
    return 'Terisi';
  }

  return 'Buka';
}
