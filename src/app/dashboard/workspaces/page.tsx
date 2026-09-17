import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { workspacesInfoContent } from '@/config/infoconfig';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Unit Layanan & Workspace'
};

export default async function WorkspacesPage() {
  await requireAdmin();

  return (
    <PageContainer
      pageTitle='Unit Layanan & Workspace'
      pageDescription='Kelola dan pilih unit layanan klinik'
      infoContent={workspacesInfoContent}
    >
      <div className='max-w-2xl space-y-4'>
        <Card className='border border-border/80'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Amanah Healthcare (Pusat)</CardTitle>
                <CardDescription>Klinik Utama & Apotek Terintegrasi</CardDescription>
              </div>
              <Button size='sm' asChild>
                <Link href='/dashboard/admin'>Kelola Layanan</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Unit operasional utama dengan integrasi rekam medis, antrean kasir, dan jadwal dokter
              aktif.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
