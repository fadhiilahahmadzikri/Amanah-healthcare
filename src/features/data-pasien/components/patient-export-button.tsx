'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { fakePatients } from '@/constants/mock-api-patients';

export function PatientExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const allPatients = await fakePatients.getAll({});

      // Format CSV rows
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

      const rows = allPatients.map((p) => [
        `"${p.patient_id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `'${p.nik}`,
        `"${p.phone}"`,
        `"${p.email}"`,
        `"${p.gender}"`,
        `"${p.age} th"`,
        `"${p.birth_date}"`,
        `"${p.blood_type}"`,
        `"${p.address.replace(/"/g, '""')}"`,
        `"${(p.emergency_contact || '').replace(/"/g, '""')}"`,
        `"${(p.allergies || []).join(', ')}"`,
        `"${(p.medical_history || '').replace(/"/g, '""')}"`,
        `"${p.account_status}"`,
        `"${new Date(p.created_at).toLocaleDateString('id-ID')}"`
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `data_pasien_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data pasien berhasil diekspor ke file CSV');
    } catch {
      toast.error('Gagal mengekspor data pasien');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant='default'
      size='sm'
      className='h-9 font-medium shadow-xs'
    >
      {isExporting ? (
        <Icons.spinner className='mr-2 size-4 animate-spin' />
      ) : (
        <Icons.upload className='mr-2 size-4' />
      )}
      Ekspor Data
    </Button>
  );
}
