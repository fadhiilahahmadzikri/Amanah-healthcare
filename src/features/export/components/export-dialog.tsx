'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { EXPORT_FORMAT_OPTIONS, type ExportDialogProps, type PayrollPeriodOption } from '../types';
import { useExportDialog } from '../model/useExportDialog';
import { ExportFormatCard } from './export-format-card';
import { ExportAttendancePicker } from './export-attendance-picker';
import { ExportPayrollPicker } from './export-payroll-picker';
import {
  ExportCheckingView,
  ExportCompletedView,
  ExportEmptyView,
  ExportErrorAlert,
  ExportProgressView
} from './export-state-views';

export type { ExportDialogProps, PayrollPeriodOption };

export function ExportDialog(props: ExportDialogProps) {
  const { open, onOpenChange } = props;
  const { pipeline, attendance, payroll, display, handleSelectFormat } = useExportDialog(props);

  const {
    isChecking,
    hasData,
    totalRows,
    isExporting,
    isDownloading,
    isCompleted,
    progressPercent,
    currentPhase,
    errorMessage
  } = pipeline;

  const isBusy = isExporting || isDownloading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md p-6 overflow-hidden rounded-2xl border-border/80 shadow-xl'>
        <DialogHeader className='space-y-1 text-left'>
          <DialogTitle className='text-base font-bold text-foreground tracking-tight line-clamp-1'>
            {display.title}
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            {display.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className='mt-3 space-y-4'>
          {!isBusy && !isCompleted && (
            <>
              {attendance.enableMonthPicker && (
                <ExportAttendancePicker
                  selectedMonthIndex={attendance.selectedMonthIndex}
                  selectedYear={attendance.selectedYear}
                  onMonthChange={attendance.setSelectedMonthIndex}
                  onYearChange={attendance.setSelectedYear}
                />
              )}

              {payroll.availablePeriods && payroll.availablePeriods.length > 0 && (
                <ExportPayrollPicker
                  periods={payroll.availablePeriods}
                  activePeriodId={payroll.activePeriodId}
                  onPeriodChange={payroll.setActivePeriodId}
                />
              )}
            </>
          )}

          {isBusy && (
            <ExportProgressView
              progressPercent={progressPercent}
              currentPhase={currentPhase}
            />
          )}

          {isCompleted && (
            <ExportCompletedView onClose={() => onOpenChange(false)} />
          )}

          {isChecking && !isBusy && !isCompleted && (
            <ExportCheckingView />
          )}

          {!isChecking && !isBusy && !isCompleted && hasData === false && (
            <ExportEmptyView />
          )}

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

          {errorMessage && !isBusy && (
            <ExportErrorAlert message={errorMessage} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
