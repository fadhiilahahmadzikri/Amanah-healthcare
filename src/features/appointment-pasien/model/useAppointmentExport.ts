'use client';

import { useState } from 'react';
import { buildCsvContent, downloadCsv } from '@/shared/lib/csv';
import { getAdminAppointments } from '../api/service';
import { getAppointmentStatusConfig } from '../constants/appointment-status.dictionary';

type AppointmentExportResult = 'empty' | 'success' | 'error';

export interface UseAppointmentExportResult {
  isExporting: boolean;
  actions: {
    exportData: () => Promise<AppointmentExportResult>;
  };
}

export function useAppointmentExport(): UseAppointmentExportResult {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await getAdminAppointments({ limit: 1000 });
      const appointments = response.appointments;

      if (appointments.length === 0) {
        return 'empty' as const;
      }

      const headers = [
        'No. Antrean',
        'ID Pasien',
        'Nama Pasien',
        'Jenis Kelamin',
        'No. Telepon',
        'Email',
        'Tanggal Booking',
        'Sesi / Estimasi Jam',
        'Dokter',
        'Layanan Poli',
        'Tipe Kunjungan',
        'Status',
        'Keluhan'
      ];

      const rows = appointments.map((appointment) => {
        const statusLabel = getAppointmentStatusConfig(appointment.status).label;
        const timeDisplay = appointment.scheduledStartTime;
        return [
          `"${appointment.queueNumber}"`,
          `"${appointment.patientId}"`,
          `"${appointment.patientName.replace(/"/g, '""')}"`,
          `"${appointment.gender}"`,
          `"${appointment.phone}"`,
          `"${appointment.email}"`,
          `"${appointment.scheduledDate}"`,
          `"${timeDisplay}"`,
          `"${(appointment.doctorName || '').replace(/"/g, '""')}"`,
          `"${appointment.poliklinikName.replace(/"/g, '""')}"`,
          `"${appointment.visitType}"`,
          `"${statusLabel}"`,
          `"${(appointment.complaint || '').replace(/"/g, '""')}"`
        ];
      });

      downloadCsv(
        `appointment_pasien_${new Date().toISOString().slice(0, 10)}.csv`,
        buildCsvContent(headers, rows)
      );
      return 'success' as const;
    } catch {
      return 'error' as const;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    actions: {
      exportData: handleExport
    }
  };
}
