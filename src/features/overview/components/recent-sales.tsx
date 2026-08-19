'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useOrderStore } from '@/features/orders/store/order-store';

export function RecentSales() {
  const orders = useOrderStore((state) => state.orders);
  const recentOrders = orders
    .toSorted(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>You received {orders.length} orders recently.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {recentOrders.map((order) => {
            return (
              <div key={order.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  {order.customerAvatarUrl && (
                    <AvatarImage src={order.customerAvatarUrl} alt={order.customerName} />
                  )}
                  <AvatarFallback>
                    {order.customerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>{order.orderNumber}</p>
                  <p className='text-muted-foreground text-sm flex items-center gap-1.5'>
                    {order.countryFlagUrl ? (
                      <img
                        src={order.countryFlagUrl}
                        alt='flag'
                        className='h-3 w-4 object-cover rounded-[2px]'
                      />
                    ) : (
                      <span>{order.countryFlag}</span>
                    )}
                    <span className='truncate'>
                      {order.customerName}
                      {order.geographicOrigin ? ` · ${order.geographicOrigin.city}` : ''}
                    </span>
                  </p>
                </div>
                <div className='ml-auto font-medium'>+${order.totalAmount.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
