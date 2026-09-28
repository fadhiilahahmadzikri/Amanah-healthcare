'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingPatientSelectionStepProps {
  affiliations?: PatientAffiliationProfile[];
  patients?: PatientAffiliationProfile[];
  selectedPatientId: string | null;
  onSelectPatient: (patient: PatientAffiliationProfile) => void;
  onAddNewPatient: () => void;
  onContinue?: () => void;
}

export function BookingPatientSelectionStep({
  affiliations,
  patients,
  selectedPatientId,
  onSelectPatient,
  onAddNewPatient,
  onContinue: _onContinue
}: BookingPatientSelectionStepProps) {
  const patientList = affiliations ?? patients ?? [];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-foreground'>
            Pilih Pasien yang Berobat
          </h4>
          <p className='text-xs text-muted-foreground'>
            Gunakan data profil yang sudah ada atau daftarkan profil baru
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          shape='pill'
          onClick={onAddNewPatient}
          className='text-xs font-semibold'
        >
          <Icons.add className='mr-1.5 size-3.5' />+ Pasien Baru
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1'>
        {patientList.map((patient) => {
          const isSelected = selectedPatientId === patient.id;
          const genderText =
            patient.gender === 'L' || patient.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';

          return (
            <button
              type='button'
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={cn(
                'group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none text-left w-full',
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs'
                  : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10'
              )}
            >
              <div className='flex items-start justify-between gap-2 mb-2'>
                <div className='min-w-0 flex-1'>
                  <h5 className='text-sm font-bold text-foreground truncate'>{patient.fullName}</h5>
                  <span className='text-[11px] text-muted-foreground font-mono'>
                    NIK: {patient.nik || '-'}
                  </span>
                </div>

                <Badge
                  variant='secondary'
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0',
                    patient.relationship === 'self'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {patient.relationshipLabel || patient.relationship}
                </Badge>
              </div>

              <div className='flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground'>
                <span>{genderText}</span>
                {patient.bloodType && (
                  <>
                    <span>•</span>
                    <span className='font-bold text-foreground'>Gol. {patient.bloodType}</span>
                  </>
                )}
                {patient.occupationName && (
                  <>
                    <span>•</span>
                    <span className='truncate'>{patient.occupationName}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}

        {/* Add New Card */}
        <button
          type='button'
          onClick={onAddNewPatient}
          className='p-4 rounded-2xl border border-dashed border-border hover:border-primary/60 bg-muted/10 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[110px] text-center gap-1.5 select-none w-full'
        >
          <div className='size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
            <Icons.add className='size-4' />
          </div>
          <span className='text-xs font-bold text-foreground'>Daftarkan Pasien Baru</span>
          <span className='text-[11px] text-muted-foreground'>
            Formulir identitas pre-service on-demand
          </span>
        </button>
      </div>
    </div>
  );
}
