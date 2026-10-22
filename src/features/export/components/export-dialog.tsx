'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EXPORT_FORMAT_OPTIONS, type ExportFormat, type ExportType } from '../types';
import { useExportPipeline } from '../hooks/useExportPipeline';
import { ExportFormatCard } from './export-format-card';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export interface PayrollPeriodOption {
  id: string;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  status?: string;
}

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: ExportType;
  title?: string;
  subtitle?: string;
  entityName?: string;
  parameters?: Record<string, any>;
  fileNamePrefix?: string;
  enableMonthPicker?: boolean;
  availablePeriods?: PayrollPeriodOption[];
  selectedPeriodId?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  exportType,
  title,
  subtitle,
  entityName,
  parameters = {},
  fileNamePrefix,
  enableMonthPicker = false,
  availablePeriods,
  selectedPeriodId: initialPeriodId
}: ExportDialogProps) {
  const {
    isChecking,
    hasData,
    totalRows,
    isExporting,
    isDownloading,
    isCompleted,
    progressPercent,
    currentPhase,
    errorMessage,
    checkAvailability,
    startExport,
    reset
  } = useExportPipeline();

  // Period / Month State for Attendance
  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(now.getMonth());

  // Period State for Payroll
  const [activePeriodId, setActivePeriodId] = useState<string>(
    initialPeriodId || availablePeriods?.[0]?.id || ''
  );

  useEffect(() => {
    if (initialPeriodId) {
      setActivePeriodId(initialPeriodId);
    } else if (availablePeriods?.length && !activePeriodId) {
      setActivePeriodId(availablePeriods[0].id);
    }
  }, [initialPeriodId, availablePeriods, activePeriodId]);

  // Compute effective parameters based on type and selected period
  const effectiveParameters = useMemo(() => {
    const params: Record<string, any> = { ...parameters };

    if (exportType === 'attendance' && enableMonthPicker) {
      const year = selectedYear;
      const monthNum = selectedMonthIndex + 1;
      const mm = String(monthNum).padStart(2, '0');
      const lastDay = new Date(year, monthNum, 0).getDate();
      const dd = String(lastDay).padStart(2, '0');

      params.startDate = `${year}-${mm}-01`;
      params.endDate = `${year}-${mm}-${dd}`;
      params.periodLabel = `${MONTH_NAMES[selectedMonthIndex]} ${year}`;
    }

    if (exportType === 'payroll' && activePeriodId) {
      params.periodId = activePeriodId;
      const periodObj = availablePeriods?.find((p) => p.id === activePeriodId);
      if (periodObj) {
        params.periodName = periodObj.periodName;
      }
    }

    return params;
  }, [
    exportType,
    enableMonthPicker,
    selectedYear,
    selectedMonthIndex,
    activePeriodId,
    availablePeriods,
    parameters
  ]);

  // Trigger availability check when dialog opens or parameters change
  useEffect(() => {
    if (open) {
      checkAvailability(exportType, effectiveParameters);
    } else {
      reset();
    }
  }, [open, exportType, effectiveParameters, checkAvailability, reset]);

  const handleSelectFormat = useCallback(
    (format: ExportFormat) => {
      const entitySlug = entityName
        ? entityName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .slice(0, 30)
        : 'klinik';
      const defaultPrefix =
        fileNamePrefix ||
        (exportType === 'attendance'
          ? `Presensi_${entitySlug}_${effectiveParameters.periodLabel ? effectiveParameters.periodLabel.replace(/\s+/g, '_') : 'rekap'}`
          : `Gaji_${entitySlug}_${effectiveParameters.periodName ? effectiveParameters.periodName.replace(/\s+/g, '_') : 'rekap'}`);

      startExport({
        exportType,
        format,
        parameters: effectiveParameters,
        fileNamePrefix: defaultPrefix
      });
    },
    [entityName, fileNamePrefix, exportType, effectiveParameters, startExport]
  );

  const displayTitle =
    title ||
    (exportType === 'attendance'
      ? entityName
        ? `Laporan Presensi: ${entityName}`
        : 'Unduh Rekapitulasi Presensi'
      : entityName
        ? `Slip Gaji: ${entityName}`
        : 'Unduh Rekapitulasi Penggajian');

  const displaySubtitle =
    subtitle ||
    (exportType === 'attendance' && enableMonthPicker
      ? `Periode: ${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`
      : 'Pilih format dokumen resmi yang ingin Anda unduh');

  const isBusy = isExporting || isDownloading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md p-6 overflow-hidden rounded-2xl border-border/80 shadow-xl'>
        {/* Header Section */}
        <DialogHeader className='space-y-1 text-left'>
          <div className='flex items-center justify-between gap-3'>
            <DialogTitle className='text-base font-bold text-foreground tracking-tight line-clamp-1'>
              {displayTitle}
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs text-muted-foreground'>
            {displaySubtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Body Section */}
        <div className='mt-3 space-y-4'>
          {/* Period Selection Controls (When not busy) */}
          {!isBusy && !isCompleted && (
            <>
              {/* Attendance Month/Year Picker */}
              {exportType === 'attendance' && enableMonthPicker && (
                <div className='flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60'>
                  <Icons.calendar className='size-4 text-primary shrink-0 ml-1' />
                  <span className='text-xs font-semibold text-foreground/80 shrink-0'>
                    Periode:
                  </span>
                  <Select
                    value={String(selectedMonthIndex)}
                    onValueChange={(val) => setSelectedMonthIndex(Number(val))}
                  >
                    <SelectTrigger className='h-8 text-xs font-medium bg-card'>
                      <SelectValue placeholder='Pilih Bulan' />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((m, idx) => (
                        <SelectItem key={m} value={String(idx)} className='text-xs'>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(selectedYear)}
                    onValueChange={(val) => setSelectedYear(Number(val))}
                  >
                    <SelectTrigger className='h-8 text-xs font-medium w-24 bg-card'>
                      <SelectValue placeholder='Tahun' />
                    </SelectTrigger>
                    <SelectContent>
                      {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(
                        (y) => (
                          <SelectItem key={y} value={String(y)} className='text-xs'>
                            {y}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payroll Period Selector */}
              {exportType === 'payroll' && availablePeriods && availablePeriods.length > 0 && (
                <div className='p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5'>
                  <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground/80'>
                    <Icons.receipt className='size-3.5 text-primary' />
                    <span>Periode Penggajian:</span>
                  </div>
                  <Select value={activePeriodId} onValueChange={(val) => setActivePeriodId(val)}>
                    <SelectTrigger className='h-8.5 text-xs font-medium bg-card'>
                      <SelectValue placeholder='Pilih Periode Penggajian' />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id} className='text-xs'>
                          <span className='font-semibold'>{period.periodName}</span>{' '}
                          <span className='text-muted-foreground text-[11px]'>
                            ({period.periodStart} s/d {period.periodEnd})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Real-time Progress State */}
          {isBusy && (
            <div className='py-6 flex flex-col items-center justify-center text-center space-y-3.5'>
              <div className='relative size-18 flex items-center justify-center'>
                <div className='size-18 rounded-full border-4 border-muted border-t-primary animate-spin' />
                <span className='absolute text-xs font-extrabold text-primary'>
                  {progressPercent}%
                </span>
              </div>
              <div className='space-y-1'>
                <p className='text-xs sm:text-sm font-semibold text-foreground'>{currentPhase}</p>
                <p className='text-[11px] text-muted-foreground max-w-xs'>
                  Proses ekspor berjalan di antrean server. Berkas otomatis terunduh ke peramban.
                </p>
              </div>
            </div>
          )}

          {/* Success Completed State */}
          {isCompleted && (
            <div className='py-5 flex flex-col items-center justify-center text-center space-y-3'>
              <div className='size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
                <Icons.check className='size-6' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-bold text-foreground'>Laporan Berhasil Diunduh!</p>
                <p className='text-xs text-muted-foreground max-w-xs'>
                  Berkas laporan telah berhasil digenerate dan tersimpan di folder unduhan Anda.
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => onOpenChange(false)}
                className='mt-2 h-8 text-xs font-semibold px-4 rounded-lg'
              >
                Selesai & Tutup
              </Button>
            </div>
          )}

          {/* Checking Data State */}
          {isChecking && !isBusy && !isCompleted && (
            <div className='py-8 flex flex-col items-center justify-center text-center space-y-2'>
              <Icons.spinner className='size-6 text-primary animate-spin' />
              <p className='text-xs font-medium text-muted-foreground'>
                Memeriksa ketersediaan data di basis data...
              </p>
            </div>
          )}

          {/* Empty Data State */}
          {!isChecking && !isBusy && !isCompleted && hasData === false && (
            <div className='py-6 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2'>
              <div className='size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
                <Icons.alertCircle className='size-5' />
              </div>
              <p className='text-xs font-semibold text-foreground'>Data Tidak Tersedia</p>
              <p className='text-[11px] text-muted-foreground max-w-xs'>
                Tidak ditemukan rekaman data pada periode yang dipilih. Silakan pilih bulan atau
                periode lain.
              </p>
            </div>
          )}

          {/* Format Selection Cards (Normal Ready State) */}
          {!isChecking && !isBusy && !isCompleted && hasData !== false && (
            <div className='space-y-2.5'>
              {totalRows > 0 && (
                <div className='flex items-center justify-between text-[11px] text-muted-foreground px-1'>
                  <span>Format Berkas Dokumen:</span>
                  <span className='font-semibold text-foreground/80'>
                    {totalRows} rekaman ditemukan
                  </span>
                </div>
              )}
              {EXPORT_FORMAT_OPTIONS.map((meta) => (
                <ExportFormatCard
                  key={meta.format}
                  meta={meta}
                  disabled={isBusy}
                  onSelect={() => handleSelectFormat(meta.format)}
                />
              ))}
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && !isBusy && (
            <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5'>
              <Icons.alertCircle className='size-4 shrink-0 mt-0.5' />
              <div className='flex-1 min-w-0'>
                <p className='font-semibold'>Gagal Mengekspor Laporan</p>
                <p className='text-[11px] opacity-90 mt-0.5'>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
