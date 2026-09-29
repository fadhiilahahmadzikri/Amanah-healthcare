'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface BookingCategoryStepProps {
  isLoadingCatalog: boolean;
  activeCategoryList: Array<{
    id: string;
    code: string;
    title: string;
    icon: string;
    description: string;
    servicesCount: number;
  }>;
  onSelectCategory: (categoryId: string) => void;
}

export function BookingCategoryStep({
  isLoadingCatalog,
  activeCategoryList,
  onSelectCategory
}: BookingCategoryStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Mau periksa layanan apa hari ini? 🏥
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan kategori perawatan kesehatan yang ingin Anda akses di Klinik Amanah.
        </p>
      </div>

      {isLoadingCatalog || activeCategoryList.length === 0 ? (
        <div className='p-8 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-2'>
          <Icons.spinner className='size-6 animate-spin text-primary' />
          <p className='text-xs text-muted-foreground'>
            Memuat kategori layanan klinik...
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'>
          {activeCategoryList.map((cat) => (
            <Card
              key={cat.id}
              className='p-4 border border-border/70 hover:border-primary/60 transition cursor-pointer hover:shadow-xs rounded-2xl flex flex-col justify-between group bg-card'
              onClick={() => onSelectCategory(cat.id)}
            >
              <CardHeader className='p-0 gap-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='text-2xl'>{cat.icon}</span>
                  <span className='text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
                    {cat.servicesCount} Layanan
                  </span>
                </div>
                <CardTitle className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                  {cat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0 pt-2'>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {cat.description}
                </p>
              </CardContent>
              <CardAction className='p-0 pt-3 flex items-center gap-1 text-xs font-semibold text-primary'>
                <span>Pilih Kategori</span>
                <Icons.arrowRight className='size-3 group-hover:translate-x-0.5 transition-transform' />
              </CardAction>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
