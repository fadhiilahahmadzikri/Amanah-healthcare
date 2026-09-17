import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { billingInfoContent } from '@/config/infoconfig';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Langganan & Paket'
};

export default async function BillingPage() {
  await requireAdmin();

  return (
    <PageContainer
      infoContent={billingInfoContent}
      pageTitle='Langganan & Paket'
      pageDescription='Kelola paket operasional klinik Amanah Healthcare'
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Klinik saat ini berjalan dengan lisensi resmi Klinik Amanah Healthcare.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Paket Layanan Aktif</CardTitle>
                <CardDescription>Paket sistem informasi manajemen klinik</CardDescription>
              </div>
              <Badge variant='outline' className='bg-primary/10 text-primary border-primary/20'>
                Aktif
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Tipe Lisensi</span>
                <span className='font-medium'>Klinik Utama & Apotek Terintegrasi</span>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Jumlah Dokter Aktif</span>
                <span className='font-medium'>Tanpa Batas</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-muted-foreground'>Status Sinkronisasi SATUSEHAT</span>
                <span className='font-medium text-emerald-600'>Terhubung</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
