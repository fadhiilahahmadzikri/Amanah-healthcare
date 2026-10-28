'use client';

import { useState } from 'react';
import { buildCsvContent, downloadCsv } from '@/shared/lib/csv';
import { getPatients } from '@/features/data-pasien/api/service';

type MedicalHistoryExportResult = 'empty' | 'success' | 'error';

export interface UseMedicalHistoryExportResult {
  isExporting: boolean;
  actions: {
    exportData: () => Promise<MedicalHistoryExportResult>;
  };
}

export function useMedicalHistoryExport(): UseMedicalHistoryExportResult {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await getPatients({ limit: 1000 });
      const allPatients = response.patients;

      if (allPatients.length === 0) {
        return 'empty' as const;
      }

      const headers = [
        'No. RM',
        'Nama Pasien',
        'Status Profil',
        'Hubungan / Induk',
        'NIK',
        'No. Telepon',
        'Email',
        'Jenis Kelamin',
        'Usia',
        'Total Janji Temu',
        'Kunjungan Selesai',
        'Batal / Lewat',
        'Kunjungan Terakhir',
        'Alamat Lengkap'
      ];

      const rows = allPatients.map((patient) => [
        `"${patient.patient_id || '-'}"`,
        `"${patient.name.replace(/"/g, '""')}"`,
        `"${patient.is_master ? 'Akun Utama' : 'Afiliasi'}"`,
        `"${patient.master_patient_name ? `Afiliasi dari ${patient.master_patient_name}` : '-'}"`,
        `'${patient.nik || patient.masked_nik || '-'}`,
        `"${patient.phone || '-'}"`,
        `"${patient.email || '-'}"`,
        `"${patient.gender === 'female' ? 'Perempuan' : 'Laki-laki'}"`,
        `"${patient.age ? `${patient.age} th` : '-'}"`,
        `"${patient.total_appointments ?? 0}"`,
        `"${patient.completed_visits ?? 0}"`,
        `"${(patient.missed_appointments || 0) + (patient.cancelled_appointments || 0)}"`,
        `"${patient.last_visit_date || '-'}"`,
        `"${(patient.address || '').replace(/"/g, '""')}"`
      ]);

      downloadCsv(
        `riwayat_medis_pasien_${new Date().toISOString().slice(0, 10)}.csv`,
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
