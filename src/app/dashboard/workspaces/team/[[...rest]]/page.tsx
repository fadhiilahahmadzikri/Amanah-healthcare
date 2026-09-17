import PageContainer from '@/components/layout/page-container';
import { teamInfoContent } from '@/config/infoconfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Manajemen Tim'
};

export default async function TeamPage() {
  const session = await requireAdmin();

  return (
    <PageContainer
      pageTitle='Manajemen Tim'
      pageDescription='Kelola anggota tim, staf medis, peran operasional dan keamanan'
      infoContent={teamInfoContent}
    >
      <div className='max-w-3xl space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Anggota Terdaftar</CardTitle>
            <CardDescription>Daftar akun staf dan tenaga kesehatan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='divide-y divide-border'>
              <div className='flex items-center justify-between py-3'>
                <div>
                  <p className='font-medium'>{session.user.name || 'Admin Amanah'}</p>
                  <p className='text-xs text-muted-foreground'>{session.user.email}</p>
                </div>
                <Badge variant='outline'>Admin Klinik</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
