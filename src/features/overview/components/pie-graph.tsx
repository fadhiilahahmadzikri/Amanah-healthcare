'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { mockDb } from '@/constants/mock-db';

export function PieGraph() {
  const statusCounts = mockDb.orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statuses = Object.keys(statusCounts);

  const chartData = statuses.map((status, index) => {
    return {
      status: status.toLowerCase().replace(/\s/g, ''),
      label: status,
      count: statusCounts[status],
      fill: `var(--chart-${(index % 5) + 1})`
    };
  });

  const chartConfig = {
    count: {
      label: 'Orders'
    },
    ...Object.fromEntries(
      statuses.map((status, index) => [
        status.toLowerCase().replace(/\s/g, ''),
        { label: status, color: `var(--chart-${(index % 5) + 1})` }
      ])
    )
  } satisfies ChartConfig;

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>
          Order Status
          <Badge variant='outline'>
            <Icons.pieChart className='mr-1 size-4' />
            Current
          </Badge>
        </CardTitle>
        <CardDescription>Distribution of all orders</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px] min-h-[250px]'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey='status' hideLabel />} />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey='count'
              nameKey='status'
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey='count'
                stroke='none'
                fontSize={12}
                fontWeight={500}
                fill='currentColor'
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
