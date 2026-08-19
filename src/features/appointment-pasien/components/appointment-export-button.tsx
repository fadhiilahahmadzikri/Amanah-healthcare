'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getAdminAppointments } from '../api/service';
import { toast } from 'sonner';

export function AppointmentExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await getAdminAppointments({ limit: 1000 });
      const appointments = res.appointments;

      if (appointments.length === 0) {
        toast.info('Tidak ada data appointment untuk diekspor');
        return;
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

      const rows = appointments.map((a) => [
        `"${a.no_antrian}"`,
        `"${a.id_pasien}"`,
        `"${a.pasien.replace(/"/g, '""')}"`,
        `"${a.jenis_kelamin}"`,
        `"${a.nomor_telepon_wa}"`,
        `"${a.email_pasien}"`,
        `"${a.tanggal_booking}"`,
        `"${a.jam_booking}"`,
        `"${a.dokter.replace(/"/g, '""')}"`,
        `"${a.layanan_poli.replace(/"/g, '""')}"`,
        `"${a.tipe_kunjungan}"`,
        `"${a.live_status}"`,
        `"${(a.keluhan_pasien || '').replace(/"/g, '""')}"`
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `appointment_pasien_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data appointment berhasil diekspor ke file CSV');
    } catch {
      toast.error('Gagal mengekspor data appointment');
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
