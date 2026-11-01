import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireRouteAccess } from '@/lib/guard';
import { RoleManagementView } from '@/features/role-management';

export const metadata = {
  title: 'Management Role - Amanah Healthcare',
  description:
    'Kelola peran dinamis, tingkatan hierarki, dan matriks hak akses perizinan sistem klinik.'
};

export default async function ManagementRolePage() {
  await requireRouteAccess('/admin/management-role');

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Management Role'
      pageDescription='Kelola peran dinamis, tingkatan hierarki (macro/micro), dan matriks hak akses sistem klinik.'
    >
      <RoleManagementView />
    </PageContainer>
  );
}
