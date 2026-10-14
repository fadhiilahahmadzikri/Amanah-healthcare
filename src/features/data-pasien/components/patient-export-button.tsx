'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePatientExport } from '../model/usePatientExport';

export interface PatientExportButtonProps {
  variant?: 'default' | 'icon';
  className?: string;
}

export function PatientExportButton({
  variant = 'default',
  className,
}: PatientExportButtonProps) {
  const patientExport = usePatientExport();

  const handleExport = async () => {
    const result = await patientExport.actions.exportData();
    if (result === 'empty') {
      toast.info('Tidak ada data pasien untuk diekspor');
    }
    if (result === 'success') {
      toast.success('Data pasien berhasil diekspor ke file CSV');
    }
    if (result === 'error') {
      toast.error('Gagal mengekspor data pasien');
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={handleExport}
        disabled={patientExport.isExporting}
        aria-label='Ekspor Data Pasien'
        className={cn(
          'size-8.5 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer shrink-0',
          className
        )}
        title='Ekspor CSV'
      >
        {patientExport.isExporting ? (
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
      disabled={patientExport.isExporting}
      variant='default'
      size='sm'
      className={cn('h-9 font-medium shadow-xs', className)}
    >
      {patientExport.isExporting ? (
        <Icons.spinner className='mr-2 size-4 animate-spin' />
      ) : (
        <Icons.upload className='mr-2 size-4' />
      )}
      Ekspor Data
    </Button>
  );
}
