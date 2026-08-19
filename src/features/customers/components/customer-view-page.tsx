'use client';

import { useState, type ReactNode } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { AlertModal } from '@/components/modal/alert-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getCustomerAddress, type Customer, useCustomerStore } from '../store/customer-store';

type CustomerViewPageProps = {
  customerId: string;
};

const customerDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function CustomerViewPage({ customerId }: CustomerViewPageProps) {
  const router = useRouter();
  const { customers, deleteCustomer } = useCustomerStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    notFound();
  }

  const address = getCustomerAddress(customer);
  const averageOrderValue = customer.orders > 0 ? customer.totalSpent / customer.orders : 0;

  const handleDelete = () => {
    deleteCustomer(customer.id);
    toast.success('Customer deleted successfully');
    router.push('/dashboard/customers');
  };

  return (
    <div className='flex flex-col gap-6'>
      <AlertModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        loading={false}
      />

      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>{customer.name}</h2>
          <p className='text-muted-foreground'>Customer since {formatDate(customer.joinedAt)}</p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
          >
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </Button>
          <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.user className='h-5 w-5 text-muted-foreground' /> Profile
            </CardTitle>
            <CardDescription>Customer details</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center gap-3 border-b pb-4'>
              <Avatar className='size-12 rounded-md'>
                {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt={customer.name} />}
                <AvatarFallback className='rounded-md bg-primary/10 text-primary'>
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex min-w-0 flex-col gap-1'>
                <span className='truncate font-medium'>{customer.name}</span>
                <Badge
                  variant='outline'
                  className={cn('w-fit border', getStatusColor(customer.status))}
                >
                  {customer.status}
                </Badge>
              </div>
            </div>

            <ProfileLine icon={<Icons.post className='h-4 w-4' />}>{customer.email}</ProfileLine>
            <ProfileLine icon={<Icons.phone className='h-4 w-4' />}>{customer.phone}</ProfileLine>
            <ProfileLine icon={<Icons.dashboard className='h-4 w-4' />}>
              {customer.company}
            </ProfileLine>
            <ProfileLine icon={<Icons.location className='h-4 w-4' />}>
              {formatAddress(address)}
            </ProfileLine>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.barChart className='h-5 w-5 text-muted-foreground' /> Statistics
            </CardTitle>
            <CardDescription>Lifetime metrics</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Total Orders'>{customer.orders}</DetailRow>
            <DetailRow label='Total Spent'>{formatCurrency(customer.totalSpent)}</DetailRow>
            <DetailRow label='Avg. Order Value'>{formatCurrency(averageOrderValue)}</DetailRow>
            <DetailRow label='Member Since'>{formatDate(customer.joinedAt)}</DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <Button
              variant='outline'
              className='justify-start'
              onClick={() => router.push(`/dashboard/orders?customer=${customer.id}`)}
            >
              <Icons.receipt className='mr-2 h-4 w-4' /> Create Order
            </Button>
            <Button
              variant='outline'
              className='justify-start'
              onClick={() => router.push(`/dashboard/invoices?customer=${customer.id}`)}
            >
              <Icons.post className='mr-2 h-4 w-4' /> Create Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
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

function ProfileLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className='flex items-center gap-2 text-sm'>
      <span className='text-muted-foreground'>{icon}</span>
      <span className='min-w-0 truncate font-medium'>{children}</span>
    </div>
  );
}

function getStatusColor(status: Customer['status']) {
  return status === 'Active'
    ? 'bg-green-500/10 text-green-500 border-green-500/20'
    : 'bg-gray-500/10 text-gray-500 border-gray-500/20';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function formatAddress(address: ReturnType<typeof getCustomerAddress>) {
  return `${address.streetAddress}, ${address.city}, ${address.country}`;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  return customerDateFormatter.format(new Date(value));
}
