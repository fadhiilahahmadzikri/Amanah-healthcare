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
  strokeColor?: string;
};

const toneColors: Record<MetricTone, string> = {
  primary: '#2563eb',
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
  tone = 'primary',
  strokeColor
}: MetricChartCardProps) {
  const gradientId = `metric-gradient-${useId().replace(/:/g, '')}`;
  const activeColor = strokeColor || toneColors[tone];

  const chartConfig = {
    value: {
      label: title,
      color: activeColor
    }
  } satisfies ChartConfig;

  return (
    <Card className='overflow-hidden shadow-xs border-border/60'>
      <CardHeader className='flex flex-row items-start justify-between gap-3 pb-2'>
        <div className='min-w-0'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
          <div className='mt-1 truncate text-2xl font-bold text-foreground'>{value}</div>
        </div>
        {icon && (
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className='flex flex-col gap-3 pt-0'>
        <div className='flex min-h-5 items-center gap-2'>
          {trendLabel && (
            <Badge
              variant='outline'
              className={cn(
                'border font-semibold text-[11px] px-2 py-0.5',
                getTrendClassName(trendDirection)
              )}
            >
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
                <stop offset='5%' stopColor={activeColor} stopOpacity={0.25} />
                <stop offset='95%' stopColor={activeColor} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator='line' />}
            />
            <Area
              dataKey='value'
              type='monotone'
              stroke={activeColor}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: activeColor }}
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
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    case 'down':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    case 'neutral':
      return 'bg-muted text-muted-foreground';
  }
}
