'use client';

import * as React from 'react';
import { SectionContainer } from '@/features/public-site/components/shared/SectionContainer';
import { SectionHeader } from '@/features/public-site/components/shared/SectionHeader';
import { usePromotions } from '../context/PromotionsContext';
import { PromoCard } from './PromoCard';

interface PromoSectionProps {
  className?: string;
}

export function PromoSection({ className }: PromoSectionProps) {
  const { sectionPromos } = usePromotions();

  if (!sectionPromos || sectionPromos.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <SectionContainer className='py-12 sm:py-16'>
        <SectionHeader
          eyebrow='Program & Informasi Khusus'
          title='Promo & Layanan Unggulan'
          description='Penawaran spesial dan pengumuman layanan kesehatan terkini dari Amanah Healthcare untuk kenyamanan Anda dan keluarga.'
          align='center'
        />

        <div className='mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sectionPromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
