'use client';

import * as React from 'react';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';
import { PatientCardMaster } from './atoms/patient-card-master';
import { NewPatientTriggerCard } from './atoms/new-patient-trigger-card';

export interface BookingPatientSelectionStepProps {
  patients: PatientAffiliationProfile[];
  selectedPatientId: string | null;
  onSelectPatient: (patient: PatientAffiliationProfile) => void;
  onAddNewPatient: () => void;
  onEditPatient?: (patient: PatientAffiliationProfile) => void;
  onContinue?: () => void;
}

export function BookingPatientSelectionStep({
  patients,
  selectedPatientId,
  onSelectPatient,
  onAddNewPatient,
  onEditPatient,
  onContinue: _onContinue
}: BookingPatientSelectionStepProps) {
  const patientList = patients;

  return (
    <div className='space-y-4 font-sans select-none'>
      <div>
        <h4 className='text-sm sm:text-base font-bold text-foreground'>
          Pilih pasien yang berobat
        </h4>
        <p className='text-xs text-muted-foreground'>
          Gunakan data profil yang sudah ada atau daftarkan profil baru
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1'>
        {patientList.map((patient) => (
          <PatientCardMaster
            key={patient.id}
            patient={patient}
            isSelected={selectedPatientId === patient.id}
            onSelect={onSelectPatient}
            onEdit={onEditPatient}
          />
        ))}

        <NewPatientTriggerCard onClick={onAddNewPatient} />
      </div>
    </div>
  );
}
