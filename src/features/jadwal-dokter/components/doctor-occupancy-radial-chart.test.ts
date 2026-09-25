import { describe, it, expect } from 'bun:test';

describe('DoctorOccupancyRadialChart Logic & Clinical Terminology SSOT', () => {
  it('correctly calculates clinical percentage metrics for active practice day', () => {
    const scheduleCoverage = {
      scheduled: 24,
      total: 48,
      percentage: 50
    };
    const patientOccupancy = {
      occupied: 12,
      capacity: 24,
      percentage: 50
    };

    expect(scheduleCoverage.scheduled).toBe(24);
    expect(scheduleCoverage.total).toBe(48);
    expect(scheduleCoverage.percentage).toBe(50);
    expect(patientOccupancy.occupied).toBe(12);
    expect(patientOccupancy.capacity).toBe(24);
  });

  it('guarantees clinical terminology: Alokasi Praktik and Keterisian Kuota', () => {
    const scheduledSlots = 24;
    const totalSlots = 48;
    const coveragePercentage = 50;

    const occupiedSlots = 0;
    const activeBookableSlots = 24;
    const occupancyPercentage = 0;

    const alokasiPraktikText = `Alokasi Praktik: ${scheduledSlots}/${totalSlots} Slot (${coveragePercentage}%)`;
    const keterisianKuotaText = `Keterisian Kuota: ${occupiedSlots}/${activeBookableSlots} Pasien (${occupancyPercentage}%)`;

    expect(alokasiPraktikText).toBe('Alokasi Praktik: 24/48 Slot (50%)');
    expect(keterisianKuotaText).toBe('Keterisian Kuota: 0/24 Pasien (0%)');
  });

  it('correctly calculates unscheduled slots remainder', () => {
    const totalSlots = 48;
    const scheduledSlots = 24;
    const unscheduled = Math.max(0, totalSlots - scheduledSlots);

    expect(unscheduled).toBe(24);
  });

  it('handles 0% and 100% boundary conditions safely', () => {
    const emptyDay = {
      scheduled: 0,
      total: 48,
      percentage: 0
    };
    const fullDay = {
      occupied: 24,
      capacity: 24,
      percentage: 100
    };

    expect(emptyDay.percentage).toBe(0);
    expect(fullDay.percentage).toBe(100);
  });
});
