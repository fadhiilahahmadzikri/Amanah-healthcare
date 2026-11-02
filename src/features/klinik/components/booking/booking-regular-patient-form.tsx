'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType,
  PatientBloodType
} from '@/features/data-pasien/api/patient-affiliation-service';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import { getGenderLabel } from '@/constants/gender.constants';
import { formatBloodTypeDisplay } from '@/constants/blood-type.constants';
import { PatientBloodTypeSelector } from '@/features/data-pasien/components/registration/molecules/patient-blood-type-selector';
import { PatientRegionDropdown } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { PatientSearchableSelect } from '@/features/data-pasien/components/registration/molecules/patient-searchable-select';
import { PatientEmergencyContactSelector } from '@/features/data-pasien/components/registration/molecules/patient-emergency-contact-selector';
import { getRelationshipIcon } from '@/features/data-pasien/model/relationship-icon.helper';
import { useBookingRegularPatientForm } from '../../model/useBookingRegularPatientForm';

export interface BookingRegularPatientFormProps {
  onSuccess: (newPatient: PatientAffiliationProfile) => void;
  onCancel: () => void;
  allowedRelationships?: {
    value: string;
    label: string;
    description?: string;
    isSystem?: boolean;
  }[];
  targetFlow?: string;
  onRelationshipSubmit?: (relationship: PatientRelationshipType) => void;
  hasExistingSelf?: boolean;
  initialRelationship?: PatientRelationshipType | string;
  existingPatients?: PatientAffiliationProfile[];
}

