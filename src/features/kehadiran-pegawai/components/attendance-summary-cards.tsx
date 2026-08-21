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
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {/* 1. Total Staf */}
      <MetricChartCard
        title='Total Staf'
        value={summary.total_staf.toString()}
        description='vs kemarin'
        data={summary.sparkline_total_staf}
        trendLabel={`↑ ${summary.perubahan_total_staf}%`}
        trendDirection='up'
        tone='primary'
        icon={<Icons.teams className='size-5 text-chart-1' />}
      />

      {/* 2. Staf Hadir */}
      <MetricChartCard
        title='Staf Hadir'
        value={summary.staf_hadir.toString()}
        description='vs kemarin'
        data={summary.sparkline_staf_hadir}
        trendLabel={`↑ ${summary.perubahan_staf_hadir}%`}
        trendDirection='up'
        tone='success'
        icon={<Icons.userCheck className='size-5 text-chart-2' />}
      />

      {/* 3. Staf Tidak Hadir */}
      <MetricChartCard
        title='Staf Tidak Hadir'
        value={summary.staf_tidak_hadir.toString()}
        description='vs kemarin'
        data={summary.sparkline_staf_tidak_hadir}
        trendLabel={`↓ ${Math.abs(summary.perubahan_staf_tidak_hadir)}%`}
        trendDirection='down'
        tone='danger'
        icon={<Icons.userX className='size-5 text-chart-5' />}
      />

      {/* 4. Tingkat Kehadiran */}
      <MetricChartCard
        title='Tingkat Kehadiran'
        value={`${summary.tingkat_kehadiran}%`}
        description='vs kemarin'
        data={summary.sparkline_tingkat_kehadiran}
        trendLabel={`↑ ${summary.perubahan_tingkat_kehadiran}%`}
        trendDirection='up'
        tone='warning'
        icon={<Icons.trendingUp className='size-5 text-chart-4' />}
      />
    </div>
  );
}
