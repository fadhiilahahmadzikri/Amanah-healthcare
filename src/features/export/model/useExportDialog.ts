'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ExportDialogProps, ExportFormat } from '../types';
import { useExportPipeline } from '../hooks/useExportPipeline';

export interface UseExportDialogOptions extends ExportDialogProps {}

export function getDynamicMonthOptions(locale = 'id-ID'): { index: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    index: i,
    label: new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2026, i, 1))
    )
  }));
}

export function getRecentYears(count = 3): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
}

export function useExportDialog({
  open,
  exportType,
  parameters,
  enableMonthPicker = false,
  availablePeriods,
  selectedPeriodId: initialPeriodId,
  title,
  subtitle,
  entityName,
  fileNamePrefix
}: UseExportDialogOptions) {
  const pipeline = useExportPipeline();
  const { checkAvailability, startExport, reset } = pipeline;

  // Attendance Month / Year Filter State
  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(now.getMonth());

  // Payroll Period State
  const fallbackPeriodId = availablePeriods?.[0]?.id ?? '';
  const [activePeriodId, setActivePeriodId] = useState<string>(initialPeriodId || fallbackPeriodId);

  useEffect(() => {
    if (initialPeriodId) {
      setActivePeriodId(initialPeriodId);
    } else if (availablePeriods?.length) {
      setActivePeriodId((prev) => prev || availablePeriods[0].id);
    }
  }, [initialPeriodId, availablePeriods]);

  // Caller staff ID primitive
  const callerStaffProfileId = parameters?.staffProfileId as string | undefined;

  // Pure parameter derivation without side effects
  const effectiveParameters = useMemo(() => {
    const params: Record<string, unknown> = {};

    if (callerStaffProfileId) {
      params.staffProfileId = callerStaffProfileId;
    }

    if (exportType === 'attendance' && enableMonthPicker) {
      const year = selectedYear;
      const monthNum = selectedMonthIndex + 1;
      const mm = String(monthNum).padStart(2, '0');
      const lastDay = new Date(year, monthNum, 0).getDate();
      const dd = String(lastDay).padStart(2, '0');

      params.startDate = `${year}-${mm}-01`;
      params.endDate = `${year}-${mm}-${dd}`;
    }

    if (exportType === 'payroll' && activePeriodId) {
      params.periodId = activePeriodId;
    }

    return params;
  }, [
    exportType,
    enableMonthPicker,
    selectedYear,
    selectedMonthIndex,
    activePeriodId,
    callerStaffProfileId
  ]);

  // Reactive availability check on open or filter change
  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    checkAvailability(exportType, effectiveParameters);
  }, [open, exportType, effectiveParameters, checkAvailability, reset]);

  // Format selection trigger
  const handleSelectFormat = useCallback(
    (format: ExportFormat) => {
      startExport({
        exportType,
        format,
        parameters: effectiveParameters,
        fileNamePrefix
      });
    },
    [exportType, effectiveParameters, fileNamePrefix, startExport]
  );

  // Dynamic localized subtitle
  const dynamicMonthName = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(selectedYear, selectedMonthIndex, 1))
    );
  }, [selectedYear, selectedMonthIndex]);

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
      ? `Periode: ${dynamicMonthName} ${selectedYear}`
      : 'Pilih format dokumen resmi yang ingin Anda unduh');

  return {
    pipeline,
    attendance: {
      selectedYear,
      selectedMonthIndex,
      setSelectedYear,
      setSelectedMonthIndex,
      enableMonthPicker: exportType === 'attendance' && enableMonthPicker
    },
    payroll: {
      activePeriodId,
      setActivePeriodId,
      availablePeriods: exportType === 'payroll' ? availablePeriods : undefined
    },
    display: {
      title: displayTitle,
      subtitle: displaySubtitle
    },
    handleSelectFormat
  };
}
