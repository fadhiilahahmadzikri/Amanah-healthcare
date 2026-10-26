'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getRelationshipLabel } from '@/constants/relationship.constants';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';

export interface PatientCardMasterProps {
  patient: PatientAffiliationProfile;
  isSelected?: boolean;
  onSelect?: (patient: PatientAffiliationProfile) => void;
  onEdit?: (patient: PatientAffiliationProfile) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PatientCardMaster({
  patient,
  isSelected = false,
  onSelect,
  onEdit,
  className,
  children
}: PatientCardMasterProps) {
  const isSelf = patient.relationship === 'self';
  const relationshipLabel = getRelationshipLabel(patient.relationship, patient.relationshipLabel);
  const isInactive = patient.status === 'inactive';

  return (
    <div
      role='button'
      tabIndex={isInactive ? -1 : 0}
      aria-disabled={isInactive}
      onClick={() => {
        if (!isInactive) {
          onSelect?.(patient);
        }
      }}
      onKeyDown={(e) => {
        if (!isInactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect?.(patient);
        }
      }}
      className={cn(
        'group relative w-full p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none text-left min-h-[72px]',
        isInactive
          ? 'opacity-50 cursor-not-allowed bg-muted/30 border-border/40 pointer-events-none'
          : isSelected
            ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs cursor-pointer'
            : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10 cursor-pointer',
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

      <div className='shrink-0 flex items-center gap-1.5'>
        {onEdit && !isInactive && (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onEdit(patient);
            }}
            className='size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition shrink-0'
            title='Edit data pasien'
            aria-label={`Edit data ${patient.fullName}`}
          >
            <Icons.edit className='size-3.5' />
          </button>
        )}
        {isInactive && (
          <Badge
            variant='outline'
            className='text-[10px] font-semibold px-2 py-0.5 rounded-md border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0'
          >
            Nonaktif
          </Badge>
        )}
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
    </div>
  );
}
