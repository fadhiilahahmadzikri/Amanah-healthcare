import { OrderEditPage } from '@/features/orders/components/order-edit-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Edit Order'
};

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <PageContainer>
      <OrderEditPage orderId={orderId} />
    </PageContainer>
  );
}
