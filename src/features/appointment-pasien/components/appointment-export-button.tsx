'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppointmentExport } from '../model/useAppointmentExport';

import { cn } from '@/lib/utils';

export interface AppointmentExportButtonProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export function AppointmentExportButton({
  variant = 'full',
  className
}: AppointmentExportButtonProps) {
  const appointmentExport = useAppointmentExport();

  const handleExport = async () => {
    const result = await appointmentExport.actions.exportData();
    if (result === 'empty') {
      toast.info('Tidak ada data appointment untuk diekspor');
    }
    if (result === 'success') {
      toast.success('Data appointment berhasil diekspor ke file CSV');
    }
    if (result === 'error') {
      toast.error('Gagal mengekspor data appointment');
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        onClick={handleExport}
        disabled={appointmentExport.isExporting}
        variant='outline'
        size='icon'
        aria-label='Ekspor Data CSV'
        title='Ekspor Data CSV'
        className={cn('size-8.5 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground', className)}
      >
        {appointmentExport.isExporting ? (
          <Icons.spinner className='size-3.5 animate-spin' />
        ) : (
          <Icons.upload className='size-3.5' />
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleExport}
      disabled={appointmentExport.isExporting}
      variant='default'
      size='sm'
      className={cn('h-9 font-medium shadow-xs', className)}
    >
      {appointmentExport.isExporting ? (
        <Icons.spinner className='mr-2 size-4 animate-spin' />
      ) : (
        <Icons.upload className='mr-2 size-4' />
      )}
      Ekspor Data
    </Button>
  );
}
