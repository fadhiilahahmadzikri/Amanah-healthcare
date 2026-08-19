import PageContainer from '@/components/layout/page-container';
import { OrderTable } from '@/features/orders/components/orders-table';

export default function OrdersPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Orders'
      pageDescription='Manage your orders and track their status.'
    >
      <OrderTable />
    </PageContainer>
  );
}
