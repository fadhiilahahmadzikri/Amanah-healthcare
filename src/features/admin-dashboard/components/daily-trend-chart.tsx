'use client';

import React, { useMemo, useState } from 'react';
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
import { Icons } from '@/components/icons';
import { getTrendData } from '@/constants/mock-api-operational-report';

interface DailyTrendChartProps {
  monthKey?: string;
}

export function DailyTrendChart({ monthKey = '2026-05' }: DailyTrendChartProps) {
  const [granularity, setGranularity] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');

  const chartData = useMemo(() => {
    return getTrendData(granularity, monthKey);
  }, [granularity, monthKey]);

  const { title, subtitle, domain, ticks, xAxisTicks } = useMemo(() => {
    if (granularity === 'Bulanan') {
      return {
        title: 'Tren Pasien per Bulan',
        subtitle: 'Jumlah kunjungan dan pasien setiap bulan selama 1 tahun (2026).',
        domain: [0, 3500],
        ticks: [0, 700, 1400, 2100, 2800, 3500],
        xAxisTicks: undefined
      };
    }

    if (granularity === 'Mingguan') {
      return {
        title: 'Tren Pasien per Minggu',
        subtitle: 'Jumlah pasien per minggu selama periode 1 tahun.',
        domain: [0, 900],
        ticks: [0, 180, 360, 540, 720, 900],
        xAxisTicks: undefined
      };
    }

    return {
      title: 'Tren Pasien per Hari',
      subtitle: 'Jumlah pasien yang datang per hari selama periode pilihan.',
      domain: [0, 200],
      ticks: [0, 40, 80, 120, 160, 200],
      xAxisTicks: ['1 Mei', '6 Mei', '11 Mei', '16 Mei', '21 Mei', '26 Mei', '31 Mei']
    };
  }, [granularity]);

  return (
    <Card className='col-span-12 lg:col-span-7 flex flex-col justify-between shadow-xs border-border/60'>
      <CardHeader className='flex flex-row items-start justify-between pb-3'>
        <div className='space-y-0.5'>
          <CardTitle className='text-base font-bold text-foreground tracking-tight'>
            {title}
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>{subtitle}</CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-8 text-xs font-medium gap-1.5 px-3 bg-card shadow-2xs'
            >
              <span>{granularity}</span>
              <Icons.chevronDown className='size-3.5 text-muted-foreground' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-32'>
            <DropdownMenuItem onClick={() => setGranularity('Harian')}>Harian</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGranularity('Mingguan')}>Mingguan</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGranularity('Bulanan')}>Bulanan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className='pb-4 pt-1'>
        <div className='h-[260px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
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
                ticks={xAxisTicks}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                domain={domain}
                ticks={ticks}
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
                        <div className='text-xs font-semibold text-foreground'>
                          {d.dayLabel} {granularity === 'Harian' ? '2026' : ''}
                        </div>
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
        </div>
      </CardContent>
    </Card>
  );
}
