'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UNIT_ATTENDANCE_DATA = [
  { unit: 'Dokter', hadir: 12, total: 12 },
  { unit: 'Perawat', hadir: 18, total: 20 },
  { unit: 'Farmasi', hadir: 6, total: 6 },
  { unit: 'Lab / Rad', hadir: 4, total: 5 },
  { unit: 'Admin / Kasir', hadir: 6, total: 7 }
];

export function AttendanceDistributionCard() {
  return (
    <Card className='col-span-12 lg:col-span-5 flex flex-col justify-between shadow-xs border-border/60 rounded-[20px]'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-bold text-foreground tracking-tight'>
            Distribusi Kehadiran per Unit
          </CardTitle>
          <span className='text-[11px] font-medium text-muted-foreground font-mono'>Hari Ini</span>
        </div>
        <CardDescription className='text-xs text-muted-foreground'>
          Perbandingan staf hadir vs total jadwal per divisi klinik.
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-4 pt-1'>
        {/* Bar Chart Visualisasi Kehadiran per Unit (Tinggi diselaraskan dengan chart tren 260px) */}
        <div className='h-[260px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={UNIT_ATTENDANCE_DATA}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='var(--border)'
                opacity={0.5}
              />
              <XAxis
                dataKey='unit'
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px'
                }}
                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
              />
              <Legend
                verticalAlign='top'
                align='right'
                iconType='circle'
                wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
              />
              <Bar
                dataKey='hadir'
                name='Staf Hadir'
                fill='var(--primary-bright, #2563eb)'
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey='total'
                name='Total Jadwal'
                fill='var(--muted-foreground)'
                fillOpacity={0.25}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
