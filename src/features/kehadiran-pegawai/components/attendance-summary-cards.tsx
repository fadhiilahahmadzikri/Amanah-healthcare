'use client';

import React from 'react';
import { MetricChartCard } from '@/components/charts/metric-chart-card';
import { Icons } from '@/components/icons';
import type { AttendanceMetrics } from '../api/types';

interface AttendanceSummaryCardsProps {
  summary: AttendanceMetrics;
}

export function AttendanceSummaryCards({ summary }: AttendanceSummaryCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {/* 1. Total Staf */}
      <MetricChartCard
        title='Total Staf'
        value={summary.total_staf.toString()}
        description='vs kemarin'
        data={summary.sparkline_total_staf}
        trendLabel={`↑ ${summary.perubahan_total_staf}%`}
        trendDirection='up'
        tone='primary'
        strokeColor='var(--primary-bright, #2563eb)'
        icon={<Icons.teams className='size-5 text-primary' />}
      />

      {/* 2. Staf Hadir */}
      <MetricChartCard
        title='Staf Hadir'
        value={summary.staf_hadir.toString()}
        description='vs kemarin'
        data={summary.sparkline_staf_hadir}
        trendLabel={`↑ ${summary.perubahan_staf_hadir}%`}
        trendDirection='up'
        tone='primary'
        strokeColor='var(--primary-bright, #2563eb)'
        icon={<Icons.teams className='size-5 text-primary' />}
      />

      {/* 3. Staf Tidak Hadir */}
      <MetricChartCard
        title='Staf Tidak Hadir'
        value={summary.staf_tidak_hadir.toString()}
        description='vs kemarin'
        data={summary.sparkline_staf_tidak_hadir}
        trendLabel={`↓ ${Math.abs(summary.perubahan_staf_tidak_hadir)}%`}
        trendDirection='down'
        tone='primary'
        strokeColor='var(--primary-bright, #2563eb)'
        icon={<Icons.fileTypeDoc className='size-5 text-primary' />}
      />

      {/* 4. Tingkat Kehadiran */}
      <MetricChartCard
        title='Tingkat Kehadiran'
        value={`${summary.tingkat_kehadiran}%`}
        description='vs kemarin'
        data={summary.sparkline_tingkat_kehadiran}
        trendLabel={`↑ ${summary.perubahan_tingkat_kehadiran}%`}
        trendDirection='up'
        tone='primary'
        strokeColor='var(--primary-bright, #2563eb)'
        icon={<Icons.trendingUp className='size-5 text-primary' />}
      />
    </div>
  );
}
