'use client';

import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { Patient } from '../../api/types';
import {
  getInitials,
  getRelationshipStatusKey,
  getRelationshipLabel,
} from './columns-helpers';

export function PatientNameCell({ row }: { row: Row<Patient> }) {
  const patient = row.original;
  const isSubRow = row.depth > 0;
  const canExpand = row.getCanExpand();
  const isExpanded = row.getIsExpanded();

  return (
    <div className='flex items-center gap-2.5 min-w-[200px]'>
      {/* A. Reddit Tree Branch Connector & Expansion Controls */}
      {isSubRow ? (
        <div className='flex items-center pl-1 pr-0.5 select-none shrink-0'>
          <div className='relative w-5 h-9 flex items-center justify-center'>
            <span className='absolute -top-3.5 left-2 w-[2px] h-8 bg-border/80 dark:bg-border/60' />
            <span className='absolute top-2.5 left-2 w-3 h-3.5 border-b-2 border-l-2 border-border/80 dark:border-border/60 rounded-bl-[5px]' />
          </div>
        </div>
      ) : canExpand ? (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          className={cn(
            'size-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-150 cursor-pointer shadow-xs select-none',
            isExpanded
              ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'
          )}
          title={isExpanded ? 'Tutup cabang afiliasi' : 'Buka cabang afiliasi'}
          aria-label={isExpanded ? 'Tutup afiliasi' : 'Buka afiliasi'}
        >
          {isExpanded ? (
            <Icons.minus className='size-3 stroke-[2.5]' />
          ) : (
            <Icons.plus className='size-3 stroke-[2.5]' />
          )}
        </button>
      ) : (
        <div className='size-5 shrink-0' />
      )}

      {/* B. Avatar */}
      <Avatar
        className={cn(
          'shrink-0 border border-border/40 transition-all',
          isSubRow ? 'h-7 w-7 rounded-md' : 'h-8 w-8 rounded-lg'
        )}
      >
        <AvatarFallback
          className={cn(
            'font-bold',
            isSubRow
              ? 'rounded-md text-[10px] bg-muted text-muted-foreground'
              : 'rounded-lg text-xs bg-primary/10 text-primary'
          )}
        >
          {getInitials(patient.name)}
        </AvatarFallback>
      </Avatar>

      {/* C. Clean Patient Name */}
      <span className='font-semibold leading-tight text-sm text-foreground truncate'>
        {patient.name}
      </span>
    </div>
  );
}

export function PatientProfileTypeCell({ row }: { row: Row<Patient> }) {
  const patient = row.original;
  const isSubRow = row.depth > 0;

  if (isSubRow) {
    const relStatusKey = getRelationshipStatusKey(patient.relationship_type);
    const relLabel = getRelationshipLabel(patient.relationship_type, patient.relation_label);
    return (
      <div className='flex items-center gap-1.5 flex-wrap'>
        <StatusBadge status={relStatusKey} label={relLabel} size='sm' />
        {patient.has_own_account && (
          <StatusBadge status='PUNYA_AKUN' label='Punya Akun' size='sm' />
        )}
      </div>
    );
  }

  return (
    <StatusBadge
      status='AKUN_UTAMA'
      label='Akun Utama'
      icon={<Icons.crown className='size-2.5 shrink-0 text-amber-600 dark:text-amber-400' />}
      size='sm'
    />
  );
}
