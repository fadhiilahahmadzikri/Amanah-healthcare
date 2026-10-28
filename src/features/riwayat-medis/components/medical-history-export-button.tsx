'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMedicalHistoryExport } from '../model/useMedicalHistoryExport';

export interface MedicalHistoryExportButtonProps {
  variant?: 'default' | 'icon';
  className?: string;
}

export function MedicalHistoryExportButton({
  variant = 'default',
  className
}: MedicalHistoryExportButtonProps) {
  const exporter = useMedicalHistoryExport();

  const handleExport = async () => {
    const result = await exporter.actions.exportData();
    if (result === 'empty') {
      toast.info('Tidak ada data riwayat medis untuk diekspor');
    }
    if (result === 'success') {
      toast.success('Data riwayat medis berhasil diekspor ke file CSV');
    }
    if (result === 'error') {
      toast.error('Gagal mengekspor data riwayat medis');
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={handleExport}
        disabled={exporter.isExporting}
        aria-label='Ekspor Riwayat Medis'
        className={cn(
          'size-8.5 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer shrink-0',
          className
        )}
        title='Ekspor CSV'
      >
        {exporter.isExporting ? (
          <Icons.spinner className='size-4 animate-spin' />
        ) : (
          <Icons.upload className='size-4' />
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleExport}
      disabled={exporter.isExporting}
      variant='default'
      size='sm'
      className={cn('h-9 font-medium shadow-xs', className)}
    >
      {exporter.isExporting ? (
        <Icons.spinner className='mr-2 size-4 animate-spin' />
      ) : (
        <Icons.upload className='mr-2 size-4' />
      )}
      Ekspor Data
    </Button>
  );
}
