'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PayrollSummaryItem } from '../api/types';

export interface PayrollExportButtonProps {
  data: PayrollSummaryItem[];
  periodName?: string;
  variant?: 'full' | 'icon';
  className?: string;
}

export function PayrollExportButton({
  data,
  periodName,
  variant = 'full',
  className
}: PayrollExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    try {
      setIsExporting(true);

      const headers = [
        'Nama Karyawan',
        'NIP / Kode Staf',
        'Kategori',
        'Jabatan / Posisi',
        'Jam Pokok',
        'Gaji Pokok (IDR)',
        'Potongan Cuti (IDR)',
        'Insentif Pengganti (IDR)',
        'Gaji Bersih (THP IDR)'
      ];

      const rows = data.map((staff) => [
        `"${staff.fullName.replace(/"/g, '""')}"`,
        `"${staff.staffCode || ''}"`,
        `"${staff.staffType}"`,
        `"${(staff.positionTitle || '').replace(/"/g, '""')}"`,
        staff.baseHours,
        staff.baseEarnings,
        staff.leaveDeductions,
        staff.replacementAdditions,
        staff.netPayroll
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const safePeriodName = (periodName || 'periode').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      link.setAttribute('download', `rekap-penggajian-${safePeriodName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data rekapitulasi penggajian berhasil diekspor ke CSV.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor data penggajian.');
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
        aria-label='Ekspor Rekap Penggajian CSV'
        title='Ekspor Rekap Penggajian CSV'
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
      <span>Ekspor rekap</span>
    </Button>
  );
}
