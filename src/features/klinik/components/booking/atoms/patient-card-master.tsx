'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';

export interface PatientCardMasterProps {
  patient: PatientAffiliationProfile;
  isSelected?: boolean;
  onSelect?: (patient: PatientAffiliationProfile) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PatientCardMaster({
  patient,
  isSelected = false,
  onSelect,
  className,
  children
}: PatientCardMasterProps) {
  const isSelf = patient.relationship === 'self';
  const relationshipLabel =
    patient.relationshipLabel || (isSelf ? 'Diri Sendiri' : patient.relationship);

  return (
    <button
      type='button'
      onClick={() => onSelect?.(patient)}
      className={cn(
        'group relative w-full p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none text-left min-h-[72px]',
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs'
          : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10',
        className
      )}
    >
      <div className='min-w-0 flex-1 flex flex-col justify-center'>
        <div className='flex items-center gap-2'>
          <h5 className='text-sm font-bold text-foreground truncate'>{patient.fullName}</h5>
          {isSelected && (
            <div className='size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0'>
              <Icons.check className='size-2.5 stroke-[3]' />
            </div>
          )}
        </div>
        {children}
      </div>

      <div className='shrink-0'>
        <Badge
          variant='secondary'
          className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0',
            isSelf
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-muted text-muted-foreground border-border/40'
          )}
        >
          {relationshipLabel}
        </Badge>
      </div>
    </button>
  );
}
