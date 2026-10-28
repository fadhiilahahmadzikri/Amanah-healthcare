'use client';

import React from 'react';
import Image from 'next/image';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { cn } from '@/lib/utils';
import {
  ENTRY_TYPE_CONFIG,
  SOURCE_TYPE_LABELS,
  PERIOD_STATUS_CONFIG,
  isPayrollCalculatedOrFinalized
} from '../constants/options';
import { formatCurrency } from '../utils/currency';
import { formatPracticeHours } from '@/lib/duration-format';
import { useStaffPayrollReport } from '../model/useStaffPayrollReport';
import type { PayrollPeriodItem, PayrollSummaryItem } from '../api/types';

export interface PayrollSlipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffSummary: PayrollSummaryItem | null;
  period?: PayrollPeriodItem | null;
}

export function PayrollSlipDetailModal({
  isOpen,
  onClose,
  staffSummary,
  period
}: PayrollSlipDetailModalProps) {
  const { isExporting, generateStaffReport } = useStaffPayrollReport();

  if (!staffSummary || !period) return null;

  const isPeriodCalculatedOrFinalized = isPayrollCalculatedOrFinalized(period.status);

  const handleDownloadReport = async (format: 'pdf' | 'xlsx' = 'pdf') => {
    await generateStaffReport({
      periodId: period.id,
      staffId: staffSummary.staffId,
      staffName: staffSummary.fullName,
      periodName: period.periodName,
      format
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-4xl lg:max-w-5xl'
      className='max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
      dismissible={!isExporting}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3.5 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <Avatar className='size-11 rounded-xl shrink-0 border border-border/50'>
              <AvatarImage
                src={staffSummary.avatarUrl || DEFAULT_AVATAR_PATH}
                alt={staffSummary.fullName}
                className='rounded-xl object-cover'
              />
              <AvatarFallback className='rounded-xl p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={staffSummary.fullName}
                  width={44}
                  height={44}
                  unoptimized
                  className='size-full rounded-xl object-cover'
                />
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
                  {staffSummary.fullName}
                </h3>
                <span className='text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted border border-border/60 text-muted-foreground capitalize'>
                  {staffSummary.staffType}
                </span>
                {staffSummary.staffCode && (
                  <span className='text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60'>
                    {staffSummary.staffCode}
                  </span>
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                {period.periodName} • {staffSummary.positionTitle}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className='shrink-0 pt-0.5'>
            <span
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-lg border',
                PERIOD_STATUS_CONFIG[period.status].className
              )}
            >
              {PERIOD_STATUS_CONFIG[period.status].label}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 space-y-4 pr-1'>
          {/* Wide Metrics Banner */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            {/* THP Primary */}
            <div className='bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-col justify-between'>
              <span className='text-[11px] font-medium text-muted-foreground block'>
                Total Gaji Bersih (THP)
              </span>
              <div className='mt-1'>
                <span className='text-xl sm:text-2xl font-bold text-foreground tabular-nums'>
                  {formatCurrency(staffSummary.netPayroll)}
                </span>
              </div>
            </div>

            {/* Gaji Pokok & Jam */}
            <div className='bg-card border border-border/60 rounded-xl p-3.5 flex flex-col justify-between'>
              <span className='text-[11px] font-medium text-muted-foreground block'>
                Gaji Pokok ({formatPracticeHours(staffSummary.baseHours)})
              </span>
              <div className='mt-1'>
                <span className='text-base font-bold text-foreground tabular-nums'>
                  {formatCurrency(staffSummary.baseEarnings)}
                </span>
              </div>
            </div>

            {/* Potongan Cuti */}
            <div className='bg-card border border-border/60 rounded-xl p-3.5 flex flex-col justify-between'>
              <span className='text-[11px] font-medium text-muted-foreground block'>
                Potongan Cuti
              </span>
              <div className='mt-1'>
                <span className='text-base font-bold text-destructive tabular-nums'>
                  {staffSummary.leaveDeductions > 0
                    ? `-${formatCurrency(staffSummary.leaveDeductions)}`
                    : 'Rp 0'}
                </span>
              </div>
            </div>

            {/* Insentif Pengganti */}
            <div className='bg-card border border-border/60 rounded-xl p-3.5 flex flex-col justify-between'>
              <span className='text-[11px] font-medium text-muted-foreground block'>
                Insentif Pengganti / Lembur
              </span>
              <div className='mt-1'>
                <span className='text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>
                  {staffSummary.replacementAdditions > 0
                    ? `+${formatCurrency(staffSummary.replacementAdditions)}`
                    : 'Rp 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Entries Section */}
          <div className='space-y-2.5 pt-1'>
            <div className='flex items-center justify-between'>
              <h4 className='text-xs font-bold text-foreground tracking-tight'>
                Rincian Komponen Transaksi Slip Gaji ({staffSummary.entries.length} entri)
              </h4>
              <span className='text-[11px] text-muted-foreground'>
                Dicatat berdasarkan verifikasi presensi & cuti
              </span>
            </div>

            {staffSummary.entries.length === 0 ? (
              <div className='p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border/40'>
                Tidak ada entri komponen pada periode ini.
              </div>
            ) : (
              <div className='space-y-2'>
                {staffSummary.entries.map((entry) => {
                  const config =
                    ENTRY_TYPE_CONFIG[entry.entryType] || ENTRY_TYPE_CONFIG.base_scheduled;
                  const isPositive = entry.amount >= 0;

                  return (
                    <div
                      key={entry.id}
                      className='p-3 bg-card border border-border/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-border transition-colors'
                    >
                      <div className='space-y-1 min-w-0 flex-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='font-bold text-foreground'>{config.label}</span>
                          <span className='text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted'>
                            Sumber: {SOURCE_TYPE_LABELS[entry.sourceType] ?? entry.sourceType}
                          </span>
                          {entry.checkInAt && entry.checkOutAt && (
                            <span className='text-[10px] text-muted-foreground/80 font-mono'>
                              {new Date(entry.checkInAt).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>

                        {entry.description && (
                          <p className='text-[11px] text-muted-foreground leading-relaxed'>
                            {entry.description}
                          </p>
                        )}

                        <div className='flex items-center gap-2 text-[10px] text-muted-foreground/80 font-mono'>
                          <span>{formatPracticeHours(entry.quantityHours)}</span>
                          <span>•</span>
                          <span>@ {formatCurrency(entry.hourlyRate)} / jam</span>
                          {entry.notes && (
                            <>
                              <span>•</span>
                              <span className='italic font-sans'>{entry.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className='text-right shrink-0 sm:self-center'>
                        <span
                          className={`font-bold text-sm tabular-nums block ${
                            isPositive ? 'text-foreground' : 'text-destructive'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/50 flex items-center justify-between gap-2.5'>
          <p className='text-[11px] text-muted-foreground hidden sm:block'>
            Laporan individual mengacu pada data agregasi resmi periode penggajian.
          </p>

          <div className='flex items-center gap-2 ml-auto'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              className='px-4 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
            >
              Tutup
            </Button>

            {isPeriodCalculatedOrFinalized && (
              <Button
                type='button'
                variant='default'
                size='sm'
                onClick={() => handleDownloadReport('pdf')}
                disabled={isExporting}
                className='px-4 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
              >
                {isExporting ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1' />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Icons.fileTypePdf className='size-3.5 mr-1' />
                    <span>Generate Laporan</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
