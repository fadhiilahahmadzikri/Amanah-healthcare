import PageContainer from '@/components/layout/page-container';
import { CustomerEditPage } from '@/features/customers/components/customer-edit-page';

export const metadata = {
  title: 'Dashboard: Edit Customer'
};

type PageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { customerId } = await params;

  return (
    <PageContainer scrollable>
      <CustomerEditPage customerId={customerId} />
    </PageContainer>
  );
}
