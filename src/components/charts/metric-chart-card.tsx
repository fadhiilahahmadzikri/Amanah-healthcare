'use client';

import { useId, type ReactNode } from 'react';
import { Area, AreaChart } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export type MetricChartPoint = {
  label: string;
  value: number;
};

type MetricTone = 'primary' | 'success' | 'info' | 'warning' | 'danger';

type MetricChartCardProps = {
  title: string;
  value: string;
  description: string;
  data: MetricChartPoint[];
  icon?: ReactNode;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  tone?: MetricTone;
};

const toneColors: Record<MetricTone, string> = {
  primary: 'var(--chart-1)',
  success: 'var(--chart-2)',
  info: 'var(--chart-3)',
  warning: 'var(--chart-4)',
  danger: 'var(--destructive)'
};

export function MetricChartCard({
  title,
  value,
  description,
  data,
  icon,
  trendLabel,
  trendDirection = 'neutral',
  tone = 'primary'
}: MetricChartCardProps) {
  const gradientId = `metric-gradient-${useId().replace(/:/g, '')}`;
  const chartConfig = {
    value: {
      label: title,
      color: toneColors[tone]
    }
  } satisfies ChartConfig;

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row items-start justify-between gap-3 pb-2'>
        <div className='min-w-0'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
          <div className='mt-1 truncate text-2xl font-bold'>{value}</div>
        </div>
        {icon && (
          <div className='flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className='flex flex-col gap-3 pt-0'>
        <div className='flex min-h-5 items-center gap-2'>
          {trendLabel && (
            <Badge variant='outline' className={cn('border', getTrendClassName(trendDirection))}>
              {trendLabel}
            </Badge>
          )}
          <span className='truncate text-xs text-muted-foreground'>{description}</span>
        </div>
        <ChartContainer config={chartConfig} className='h-16 w-full aspect-auto'>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 0, top: 6, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-value)' stopOpacity={0.38} />
                <stop offset='95%' stopColor='var(--color-value)' stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator='line' />}
            />
            <Area
              dataKey='value'
              type='monotone'
              stroke='var(--color-value)'
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function getTrendClassName(direction: 'up' | 'down' | 'neutral') {
  switch (direction) {
    case 'up':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'down':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'neutral':
      return 'bg-muted text-muted-foreground';
  }
}
