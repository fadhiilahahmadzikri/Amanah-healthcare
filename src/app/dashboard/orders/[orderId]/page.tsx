import { OrderViewPage } from '@/features/orders/components/order-view-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Order Details'
};

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <PageContainer>
      <OrderViewPage orderId={orderId} />
    </PageContainer>
  );
}
