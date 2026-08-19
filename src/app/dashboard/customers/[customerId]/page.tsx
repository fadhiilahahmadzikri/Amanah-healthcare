import PageContainer from '@/components/layout/page-container';
import { CustomerViewPage } from '@/features/customers/components/customer-view-page';

export const metadata = {
  title: 'Dashboard: Customer Details'
};

type PageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { customerId } = await params;

  return (
    <PageContainer scrollable>
      <CustomerViewPage customerId={customerId} />
    </PageContainer>
  );
}
