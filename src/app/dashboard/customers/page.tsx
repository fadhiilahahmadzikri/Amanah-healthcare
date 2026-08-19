import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { CustomerTable } from '@/features/customers/components/customers-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export const metadata = { title: 'Dashboard: Customers' };

export default function CustomersPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Customers'
      pageDescription='Manage your customer relationships.'
      pageHeaderAction={
        <Button asChild>
          <Link href='/dashboard/customers/new'>
            <Icons.add className='mr-2 h-4 w-4' /> Add Customer
          </Link>
        </Button>
      }
    >
      <CustomerTable />
    </PageContainer>
  );
}
