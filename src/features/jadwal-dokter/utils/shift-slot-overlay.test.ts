import { describe, it, expect } from 'bun:test';
import { overlaySessionsOnShifts } from './shift-slot-overlay';
import type { OccupancyShift } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession } from '../api/types';

describe('overlaySessionsOnShifts', () => {
  const dummyShift: OccupancyShift = {
    contextId: 'ctx-malam',
    contextLabel: 'Shift Malam (18:00 - 00:00)',
    shift: 'MALAM',
    name: 'Shift Malam',
    timeRange: '18:00 - 00:00',
    totalSlots: 2,
    availableSlotsCount: 0,
    occupiedSlotsCount: 0,
    slots: [
      {
        slotIndex: 0,
        startTime: '18:00',
        endTime: '18:30',
        status: 'UNSCHEDULED',
        availabilityState: 'UNSCHEDULED',
        effectiveStatus: 'UNSCHEDULED',
        actionType: 'ADD_SESSION',
        isClickable: true,
        isSelectable: false,
        uiStatus: 'UNSCHEDULED',
        uiLabel: 'Belum Terjadwal',
        uiVariant: 'dashed_border'
      },
      {
        slotIndex: 1,
        startTime: '18:30',
        endTime: '19:00',
        status: 'UNSCHEDULED',
        availabilityState: 'UNSCHEDULED',
        effectiveStatus: 'UNSCHEDULED',
        actionType: 'ADD_SESSION',
        isClickable: true,
        isSelectable: false,
        uiStatus: 'UNSCHEDULED',
        uiLabel: 'Belum Terjadwal',
        uiVariant: 'dashed_border'
      }
    ]
  };

  it('returns original shifts when sessions array is empty', () => {
    const result = overlaySessionsOnShifts([dummyShift], []);
    expect(result).toEqual([dummyShift]);
  });

  it('overlays newly added session onto UNSCHEDULED slot with AVAILABLE and success_green', () => {
    const session: DoctorDailySession = {
      id: 'session-1',
      nama_sesi: 'Shift Malam',
      jam_mulai: '18:00',
      jam_selesai: '18:30',
      waktu: '18:00 - 18:30 WIB',
      kuota_pasien: 1,
      slot_tersedia: 1,
      status_sesi: 'OPEN',
      ruang: 'Ruang KIA 1'
    };

    const result = overlaySessionsOnShifts([dummyShift], [session]);
    const slot0 = result[0].slots[0];
    const slot1 = result[0].slots[1];

    expect(slot0.status).toBe('AVAILABLE');
    expect(slot0.uiStatus).toBe('AVAILABLE');
    expect(slot0.uiVariant).toBe('success_green');
    expect(slot0.uiLabel).toBe('Tersedia');
    expect(slot0.actionType).toBe('VIEW_SESSION');
    expect(slot0.sessionId).toBe('session-1');
    expect(slot0.room).toBe('Ruang KIA 1');

    // Slot 1 remains unscheduled
    expect(slot1.status).toBe('UNSCHEDULED');
    expect(slot1.actionType).toBe('ADD_SESSION');

    // Metrics are recalculated
    expect(result[0].availableSlotsCount).toBe(1);
    expect(result[0].metrics?.scheduledSlots).toBe(1);
    expect(result[0].metrics?.unscheduledSlots).toBe(1);
  });

  it('overlays CLOSED session with CLOSED status and danger_red variant', () => {
    const closedSession: DoctorDailySession = {
      id: 'session-closed',
      nama_sesi: 'Shift Malam',
      jam_mulai: '18:00',
      jam_selesai: '18:30',
      kuota_pasien: 1,
      slot_tersedia: 0,
      status_sesi: 'CLOSED',
      ruang: 'Ruang KIA 1'
    };

    const result = overlaySessionsOnShifts([dummyShift], [closedSession]);
    const slot0 = result[0].slots[0];

    expect(slot0.status).toBe('CLOSED');
    expect(slot0.uiStatus).toBe('CLOSED_CLINIC');
    expect(slot0.uiVariant).toBe('danger_red');
    expect(slot0.uiLabel).toBe('Ditutup');
  });

  it('overlays OCCUPIED session with info_blue variant and VIEW_PATIENTS action', () => {
    const occupiedSession: DoctorDailySession = {
      id: 'session-occupied',
      nama_sesi: 'Shift Malam',
      jam_mulai: '18:00',
      jam_selesai: '18:30',
      kuota_pasien: 1,
      slot_tersedia: 0,
      status_sesi: 'OPEN',
      ruang: 'Ruang KIA 1'
    };

    const result = overlaySessionsOnShifts([dummyShift], [occupiedSession]);
    const slot0 = result[0].slots[0];

    expect(slot0.status).toBe('OCCUPIED');
    expect(slot0.uiStatus).toBe('OCCUPIED');
    expect(slot0.uiVariant).toBe('info_blue');
    expect(slot0.uiLabel).toBe('Terisi');
    expect(slot0.actionType).toBe('VIEW_PATIENTS');
  });
});
