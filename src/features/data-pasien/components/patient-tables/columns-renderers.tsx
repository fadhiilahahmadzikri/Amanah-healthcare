'use client';

import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { Patient } from '../../api/types';
import { getInitials, getRelationshipStatusKey, getRelationshipLabel } from './columns-helpers';

export function PatientNameCell({ row }: { row: Row<Patient> }) {
  const patient = row.original;

  return (
    <div className='flex items-center gap-2.5 min-w-[200px]'>
      {/* Avatar */}
      <Avatar className='h-8 w-8 rounded-lg shrink-0 border border-border/40 transition-all'>
        <AvatarFallback className='rounded-lg text-xs font-bold bg-primary/10 text-primary'>
          {getInitials(patient.name)}
        </AvatarFallback>
      </Avatar>

      {/* Patient Name */}
      <span className='font-semibold leading-tight text-sm text-foreground truncate'>
        {patient.name}
      </span>
    </div>
  );
}

export function PatientProfileTypeCell({ row }: { row: Row<Patient> }) {
  const patient = row.original;
  const isMaster = patient.is_master ?? (!patient.master_patient_id && !patient.relationship_type);

  if (!isMaster) {
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
