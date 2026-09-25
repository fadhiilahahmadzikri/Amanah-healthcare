'use client';

import React from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface BookedPatientOuterCardProps {
  patient: BookedPatientItem;
  onSelect: (patient: BookedPatientItem) => void;
  className?: string;
}

/**
 * Molecule: Minimalist Patient Card in 5-Column Grid
 * Strictly displays only:
 * 1. Queue Number & Time Slot
 * 2. Patient Name
 * 3. Chief Complaint ("Sakit apa")
 * 4. Room Name ("Ruangan apa")
 * 5. Status Badge
 * (Demographics like Age, NIK, and Full Address are kept for the Detail Sub-Modal)
 */
export function BookedPatientOuterCard({
  patient,
  onSelect,
  className
}: BookedPatientOuterCardProps) {
  const isCancelled =
    patient.status === 'cancelled' || patient.status === 'BATAL' || patient.status === 'no_doctor';
  const isInService = patient.status === 'in_service' || patient.status === 'SEDANG_DILAYANI';

  const complaintText = patient.chiefComplaint?.trim()
    ? patient.chiefComplaint
    : 'Pemeriksaan rutin / Belum ada catatan keluhan';

  return (
    <div
      onClick={() => onSelect(patient)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(patient);
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between p-3.5 rounded-2xl border text-left font-sans transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'bg-card text-card-foreground border-border/70 hover:border-primary/60 hover:shadow-sm',
        isCancelled && 'opacity-65 bg-muted/20 border-dashed border-border/60',
        isInService && 'border-primary/50 bg-primary/5 shadow-2xs',
        className
      )}
    >
      {/* 1. Header: Queue Number + Time Slot & Status Badge */}
      <div className='flex items-start justify-between gap-1.5 pb-2 border-b border-border/40'>
        <div className='flex flex-col min-w-0'>
          <span className='font-mono font-bold text-xs sm:text-[12.5px] text-foreground tracking-tight'>
            {patient.queueNumber}
          </span>
          <span className='text-[10px] font-mono font-medium text-muted-foreground/80 truncate mt-0.5'>
            {patient.timeSlot}
          </span>
        </div>

        <StatusBadge
          status={patient.status}
          size='sm'
          variant='pill'
          className='shrink-0 text-[10px]'
        />
      </div>

      {/* 2. Body: Patient Name & Chief Complaint */}
      <div className='py-2.5 flex-1 flex flex-col justify-between min-h-[72px]'>
        <div>
          <h4
            title={patient.patient.fullName}
            className='font-bold text-xs sm:text-[13px] text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors'
          >
            {patient.patient.fullName}
          </h4>

          {/* Chief Complaint ("Sakit apa") */}
          <div className='mt-1.5 flex items-start gap-1.5'>
            <Icons.stethoscope className='size-3 text-muted-foreground/80 shrink-0 mt-0.5' />
            <p
              title={complaintText}
              className='text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-normal'
            >
              {complaintText}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Footer: Room Name & Detail Action Hint */}
      <div className='pt-2 border-t border-border/40 flex items-center justify-between gap-1.5 text-[10.5px] text-muted-foreground'>
        <div className='flex items-center gap-1 min-w-0'>
          <Icons.location className='size-3 shrink-0 text-muted-foreground/80' />
          <span className='truncate font-medium' title={patient.clinicRoomName}>
            {patient.clinicRoomName}
          </span>
        </div>

        <span className='text-[10px] font-semibold text-primary/80 group-hover:text-primary transition-colors shrink-0'>
          Detail &rarr;
        </span>
      </div>
    </div>
  );
}
