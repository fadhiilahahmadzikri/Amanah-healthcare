'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { useDailyTrendChart } from '../model/useDailyTrendChart';

interface DailyTrendChartProps {
  monthKey?: string;
}

export function DailyTrendChart({ monthKey }: DailyTrendChartProps) {
  const trendChart = useDailyTrendChart(monthKey);

  return (
    <Card className='col-span-12 lg:col-span-7 flex flex-col justify-between shadow-xs border-border/60'>
      <CardHeader className='flex flex-row items-start justify-between pb-3'>
        <div className='space-y-0.5'>
          <CardTitle className='text-base font-bold text-foreground tracking-tight'>
            {trendChart.title}
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            {trendChart.subtitle}
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-8 text-xs font-medium gap-1.5 px-3 bg-card shadow-2xs'
            >
              <span>{trendChart.granularity}</span>
              <Icons.chevronDown className='size-3.5 text-muted-foreground' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-32'>
            <DropdownMenuItem onClick={() => trendChart.actions.changeGranularity('Harian')}>
              Harian
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => trendChart.actions.changeGranularity('Mingguan')}>
              Mingguan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => trendChart.actions.changeGranularity('Bulanan')}>
              Bulanan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className='pb-4 pt-1'>
        <div className='h-[260px] w-full'>
          {trendChart.chartData.length > 0 ? (
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={trendChart.chartData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='patientTrendGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='var(--primary)' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='var(--primary)' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='var(--border)'
                  opacity={0.5}
                />
                <XAxis
                  dataKey='dayLabel'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval='preserveStartEnd'
                  ticks={trendChart.xAxisTicks}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  domain={trendChart.domain}
                  ticks={trendChart.ticks}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                          <div className='text-xs font-semibold text-foreground'>{d.dayLabel}</div>
                          <div className='mt-1 flex items-center gap-1.5 text-xs text-primary font-bold'>
                            <span>{d.patients} Pasien</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='patients'
                  stroke='var(--primary)'
                  strokeWidth={2.5}
                  fill='url(#patientTrendGradient)'
                  activeDot={{
                    r: 5,
                    fill: 'var(--primary)',
                    strokeWidth: 2,
                    stroke: 'var(--card)'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Icons.barChart}
              title='Belum ada tren pasien'
              description='Grafik tren pasien akan ditampilkan setelah data tersedia.'
              className='h-full min-h-[260px] border-0 bg-transparent'
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
