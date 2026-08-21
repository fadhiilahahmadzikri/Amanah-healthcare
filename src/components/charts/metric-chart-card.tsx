'use client';

import { useId, type ReactNode } from 'react';
import { Area, AreaChart } from 'recharts';

import { Icons } from '@/components/icons';
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

export type MetricTone = 'primary' | 'success' | 'info' | 'warning' | 'danger';

export type MetricChartCardProps = {
  title: string;
  value: string;
  description?: string;
  data: MetricChartPoint[];
  icon?: ReactNode;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  tone?: MetricTone;
  strokeColor?: string;
  className?: string;
};

const toneColors: Record<MetricTone, string> = {
  primary: 'var(--chart-1, #2563eb)',
  success: 'var(--chart-2, #10b981)',
  info: 'var(--chart-3, #06b6d4)',
  warning: 'var(--chart-4, #f59e0b)',
  danger: 'var(--chart-5, #ef4444)'
};

function getIconBgClass(tone: MetricTone = 'primary') {
  switch (tone) {
    case 'primary':
      return 'bg-chart-1/10 text-chart-1';
    case 'success':
      return 'bg-chart-2/10 text-chart-2';
    case 'info':
      return 'bg-chart-3/10 text-chart-3';
    case 'warning':
      return 'bg-chart-4/10 text-chart-4';
    case 'danger':
      return 'bg-chart-5/10 text-chart-5';
  }
}

export function MetricChartCard({
  title,
  value,
  description,
  data,
  icon,
  trendLabel,
  trendDirection = 'neutral',
  tone = 'primary',
  strokeColor,
  className
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
    <div
      data-slot='card'
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md',
        className
      )}
    >
      {/* 1. Header Metrics Content */}
      <div className='p-5 pb-0'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <p className='text-xs font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold tracking-tight text-foreground'>{value}</p>
            <div className='flex items-center gap-1.5'>
              {trendDirection === 'up' && (
                <Icons.trendingUp className='size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
              )}
              {trendDirection === 'down' && (
                <Icons.trendingDown className='size-3.5 text-rose-600 dark:text-rose-400 shrink-0' />
              )}
              {trendLabel && (
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trendDirection === 'up'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : trendDirection === 'down'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground'
                  )}
                >
                  {trendLabel}
                </span>
              )}
              {description && (
                <span className='text-xs text-muted-foreground truncate'>{description}</span>
              )}
            </div>
          </div>
          {icon && (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                getIconBgClass(tone)
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* 2. Unwrapped Edge-to-Edge Sparkline Chart */}
      <div className='w-full'>
        <ChartContainer config={chartConfig} className='h-14 w-full aspect-auto'>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={activeColor} stopOpacity={0.35} />
                <stop offset='100%' stopColor={activeColor} stopOpacity={0.0} />
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
      </div>
    </div>
  );
}
