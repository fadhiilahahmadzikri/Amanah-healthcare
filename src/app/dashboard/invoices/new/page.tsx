import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { InvoiceCreatePage } from '@/features/invoices/components/invoice-create-page';

export const metadata = {
  title: 'Dashboard: New Invoice'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <Suspense>
        <InvoiceCreatePage />
      </Suspense>
    </PageContainer>
  );
}
