import PageContainer from '@/components/layout/page-container';
import { getOnboardingById } from '@/features/shipping/api/service';
import ShippingForm from '@/features/shipping/components/shipping-form';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Edit Shipping'
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const record = await getOnboardingById(resolvedParams.id);

  if (!record) {
    notFound();
  }

  return (
    <PageContainer pageTitle='Edit Shipping' pageDescription='Update shipping record details'>
      <div className='flex-1 w-full flex flex-col gap-4 -mt-4'>
        <ShippingForm initialData={record} pageTitle='Edit Shipping' />
      </div>
    </PageContainer>
  );
}
