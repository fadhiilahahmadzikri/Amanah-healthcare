import PageContainer from '@/components/layout/page-container';
import { CustomerCreatePage } from '@/features/customers/components/customer-create-page';

export const metadata = {
  title: 'Dashboard: New Customer'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <CustomerCreatePage />
    </PageContainer>
  );
}
