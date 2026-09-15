'use client';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';

export function ClinicProfileView() {
  return (
    <PageContainer
      pageTitle='Profil Pasien'
      pageDescription='Informasi rekam medis, kartu BPJS, dan data akun klinik Anda'
      scrollable={false}
    >
      <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
        <EmptyState
          icon={Icons.user}
          title='Profil pasien belum tersedia'
          description='Data profil pasien akan ditampilkan di sini setelah sumber data tersambung.'
          className='h-full w-full flex-1'
        />
      </div>
    </PageContainer>
  );
}
