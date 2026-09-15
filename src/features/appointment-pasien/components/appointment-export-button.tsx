'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppointmentExport } from '../model/useAppointmentExport';

export function AppointmentExportButton() {
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

  return (
    <Button
      onClick={handleExport}
      disabled={appointmentExport.isExporting}
      variant='default'
      size='sm'
      className='h-9 font-medium shadow-xs'
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
