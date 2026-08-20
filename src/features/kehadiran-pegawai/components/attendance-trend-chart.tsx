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
import { Icons } from '@/components/icons';

const DAILY_DATA = [
  { label: 'Senin', hadir: 42, izin: 3, tidakHadir: 1 },
  { label: 'Selasa', hadir: 45, izin: 1, tidakHadir: 0 },
  { label: 'Rabu', hadir: 44, izin: 2, tidakHadir: 0 },
  { label: 'Kamis', hadir: 43, izin: 2, tidakHadir: 1 },
  { label: 'Jumat', hadir: 46, izin: 0, tidakHadir: 0 },
  { label: 'Sabtu', hadir: 38, izin: 5, tidakHadir: 3 },
  { label: 'Minggu', hadir: 35, izin: 8, tidakHadir: 3 }
];

const WEEKLY_DATA = [
  { label: 'Minggu 1', hadir: 290, izin: 18, tidakHadir: 6 },
  { label: 'Minggu 2', hadir: 305, izin: 12, tidakHadir: 4 },
  { label: 'Minggu 3', hadir: 298, izin: 15, tidakHadir: 5 },
  { label: 'Minggu 4', hadir: 312, izin: 9, tidakHadir: 2 }
];

const MONTHLY_DATA = [
  { label: 'Jan', hadir: 1210, izin: 60, tidakHadir: 18 },
  { label: 'Feb', hadir: 1180, izin: 52, tidakHadir: 14 },
  { label: 'Mar', hadir: 1250, izin: 45, tidakHadir: 10 },
  { label: 'Apr', hadir: 1230, izin: 48, tidakHadir: 12 },
  { label: 'Mei', hadir: 1270, izin: 38, tidakHadir: 8 },
  { label: 'Jun', hadir: 1260, izin: 40, tidakHadir: 9 }
];

export function AttendanceTrendChart() {
  const [granularity, setGranularity] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');

  const data =
    granularity === 'Harian' ? DAILY_DATA : granularity === 'Mingguan' ? WEEKLY_DATA : MONTHLY_DATA;

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
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='hadirGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--primary-bright, #2563eb)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--primary-bright, #2563eb)' stopOpacity={0.0} />
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
        </div>
      </CardContent>
    </Card>
  );
}
