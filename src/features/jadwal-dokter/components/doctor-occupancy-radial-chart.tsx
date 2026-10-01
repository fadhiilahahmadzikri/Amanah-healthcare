'use client';

import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface DoctorOccupancyRadialChartProps {
  scheduleCoverage: {
    scheduled: number;
    total: number;
    percentage: number;
    displayText?: string;
  };
  patientOccupancy: {
    occupied: number;
    capacity: number;
    percentage: number;
    displayText?: string;
  };
  unscheduledNotice?: string;
  unscheduledSlots?: number;
  className?: string;
}

/**
 * DoctorOccupancyRadialChart
 *
 * Compact animated dual-concentric radial progress chart for clinical schedule metrics.
 * Designed using clinical terminology understood by practicing doctors:
 * - "Alokasi Praktik": scheduled consultation slots out of total daily slots
 * - "Keterisian Kuota": booked patients out of total available patient quota
 */
export function DoctorOccupancyRadialChart({
  scheduleCoverage,
  patientOccupancy,
  unscheduledNotice,
  unscheduledSlots,
  className
}: DoctorOccupancyRadialChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const coveragePct = Math.min(100, Math.max(0, scheduleCoverage.percentage || 0));
  const occupancyPct = Math.min(100, Math.max(0, patientOccupancy.percentage || 0));

  // Outer Ring Dimensions (Alokasi Praktik)
  const outerRadius = 24;
  const outerCircumference = 2 * Math.PI * outerRadius; // ~150.796
  const outerOffset = isMounted ? outerCircumference * (1 - coveragePct / 100) : outerCircumference;

  // Inner Ring Dimensions (Keterisian Kuota)
  const innerRadius = 17;
  const innerCircumference = 2 * Math.PI * innerRadius; // ~106.814
  const innerOffset = isMounted
    ? innerCircumference * (1 - occupancyPct / 100)
    : innerCircumference;

  const unscheduledCount =
    unscheduledSlots !== undefined
      ? unscheduledSlots
      : Math.max(0, (scheduleCoverage.total || 48) - (scheduleCoverage.scheduled || 0));

  return (
    <div
      className={cn(
        'px-3.5 sm:px-4 py-2 border-b border-border/30 bg-muted/10 flex items-center justify-between gap-3 flex-wrap text-xs select-none transition-colors',
        className
      )}
      aria-label='Ringkasan Alokasi Praktik dan Keterisian Kuota Pasien'
    >
      {/* Left: Animated Radial Chart + Clinical Metrics Grid */}
      <div className='flex items-center gap-3.5 sm:gap-4 flex-wrap'>
        {/* Animated Dual-Concentric Radial Chart */}
        <div
          className='relative size-13.5 sm:size-14 shrink-0 flex items-center justify-center'
          title={`Alokasi Praktik: ${coveragePct}%, Keterisian Kuota: ${occupancyPct}%`}
        >
          <svg
            className='size-full -rotate-90 transform overflow-visible'
            viewBox='0 0 60 60'
            aria-hidden='true'
          >
            {/* Outer Ring Background (Alokasi Praktik Track) */}
            <circle
              cx='30'
              cy='30'
              r={outerRadius}
              className='stroke-emerald-500/15 dark:stroke-emerald-500/20'
              strokeWidth='4'
              fill='none'
            />
            {/* Outer Ring Active Animated Arc */}
            <circle
              cx='30'
              cy='30'
              r={outerRadius}
              className='stroke-emerald-500 transition-[stroke-dashoffset] duration-1000 ease-out'
              strokeWidth='4'
              strokeLinecap='round'
              fill='none'
              style={{
                strokeDasharray: outerCircumference,
                strokeDashoffset: outerOffset
              }}
            >
              <title>{`Alokasi Praktik: ${scheduleCoverage.scheduled}/${scheduleCoverage.total} Slot (${coveragePct}%)`}</title>
            </circle>

            {/* Inner Ring Background (Keterisian Kuota Track) */}
            <circle
              cx='30'
              cy='30'
              r={innerRadius}
              className='stroke-sky-500/15 dark:stroke-sky-500/20'
              strokeWidth='3.5'
              fill='none'
            />
            {/* Inner Ring Active Animated Arc */}
            <circle
              cx='30'
              cy='30'
              r={innerRadius}
              className='stroke-sky-500 transition-[stroke-dashoffset] duration-1000 ease-out'
              strokeWidth='3.5'
              strokeLinecap='round'
              fill='none'
              style={{
                strokeDasharray: innerCircumference,
                strokeDashoffset: innerOffset
              }}
            >
              <title>{`Keterisian Kuota: ${patientOccupancy.occupied}/${patientOccupancy.capacity} Pasien (${occupancyPct}%)`}</title>
            </circle>
          </svg>

          {/* Center Clinical Icon */}
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <Icons.stethoscope className='size-3.5 text-muted-foreground/80 dark:text-muted-foreground' />
          </div>
        </div>

        {/* Clinical Metric Details (Bahasa Medis yang Dipahami Dokter) */}
        <div className='flex flex-col justify-center gap-1 min-w-0'>
          {/* Row 1: Alokasi Praktik (Cakupan Jam/Slot Praktik Dokter) */}
          <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs leading-none'>
            <span className='size-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-500/20' />
            <span className='font-semibold text-foreground text-[11.5px] sm:text-xs'>
              Alokasi Praktik:
            </span>
            <span className='font-mono font-bold text-foreground text-[11.5px] sm:text-xs'>
              {scheduleCoverage.scheduled}/{scheduleCoverage.total || 48} Slot
            </span>
            <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 leading-none'>
              {coveragePct}%
            </span>
          </div>

          {/* Row 2: Keterisian Kuota Pasien (Antrean / Pasien Booking) */}
          <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs leading-none'>
            <span className='size-2 rounded-full bg-sky-500 shrink-0 ring-2 ring-sky-500/20' />
            <span className='font-semibold text-foreground text-[11.5px] sm:text-xs'>
              Keterisian Kuota:
            </span>
            <span className='font-mono font-bold text-foreground text-[11.5px] sm:text-xs'>
              {patientOccupancy.occupied}/{patientOccupancy.capacity} Pasien
            </span>
            <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold font-mono bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 leading-none'>
              {occupancyPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Right: Unscheduled Slots Notice */}
      {unscheduledNotice ? (
        <div className='text-[11px] text-muted-foreground font-medium pl-1'>
          {unscheduledNotice}
        </div>
      ) : unscheduledCount > 0 ? (
        <div className='text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 pl-1'>
          <span className='inline-flex items-center justify-center px-2 py-0.5 rounded-md border border-dashed border-border/80 bg-background/60 font-mono font-bold text-foreground text-[10.5px]'>
            {unscheduledCount} slot
          </span>
          <span className='hidden sm:inline'>belum dijadwalkan</span>
        </div>
      ) : (
        <div className='text-[11px] text-muted-foreground font-medium pl-1'>
          Semua slot telah terjadwal
        </div>
      )}
    </div>
  );
}
