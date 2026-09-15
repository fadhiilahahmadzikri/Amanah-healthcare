'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { MiniSparkline } from './mini-sparkline';
import { cn } from '@/lib/utils';
import type { OperationalSummary } from '../types';

interface TopServicesTableProps {
  data: OperationalSummary['topOrderedServices'];
}

export function TopServicesTable({ data }: TopServicesTableProps) {
  return (
    <Card className='col-span-12 shadow-xs border-border/60'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-bold text-foreground tracking-tight'>
          Top Layanan yang Dipesan
        </CardTitle>
        <CardDescription className='text-xs text-muted-foreground'>
          Layanan yang paling sering dipesan oleh pasien.
        </CardDescription>
      </CardHeader>

      <CardContent className='pt-0 pb-4'>
        {data.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-xs text-left'>
              <thead>
                <tr className='border-b border-border/40 text-muted-foreground/80 font-semibold text-[11px]'>
                  <th className='py-2.5 px-3 font-semibold'>Layanan</th>
                  <th className='py-2.5 px-3 text-center font-semibold'>Total Pemesanan</th>
                  <th className='py-2.5 px-3 text-center font-semibold'>Persentase</th>
                  <th className='py-2.5 px-3 text-right font-semibold'>
                    Tren (vs Periode Sebelumnya)
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/30'>
                {data.map((item) => {
                  const isPositive = item.trendPercentage >= 0;
                  return (
                    <tr key={item.id} className='hover:bg-muted/40 transition-colors'>
                      <td className='py-3 px-3 font-semibold text-foreground'>
                        {item.serviceName}
                      </td>

                      <td className='py-3 px-3 text-center font-bold text-foreground tabular-nums'>
                        {item.totalOrders.toLocaleString('id-ID')}
                      </td>

                      <td className='py-3 px-3 text-center font-medium text-muted-foreground tabular-nums'>
                        {item.percentage}%
                      </td>

                      <td className='py-3 px-3 text-right'>
                        <div className='flex items-center justify-end gap-3'>
                          <MiniSparkline
                            data={item.sparkline}
                            color={isPositive ? 'var(--primary-bright)' : 'var(--destructive)'}
                            width={110}
                            height={20}
                          />
                          <span
                            className={cn(
                              'text-xs font-bold tabular-nums whitespace-nowrap min-w-[55px] text-right',
                              isPositive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {isPositive
                              ? `↑ ${item.trendPercentage}%`
                              : `↓ ${Math.abs(item.trendPercentage)}%`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Icons.inbox}
            title='Belum ada data layanan'
            description='Layanan yang paling sering dipesan akan ditampilkan setelah data tersedia.'
            className='min-h-[240px] border-0 bg-transparent'
          />
        )}
      </CardContent>
    </Card>
  );
}
