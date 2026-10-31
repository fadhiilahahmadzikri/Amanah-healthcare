'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface RoleClinicalStepProps {
  isClinical: boolean;
  onClinicalChange: (val: boolean) => void;
  disabled?: boolean;
}

export function RoleClinicalStep({
  isClinical,
  onClinicalChange,
  disabled
}: RoleClinicalStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apakah peran ini termasuk tenaga medis?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih apakah peran ini berhubungan langsung dengan tindakan medis atau operasional.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
        {/* Option: Yes (Clinical) */}
        <button
          type='button'
          disabled={disabled}
          onClick={() => onClinicalChange(true)}
          className={cn(
            'flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer relative',
            isClinical
              ? 'border-2 border-primary bg-primary/5 shadow-xs'
              : 'border-border bg-card hover:border-primary/40'
          )}
        >
          <div className='flex items-center justify-between w-full mb-2'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold',
                isClinical ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icons.pill className='size-3' />
              Klinis
            </span>
            <div
              className={cn(
                'size-4 rounded-full border flex items-center justify-center transition-colors',
                isClinical
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/40 bg-transparent'
              )}
            >
              {isClinical && <Icons.check className='size-2.5 stroke-[3]' />}
            </div>
          </div>
          <span className='text-sm font-bold text-foreground'>Ya, Tenaga Medis</span>
          <span className='text-xs text-muted-foreground mt-1 leading-normal'>
            Menangani pemeriksaan pasien, konsultasi poliklinik, tindakan, atau rekam medis.
          </span>
        </button>

        {/* Option: No (Operational) */}
        <button
          type='button'
          disabled={disabled}
          onClick={() => onClinicalChange(false)}
          className={cn(
            'flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer relative',
            !isClinical
              ? 'border-2 border-primary bg-primary/5 shadow-xs'
              : 'border-border bg-card hover:border-primary/40'
          )}
        >
          <div className='flex items-center justify-between w-full mb-2'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold',
                !isClinical
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icons.settings className='size-3' />
              Operasional
            </span>
            <div
              className={cn(
                'size-4 rounded-full border flex items-center justify-center transition-colors',
                !isClinical
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/40 bg-transparent'
              )}
            >
              {!isClinical && <Icons.check className='size-2.5 stroke-[3]' />}
            </div>
          </div>
          <span className='text-sm font-bold text-foreground'>Bukan Tenaga Medis</span>
          <span className='text-xs text-muted-foreground mt-1 leading-normal'>
            Bertugas pada pendaftaran, kasir, logistik, administrasi, atau manajemen klinik.
          </span>
        </button>
      </div>
    </div>
  );
}
