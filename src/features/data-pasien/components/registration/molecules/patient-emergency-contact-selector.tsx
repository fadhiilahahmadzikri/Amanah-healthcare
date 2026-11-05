'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientLineInput } from '../atoms/patient-line-input';
import { PatientRelationshipSelector } from './patient-relationship-selector';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';

export interface PatientEmergencyContactSelectorProps {
  affiliations?: PatientAffiliationProfile[];
  name: string;
  onChangeName: (val: string) => void;
  relationship: string;
  onChangeRelationship: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  selectedAffiliationPatientId?: string;
  onSelectAffiliationPatientId?: (patientId: string) => void;
  relationshipOptions?: ReferenceOptionItem[];
  currentPatientIdToExclude?: string;
  excludeSelfOrPrimary?: boolean;
  className?: string;
}

export function PatientEmergencyContactSelector({
  affiliations = [],
  name,
  onChangeName,
  relationship,
  onChangeRelationship,
  phone,
  onChangePhone,
  selectedAffiliationPatientId,
  onSelectAffiliationPatientId,
  relationshipOptions,
  currentPatientIdToExclude,
  excludeSelfOrPrimary = false,
  className
}: PatientEmergencyContactSelectorProps) {
  // Filter out the current patient being registered so they cannot be their own emergency contact
  const availableAffiliations = React.useMemo(() => {
    return affiliations.filter((aff) => {
      if (currentPatientIdToExclude && aff.id === currentPatientIdToExclude) {
        return false;
      }
      if (excludeSelfOrPrimary && (aff.isPrimary || aff.isSystem)) {
        return false;
      }
      return Boolean(aff.fullName);
    });
  }, [affiliations, currentPatientIdToExclude, excludeSelfOrPrimary]);

  const hasAffiliations = availableAffiliations.length > 0;

  // Determine mode: 'select_existing' or 'manual'
  const [mode, setMode] = React.useState<'select_existing' | 'manual'>(() => {
    if (selectedAffiliationPatientId) return 'select_existing';
    if (hasAffiliations) return 'select_existing';
    return 'manual';
  });

  const handleSelectAffiliation = (aff: PatientAffiliationProfile) => {
    onChangeName(aff.fullName || '');
    onChangePhone(aff.phone || aff.phoneNumber || '');
    const relVal = aff.relationshipLabel || aff.relationship || 'Keluarga';
    onChangeRelationship(relVal);
    onSelectAffiliationPatientId?.(aff.id);
  };

  const handleSwitchToManual = () => {
    setMode('manual');
    onSelectAffiliationPatientId?.('');
  };

  const handleSwitchToExisting = () => {
    setMode('select_existing');
    if (availableAffiliations.length > 0) {
      handleSelectAffiliation(availableAffiliations[0]);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mode switcher if affiliations exist */}
      {hasAffiliations && (
        <div className='flex items-center gap-2 p-1 bg-muted/30 border border-border/60 rounded-xl'>
          <button
            type='button'
            onClick={handleSwitchToExisting}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all',
              mode === 'select_existing'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icons.users className='w-3.5 h-3.5 text-primary shrink-0' />
            <span>Pilih dari Keluarga ({availableAffiliations.length})</span>
          </button>
          <button
            type='button'
            onClick={handleSwitchToManual}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all',
              mode === 'manual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icons.userPlus className='w-3.5 h-3.5 text-primary shrink-0' />
            <span>Input Kontak Baru</span>
          </button>
        </div>
      )}

      {/* Mode 1: Select from existing affiliations */}
      {hasAffiliations && mode === 'select_existing' && (
        <div className='space-y-2.5'>
          <p className='text-xs text-muted-foreground'>
            Pilih anggota keluarga atau kerabat yang dapat dihubungi saat darurat:
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1'>
            {availableAffiliations.map((aff) => {
              const isSelected =
                selectedAffiliationPatientId === aff.id ||
                (name &&
                  aff.fullName &&
                  name.trim().toLowerCase() === aff.fullName.trim().toLowerCase());

              return (
                <button
                  key={aff.id}
                  type='button'
                  onClick={() => handleSelectAffiliation(aff)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/60 bg-card hover:border-border hover:bg-muted/30'
                  )}
                >
                  <div className='flex flex-col min-w-0 pr-2'>
                    <span className='text-xs font-bold text-foreground truncate'>
                      {aff.fullName}
                    </span>
                    <span className='text-[11px] text-muted-foreground font-normal truncate mt-0.5'>
                      {aff.relationshipLabel || aff.relationship || 'Keluarga'}
                    </span>
                  </div>
                  {isSelected && (
                    <span className='flex items-center gap-1 text-[11px] font-bold text-primary shrink-0'>
                      <Icons.check className='w-3.5 h-3.5 stroke-[2.5]' />
                      Dipilih
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* If the chosen affiliate is missing a phone number, prompt for phone */}
          {name && !phone && (
            <div className='mt-2'>
              <PatientLineInput
                id='patient-emergency-phone'
                label='No. Telepon / WhatsApp Kontak Darurat'
                type='tel'
                placeholder='contoh: 0812-9876-5432'
                value={phone}
                onChange={(val) => {
                  const numericOnly = val.replace(/[^\d+-\s]/g, '');
                  onChangePhone(numericOnly);
                }}
                maxLength={16}
                autoComplete='tel'
              />
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual entry with database-driven relationship selector */}
      {(mode === 'manual' || !hasAffiliations) && (
        <div className='space-y-3.5'>
          <PatientLineInput
            id='patient-emergency-name'
            label='Nama Kontak Darurat'
            placeholder='contoh: Budi Santoso / Siti Rahayu'
            value={name}
            onChange={onChangeName}
          />

          <PatientRelationshipSelector
            id='patient-emergency-relationship'
            label='Hubungan dengan Pasien'
            value={relationship}
            onChange={(val, opt) => onChangeRelationship(opt?.label || val)}
            options={relationshipOptions}
            excludeSystem={true}
          />

          <PatientLineInput
            id='patient-emergency-phone'
            label='No. Telepon Kontak Darurat'
            type='tel'
            placeholder='contoh: 0812-9876-5432'
            value={phone}
            onChange={(val) => {
              const numericOnly = val.replace(/[^\d+-\s]/g, '');
              onChangePhone(numericOnly);
            }}
            maxLength={16}
            autoComplete='tel'
          />
        </div>
      )}
    </div>
  );
}
