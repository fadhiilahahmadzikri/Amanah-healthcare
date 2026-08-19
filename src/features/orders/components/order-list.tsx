'use client';

import { useOrderStore } from '../store/order-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/constants/mock-db';
import { useState } from 'react';
import { OrderDetailsModal } from './order-details-modal';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'READY_TO_SHIP':
      return 'bg-purple-100 text-purple-800';
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function OrderList() {
  const { orders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>Orders Queue</CardTitle>
        <CardDescription>Manage your incoming orders and fulfillment pipeline</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 p-0 overflow-auto'>
        <div className='divide-y'>
          {orders.map((order) => (
            <div
              key={order.id}
              className='p-4 hover:bg-muted/50 flex justify-between items-center transition-colors cursor-pointer'
              onClick={() => setSelectedOrder(order)}
              aria-label={`Select order ${order.orderNumber}`}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedOrder(order);
                }
              }}
            >
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='font-semibold'>{order.orderNumber}</span>
                  <Badge variant='outline' className={getStatusColor(order.status)}>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className='text-sm text-muted-foreground'>
                  {order.customerName} - {order.items.length} items
                </div>
              </div>
              <div className='text-right'>
                <div className='font-semibold'>${order.totalAmount.toFixed(2)}</div>
                <div className='text-xs text-muted-foreground'>
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className='p-8 text-center text-muted-foreground'>No orders found</div>
          )}
        </div>
      </CardContent>
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </Card>
  );
}
