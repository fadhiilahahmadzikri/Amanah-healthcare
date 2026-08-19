'use client';

import { notFound, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { mockDb } from '@/constants/mock-db';
import { useCustomerStore } from '@/features/customers/store/customer-store';
import { useInvoiceStore } from '@/features/invoices/store/invoice-store';
import { useOrderStore } from '@/features/orders/store/order-store';
import {
  formatCurrency,
  formatDate,
  getReportRecordById,
  type ReportRecord,
  type ReportSources
} from '../lib/report-data';

type ReportDetailPageProps = {
  reportId: string;
};

export function ReportDetailPage({ reportId }: ReportDetailPageProps) {
  const router = useRouter();
  const { orders } = useOrderStore();
  const { invoices } = useInvoiceStore();
  const { customers } = useCustomerStore();
  const sources: ReportSources = {
    orders,
    invoices,
    customers,
    products: mockDb.products
  };
  const record = getReportRecordById(sources, reportId);

  if (!record) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>{record.title}</h2>
          <p className='text-muted-foreground'>
            {formatKind(record.kind)} report generated from operational mock data.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => window.print()}>
            <Icons.post className='mr-2 h-4 w-4' /> Print
          </Button>
          <Button variant='outline' onClick={() => router.push('/dashboard/reports')}>
            <Icons.chevronLeft className='mr-2 h-4 w-4' /> Reports
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>Read-only recap identity.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Type'>{formatKind(record.kind)}</DetailRow>
            <DetailRow label='Source ID'>{record.sourceId}</DetailRow>
            <DetailRow label='Status'>
              <Badge variant='outline' className={cn('border', getStatusClassName(record.status))}>
                {record.status}
              </Badge>
            </DetailRow>
            <DetailRow label='Recorded'>{formatDate(record.date)}</DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Snapshot</CardTitle>
            <CardDescription>Amount captured for this record.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Primary Amount'>{formatCurrency(record.amount)}</DetailRow>
            <DetailRow label='Reference'>{record.subtitle}</DetailRow>
            <DetailRow label='Line Items'>{record.lineItems?.length ?? 0}</DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Report records are final summaries.</CardDescription>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            This report detail is intentionally read-only. Source modules own operational edits,
            while Reports provide stable business documentation.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Key-value breakdown for this report record.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 md:grid-cols-2'>
          {record.details.map((detail) => (
            <DetailRow key={detail.label} label={detail.label}>
              {detail.value}
            </DetailRow>
          ))}
        </CardContent>
      </Card>

      {record.lineItems && record.lineItems.length > 0 && <LineItemsTable record={record} />}
    </div>
  );
}

function LineItemsTable({ record }: { record: ReportRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
        <CardDescription>{record.lineItems?.length ?? 0} item(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className='text-right'>Qty</TableHead>
              <TableHead className='text-right'>Unit Price</TableHead>
              <TableHead className='text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {record.lineItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className='font-medium'>{item.label}</TableCell>
                <TableCell className='text-right'>{item.quantity}</TableCell>
                <TableCell className='text-right'>{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className='text-right font-medium'>
                  {formatCurrency(item.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 border-b py-2 last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{children}</span>
    </div>
  );
}

function formatKind(kind: ReportRecord['kind']) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function getStatusClassName(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes('paid') ||
    normalizedStatus.includes('active') ||
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('delivered') ||
    normalizedStatus.includes('shipped')
  ) {
    return 'bg-green-500/10 text-green-500 border-green-500/20';
  }

  if (
    normalizedStatus.includes('pending') ||
    normalizedStatus.includes('processing') ||
    normalizedStatus.includes('ready') ||
    normalizedStatus.includes('low stock')
  ) {
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  }

  if (
    normalizedStatus.includes('cancelled') ||
    normalizedStatus.includes('overdue') ||
    normalizedStatus.includes('inactive')
  ) {
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }

  return 'bg-muted text-muted-foreground';
}
