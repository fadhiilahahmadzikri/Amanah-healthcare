'use client';

import React, { useMemo } from 'react';
import { MetricChartCard, type MetricChartPoint } from '@/components/charts/metric-chart-card';
import { Icons } from '@/components/icons';
import { formatCurrency } from '../utils/currency';
import type { PayrollPeriodItem, PayrollSummaryItem } from '../api/types';

interface PayrollOverviewStatsProps {
  period?: PayrollPeriodItem | null;
  summaries: PayrollSummaryItem[];
}

export function PayrollOverviewStats({ period, summaries }: PayrollOverviewStatsProps) {
  const totalPayout = period?.totalPayout ?? summaries.reduce((acc, s) => acc + s.netPayroll, 0);
  const totalBaseHours = summaries.reduce((acc, s) => acc + s.baseHours, 0);
  const totalLeaveDeductions = summaries.reduce((acc, s) => acc + s.leaveDeductions, 0);
  const totalReplacementAdditions = summaries.reduce((acc, s) => acc + s.replacementAdditions, 0);

  // Sparkline data points from real summary data
  const sparklinePayout = useMemo<MetricChartPoint[]>(() => {
    if (summaries.length === 0) return [{ label: 'Periode', value: totalPayout }];
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.netPayroll
    }));
  }, [summaries, totalPayout]);

  const sparklineHours = useMemo<MetricChartPoint[]>(() => {
    if (summaries.length === 0) return [{ label: 'Periode', value: totalBaseHours }];
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.baseHours
    }));
  }, [summaries, totalBaseHours]);

  const sparklineDeductions = useMemo<MetricChartPoint[]>(() => {
    if (summaries.length === 0) return [{ label: 'Periode', value: totalLeaveDeductions }];
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.leaveDeductions
    }));
  }, [summaries, totalLeaveDeductions]);

  const sparklineAdditions = useMemo<MetricChartPoint[]>(() => {
    if (summaries.length === 0) return [{ label: 'Periode', value: totalReplacementAdditions }];
    return summaries.map((s, idx) => ({
      label: s.fullName.split(' ')[0] || `Staf ${idx + 1}`,
      value: s.replacementAdditions
    }));
  }, [summaries, totalReplacementAdditions]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5'>
      {/* 1. Total Pengeluaran Gaji */}
      <MetricChartCard
        title='Total Pengeluaran Gaji'
        value={formatCurrency(totalPayout)}
        description={`${summaries.length} staf terdaftar`}
        data={sparklinePayout}
        tone='primary'
        icon={<Icons.receipt className='size-5 text-primary' />}
      />

      {/* 2. Total Jam Pelayanan */}
      <MetricChartCard
        title='Total Jam Pelayanan'
        value={`${totalBaseHours.toLocaleString('id-ID')} jam`}
        description='Akumulasi jam dinas terjadwal'
        data={sparklineHours}
        tone='info'
        icon={<Icons.clock className='size-5 text-sky-600 dark:text-sky-400' />}
      />

      {/* 3. Total Potongan Cuti / Izin */}
      <MetricChartCard
        title='Total Potongan Cuti / Izin'
        value={`-${formatCurrency(totalLeaveDeductions)}`}
        description='Pengurangan ketidakhadiran'
        data={sparklineDeductions}
        tone='danger'
        icon={<Icons.alertCircle className='size-5 text-rose-600 dark:text-rose-400' />}
      />

      {/* 4. Insentif Dinas Pengganti */}
      <MetricChartCard
        title='Insentif Dinas Pengganti'
        value={`+${formatCurrency(totalReplacementAdditions)}`}
        description='Kompensasi dinas & lembur'
        data={sparklineAdditions}
        tone='success'
        icon={<Icons.sparkles className='size-5 text-emerald-600 dark:text-emerald-400' />}
      />
    </div>
  );
}
