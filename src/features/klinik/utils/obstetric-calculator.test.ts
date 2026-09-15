import { describe, expect, it } from 'bun:test';
import {
  calculateEddFromArt,
  calculateEddFromLmp,
  calculateEddFromUsg,
  calculateGestationalAge,
  determineBestObstetricEdd,
  formatIndonesianDateText
} from './obstetric-calculator';

describe('ACOG-Compliant Obstetric Calculator', () => {
  describe('calculateEddFromLmp (HPL dari HPHT)', () => {
    it('calculates HPL as exactly 280 days from HPHT (standard ACOG)', () => {
      // User example: HPHT 15 Mei 2026 -> HPL 19 Februari 2027
      const lmp = '2026-05-15';
      const edd = calculateEddFromLmp(lmp);

      expect(edd.toISOString().slice(0, 10)).toBe('2027-02-19');
      expect(formatIndonesianDateText(edd)).toBe('19 Februari 2027');
    });

    it('calculates HPL correctly across leap years and month lengths', () => {
      const lmp = '2026-01-01';
      const edd = calculateEddFromLmp(lmp);

      expect(edd.toISOString().slice(0, 10)).toBe('2026-10-08');
      expect(formatIndonesianDateText(edd)).toBe('8 Oktober 2026');
    });
  });

  describe('calculateGestationalAge (UK dinamis dari HPL dan tanggal pemeriksaan)', () => {
    const edd = '2027-02-19';

    it('calculates exact gestational age on 16 September 2026 as 17 minggu 5 hari (17 5/7 minggu)', () => {
      // Reference date: 16 September 2026
      // Days until EDD: 19 Feb 2027 - 16 Sep 2026 = 156 days
      // Gestational age: 280 - 156 = 124 days = 17 weeks 5 days
      const referenceDate = '2026-09-16';
      const ga = calculateGestationalAge(edd, referenceDate);

      expect(ga.totalDays).toBe(124);
      expect(ga.weeks).toBe(17);
      expect(ga.days).toBe(5);
      expect(ga.formatted).toBe('17 minggu 5 hari');
      expect(ga.formattedMedical).toBe('17 5/7 minggu');
    });

    it('calculates exact 16 weeks (16+0) on 5 September 2026', () => {
      const referenceDate = '2026-09-05';
      const ga = calculateGestationalAge(edd, referenceDate);

      expect(ga.weeks).toBe(16);
      expect(ga.days).toBe(1); // 16 weeks 1 day
    });

    it('advances gestational age dynamically as reference date advances', () => {
      const day1 = calculateGestationalAge(edd, '2026-09-16');
      const day2 = calculateGestationalAge(edd, '2026-09-17');
      const day3 = calculateGestationalAge(edd, '2026-09-18');

      expect(day1.formatted).toBe('17 minggu 5 hari');
      expect(day2.formatted).toBe('17 minggu 6 hari');
      expect(day3.formatted).toBe('18 minggu 0 hari');
    });
  });

  describe('determineBestObstetricEdd (ACOG Redating Hierarchy)', () => {
    it('keeps LMP as EDD when USG discrepancy is within ACOG tolerance (<= 7 days in trimester 1)', () => {
      const estimate = determineBestObstetricEdd({
        lmpDate: '2026-05-15', // EDD LMP = 2027-02-19
        usgDate: '2026-07-15',
        usgGestationalAge: { weeks: 8, days: 3 }, // EDD USG approx 2027-02-21 (diff: 2 days <= 7)
        referenceDate: '2026-09-16'
      });

      expect(estimate.datingMethod).toBe('LMP');
      expect(estimate.isRedated).toBe(false);
      expect(estimate.eddFinalFormatted).toBe('19 Februari 2027');
    });

    it('redates EDD to USG when discrepancy exceeds ACOG threshold (> 7 days in trimester 1)', () => {
      const estimate = determineBestObstetricEdd({
        lmpDate: '2026-05-15', // EDD LMP = 2027-02-19
        usgDate: '2026-07-15',
        usgGestationalAge: { weeks: 7, days: 0 }, // EDD USG = 2027-03-02 (diff: 11 days > 7)
        referenceDate: '2026-09-16'
      });

      expect(estimate.datingMethod).toBe('FIRST_TRIMESTER_ULTRASOUND');
      expect(estimate.isRedated).toBe(true);
      expect(estimate.redatingReason).toContain('melebihi ambang ACOG');
      expect(estimate.eddFinalFormatted).toBe('3 Maret 2027');
    });

    it('prioritizes ART / IVF dating over LMP and USG', () => {
      const transferDate = '2026-06-01';
      const estimate = determineBestObstetricEdd({
        isArt: true,
        artTransferDate: transferDate,
        artEmbryoAgeDays: 5,
        lmpDate: '2026-05-15',
        referenceDate: '2026-09-16'
      });

      expect(estimate.datingMethod).toBe('ART');
      expect(estimate.isRedated).toBe(false);
      // Transfer + 261 days = 2027-02-17
      expect(estimate.eddFinal.toISOString().slice(0, 10)).toBe('2027-02-17');
    });
  });
});
