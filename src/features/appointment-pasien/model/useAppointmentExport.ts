'use client';

import { useState } from 'react';
import { buildCsvContent, downloadCsv } from '@/shared/lib/csv';
import { getAdminAppointments } from '../api/service';

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
        'Jam Booking',
        'Dokter',
        'Layanan Poli',
        'Tipe Kunjungan',
        'Status Live',
        'Keluhan'
      ];

      const rows = appointments.map((appointment) => [
        `"${appointment.no_antrian}"`,
        `"${appointment.id_pasien}"`,
        `"${appointment.pasien.replace(/"/g, '""')}"`,
        `"${appointment.jenis_kelamin}"`,
        `"${appointment.nomor_telepon_wa}"`,
        `"${appointment.email_pasien}"`,
        `"${appointment.tanggal_booking}"`,
        `"${appointment.jam_booking}"`,
        `"${appointment.dokter.replace(/"/g, '""')}"`,
        `"${appointment.layanan_poli.replace(/"/g, '""')}"`,
        `"${appointment.tipe_kunjungan}"`,
        `"${appointment.live_status}"`,
        `"${(appointment.keluhan_pasien || '').replace(/"/g, '""')}"`
      ]);

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
