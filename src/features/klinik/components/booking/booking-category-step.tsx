'use client';

import React from 'react';
import { Folder } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveLucideIcon } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';

export function BookingCategorySkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className='p-4 border border-border/70 rounded-2xl flex flex-col justify-between bg-card min-h-[140px] space-y-3'
        >
          <div className='space-y-2.5'>
            <div className='flex items-center justify-between'>
              <Skeleton className='size-9 rounded-xl' />
              <Skeleton className='h-5 w-20 rounded-full' />
            </div>
            <Skeleton className='h-4.5 w-3/4 rounded-md' />
            <div className='space-y-1.5 pt-1'>
              <Skeleton className='h-3 w-full rounded-md' />
              <Skeleton className='h-3 w-2/3 rounded-md' />
            </div>
          </div>
          <div className='flex items-center justify-between pt-2'>
            <Skeleton className='h-3.5 w-24 rounded-md' />
            <Skeleton className='size-3 rounded-full' />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface BookingCategoryStepProps {
  isLoadingCatalog: boolean;
  catalogError?: Error | null;
  onRetryCatalog?: () => void;
  activeCategoryList: Array<{
    id: string;
    code: string;
    title: string;
    icon?: string;
    description: string;
    servicesCount: number;
  }>;
  onSelectCategory: (categoryId: string) => void;
}

export function BookingCategoryStep({
  isLoadingCatalog,
  catalogError,
  onRetryCatalog,
  activeCategoryList,
  onSelectCategory
}: BookingCategoryStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Mau periksa layanan apa hari ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan kategori perawatan kesehatan yang ingin Anda akses di Klinik Amanah.
        </p>
      </div>

      {isLoadingCatalog ? (
        <BookingCategorySkeleton />
      ) : catalogError ? (
        <EmptyState
          icon={Icons.warning}
          animated={false}
          title='Gagal Memuat Kategori Layanan'
          description={
            catalogError.message ||
            'Terjadi kendala saat memuat data katalog layanan klinik. Silakan periksa koneksi Anda dan coba lagi.'
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
      ) : activeCategoryList.length === 0 ? (
        <EmptyState
          title='Belum Ada Kategori Layanan'
          description='Layanan klinik belum dikonfigurasi atau belum tersedia saat ini. Silakan hubungi staf klinik atau coba beberapa saat lagi.'
          className='py-6 rounded-2xl border-dashed border-border/70 bg-muted/10'
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'>
          {activeCategoryList.map((cat) => {
            const IconComponent = resolveLucideIcon(cat.icon || 'folder') || Folder;
            return (
              <Card
                key={cat.id}
                className='p-4 border border-border/70 hover:border-primary/60 transition cursor-pointer hover:shadow-xs rounded-2xl flex flex-col justify-between group bg-card'
                onClick={() => onSelectCategory(cat.id)}
              >
                <CardHeader className='p-0 gap-1.5'>
                  <div className='flex items-center justify-between'>
                    <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                      <IconComponent className='size-4.5 text-primary' />
                    </div>
                    <span className='text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
                      {cat.servicesCount} Layanan
                    </span>
                  </div>
                  <CardTitle className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                    {cat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0 pt-2'>
                  <p className='text-xs text-muted-foreground leading-relaxed'>{cat.description}</p>
                </CardContent>
                <CardAction className='p-0 pt-3 flex items-center gap-1 text-xs font-semibold text-primary'>
                  <span>Pilih Kategori</span>
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
