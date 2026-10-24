'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ExportApi } from '../api/export.api';
import { ExportFormat, ExportJob, ExportType, mapPhaseText } from '../types';

export interface StartExportParams {
  exportType: ExportType;
  format: ExportFormat;
  parameters?: Record<string, unknown>;
  fileNamePrefix?: string;
}

export function useExportPipeline() {
  const [isChecking, setIsChecking] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('Mengantre');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [job, setJob] = useState<ExportJob | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkAvailability = useCallback(
    async (exportType: ExportType, parameters?: Record<string, unknown>): Promise<boolean> => {
      setIsChecking(true);
      setErrorMessage(null);
      try {
        const res = await ExportApi.checkAvailability(exportType, parameters);
        if (isMountedRef.current) {
          setHasData(res.available);
          setTotalRows(res.totalRows);
          setIsChecking(false);
        }
        return res.available;
      } catch {
        if (isMountedRef.current) {
          setHasData(true); // Graceful fallback
          setIsChecking(false);
        }
        return true;
      }
    },
    []
  );

  const startExport = useCallback(
    async ({
      exportType,
      format,
      parameters,
      fileNamePrefix
    }: StartExportParams): Promise<void> => {
      setIsExporting(true);
      setIsDownloading(false);
      setIsCompleted(false);
      setErrorMessage(null);
      setProgressPercent(5);
      setCurrentPhase('Mendaftarkan antrean ekspor...');

      try {
        const initial = await ExportApi.requestExport(exportType, format, parameters);

        if (!isMountedRef.current) return;
        setProgressPercent(15);
        setCurrentPhase('Memproses data di server...');

        let attempts = 0;
        const maxAttempts = 35;
        const jobId = initial.jobId;

        while (attempts < maxAttempts) {
          const delayMs = attempts < 3 ? 1000 : 1800;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          if (!isMountedRef.current) return;
          attempts++;

          try {
            const statusJob = await ExportApi.getJobStatus(jobId);
            if (!isMountedRef.current) return;
            setJob(statusJob);

            const realPct = typeof statusJob.percent === 'number' ? statusJob.percent : 0;
            setProgressPercent(realPct);
            setCurrentPhase(mapPhaseText(statusJob.phase));

            if (statusJob.status === 'completed') {
              setProgressPercent(100);
              setCurrentPhase('Mengunduh berkas laporan...');
              setIsDownloading(true);

              const extension = format.toLowerCase();
              const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
              const baseName = fileNamePrefix || `${exportType}_report_${dateSlug}`;
              const fileName = `${baseName}.${extension}`;

              const downloadUrl = statusJob.downloadUrl || `/api/v1/exports/${jobId}/download`;
              await ExportApi.downloadExportFile(downloadUrl, fileName);

              if (!isMountedRef.current) return;
              setProgressPercent(100);
              setCurrentPhase('Berkas siap diunduh!');
              setIsCompleted(true);
              setIsExporting(false);
              setIsDownloading(false);

              toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh (${fileName})`);
              return;
            }

            if (statusJob.status === 'failed' || statusJob.status === 'cancelled') {
              const failureMessage =
                statusJob.errorMessage || 'Proses pembuatan laporan gagal di server';
              setErrorMessage(failureMessage);
              setIsExporting(false);
              setIsDownloading(false);
              toast.error(failureMessage);
              return;
            }
          } catch (pollErr: unknown) {
            // Transient network retry until maxAttempts
            if (attempts >= maxAttempts) {
              throw pollErr;
            }
          }
        }

        throw new Error('Batas waktu tunggu ekspor terlampaui. Silakan coba kembali.');
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        const msg = err instanceof Error ? err.message : 'Gagal memproses ekspor laporan';
        setErrorMessage(msg);
        setIsExporting(false);
        setIsDownloading(false);
        toast.error(msg);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsChecking(false);
    setHasData(null);
    setTotalRows(0);
    setIsExporting(false);
    setIsDownloading(false);
    setIsCompleted(false);
    setProgressPercent(0);
    setCurrentPhase('Mengantre');
    setErrorMessage(null);
    setJob(null);
  }, []);

  return {
    isChecking,
    hasData,
    totalRows,
    isExporting,
    isDownloading,
    isCompleted,
    progressPercent,
    currentPhase,
    errorMessage,
    job,
    checkAvailability,
    startExport,
    reset
  };
}
