'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import type { DoctorSchedule } from '../api/types';

interface DoctorExportButtonProps {
  data: DoctorSchedule[];
  filename?: string;
}

export function DoctorExportButton({
  data,
  filename = 'jadwal-dokter-amanah-healthcare.csv'
}: DoctorExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    try {
      setIsExporting(true);

      const headers = [
        'Nama Dokter',
        'Spesialisasi',
        'Ruang Praktik',
        'Status Dokter',
        'Jam Praktik Hari Ini',
        'Slot Tersedia',
        'Kapasitas Harian',
        'Status Jadwal',
        'Email',
        'Nomor Telepon'
      ];

      const rows = data.map((doc) => [
        `"${doc.nama_dokter.replace(/"/g, '""')}"`,
        `"${doc.spesialisasi.replace(/"/g, '""')}"`,
        `"${doc.ruang_praktik.replace(/"/g, '""')}"`,
        `"${doc.status_dokter}"`,
        `"${doc.jadwal_hari_ini}"`,
        `"${doc.slot_tersedia}"`,
        `"${doc.kapasitas_per_hari}"`,
        `"${doc.status_jadwal}"`,
        `"${doc.email}"`,
        `"${doc.nomor_telepon}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data jadwal dokter berhasil diekspor ke CSV.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor data jadwal dokter.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className='h-8 text-xs font-medium text-muted-foreground hover:text-foreground border-border/80 gap-1.5'
    >
      {isExporting ? (
        <Icons.spinner className='size-3.5 animate-spin' />
      ) : (
        <Icons.upload className='size-3.5' />
      )}
      Ekspor jadwal
    </Button>
  );
}
