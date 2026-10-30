'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { isPayrollCalculatedOrFinalized } from '../constants/options';
import { formatCurrency } from '../utils/currency';
import { formatPracticeHours } from '@/lib/duration-format';
import type { PayrollSummaryItem } from '../api/types';

export interface PayrollMobileCardsProps {
  summaries: PayrollSummaryItem[];
  hasFilters: boolean;
  onSelectStaff: (staff: PayrollSummaryItem) => void;
  onGenerateReport?: (staff: PayrollSummaryItem) => void;
  isCalculatedOrFinalized?: boolean;
  exportingStaffId?: string | null;
  isLoading?: boolean;
}

export function PayrollMobileCards({
  summaries,
  hasFilters,
  onSelectStaff,
  onGenerateReport,
  isCalculatedOrFinalized,
  exportingStaffId,
  isLoading
}: PayrollMobileCardsProps) {
  if (isLoading) {
    return (
      <div className='flex flex-col gap-2.5 p-1'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='h-16 rounded-xl bg-muted/20 animate-pulse border border-border/40'
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
    <div className='flex flex-col gap-2 pb-20'>
      {summaries.map((staff) => {
        const isStaffCalculated = isPayrollCalculatedOrFinalized(staff.periodStatus);
        const canGenerate = Boolean(isCalculatedOrFinalized || isStaffCalculated);
        const isExportingThis = exportingStaffId === staff.staffId;

        return (
          <Card
            key={staff.staffId}
            onClick={() => onSelectStaff(staff)}
            className='border-border/60 shadow-2xs hover:border-border transition-all cursor-pointer bg-card active:scale-[0.99] p-3'
          >
            <div className='flex items-center justify-between gap-3'>
              {/* Left: Essential Staff Identity */}
              <div className='flex items-center gap-2.5 min-w-0'>
                <Avatar className='size-8 rounded-lg shrink-0'>
                  <AvatarImage
                    src={staff.avatarUrl || DEFAULT_AVATAR_PATH}
                    alt={staff.fullName}
                    className='rounded-lg object-cover'
                  />
                  <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                    <Image
                      src={DEFAULT_AVATAR_PATH}
                      alt={staff.fullName}
                      width={32}
                      height={32}
                      unoptimized
                      className='size-full rounded-lg object-cover'
                    />
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <p className='font-semibold text-xs text-foreground truncate'>{staff.fullName}</p>
                  <p className='text-[11px] text-muted-foreground capitalize mt-0.5 truncate'>
                    {staff.roleName} {staff.staffCode ? `• ${staff.staffCode}` : ''}
                  </p>
                </div>
              </div>

              {/* Right: Net THP + Quick Action */}
              <div className='flex items-center gap-2 shrink-0'>
                <div className='text-right'>
                  <span className='text-xs font-bold text-foreground tabular-nums block'>
                    {formatCurrency(staff.netPayroll)}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>
                    {formatPracticeHours(staff.baseHours)}
                  </span>
                </div>

                {canGenerate && (
                  <Button
                    variant='outline'
                    size='icon'
                    disabled={isExportingThis}
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateReport?.(staff);
                    }}
                    aria-label={`Generate laporan ${staff.fullName}`}
                    title='Generate laporan slip gaji'
                    className='size-7 rounded-lg text-muted-foreground hover:text-foreground border-border/70'
                  >
                    {isExportingThis ? (
                      <Icons.spinner className='size-3.5 animate-spin' />
                    ) : (
                      <Icons.fileTypePdf className='size-3.5 text-primary' />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
