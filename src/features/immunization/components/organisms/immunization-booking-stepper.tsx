'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { GENDER_OPTIONS } from '@/constants/gender.constants';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import type { ChildSex, ImmunizationRegistrationPayload } from '../../types/immunization.types';

export interface ImmunizationBookingStepperProps {
  initialValues?: Partial<ImmunizationRegistrationPayload>;
  patientId: string;
  appointmentId?: string | null;
  onComplete: (payload: ImmunizationRegistrationPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ImmunizationBookingStepper({
  initialValues,
  patientId,
  appointmentId,
  onComplete,
  onCancel,
  isSubmitting = false
}: ImmunizationBookingStepperProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);

  // Form State
  const [childName, setChildName] = React.useState(initialValues?.childName || '');
  const [childNik, setChildNik] = React.useState(initialValues?.childNik || '');
  const [childBirthDate, setChildBirthDate] = React.useState(initialValues?.childBirthDate || '');
  const [childSex, setChildSex] = React.useState<ChildSex | ''>(initialValues?.childSex || '');
  const [parentPhone, setParentPhone] = React.useState(initialValues?.parentPhone || '');
  const [fatherName, setFatherName] = React.useState(initialValues?.fatherName || '');
  const [motherName, setMotherName] = React.useState(initialValues?.motherName || '');
  const [childAddress, setChildAddress] = React.useState(initialValues?.childAddress || '');
  const [region, setRegion] = React.useState<PatientRegionValues>({
    provinceCode: (initialValues as any)?.provinceCode || '',
    provinceName: (initialValues as any)?.provinceName || '',
    regencyCode: (initialValues as any)?.regencyCode || '',
    regencyName: (initialValues as any)?.regencyName || '',
    districtCode: (initialValues as any)?.districtCode || '',
    districtName: (initialValues as any)?.districtName || '',
    villageCode: (initialValues as any)?.villageCode || '',
    villageName: (initialValues as any)?.villageName || '',
    line1: (initialValues as any)?.line1 || initialValues?.childAddress || ''
  });
  const [previousVaccineHistory, setPreviousVaccineHistory] = React.useState(
    initialValues?.previousVaccineHistory || ''
  );
  const [childAllergyHistory, setChildAllergyHistory] = React.useState(
    initialValues?.childAllergyHistory || ''
  );

  // Errors State
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!childName.trim()) {
      newErrors.childName = 'Nama anak wajib diisi';
    }
    if (!childBirthDate) {
      newErrors.childBirthDate = 'Tanggal lahir anak wajib diisi';
    }
    if (!childSex) {
      newErrors.childSex = 'Jenis kelamin anak wajib dipilih';
    }
    if (childNik.trim() && !/^\d{16}$/.test(childNik.trim())) {
      newErrors.childNik = 'NIK harus berupa 16 digit angka jika diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!parentPhone.trim()) {
      newErrors.parentPhone = 'Nomor HP orang tua / wali wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = () => {
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    const resolvedChildAddress = [
      region.line1,
      region.villageName ? `Kel. ${region.villageName}` : '',
      region.districtName ? `Kec. ${region.districtName}` : '',
      region.regencyName,
      region.provinceName ? `Prov. ${region.provinceName}` : ''
    ]
      .filter(Boolean)
      .join(', ');

    const payload: ImmunizationRegistrationPayload = {
      patientId,
      appointmentId,
      childName: childName.trim(),
      childNik: childNik.trim() || undefined,
      childBirthDate,
      childSex: childSex as ChildSex,
      parentPhone: parentPhone.trim(),
      fatherName: fatherName.trim() || undefined,
      motherName: motherName.trim() || undefined,
      childAddress: resolvedChildAddress || undefined,
      line1: region.line1 || undefined,
      provinceCode: region.provinceCode || undefined,
      provinceName: region.provinceName || undefined,
      regencyCode: region.regencyCode || undefined,
      regencyName: region.regencyName || undefined,
      districtCode: region.districtCode || undefined,
      districtName: region.districtName || undefined,
      villageCode: region.villageCode || undefined,
      villageName: region.villageName || undefined,
      previousVaccineHistory: previousVaccineHistory.trim() || undefined,
      childAllergyHistory: childAllergyHistory.trim() || undefined
    };

    onComplete(payload);
  };

