'use client';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';

export function ClinicProfileView() {
  return (
    <PageContainer
      pageTitle='Profil Pasien'
      pageDescription='Informasi rekam medis, kartu BPJS, dan data akun klinik Anda'
      scrollable
    >
      <EmptyState
        icon={Icons.user}
        title='Profil pasien belum tersedia'
        description='Data profil pasien akan ditampilkan di sini setelah sumber data tersambung.'
        className='min-h-[calc(100vh-12rem)]'
      />
    </PageContainer>
  );
}
