import { clientFetch } from '@/lib/client-fetch';
import type {
  CheckAvailabilityResponse,
  ExportFormat,
  ExportJob,
  ExportType,
  RequestExportResponse
} from '../types';

export class ExportApi {
  /**
   * Pre-flight availability check to verify whether matching records exist in the database.
   */
  static async checkAvailability(
    exportType: ExportType,
    parameters?: Record<string, any>
  ): Promise<CheckAvailabilityResponse> {
    return clientFetch<CheckAvailabilityResponse>('/api/v1/exports/check-availability', {
      method: 'POST',
      body: JSON.stringify({
        exportType,
        parameters: parameters || {}
      })
    });
  }

  /**
   * Requests an asynchronous export job queued via RabbitMQ.
   */
  static async requestExport(
    exportType: ExportType,
    format: ExportFormat,
    parameters?: Record<string, any>
  ): Promise<RequestExportResponse> {
    return clientFetch<RequestExportResponse>('/api/v1/exports', {
      method: 'POST',
      body: JSON.stringify({
        exportType,
        format,
        parameters: parameters || {}
      })
    });
  }

  /**
   * Fetches real-time status and Redis progress of an active export job.
   */
  static async getJobStatus(jobId: string): Promise<ExportJob> {
    return clientFetch<ExportJob>(`/api/v1/exports/${jobId}`, {
      method: 'GET'
    });
  }

  /**
   * Downloads physical binary artifact from backend and triggers browser download.
   */
  static async downloadExportFile(downloadUrl: string, fileName: string): Promise<void> {
    const res = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'same-origin'
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh berkas laporan (HTTP ${res.status})`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }
}
