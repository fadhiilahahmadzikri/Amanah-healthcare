'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientLineInput } from '../atoms/patient-line-input';
import { PatientRelationshipSelector } from './patient-relationship-selector';
import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';

export interface PatientEmergencyChoiceStepProps {
  onChooseYes: () => void;
  onSkip: () => void;
  className?: string;
}

/**
 * Slide 1 (Choice): "Punya kontak darurat?"
 * Zero duplicate headers - relies on parent wizard step header.
 * Zero misleading checkmarks - uses navigational chevron-right.
 * Directly triggers slide advancement to detail or skip to address.
 */
export function PatientEmergencyChoiceStep({
  onChooseYes,
  onSkip,
  className
}: PatientEmergencyChoiceStepProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 select-none font-sans', className)}>
      <button
        type='button'
        onClick={onChooseYes}
        className={cn(
          'group flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer bg-card shadow-xs',
          'border-border/70 hover:border-primary hover:bg-primary/5 active:scale-[0.99] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary'
        )}
      >
        <div className='flex items-center justify-between w-full mb-1.5'>
          <span className='text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
            Ya, Punya Kontak Darurat
          </span>
          <Icons.chevronRight className='size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0' />
        </div>
        <span className='text-[11px] sm:text-xs text-muted-foreground leading-relaxed'>
          Pilih dari kerabat terdaftar atau masukkan nama dan nomor kontak baru
        </span>
      </button>

      <button
        type='button'
        onClick={onSkip}
        className={cn(
          'group flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer bg-card shadow-xs',
          'border-border/70 hover:border-primary hover:bg-primary/5 active:scale-[0.99] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary'
        )}
      >
        <div className='flex items-center justify-between w-full mb-1.5'>
          <span className='text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
            Tidak Punya / Lewati
          </span>
          <Icons.chevronRight className='size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0' />
        </div>
        <span className='text-[11px] sm:text-xs text-muted-foreground leading-relaxed'>
          Lanjut ke langkah berikutnya tanpa mengisi kontak darurat
        </span>
      </button>
    </div>
  );
}

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

/**
 * Slide 2 (Detail): "Data kontak darurat"
 * Zero duplicate headers - relies on parent wizard step header.
 * Zero internal back buttons - parent wizard footer back button handles "Kembali".
 */
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

  // Mode: 'existing' (Pilih dari Keluarga) or 'manual' (Input Baru)
  const [mode, setMode] = React.useState<'existing' | 'manual'>(() => {
    if (selectedAffiliationPatientId && hasAffiliations) return 'existing';
    if (!name && !phone && hasAffiliations) return 'existing';
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
    setMode('existing');
  };

  return (
    <div className={cn('space-y-3.5 select-none font-sans', className)}>
      {/* Mode switcher if affiliations exist */}
      {hasAffiliations && (
        <div className='flex items-center gap-1.5 p-1 bg-muted/30 border border-border/60 rounded-xl'>
          <button
            type='button'
            onClick={handleSwitchToExisting}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'existing'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icons.users className='size-3.5 text-primary shrink-0' />
            <span>Pilih dari Keluarga ({availableAffiliations.length})</span>
          </button>
          <button
            type='button'
            onClick={handleSwitchToManual}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'manual'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icons.userPlus className='size-3.5 text-primary shrink-0' />
            <span>Input Kontak Baru</span>
          </button>
        </div>
      )}

      {/* Mode 1: Select from existing family affiliations */}
      {hasAffiliations && mode === 'existing' ? (
        <div className='space-y-3 animate-in fade-in duration-200'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1'>
            {availableAffiliations.map((aff) => {
              const isSelected =
                selectedAffiliationPatientId === aff.id ||
                Boolean(name &&
                  aff.fullName &&
                  name.trim().toLowerCase() === aff.fullName.trim().toLowerCase());

              return (
                <button
                  key={aff.id}
                  type='button'
                  onClick={() => handleSelectAffiliation(aff)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-xs'
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
                      <Icons.check className='size-3.5 stroke-[2.5]' />
                      <span>Dipilih</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Prompt for phone if selected relative lacks phone number */}
          {name && !phone && (
            <div className='mt-2 pt-2 border-t border-border/50'>
              <PatientLineInput
                id='patient-emergency-phone'
                label='No. Telepon / WhatsApp Kerabat'
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
      ) : (
        /* Mode 2: Manual input form */
        <div className='space-y-3 animate-in fade-in duration-200'>
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
