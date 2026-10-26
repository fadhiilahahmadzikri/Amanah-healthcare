'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';

export interface DoctorExportButtonProps {
  data: DoctorSchedule[];
  filename?: string;
  variant?: 'full' | 'icon';
  className?: string;
}

export function DoctorExportButton({
  data,
  filename = 'jadwal-dokter-amanah-healthcare.csv',
  variant = 'full',
  className
}: DoctorExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    try {
      setIsExporting(true);

      const headers = [
        'Nama Dokter',
        'Spesialisasi',
        'Status Dokter',
        'Status Jadwal',
        'Email',
        'Nomor Telepon'
      ];

      const rows = data.map((doc) => [
        `"${doc.fullName.replace(/"/g, '""')}"`,
        `"${doc.specialty.replace(/"/g, '""')}"`,
        `"${doc.doctorStatus}"`,
        `"${doc.scheduleStatus}"`,
        `"${doc.email || ''}"`,
        `"${doc.phone || ''}"`
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

  if (variant === 'icon') {
    return (
      <Button
        variant='outline'
        size='icon'
        onClick={handleExport}
        disabled={isExporting || data.length === 0}
        aria-label='Ekspor Jadwal Dokter CSV'
        title='Ekspor Jadwal Dokter CSV'
        className={cn(
          'size-8.5 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground',
          className
        )}
      >
        {isExporting ? (
          <Icons.spinner className='size-3.5 animate-spin' />
        ) : (
          <Icons.upload className='size-3.5' />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className={cn(
        'h-8 text-xs font-medium text-muted-foreground hover:text-foreground border-border/80 gap-1.5',
        className
      )}
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
