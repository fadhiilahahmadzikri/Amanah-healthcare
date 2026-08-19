import PageContainer from '@/components/layout/page-container';
import ShippingTrackerPage from '@/features/shipping/components/shipping-tracker-page';

export const metadata = {
  title: 'Dashboard: Shipping Tracker'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Shipping Tracker'
      pageDescription='Track and manage your customer shipments'
    >
      <div className='flex-1 w-full flex flex-col gap-4 -mt-4'>
        <ShippingTrackerPage />
      </div>
    </PageContainer>
  );
}
