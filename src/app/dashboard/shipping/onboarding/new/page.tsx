import PageContainer from '@/components/layout/page-container';
import ShippingForm from '@/features/shipping/components/shipping-form';

export const metadata = {
  title: 'Dashboard: Create Shipping'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Create Shipping' pageDescription='Add a new shipping record'>
      <div className='flex-1 w-full flex flex-col gap-4 -mt-4'>
        <ShippingForm initialData={null} pageTitle='Create New Shipping' />
      </div>
    </PageContainer>
  );
}