  return (
    <div className='flex flex-col h-full space-y-5'>
      {/* Stepper Header Navigation */}
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-2'>
          {[
            { step: 1, label: 'Identitas Anak' },
            { step: 2, label: 'Orang Tua & Alamat' },
            { step: 3, label: 'Riwayat' }
          ].map(({ step, label }) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;

            return (
              <div key={step} className='flex items-center gap-2'>
                <div
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
                    isActive && 'bg-primary text-primary-foreground shadow-xs',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Icons.check className='size-3.5' /> : step}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:inline-block',
                    isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
                {step < 3 && <div className='h-[1px] w-4 bg-border/80 mx-1' />}
              </div>
            );
          })}
        </div>

        <span className='text-xs text-muted-foreground font-medium'>
          Langkah {currentStep} dari 3
        </span>
      </div>

      {/* Stepper Body Content */}
      <div className='flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col'>
        {currentStep === 1 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Identitas Anak</h3>
              <p className='text-xs text-muted-foreground'>
                Lengkapi identitas calon pasien anak yang akan menerima imunisasi.
              </p>
            </div>

            <div className='space-y-3.5'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>
                  Nama Lengkap Anak <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  value={childName}
                  onChange={(e) => {
                    setChildName(e.target.value);
                    if (errors.childName) setErrors((prev) => ({ ...prev, childName: '' }));
                  }}
                  placeholder='cth: Aisyah Putri Ramadhani'
                  className={cn('h-9 text-xs', errors.childName && 'border-rose-500')}
                />
                {errors.childName && (
                  <p className='text-[11px] text-rose-500'>{errors.childName}</p>
                )}
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>NIK Anak (16 Digit)</Label>
                  <Input
                    value={childNik}
                    maxLength={16}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setChildNik(numeric);
                      if (errors.childNik) setErrors((prev) => ({ ...prev, childNik: '' }));
                    }}
                    placeholder='16 digit NIK anak'
                    className={cn('h-9 text-xs font-mono', errors.childNik && 'border-rose-500')}
                  />
                  {errors.childNik && (
                    <p className='text-[11px] text-rose-500'>{errors.childNik}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Jenis Kelamin</Label>
                  <Select value={childSex} onValueChange={(val) => setChildSex(val as ChildSex)}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>
                  Tanggal Lahir Anak <span className='text-rose-500'>*</span>
                </Label>
                <CustomDatePicker
                  value={childBirthDate}
                  onChange={(val) => {
                    setChildBirthDate(val || '');
                    if (errors.childBirthDate) {
                      setErrors((prev) => ({ ...prev, childBirthDate: '' }));
                    }
                  }}
                  placeholder='Pilih tanggal lahir anak'
                  disableFutureDates
                />
                {errors.childBirthDate && (
                  <p className='text-[11px] text-rose-500'>{errors.childBirthDate}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Data Orang Tua & Alamat</h3>
              <p className='text-xs text-muted-foreground'>
                Kontak dan domisili tempat tinggal orang tua atau wali anak.
              </p>
            </div>

            <div className='space-y-3.5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Nama Ayah</Label>
                  <Input
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder='cth: Ahmad Fauzi'
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Nama Ibu</Label>
                  <Input
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder='cth: Dewi Lestari'
                    className='h-9 text-xs'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>
                  Nomor HP Orang Tua/Wali (WhatsApp Aktif) <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  type='tel'
                  value={parentPhone}
                  onChange={(e) => {
                    setParentPhone(e.target.value);
                    if (errors.parentPhone) {
                      setErrors((prev) => ({ ...prev, parentPhone: '' }));
                    }
                  }}
                  placeholder='08xxxxxxxxxx'
                  className={cn('h-9 text-xs font-mono', errors.parentPhone && 'border-rose-500')}
                />
                {errors.parentPhone && (
                  <p className='text-[11px] text-rose-500'>{errors.parentPhone}</p>
                )}
              </div>

              <div className='space-y-2 pt-2 border-t border-border/30'>
                <Label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider block'>
                  Alamat Domisili Anak
                </Label>
                <PatientRegionDropdown
                  values={region}
                  onChange={(updates) => setRegion((prev) => ({ ...prev, ...updates }))}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Riwayat Vaksin & Alergi</h3>
              <p className='text-xs text-muted-foreground'>
                Tuliskan riwayat vaksinasi sebelumnya dan alergi obat/makanan (opsional).
              </p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Riwayat Vaksin Sebelumnya</Label>
                <Input
                  value={previousVaccineHistory}
                  onChange={(e) => setPreviousVaccineHistory(e.target.value)}
                  placeholder='cth: HB 0 sudah di RS setelah lahir'
                  className='h-9 text-xs'
                />
                <span className='text-[11px] text-muted-foreground block'>
                  Cukup tuliskan nama vaksin atau catatan singkat jika pernah imunisasi sebelumnya.
                </span>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Riwayat Alergi Anak</Label>
                <Input
                  value={childAllergyHistory}
                  onChange={(e) => setChildAllergyHistory(e.target.value)}
                  placeholder='cth: Tidak ada alergi yang diketahui / Alergi amoksisilin'
                  className='h-9 text-xs'
                />
                <span className='text-[11px] text-muted-foreground block'>
                  Tuliskan jika anak memiliki riwayat alergi obat, makanan, atau alergi lainnya.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Footer Controls */}
      <div className='flex items-center justify-between border-t border-border/60 pt-3'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={handlePrev}
          disabled={isSubmitting}
          className='h-8 text-xs'
        >
          {currentStep === 1 ? 'Batal' : 'Sebelumnya'}
        </Button>

        <Button
          type='button'
          size='sm'
          onClick={handleNext}
          disabled={isSubmitting}
          className='h-8 text-xs font-semibold px-4'
        >
          {isSubmitting ? (
            <div className='flex items-center gap-2'>
              <Icons.spinner className='size-3.5 animate-spin' />
              <span>Menyimpan...</span>
            </div>
          ) : currentStep === 3 ? (
            'Selesai & Lanjutkan'
          ) : (
            'Lanjut'
          )}
        </Button>
      </div>
    </div>
  );
}
