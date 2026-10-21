'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { formatCurrency } from '../utils/currency';
import type { PayrollSummaryItem } from '../api/types';

export interface PayrollMobileCardsProps {
  summaries: PayrollSummaryItem[];
  hasFilters: boolean;
  onSelectStaff: (staff: PayrollSummaryItem) => void;
  isLoading?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'doctor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300/40';
    case 'midwife':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300/40';
    default:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300/40';
  }
};

export function PayrollMobileCards({
  summaries,
  hasFilters,
  onSelectStaff,
  isLoading
}: PayrollMobileCardsProps) {
  if (isLoading) {
    return (
      <div className='flex flex-col gap-3 p-1'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='h-24 rounded-2xl bg-muted/20 animate-pulse border border-border/40'
          />
        ))}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className='flex flex-1 min-h-[260px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <EmptyState
            icon={Icons.receipt}
            title='Tidak ada staf yang cocok'
            description='Coba sesuaikan kata kunci pencarian atau filter kategori di atas.'
          />
        ) : (
          <EmptyState
            icon={Icons.receipt}
            title='Belum ada data slip gaji'
            description='Silakan jalankan kalkulasi penggajian periode baru.'
          />
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2.5 pb-20'>
      {summaries.map((staff) => {
        const roleBadge = getRoleBadgeClass(staff.staffType);

        return (
          <Card
            key={staff.staffId}
            onClick={() => onSelectStaff(staff)}
            className='border-border/60 shadow-xs hover:border-primary/30 transition-all cursor-pointer bg-card active:scale-[0.99]'
          >
            <CardContent className='p-3.5 flex items-center justify-between gap-3'>
              {/* Left: Essential Staff Identity */}
              <div className='flex items-center gap-3 min-w-0'>
                <div className='size-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 select-none'>
                  {getInitials(staff.fullName)}
                </div>
                <div className='min-w-0'>
                  <span className='font-semibold text-xs text-foreground block truncate'>
                    {staff.fullName}
                  </span>
                  <div className='flex items-center gap-1.5 mt-0.5'>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${roleBadge}`}
                    >
                      {staff.staffType}
                    </span>
                    <span className='text-[11px] text-muted-foreground font-mono'>
                      • {staff.baseHours} jam
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Net THP & Compact Detail Action */}
              <div className='text-right shrink-0 flex flex-col items-end gap-1'>
                <span className='text-xs font-bold text-primary tabular-nums'>
                  {formatCurrency(staff.netPayroll)}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStaff(staff);
                  }}
                  className='h-6 text-[11px] px-2 text-primary hover:bg-primary/10 rounded-md gap-1'
                >
                  <Icons.receipt className='size-3' />
                  <span>Rincian</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
