'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export interface ClinicalHistoryCellActionProps {
  id: string;
  onViewDetail: (id: string) => void;
  label?: string;
}

export function ClinicalHistoryCellAction({
  id,
  onViewDetail,
  label = 'Lihat Detail'
}: ClinicalHistoryCellActionProps) {
  return (
    <div className='flex items-center justify-end pr-2'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        shape='pill'
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail(id);
        }}
        className='h-7.5 px-3 text-xs font-semibold shadow-2xs hover:border-primary/50 hover:bg-primary/5 transition-all'
      >
        <Icons.eye className='size-3.5 mr-1.5 text-primary' />
        {label}
      </Button>
    </div>
  );
}
