import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { InvoiceTable } from '@/features/invoices/components/invoices-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export const metadata = { title: 'Dashboard: Invoices' };

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const customer = params.customer;
  const href = customer
    ? `/dashboard/invoices/new?customer=${customer}`
    : '/dashboard/invoices/new';

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Invoices'
      pageDescription='Manage billing and payment tracking.'
      pageHeaderAction={
        <Button asChild>
          <Link href={href}>
            <Icons.add className='mr-2 h-4 w-4' /> New Invoice
          </Link>
        </Button>
      }
    >
      <InvoiceTable />
    </PageContainer>
  );
}
