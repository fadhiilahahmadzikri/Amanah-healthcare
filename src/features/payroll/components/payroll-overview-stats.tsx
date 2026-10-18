'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
      {/* 1. Total Payout */}
      <Card className='shadow-xs border-border/60 bg-card'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider block'>
              Total Pengeluaran Gaji
            </span>
            <span className='text-xl font-bold tracking-tight text-foreground block'>
              {formatCurrency(totalPayout)}
            </span>
            <span className='text-[11px] text-muted-foreground block'>
              {summaries.length} karyawan terdaftar
            </span>
          </div>
          <div className='size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
            <Icons.receipt className='size-5' />
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Jam Dinas */}
      <Card className='shadow-xs border-border/60 bg-card'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider block'>
              Total Jam Pelayanan
            </span>
            <span className='text-xl font-bold tracking-tight text-foreground block'>
              {totalBaseHours.toLocaleString('id-ID')} Jam
            </span>
            <span className='text-[11px] text-muted-foreground block'>Akumulasi jadwal dinas</span>
          </div>
          <div className='size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0'>
            <Icons.clock className='size-5' />
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Potongan Cuti */}
      <Card className='shadow-xs border-border/60 bg-card'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider block'>
              Total Potongan Cuti/Izin
            </span>
            <span className='text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400 block'>
              -{formatCurrency(totalLeaveDeductions)}
            </span>
            <span className='text-[11px] text-muted-foreground block'>
              Pengurangan ketidakhadiran
            </span>
          </div>
          <div className='size-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0'>
            <Icons.alertCircle className='size-5' />
          </div>
        </CardContent>
      </Card>

      {/* 4. Total Insentif Pengganti */}
      <Card className='shadow-xs border-border/60 bg-card'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider block'>
              Insentif Dinas Pengganti
            </span>
            <span className='text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 block'>
              +{formatCurrency(totalReplacementAdditions)}
            </span>
            <span className='text-[11px] text-muted-foreground block'>
              Tambahan dinas &amp; lembur
            </span>
          </div>
          <div className='size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0'>
            <Icons.sparkles className='size-5' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
