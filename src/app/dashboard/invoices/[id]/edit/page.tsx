import PageContainer from '@/components/layout/page-container';
import { InvoiceEditPage } from '@/features/invoices/components/invoice-edit-page';

export const metadata = {
  title: 'Dashboard: Edit Invoice'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageContainer scrollable>
      <InvoiceEditPage invoiceId={id} />
    </PageContainer>
  );
}
