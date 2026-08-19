'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { OperationalSummary } from '../types';

interface ServiceDistributionChartProps {
  data: OperationalSummary['servicesDistribution'];
  totalPatients: number;
}

export function ServiceDistributionChart({ data, totalPatients }: ServiceDistributionChartProps) {
  return (
    <Card className='col-span-12 lg:col-span-5 flex flex-col justify-between shadow-xs border-border/60'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-bold text-foreground tracking-tight'>
          Pasien Berdasarkan Layanan
        </CardTitle>
        <CardDescription className='text-xs text-muted-foreground'>
          Distribusi pasien berdasarkan layanan yang digunakan.
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-4 pt-1'>
        <div className='grid grid-cols-1 sm:grid-cols-12 items-center gap-4'>
          {/* Donut Chart with Centered Total */}
          <div className='sm:col-span-5 relative flex items-center justify-center min-h-[190px]'>
            <div className='w-[190px] h-[190px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className='rounded-lg border bg-background px-3 py-1.5 shadow-md text-xs'>
                            <span className='font-semibold text-foreground'>
                              {item.serviceName}
                            </span>
                            <div className='mt-0.5 text-muted-foreground font-medium'>
                              {item.patientsCount} pasien ({item.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data}
                    dataKey='patientsCount'
                    nameKey='serviceName'
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={2}
                    strokeWidth={1}
                    stroke='var(--background)'
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centered Total Text inside Donut */}
            <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
              <span className='text-xl font-bold text-foreground tracking-tight'>
                {totalPatients.toLocaleString('id-ID')}
              </span>
              <span className='text-[11px] font-medium text-muted-foreground'>Total</span>
            </div>
          </div>

          {/* Right Legend Items */}
          <div className='sm:col-span-7 flex flex-col justify-center space-y-2.5 pl-2'>
            {data.map((item) => (
              <div key={item.serviceName} className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2 min-w-0 pr-2'>
                  <span
                    className='size-2 rounded-full shrink-0'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='text-muted-foreground truncate font-medium'>
                    {item.serviceName}
                  </span>
                </div>
                <span className='font-semibold text-foreground whitespace-nowrap tabular-nums'>
                  {item.percentage}% ({item.patientsCount})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
