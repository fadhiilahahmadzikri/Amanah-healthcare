'use client';

import { useOrderStore } from '../store/order-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockDb } from '@/constants/mock-db';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderEditPageProps {
  orderId: string;
}

export function OrderEditPage({ orderId }: OrderEditPageProps) {
  const router = useRouter();
  const { orders } = useOrderStore();
  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  const [items, setItems] = useState(() => order?.items ?? []);

  if (!order) {
    return <div className='p-8 text-center text-muted-foreground'>Order not found</div>;
  }

  const handleSave = () => {
    toast.success('Order changes saved successfully (mock).');
    router.push(`/dashboard/orders/${order.id}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      productId: 'prod-1',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    };
    setItems([...items, newItem]);
  };

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex flex-col'>
        <h2 className='text-3xl font-bold tracking-tight'>Edit {order.orderNumber}</h2>
        <p className='text-muted-foreground text-sm mt-1'>Update order information.</p>
      </div>

      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Order Details</CardTitle>
            <CardDescription>Update basic order information.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Customer</Label>
              <Select defaultValue={order.customerName}>
                <SelectTrigger>
                  <SelectValue placeholder='Select Customer' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={order.customerName}>
                    {order.customerName} ({order.customerEmail || 'no-email'})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Status</Label>
              <Select defaultValue={order.status}>
                <SelectTrigger>
                  <SelectValue placeholder='Select Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='PROCESSING'>Processing</SelectItem>
                  <SelectItem value='READY_TO_SHIP'>Ready to Ship</SelectItem>
                  <SelectItem value='SHIPPED'>Shipped</SelectItem>
                  <SelectItem value='DELIVERED'>Delivered</SelectItem>
                  <SelectItem value='COMPLETED'>Completed</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Payment Method</Label>
              <Select defaultValue={order.paymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder='Select Payment Method' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PAYPAL'>PayPal</SelectItem>
                  <SelectItem value='CREDIT_CARD'>Credit Card</SelectItem>
                  <SelectItem value='CASH_ON_DELIVERY'>Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Line Items</CardTitle>
            <CardDescription>Update products in this order.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {items.map((item) => {
              const product = mockDb.products.find((p) => p.id === item.productId);
              return (
                <div key={item.id} className='flex items-end gap-2'>
                  <div className='flex-1 space-y-2'>
                    <Label>Product</Label>
                    <Select defaultValue={product?.name}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select Product' />
                      </SelectTrigger>
                      <SelectContent>
                        {product && (
                          <SelectItem value={product.name}>
                            {product.name} (${product.price.toFixed(2)})
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2 w-24'>
                    <Label>Qty</Label>
                    <Input type='number' defaultValue={item.quantity} />
                  </div>
                  <div className='space-y-2 w-32'>
                    <Label>Price</Label>
                    <Input type='number' defaultValue={item.unitPrice} />
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='mb-0.5 text-muted-foreground hover:text-red-500'
                    onClick={() => removeItem(item.id)}
                  >
                    <Icons.trash className='h-4 w-4' />
                  </Button>
                </div>
              );
            })}
            <Button variant='outline' className='mt-2' onClick={addItem}>
              <Icons.add className='mr-2 h-4 w-4' /> Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Pricing</CardTitle>
            <CardDescription>Additional charges and discounts.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label>Tax</Label>
                <Input type='number' defaultValue={26.32} />
              </div>
              <div className='space-y-2'>
                <Label>Shipping</Label>
                <Input type='number' defaultValue={8.45} />
              </div>
              <div className='space-y-2'>
                <Label>Discount</Label>
                <Input type='number' defaultValue={4.13} />
              </div>
            </div>
            <div className='flex flex-col items-end pt-4 font-medium'>
              <div className='text-sm text-muted-foreground'>Subtotal: $329.00</div>
              <div className='text-base font-bold'>Total: $359.64</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder='Internal notes about this order...' className='min-h-[100px]' />
          </CardContent>
        </Card>

        <div className='flex gap-2 pt-2'>
          <Button onClick={handleSave} className='bg-green-600 hover:bg-green-700 text-white'>
            Save Changes
          </Button>
          <Button variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
