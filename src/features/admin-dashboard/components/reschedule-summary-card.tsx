'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { OperationalSummary } from '../types';

interface RescheduleSummaryCardProps {
  data: OperationalSummary['rescheduleStats'];
}

export function RescheduleSummaryCard({ data }: RescheduleSummaryCardProps) {
  return (
    <Card className='col-span-12 md:col-span-4 flex flex-col justify-between shadow-xs border-border/60'>
      <div>
        <CardHeader className='pb-2.5'>
          <CardTitle className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Reschedule
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Ringkasan reschedule selama periode pilihan.
          </CardDescription>
        </CardHeader>

        <CardContent className='pt-0 pb-2 space-y-2.5'>
          <div className='divide-y divide-border/40'>
            <div className='py-2.5 flex items-center justify-between text-xs'>
              <span className='text-muted-foreground font-medium'>Total Reschedule</span>
              <span className='font-bold text-foreground tabular-nums'>{data.totalReschedule}</span>
            </div>

            <div className='py-2.5 flex items-center justify-between text-xs'>
              <span className='text-muted-foreground font-medium'>Pasien Melakukan Reschedule</span>
              <span className='font-bold text-foreground tabular-nums'>{data.patientsCount}</span>
            </div>

            <div className='py-2.5 flex items-center justify-between text-xs'>
              <span className='text-muted-foreground font-medium'>
                Dokter Terbanyak di-reschedule
              </span>
              <span className='font-bold text-foreground truncate max-w-[170px] text-right'>
                {data.topDoctor}
              </span>
            </div>

            <div className='py-2.5 flex items-center justify-between text-xs'>
              <span className='text-muted-foreground font-medium'>
                Layanan Terbanyak di-reschedule
              </span>
              <span className='font-bold text-foreground truncate max-w-[170px] text-right'>
                {data.topService}
              </span>
            </div>

            <div className='py-2.5 flex items-center justify-between text-xs'>
              <span className='text-muted-foreground font-medium'>Alasan Terbanyak</span>
              <span className='font-bold text-foreground'>
                {data.topReason} ({data.topReasonPercentage}%)
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Footer Link */}
      <div className='p-4 pt-1 border-t border-border/30'>
        <Link
          href='/dashboard/appointment-pasien'
          className='inline-flex items-center text-xs font-semibold text-primary hover:underline group'
        >
          <span>Lihat detail reschedule</span>
          <Icons.arrowRight className='ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </Card>
  );
}
