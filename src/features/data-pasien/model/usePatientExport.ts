'use client';

import { useState } from 'react';
import { buildCsvContent, downloadCsv } from '@/shared/lib/csv';
import { getPatients } from '../api/service';

type PatientExportResult = 'empty' | 'success' | 'error';

export interface UsePatientExportResult {
  isExporting: boolean;
  actions: {
    exportData: () => Promise<PatientExportResult>;
  };
}

export function usePatientExport(): UsePatientExportResult {
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
        'ID Pasien',
        'Nama Pasien',
        'NIK',
        'No. Telepon',
        'Email',
        'Gender',
        'Umur',
        'Tanggal Lahir',
        'Golongan Darah',
        'Alamat',
        'Kontak Darurat',
        'Alergi',
        'Riwayat Medis',
        'Status Akun',
        'Dibuat Pada'
      ];

      const rows = allPatients.map((patient) => [
        `"${patient.patient_id}"`,
        `"${patient.name.replace(/"/g, '""')}"`,
        `'${patient.nik}`,
        `"${patient.phone}"`,
        `"${patient.email}"`,
        `"${patient.gender}"`,
        `"${patient.age} th"`,
        `"${patient.birth_date}"`,
        `"${patient.blood_type}"`,
        `"${patient.address.replace(/"/g, '""')}"`,
        `"${(patient.emergency_contact || '').replace(/"/g, '""')}"`,
        `"${(patient.allergies || []).join(', ')}"`,
        `"${(patient.medical_history || '').replace(/"/g, '""')}"`,
        `"${patient.account_status}"`,
        `"${new Date(patient.created_at).toLocaleDateString('id-ID')}"`
      ]);

      downloadCsv(
        `data_pasien_${new Date().toISOString().slice(0, 10)}.csv`,
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
