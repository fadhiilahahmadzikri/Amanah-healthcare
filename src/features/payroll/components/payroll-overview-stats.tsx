'use client';

import React, { useMemo } from 'react';
import { MetricChartCard, type MetricChartPoint } from '@/components/charts/metric-chart-card';
import { Icons } from '@/components/icons';
import { formatCurrency } from '../utils/currency';
import { formatPracticeHours } from '@/lib/duration-format';
import { cn } from '@/lib/utils';
import type { PayrollPeriodItem, PayrollSummaryItem } from '../api/types';

export interface PayrollOverviewStatsProps {
  period?: PayrollPeriodItem | null;
  summaries: PayrollSummaryItem[];
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function PayrollOverviewStats({
  period,
  summaries,
  layout = 'horizontal',
  className
}: PayrollOverviewStatsProps) {
  const totalPayout = period?.totalPayout ?? summaries.reduce((acc, s) => acc + s.netPayroll, 0);
  const totalBaseHours = summaries.reduce((acc, s) => acc + s.baseHours, 0);
  const totalLeaveDeductions = summaries.reduce((acc, s) => acc + s.leaveDeductions, 0);
  const totalReplacementAdditions = summaries.reduce((acc, s) => acc + s.replacementAdditions, 0);

  // Only generate sparkline data points when there are at least 2 staff summaries to form a valid distribution
  const hasCompatibleData = summaries.length >= 2;

  const sparklinePayout = useMemo<MetricChartPoint[] | undefined>(() => {
    if (!hasCompatibleData) return undefined;
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.netPayroll
    }));
  }, [hasCompatibleData, summaries]);

  const sparklineHours = useMemo<MetricChartPoint[] | undefined>(() => {
    if (!hasCompatibleData) return undefined;
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.baseHours
    }));
  }, [hasCompatibleData, summaries]);

  const sparklineDeductions = useMemo<MetricChartPoint[] | undefined>(() => {
    if (!hasCompatibleData) return undefined;
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.leaveDeductions
    }));
  }, [hasCompatibleData, summaries]);

  const sparklineAdditions = useMemo<MetricChartPoint[] | undefined>(() => {
    if (!hasCompatibleData) return undefined;
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.replacementAdditions
    }));
  }, [hasCompatibleData, summaries]);

  const containerClass =
    layout === 'vertical'
      ? 'flex flex-col gap-3.5 w-full select-none'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 select-none';

  return (
    <div className={cn(containerClass, className)}>
      {/* 1. Total pengeluaran gaji */}
      <MetricChartCard
        title='Total pengeluaran gaji'
        value={formatCurrency(totalPayout)}
        description={`${summaries.length} staf terdaftar`}
        data={sparklinePayout}
        tone='primary'
        icon={<Icons.receipt className='size-5 text-muted-foreground' />}
      />

      {/* 2. Total jam pelayanan */}
      <MetricChartCard
        title='Total jam pelayanan'
        value={formatPracticeHours(totalBaseHours)}
        description='Akumulasi jam dinas terjadwal'
        data={sparklineHours}
        tone='primary'
        icon={<Icons.clock className='size-5 text-muted-foreground' />}
      />

      {/* 3. Total potongan cuti / izin */}
      <MetricChartCard
        title='Total potongan cuti / izin'
        value={`-${formatCurrency(totalLeaveDeductions)}`}
        description='Pengurangan ketidakhadiran'
        data={sparklineDeductions}
        tone='primary'
        icon={<Icons.alertCircle className='size-5 text-muted-foreground' />}
      />

      {/* 4. Insentif dinas pengganti */}
      <MetricChartCard
        title='Insentif dinas pengganti'
        value={`+${formatCurrency(totalReplacementAdditions)}`}
        description='Kompensasi dinas & lembur'
        data={sparklineAdditions}
        tone='primary'
        icon={<Icons.sparkles className='size-5 text-muted-foreground' />}
      />
    </div>
  );
}
