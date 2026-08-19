'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import type { OperationalSummary } from '../types';

interface TopDoctorsCardProps {
  doctors: OperationalSummary['topDoctors'];
}

export function TopDoctorsCard({ doctors }: TopDoctorsCardProps) {
  return (
    <Card className='col-span-12 md:col-span-4 flex flex-col justify-between shadow-xs border-border/60'>
      <div>
        <CardHeader className='pb-2.5'>
          <CardTitle className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Top Dokter (Berdasarkan Pasien)
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Dokter dengan jumlah pasien terbanyak.
          </CardDescription>
        </CardHeader>

        <CardContent className='pt-0 pb-2 space-y-2'>
          {/* Table Header */}
          <div className='flex items-center justify-between text-[11px] font-semibold text-muted-foreground/80 pb-1 border-b border-border/40'>
            <span>Dokter</span>
            <span>Total Pasien</span>
          </div>

          {/* List of Doctors */}
          <div className='divide-y divide-border/30'>
            {doctors.map((doc) => {
              const initials = doc.name
                .replace('dr. ', '')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div key={doc.id} className='py-2 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <Avatar className='size-8 rounded-full ring-1 ring-border/40 shrink-0'>
                      <AvatarImage src={doc.avatar} alt={doc.name} />
                      <AvatarFallback className='text-[10px] bg-primary/10 text-primary font-bold'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col min-w-0'>
                      <span className='text-xs font-semibold text-foreground truncate'>
                        {doc.name}
                      </span>
                      <span className='text-[11px] text-muted-foreground truncate'>
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <span className='text-xs font-bold text-foreground tabular-nums'>
                    {doc.totalPatients}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* Footer Link */}
      <div className='p-4 pt-1 border-t border-border/30'>
        <Link
          href='/dashboard/appointment-pasien'
          className='inline-flex items-center text-xs font-semibold text-primary hover:underline group'
        >
          <span>Lihat semua dokter</span>
          <Icons.arrowRight className='ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </Card>
  );
}
