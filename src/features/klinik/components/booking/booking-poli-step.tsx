'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { BookingCategorySkeleton } from './booking-category-step';

export interface BookingPoliStepProps {
  isLoadingCatalog: boolean;
  catalogError?: Error | null;
  onRetryCatalog?: () => void;
  activePoliList: Array<{
    id: string;
    name: string;
    categoriesCount: number;
    servicesCount: number;
    icon?: string;
  }>;
  onSelectPoli: (poliId: string) => void;
}

export function BookingPoliStep({
  isLoadingCatalog,
  catalogError,
  onRetryCatalog,
  activePoliList,
  onSelectPoli
}: BookingPoliStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Pilih Poliklinik Tujuan
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan unit poliklinik yang ingin Anda kunjungi untuk melihat kelompok layanan yang
          tersedia.
        </p>
      </div>

      {isLoadingCatalog ? (
        <BookingCategorySkeleton />
      ) : catalogError ? (
        <EmptyState
          icon={Icons.warning}
          animated={false}
          title='Gagal Memuat Daftar Poliklinik'
          description={
            catalogError.message ||
            'Terjadi kendala saat memuat data unit poliklinik. Silakan periksa koneksi Anda dan coba lagi.'
          }
          resetAction={
            onRetryCatalog
              ? {
                  label: 'Coba Lagi',
                  onReset: onRetryCatalog,
                  icon: Icons.refresh
                }
              : undefined
          }
          className='min-h-[220px] py-8 rounded-2xl border-dashed border-destructive/30 bg-destructive/5'
        />
      ) : activePoliList.length === 0 ? (
        <EmptyState
          title='Belum Ada Poliklinik'
          description='Fasilitas poliklinik belum dikonfigurasi di sistem klinik. Silakan hubungi admin fasilitas klinik.'
          className='py-6 rounded-2xl border-dashed border-border/70 bg-muted/10'
        />
      ) : (
        <div
          className={
            activePoliList.length === 1
              ? 'grid grid-cols-1 gap-3.5 pt-1'
              : 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'
          }
        >
          {activePoliList.map((poli) => {
            const isSingle = activePoliList.length === 1;
            return (
              <Card
                key={poli.id}
                className={
                  isSingle
                    ? 'p-5 border border-border/70 hover:border-primary/60 transition cursor-pointer hover:shadow-xs rounded-2xl flex flex-col justify-between group bg-card w-full'
                    : 'p-4 border border-border/70 hover:border-primary/60 transition cursor-pointer hover:shadow-xs rounded-2xl flex flex-col justify-between group bg-card'
                }
                onClick={() => onSelectPoli(poli.id)}
              >
                <CardHeader className='p-0 gap-1.5'>
                  <div className='flex items-center justify-between'>
                    <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                      <Building2 className='size-4.5 text-primary' />
                    </div>
                    <span className='text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
                      {poli.servicesCount} Layanan
                    </span>
                  </div>
                  <CardTitle className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                    {poli.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0 pt-2'>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    Tersedia {poli.categoriesCount} kelompok layanan medis pada unit poliklinik ini.
                  </p>
                </CardContent>
                <CardAction className='p-0 pt-3 flex items-center gap-1 text-xs font-semibold text-primary'>
                  <span>Pilih Poli</span>
                  <Icons.arrowRight className='size-3 group-hover:translate-x-0.5 transition-transform' />
                </CardAction>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
