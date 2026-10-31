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
import { useBookingRegularPatientForm } from '../../model/useBookingRegularPatientForm';

export interface BookingRegularPatientFormProps {
  onSuccess: (newPatient: PatientAffiliationProfile) => void;
  onCancel: () => void;
  allowedRelationships?: { value: string; label: string; description?: string }[];
  targetFlow?: string;
  onRelationshipSubmit?: (relationship: PatientRelationshipType) => void;
  hasExistingSelf?: boolean;
  initialRelationship?: PatientRelationshipType | string;
}

export function BookingRegularPatientForm({
  onSuccess,
  onCancel,
  allowedRelationships,
  targetFlow,
  onRelationshipSubmit,
  hasExistingSelf = false,
  initialRelationship
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
    initialRelationship
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
        label: 'Alamat',
        value: region.line1 || '-',
        valueClass: 'font-semibold text-foreground truncate max-w-[160px] sm:max-w-[210px]'
      },
      {
        step: 9,
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
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40'
                        : 'border-border/80 bg-card text-foreground hover:border-primary/40 hover:bg-muted/15'
                    )}
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div
                        className={cn(
                          'size-6 rounded-lg flex items-center justify-center',
                          isSelected
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {opt.value === 'self' ? (
                          <Icons.user className='size-3.5' />
                        ) : opt.value === 'spouse' ? (
                          <Icons.heart className='size-3.5' />
                        ) : (
                          <Icons.user className='size-3.5' />
                        )}
                      </div>
                      {isSelected && (
                        <div className='size-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center'>
                          <Icons.check className='size-2 stroke-[3]' />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className='font-bold text-xs'>{opt.label}</div>
                      {opt.description && (
                        <div className='text-[10px] text-muted-foreground mt-0.5 line-clamp-1 leading-tight font-normal'>
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <PatientLineInput
            id='patient-name'
            label='Nama lengkap'
            placeholder='contoh: Siti Aminah / Ahmad Dahlan'
            value={fullName}
            onChange={(val) => setFullName(val)}
            autoComplete='name'
          />
        )}

        {currentStep === 3 && (
          <PatientLineInput
            id='patient-nik'
            label='NIK KTP (16 digit angka)'
            placeholder='3271012345670001'
            value={nik}
            onChange={(val) => {
              const numericOnly = val.replace(/\D/g, '').slice(0, 16);
              setNik(numericOnly);
            }}
            maxLength={16}
            inputMode='numeric'
            isMonospace
            autoComplete='off'
          />
        )}

        {currentStep === 4 && (
          <PatientLineInput
            id='patient-mother-name'
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
          <PatientRegionDropdown
            values={region}
            onChange={(updates) => setRegion((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {currentStep === 9 && (
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

        {currentStep === 10 && (
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
          className='flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer select-none'
        >
          <Icons.arrowLeft className='size-3.5' />
          <span>
            {isEditingFromReview ? 'Ke ringkasan' : currentStep === 1 ? 'Batal' : 'Kembali'}
          </span>
        </button>

        <button
          type='button'
          disabled={!isCurrentStepValid || isSubmitting}
          onClick={handleNext}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer select-none',
            isCurrentStepValid && !isSubmitting
              ? 'bg-primary text-primary-foreground shadow-xs hover:opacity-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
          )}
        >
          {isSubmitting ? (
            <>
              <Icons.spinner className='size-3.5 animate-spin' />
              <span>Menyimpan...</span>
            </>
          ) : isReviewStep ? (
            <>
              <span>Simpan profil pasien</span>
              <Icons.check className='size-3.5' />
            </>
          ) : isEditingFromReview ? (
            <>
              <span>Simpan & kembali</span>
              <Icons.check className='size-3.5' />
            </>
          ) : (
            <>
              <span>Lanjut</span>
              <Icons.arrowRight className='size-3.5' />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
