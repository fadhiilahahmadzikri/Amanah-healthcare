'use client';

import { notFound, useRouter } from 'next/navigation';
import { useInvoiceStore } from '../store/invoice-store';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AlertModal } from '@/components/modal/alert-modal';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdaptiveSheet } from '@/components/sheets/adaptive-sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { buildInvoiceDocumentData } from '../api/service';
import { InvoiceGenerationPanel } from './generation/invoice-generation-panel';

type TInvoiceViewPageProps = {
  invoiceId: string;
};

const invoiceDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'OVERDUE':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'CANCELLED':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

function formatDate(date: string) {
  return invoiceDateFormatter.format(new Date(date));
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export default function InvoiceViewPage({ invoiceId }: TInvoiceViewPageProps) {
  const { invoices, deleteInvoice } = useInvoiceStore();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const invoice = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);

  if (!invoice) {
    notFound();
  }

  const handleDelete = () => {
    deleteInvoice(invoice.id);
    toast.success('Invoice deleted successfully');
    router.push('/dashboard/invoices');
  };
  const invoiceDocument = useMemo(() => buildInvoiceDocumentData(invoice), [invoice]);

  return (
    <div className='space-y-6'>
      <AlertModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        loading={false}
      />
      <div className='flex items-start justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Invoice {invoice.invoiceNumber}</h2>
          <p className='text-muted-foreground'>Issued on {formatDate(invoice.issuedAt)}</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsGenerateOpen(true)}>
            <Icons.receipt className='mr-2 h-4 w-4' /> Generate Invoice
          </Button>
          <AdaptiveSheet
            open={isGenerateOpen}
            onOpenChange={setIsGenerateOpen}
            title={`Invoice ${invoice.invoiceNumber}`}
            description='Preview and print your invoice'
            side='right'
            width={600}
            sheetContent={<InvoiceGenerationPanel invoice={invoiceDocument} />}
          />
          <Button
            variant='outline'
            onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
          >
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </Button>
          <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.fileTypeDoc className='h-5 w-5 text-muted-foreground' /> Invoice Details
            </CardTitle>
            <CardDescription>Core invoice information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Invoice Number</span>
              <span className='font-medium'>{invoice.invoiceNumber}</span>
            </div>
            <div className='flex justify-between py-2 border-b items-center'>
              <span className='text-muted-foreground'>Status</span>
              <Badge
                variant='outline'
                className={cn('capitalize border', getStatusColor(invoice.status))}
              >
                {invoice.status.toLowerCase()}
              </Badge>
            </div>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Due Date</span>
              <span className='font-medium'>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Paid At</span>
              <span className='font-medium'>
                {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.user className='h-5 w-5 text-muted-foreground' /> Bill To
            </CardTitle>
            <CardDescription>Customer billing information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3 py-2 border-b'>
              <Avatar className='h-8 w-8 rounded-md'>
                <AvatarFallback className='rounded-md text-xs bg-primary/10 text-primary'>
                  {getInitials(invoice.customerName)}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>{invoice.customerName}</span>
                <span className='text-xs text-muted-foreground'>{invoice.customerEmail}</span>
              </div>
            </div>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Company</span>
              <span className='font-medium text-right'>{invoice.company}</span>
            </div>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Address</span>
              <span
                className='font-medium text-right max-w-[200px] truncate'
                title={invoice.address}
              >
                {invoice.address}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.billing className='h-5 w-5 text-muted-foreground' /> Payment Summary
            </CardTitle>
            <CardDescription>Financial breakdown</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span className='font-medium'>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-muted-foreground'>Tax</span>
              <span className='font-medium'>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className='flex justify-between py-2 border-b'>
              <span className='text-foreground font-semibold'>Total</span>
              <span className='font-bold text-lg'>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>{invoice.items.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className='text-right'>Unit Price</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
                <TableHead className='text-right'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>{item.description}</TableCell>
                  <TableCell className='text-right'>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className='text-right'>{item.qty}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className='text-right text-muted-foreground'>
                  Subtotal
                </TableCell>
                <TableCell className='text-right'>{formatCurrency(invoice.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='text-right text-muted-foreground'>
                  Tax
                </TableCell>
                <TableCell className='text-right'>{formatCurrency(invoice.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='text-right font-bold text-foreground'>
                  Total
                </TableCell>
                <TableCell className='text-right font-bold text-foreground'>
                  {formatCurrency(invoice.totalAmount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
