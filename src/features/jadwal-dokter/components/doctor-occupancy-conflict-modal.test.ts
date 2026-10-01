import { describe, it, expect } from 'bun:test';

describe('DoctorOccupancyConflictModal formatters', () => {
  it('extracts conflict details safely from slot', () => {
    const slot = {
      startTime: '18:00',
      endTime: '18:30',
      uiVariant: 'purple_other' as const,
      conflictInfo: {
        type: 'ROOM_COLLISION_OTHER_DOCTOR',
        practitionerName: 'dr. Sarah Sp.A',
        practitionerSpecialty: 'Spesialis Anak',
        roomName: 'Ruang KIA 1',
        startTime: '18:00',
        endTime: '19:00',
        message: 'Ruangan Ruang KIA 1 sedang digunakan oleh dr. Sarah Sp.A pada 18:00 - 19:00 WIB.'
      }
    };

    expect(slot.conflictInfo.practitionerName).toBe('dr. Sarah Sp.A');
    expect(slot.conflictInfo.roomName).toBe('Ruang KIA 1');
    expect(slot.conflictInfo.practitionerSpecialty).toBe('Spesialis Anak');
  });

  it('formats conflict details from ClinicRoom occupantDetails', () => {
    const occupantDetails = {
      practitionerName: 'dr. Budi Sp.PD',
      specialty: 'Spesialis Penyakit Dalam',
      roomName: 'Ruang Poli 2',
      startTime: '19:30',
      endTime: '20:00'
    };

    expect(occupantDetails.practitionerName).toBe('dr. Budi Sp.PD');
    expect(occupantDetails.specialty).toBe('Spesialis Penyakit Dalam');
    expect(occupantDetails.roomName).toBe('Ruang Poli 2');
    expect(`${occupantDetails.startTime} - ${occupantDetails.endTime} WIB`).toBe('19:30 - 20:00 WIB');
  });
});
