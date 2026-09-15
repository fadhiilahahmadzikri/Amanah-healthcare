'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePatientExport } from '../model/usePatientExport';

export function PatientExportButton() {
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

  return (
    <Button
      onClick={handleExport}
      disabled={patientExport.isExporting}
      variant='default'
      size='sm'
      className='h-9 font-medium shadow-xs'
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
