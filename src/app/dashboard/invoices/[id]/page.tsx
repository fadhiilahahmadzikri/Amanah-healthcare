import PageContainer from '@/components/layout/page-container';
import InvoiceViewPage from '@/features/invoices/components/invoice-view-page';

export const metadata = { title: 'Dashboard: Invoice Details' };

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  return (
    <PageContainer scrollable>
      <InvoiceViewPage invoiceId={id} />
    </PageContainer>
  );
}