export function BookingRegularPatientForm({
  onSuccess,
  onCancel,
  allowedRelationships,
  targetFlow,
  onRelationshipSubmit,
  hasExistingSelf = false,
  initialRelationship,
  existingPatients = []
}: BookingRegularPatientFormProps) {
  const {
    currentStep,
    isReviewStep,
    currentStepMeta,
    stepContainerRef,
    isSubmitting,
    errorMessage,
    isCurrentStepValid,

    fullName,
    setFullName,
    nik,
    setNik,
    phone,
    setPhone,
    email,
    emergencyContactName,
    setEmergencyContactName,
    emergencyContactPhone,
    setEmergencyContactPhone,
    emergencyContactRelationship,
    setEmergencyContactRelationship,
    emergencyContactPatientId,
    setEmergencyContactPatientId,
    motherName,
    setMotherName,
    placeOfBirth,
    setPlaceOfBirth,
    dateOfBirth,
    setDateOfBirth,
    gender,
    setGender,
    bloodType,
    setBloodType,
    region,
    setRegion,
    relationship,
    handleSelectRelationship,
    occupationCode,
    setOccupationCode,

    references,
    relationshipOptions,

    handleBack,
    handleNext,
    handleJumpToStep,
    isEditingFromReview
  } = useBookingRegularPatientForm({
    onSuccess,
    onCancel,
    targetFlow,
    onRelationshipSubmit,
    allowedRelationships,
    hasExistingSelf,
    initialRelationship,
    existingPatients
  });

  const activeRelationshipLabel = React.useMemo(() => {
    const found = relationshipOptions.find((r) => r.value === relationship);
    return found ? found.label : relationship;
  }, [relationshipOptions, relationship]);

  const activeOccupationName = React.useMemo(() => {
    const found = references.occupations.find((o) => o.code === occupationCode);
    return found ? found.name : '';
  }, [references.occupations, occupationCode]);

  const reviewItems = React.useMemo(
    () => [
      {
        step: 1,
        label: 'Hubungan dengan akun',
        value: activeRelationshipLabel,
        valueClass: 'font-bold text-primary'
      },
      {
        step: 2,
        label: 'Nama lengkap',
        value: fullName || '-',
        valueClass: 'font-bold text-foreground'
      },
      {
        step: 3,
        label: 'NIK',
        value: nik || '-',
        valueClass: 'font-mono font-bold text-primary'
      },
      {
        step: 4,
        label: 'Nama ibu kandung',
        value: motherName || '-',
        valueClass: 'font-semibold text-foreground'
      },
      {
        step: 5,
        label: 'Tempat lahir',
        value: placeOfBirth || '-',
        valueClass: 'font-semibold text-foreground'
      },
      {
        step: 5,
        label: 'Tanggal lahir',
        value: dateOfBirth || '-',
        valueClass: 'font-semibold text-foreground'
      },
      {
        step: 6,
        label: 'Jenis kelamin',
        value: gender ? getGenderLabel(gender) : '-',
        valueClass: 'font-semibold text-foreground'
      },
      {
        step: 7,
        label: 'Golongan darah',
        value: formatBloodTypeDisplay(bloodType),
        valueClass: 'font-semibold text-foreground'
      },
      {
        step: 8,
        label: 'No. Telepon / WhatsApp',
        value: phone || '-',
        valueClass: 'font-mono font-bold text-primary'
      },
      {
        step: 12,
        label: 'Email Akun (Tersinkron)',
        value: email || '-',
        valueClass: 'font-semibold text-foreground truncate max-w-[160px] sm:max-w-[210px]'
      },
      {
        step: 9,
        label: 'Kontak Darurat',
        value: emergencyContactPhone
          ? `${emergencyContactName || 'Kerabat'}${emergencyContactRelationship ? ` (${emergencyContactRelationship})` : ''} - ${emergencyContactPhone}`
          : '-',
        valueClass: 'font-semibold text-foreground truncate max-w-[160px] sm:max-w-[210px]'
      },
      {
        step: 10,
        label: 'Alamat',
        value: region.line1 || '-',
        valueClass: 'font-semibold text-foreground truncate max-w-[160px] sm:max-w-[210px]'
      },
      {
        step: 11,
        label: 'Pekerjaan',
        value: activeOccupationName || '-',
        valueClass:
          'font-semibold text-foreground break-words max-w-[160px] sm:max-w-[210px] leading-snug whitespace-normal'
      }
    ],
    [
      activeRelationshipLabel,
      fullName,
      nik,
      phone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      motherName,
      placeOfBirth,
      dateOfBirth,
      gender,
      bloodType,
      region.line1,
      activeOccupationName
    ]
  );

  return (
    <div className='flex flex-col space-y-2.5 font-sans select-none'>
      <div className='space-y-0.5'>
        <h3 className='text-sm sm:text-base font-bold tracking-tight text-foreground'>
          {currentStepMeta.title}
        </h3>
        <p className='text-[11px] sm:text-xs text-muted-foreground leading-normal'>
          {currentStepMeta.description}
        </p>
      </div>

      {errorMessage && (
        <div className='p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs'>
          {errorMessage}
        </div>
      )}

      <div ref={stepContainerRef} className='py-1 flex flex-col justify-start'>
        {currentStep === 1 && (
          <div className='space-y-1.5'>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              {relationshipOptions.map((opt) => {
                const isSelected = relationship === opt.value;
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => handleSelectRelationship(opt.value as typeof relationship)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer select-none flex flex-col justify-between gap-2',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-border/60 hover:border-border hover:bg-muted/40 text-foreground'
                    )}
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center gap-2'>
                        <span className='text-base select-none leading-none'>
                          {getRelationshipIcon(
                            (opt as any).icon || opt.value,
                            (opt as any).isSystem
                          )}
                        </span>
                        <span className='font-bold'>{opt.label}</span>
                      </div>
                      {isSelected && <Icons.check className='w-3.5 h-3.5 text-primary shrink-0' />}
                    </div>
                    {opt.description && (
                      <span className='text-[10px] text-muted-foreground font-normal line-clamp-2 leading-tight'>
                        {opt.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <PatientLineInput
            id='patient-fullname'
            label='Nama lengkap pasien (sesuai KTP)'
            placeholder='contoh: Siti Aminah / Ahmad Dahlan'
            value={fullName}
            onChange={(val) => setFullName(val)}
            autoComplete='name'
          />
        )}

        {currentStep === 3 && (
          <PatientLineInput
            id='patient-nik'
            label='Nomor Induk Kependudukan (NIK)'
            placeholder='16 digit NIK sesuai KTP atau KK'
            value={nik}
            onChange={(val) => {
              const numericOnly = val.replace(/\D/g, '');
              setNik(numericOnly);
            }}
            maxLength={16}
            autoComplete='off'
          />
        )}

        {currentStep === 4 && (
          <PatientLineInput
            id='patient-mother'
            label='Nama ibu kandung'
            placeholder='contoh: Maryam / Nurjanah'
            value={motherName}
            onChange={(val) => setMotherName(val)}
            autoComplete='off'
          />
        )}

        {currentStep === 5 && (
          <div className='space-y-3'>
            <PatientLineInput
              id='patient-pob'
              label='Tempat lahir (sesuai KTP)'
              placeholder='contoh: Sleman / Yogyakarta'
              value={placeOfBirth}
              onChange={(val) => setPlaceOfBirth(val)}
              autoComplete='off'
            />
            <PatientBirthdatePicker
              value={dateOfBirth}
              label='Tanggal lahir (sesuai KTP)*'
              placeholder='Pilih tanggal lahir sesuai KTP / KK...'
              onChange={(iso) => setDateOfBirth(iso)}
            />
          </div>
        )}

        {currentStep === 6 && (
          <div className='space-y-2'>
            <PatientGenderSelector
              value={gender}
              options={references.genders}
              onChange={(val) => setGender(val)}
            />
          </div>
        )}

        {currentStep === 7 && (
          <div className='pt-2'>
            <PatientBloodTypeSelector
              id='booking_blood_type'
              label='Golongan Darah'
              required
              placeholder='Pilih golongan darah...'
              value={bloodType}
              onChange={(val) => setBloodType(val as PatientBloodType)}
              options={references.bloodTypes}
            />
          </div>
        )}

        {currentStep === 8 && (
          <PatientLineInput
            id='patient-phone'
            label='No. Telepon / WhatsApp'
            type='tel'
            placeholder='contoh: 0812-3456-7890'
            value={phone}
            onChange={(val) => {
              const numericOnly = val.replace(/[^\d+-\s]/g, '');
              setPhone(numericOnly);
            }}
            maxLength={16}
            autoComplete='tel'
          />
        )}

        {currentStep === 9 && (
          <PatientEmergencyContactSelector
            affiliations={existingPatients}
            name={emergencyContactName}
            onChangeName={setEmergencyContactName}
            relationship={emergencyContactRelationship}
            onChangeRelationship={setEmergencyContactRelationship}
            phone={emergencyContactPhone}
            onChangePhone={setEmergencyContactPhone}
            selectedAffiliationPatientId={emergencyContactPatientId}
            onSelectAffiliationPatientId={setEmergencyContactPatientId}
            relationshipOptions={references.relationships}
          />
        )}

        {currentStep === 10 && (
          <PatientRegionDropdown
            values={region}
            onChange={(updates) => setRegion((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {currentStep === 11 && (
          <div className='space-y-1.5'>
            <PatientSearchableSelect
              id='patient-occupation'
              label='Pekerjaan pasien'
              value={activeOccupationName}
              placeholder='Pilih pekerjaan pasien...'
              options={references.occupations.map((occ) => ({
                id: occ.code,
                name: occ.name,
                description: occ.description
              }))}
              isLoading={references.isLoading}
              onSelect={(item) => setOccupationCode(item.id)}
              searchPlaceholder='Cari pekerjaan...'
              required
            />
          </div>
        )}

        {currentStep === 12 && (
          <div className='space-y-0.5 text-xs border border-border/80 rounded-2xl p-2 bg-muted/20'>
            {reviewItems.map((item, idx) => (
              <div
                key={item.label}
                role='button'
                tabIndex={0}
                onClick={() => handleJumpToStep(item.step)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleJumpToStep(item.step);
                  }
                }}
                className={cn(
                  'group/item relative flex items-start justify-between py-2 px-2.5 rounded-xl transition-colors cursor-pointer select-none border border-transparent',
                  'hover:bg-card hover:border-border/60 hover:shadow-xs active:scale-[0.995]',
                  idx < reviewItems.length - 1 && 'border-b-border/40'
                )}
              >
                <span className='text-muted-foreground text-[11px] sm:text-xs shrink-0 group-hover/item:text-foreground transition-colors pt-0.5'>
                  {item.label}
                </span>

                <div className='flex items-start gap-2 shrink-0 ml-auto pl-2'>
                  <div className='flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0 opacity-0 sm:group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none pt-0.5'>
                    <Icons.arrowRight className='size-3 stroke-[2.5]' />
                    <span className='text-[10.5px] whitespace-nowrap'>Edit data ini</span>
                  </div>

                  <span
                    className={cn(
                      'text-xs text-right max-w-[160px] sm:max-w-[210px] break-words leading-snug',
                      item.valueClass
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='flex items-center justify-between pt-2'>
        <button
          type='button'
          onClick={handleBack}
          className='px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
        >
          {isEditingFromReview ? 'Batal' : currentStep === 1 ? 'Tutup' : 'Kembali'}
        </button>

        <button
          type='button'
          onClick={handleNext}
          disabled={!isCurrentStepValid || isSubmitting}
          className={cn(
            'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
            isCurrentStepValid && !isSubmitting
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
          )}
        >
          {isSubmitting ? (
            <>
              <Icons.spinner className='w-3.5 h-3.5 animate-spin' />
              <span>Menyimpan...</span>
            </>
          ) : isReviewStep ? (
            <>
              <Icons.check className='w-3.5 h-3.5' />
              <span>Simpan Profil</span>
            </>
          ) : isEditingFromReview ? (
            <span>Selesai Edit</span>
          ) : (
            <>
              <span>Lanjut</span>
              <Icons.chevronRight className='w-3.5 h-3.5' />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
