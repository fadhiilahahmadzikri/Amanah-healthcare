'use client';

import { useOrderStore } from '../store/order-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { mockDb, OrderStatus } from '@/constants/mock-db';
import { Separator } from '@/components/ui/separator';
import { AlertModal } from '@/components/modal/alert-modal';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderViewPageProps {
  orderId: string;
}

const orderDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

export function OrderViewPage({ orderId }: OrderViewPageProps) {
  const router = useRouter();
  const { orders, updateOrderStatus } = useOrderStore();
  const [openDelete, setOpenDelete] = useState(false);

  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return <div className='p-8 text-center text-muted-foreground'>Order not found</div>;
  }

  const handleDelete = () => {
    updateOrderStatus(order.id, 'CANCELLED');
    toast.success('Order deleted/cancelled successfully.');
    router.push('/dashboard/orders');
  };

  const orderDate = orderDateFormatter.format(new Date(order.createdAt));

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.08;
  const shipping = 8.45;
  const discount = -4.13;
  const total = subtotal + tax + shipping + discount;

  const nextStatus = (
    {
      PENDING: 'PROCESSING',
      PROCESSING: 'READY_TO_SHIP',
      READY_TO_SHIP: 'SHIPPED',
      SHIPPED: 'DELIVERED',
      DELIVERED: 'COMPLETED'
    } as Record<string, OrderStatus>
  )[order.status];

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        loading={false}
      />
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Order {order.orderNumber}</h2>
          <p className='text-muted-foreground text-sm mt-1'>Placed on {orderDate}</p>
        </div>
        <div className='flex items-center gap-2'>
          {nextStatus && (
            <Button
              variant='default'
              onClick={() => {
                updateOrderStatus(order.id, nextStatus);
                toast.success(`Status updated to ${nextStatus.replace(/_/g, ' ')}`);
              }}
            >
              <Icons.check className='mr-2 h-4 w-4' /> Mark as {nextStatus.replace(/_/g, ' ')}
            </Button>
          )}
          <Button
            variant='outline'
            onClick={() => router.push(`/dashboard/orders/${order.id}/edit`)}
          >
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </Button>
          <Button variant='destructive' onClick={() => setOpenDelete(true)}>
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.page className='h-4 w-4 text-muted-foreground' /> Order Details
            </CardTitle>
            <CardDescription>Core order information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Order Number</span>
              <span className='font-medium'>{order.orderNumber}</span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Status</span>
              <Badge
                variant='outline'
                className='bg-green-500/10 text-green-500 border-green-500/20'
              >
                {order.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Payment</span>
              <span className='font-medium capitalize'>
                {order.paymentMethod.replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Date</span>
              <span className='font-medium'>{orderDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.user className='h-4 w-4 text-muted-foreground' /> Customer
            </CardTitle>
            <CardDescription>Customer information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Avatar className='h-10 w-10'>
                {order.customerAvatarUrl && (
                  <AvatarImage src={order.customerAvatarUrl} alt={order.customerName} />
                )}
                <AvatarFallback>{getInitials(order.customerName)}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium text-sm'>{order.customerName}</span>
                <span className='text-xs text-muted-foreground'>
                  {order.customerEmail || 'No email provided'}
                </span>
              </div>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Phone</span>
              <span className='text-sm'>{order.customerPhone || 'N/A'}</span>
            </div>
            <Separator />
            <div className='flex justify-between items-center gap-4'>
              <span className='text-sm text-muted-foreground'>Origin</span>
              <span className='text-right text-sm flex items-center justify-end gap-1.5'>
                {order.countryName ? (
                  <>
                    {order.countryFlagUrl ? (
                      <img
                        src={order.countryFlagUrl}
                        alt={order.countryName}
                        className='h-3 w-4 object-cover rounded-[2px]'
                      />
                    ) : (
                      <span>{order.countryFlag}</span>
                    )}
                    <span>
                      {order.geographicOrigin?.city ?? order.countryName}, {order.countryName}
                    </span>
                  </>
                ) : (
                  'N/A'
                )}
              </span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Company</span>
              <span className='text-sm'>N/A</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.page className='h-4 w-4 text-muted-foreground' /> Summary
            </CardTitle>
            <CardDescription>Financial summary</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Subtotal</span>
              <span className='font-medium'>${subtotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Tax</span>
              <span className='font-medium'>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Shipping</span>
              <span className='font-medium'>${shipping.toFixed(2)}</span>
            </div>
            <Separator />
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Discount</span>
              <span className='font-medium text-red-500'>${discount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className='flex justify-between items-center font-bold'>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Icons.page className='h-4 w-4 text-muted-foreground' /> Order Items
          </CardTitle>
          <CardDescription>{order.items.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className='text-right'>Price</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
                <TableHead className='text-right'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const product = mockDb.products.find((p) => p.id === item.productId);
                return (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{product?.name || item.productId}</TableCell>
                    <TableCell className='text-muted-foreground text-xs'>
                      {product?.sku || 'N/A'}
                    </TableCell>
                    <TableCell className='text-right'>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className='text-right'>{item.quantity}</TableCell>
                    <TableCell className='text-right'>${item.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.location className='h-4 w-4 text-muted-foreground' /> Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {order.customerAddress || 'No shipping address provided.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.location className='h-4 w-4 text-muted-foreground' /> Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {order.customerAddress || 'No billing address provided.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
