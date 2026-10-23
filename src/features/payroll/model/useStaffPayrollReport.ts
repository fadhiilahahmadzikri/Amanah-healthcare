'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { requestPayrollExport, fetchExportJobStatus } from '../api/payroll.api';

export interface GenerateStaffReportParams {
  periodId: string;
  staffId: string;
  staffName: string;
  periodName?: string;
  format?: 'pdf' | 'xlsx' | 'csv';
}

export function useStaffPayrollReport() {
  const [exportingStaffId, setExportingStaffId] = useState<string | null>(null);

  const generateStaffReport = useCallback(
    async ({
      periodId,
      staffId,
      staffName,
      periodName,
      format = 'pdf'
    }: GenerateStaffReportParams): Promise<boolean> => {
      setExportingStaffId(staffId);
      const toastId = toast.loading(`Menyiapkan laporan slip gaji ${staffName}...`);

      try {
        const { jobId } = await requestPayrollExport({
          periodId,
          staffProfileId: staffId,
          format
        });

        // Poll job status until completion
        let isDone = false;
        let attempts = 0;
        const maxAttempts = 25; // ~15 seconds max

        while (!isDone && attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 600));

          const statusRes = await fetchExportJobStatus(jobId);

          if (statusRes.status === 'completed') {
            isDone = true;

            // Trigger file download
            const downloadUrl = statusRes.downloadUrl || `/api/v1/exports/${jobId}/download`;
            const safeStaff = staffName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            const safePeriod = (periodName || 'periode').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            const filename = `slip-gaji-${safeStaff}-${safePeriod}.${format}`;

            const response = await fetch(downloadUrl, { credentials: 'same-origin' });
            if (!response.ok) {
              throw new Error(`Gagal mengunduh berkas laporan (HTTP ${response.status})`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);

            toast.success(`Laporan slip gaji ${staffName} berhasil diunduh.`, {
              id: toastId
            });
            return true;
          }

          if (statusRes.status === 'failed') {
            throw new Error(statusRes.errorMessage || 'Pembuatan laporan gagal di server.');
          }
        }

        if (!isDone) {
          throw new Error('Waktu tunggu pembuatan dokumen melebihi batas.');
        }

        return false;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Gagal menghasilkan laporan slip gaji.';
        toast.error(message, { id: toastId });
        return false;
      } finally {
        setExportingStaffId(null);
      }
    },
    []
  );

  return {
    exportingStaffId,
    isExporting: exportingStaffId !== null,
    generateStaffReport
  };
}
