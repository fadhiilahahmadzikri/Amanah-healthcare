'use client';

import { useMemo } from 'react';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { mockDb } from '@/constants/mock-db';
import { buildBusinessMetrics } from '@/features/commerce-simulator/lib/business-metrics';
import { useBalanceStore } from '@/features/commerce-simulator/store/balance-store';
import { useOrderStore } from '@/features/orders/store/order-store';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function BusinessMetricCards() {
  const orders = useOrderStore((state) => state.orders);
  const balance = useBalanceStore((state) => state.balance);
  const metrics = useMemo(
    () =>
      buildBusinessMetrics({
        orders,
        products: mockDb.products,
        balance
      }),
    [balance, orders]
  );

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Balance</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {currencyFormatter.format(metrics.balance)}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.billing />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Applied paid workflows <Icons.trendingUp className='size-4 text-green-500' />
          </div>
          <div className='text-muted-foreground'>{metrics.pendingOrders} orders still pending</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Fulfillment Rate</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {metrics.fulfillmentRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.check />
              {metrics.completedOrders}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Orders fulfilled <Icons.check className='size-4 text-green-500' />
          </div>
          <div className='text-muted-foreground'>Completed, delivered, or shipped</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Cancelled Orders</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {metrics.cancelledOrders}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.trendingDown />
              Stable
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Revenue retained {currencyFormatter.format(metrics.revenue)}
          </div>
          <div className='text-muted-foreground'>Customer or system cancellations</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Monthly Orders</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {metrics.totalOrders}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <Icons.receipt />
              {metrics.lowStockCount} low stock
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Avg {currencyFormatter.format(metrics.reportTotals.averageOrderValue)}
          </div>
          <div className='text-muted-foreground'>Total orders received this month</div>
        </CardFooter>
      </Card>
    </div>
  );
}
