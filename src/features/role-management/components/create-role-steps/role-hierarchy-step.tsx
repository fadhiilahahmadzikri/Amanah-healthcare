'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import {
  AUDIENCE,
  type RoleAudience
} from '../../types/role.types';
import { cn } from '@/lib/utils';

export interface RoleHierarchyStepProps {
  audience: RoleAudience;
  onAudienceChange: (val: RoleAudience) => void;
  disabled?: boolean;
}

export function RoleHierarchyStep({
  audience,
  onAudienceChange,
  disabled
}: RoleHierarchyStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Siapa target pengguna untuk peran ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan audiens pengguna yang akan menggunakan peran ini.
        </p>
      </div>

      <div className='space-y-4 pt-1'>
        {/* Audience Selector */}
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold'>Pengguna Peran (Audiens)</Label>
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              disabled={disabled}
              onClick={() => onAudienceChange(AUDIENCE.INTERNAL)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                audience === AUDIENCE.INTERNAL
                  ? 'border-2 border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className='text-xs font-bold text-foreground'>Staf Klinik (Internal)</span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Akses operasional untuk seluruh karyawan dan praktisi klinik
              </span>
            </button>

            <button
              type='button'
              disabled={disabled}
              onClick={() => onAudienceChange(AUDIENCE.EXTERNAL)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                audience === AUDIENCE.EXTERNAL
                  ? 'border-2 border-primary bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className='text-xs font-bold text-foreground'>Pasien Portal (Eksternal)</span>
              <span className='text-[11px] text-muted-foreground mt-0.5'>
                Akses mandiri untuk pasien portal publik
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
