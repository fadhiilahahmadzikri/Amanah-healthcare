'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import type { OperationalSummary } from '../types';

interface StaffAttendanceCardProps {
  data: OperationalSummary['staffAttendance'];
}

export function StaffAttendanceCard({ data }: StaffAttendanceCardProps) {
  return (
    <Card className='col-span-12 md:col-span-4 flex flex-col justify-between shadow-xs border-border/60'>
      <div>
        <CardHeader className='pb-2.5'>
          <CardTitle className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Kehadiran Staff
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Ringkasan kehadiran staff selama periode pilihan.
          </CardDescription>
        </CardHeader>

        <CardContent className='pt-0 pb-2 space-y-2'>
          {data.length > 0 ? (
            <>
              {/* Table Header */}
              <div className='grid grid-cols-12 text-[11px] font-semibold text-muted-foreground/80 pb-1 border-b border-border/40'>
                <span className='col-span-6'>Status</span>
                <span className='col-span-3 text-center'>Jumlah Staff</span>
                <span className='col-span-3 text-right'>Persentase</span>
              </div>

              {/* List of Attendance Records */}
              <div className='divide-y divide-border/30'>
                {data.map((item) => (
                  <div key={item.status} className='py-2.5 grid grid-cols-12 items-center text-xs'>
                    <div className='col-span-6 flex items-center gap-2'>
                      <span
                        className='size-2 rounded-full shrink-0'
                        style={{ backgroundColor: item.color }}
                      />
                      <span className='font-medium text-foreground'>{item.status}</span>
                    </div>

                    <span className='col-span-3 text-center font-bold text-foreground tabular-nums'>
                      {item.count}
                    </span>

                    <span className='col-span-3 text-right font-medium text-muted-foreground tabular-nums'>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Icons.teams}
              title='Belum ada data kehadiran'
              description='Ringkasan kehadiran staff akan ditampilkan setelah data tersedia.'
              className='min-h-[220px] border-0 bg-transparent'
            />
          )}
        </CardContent>
      </div>

      {/* Footer Link */}
      <div className='p-4 pt-1 border-t border-border/30'>
        <Link
          href='/dashboard/admin'
          className='inline-flex items-center text-xs font-semibold text-primary hover:underline group'
        >
          <span>Lihat detail kehadiran</span>
          <Icons.arrowRight className='ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </Card>
  );
}
