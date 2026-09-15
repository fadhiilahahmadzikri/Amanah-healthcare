'use client';

import React, { useState } from 'react';
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

type TrendGranularity = 'Harian' | 'Mingguan' | 'Bulanan';

interface AttendanceTrendPoint {
  label: string;
  hadir: number;
  izin: number;
  tidakHadir: number;
}

const ATTENDANCE_TREND_DATA: Record<TrendGranularity, AttendanceTrendPoint[]> = {
  Harian: [],
  Mingguan: [],
  Bulanan: []
};

export function AttendanceTrendChart() {
  const [granularity, setGranularity] = useState<TrendGranularity>('Harian');

  const data = ATTENDANCE_TREND_DATA[granularity];

  return (
    <Card className='col-span-12 lg:col-span-7 flex flex-col justify-between shadow-xs border-border/60 rounded-[20px]'>
      <CardHeader className='flex flex-row items-start justify-between pb-3'>
        <div className='space-y-0.5'>
          <CardTitle className='text-base font-bold text-foreground tracking-tight'>
            Tren Presensi Kehadiran Pegawai
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Statistik kehadiran staf medis dan non-medis pada periode terpilih.
          </CardDescription>
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
          {data.length > 0 ? (
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id='hadirGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--primary-bright, #2563eb)'
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--primary-bright, #2563eb)'
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='var(--border)'
                  opacity={0.5}
                />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='hadir'
                  name='Staf Hadir'
                  stroke='var(--primary-bright, #2563eb)'
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill='url(#hadirGradient)'
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Icons.barChart}
              title='Belum ada tren presensi'
              description='Grafik presensi akan ditampilkan setelah data analytics tersedia.'
              className='h-full min-h-[260px] border-0 bg-transparent'
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
