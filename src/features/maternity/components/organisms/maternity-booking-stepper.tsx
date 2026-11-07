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
import { PregnancyHistoryTable } from '../molecules/pregnancy-history-table';
import { ContraceptiveHistoryTable } from '../molecules/contraceptive-history-table';
import { MaternalConditionChecklist } from '../molecules/maternal-condition-checklist';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import {
  TETANUS_STATUS_OPTIONS,
} from '../../constants/maternity.constants';
import type {
  CreateMaternityIntakePayload,
  MaternalHusbandProfile,
  MaternalPreviousPregnancy,
  MaternalContraceptiveHistory,
  MaternalConditionResponse
} from '../../types/maternity.types';

export interface MaternityBookingStepperProps {
  initialValues?: Partial<CreateMaternityIntakePayload>;
  patientId: string;
  appointmentId?: string | null;
  onComplete: (payload: CreateMaternityIntakePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function MaternityBookingStepper({
  initialValues,
  patientId,
  appointmentId,
  onComplete,
  onCancel,
  isSubmitting = false
}: MaternityBookingStepperProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const references = usePatientFormReferences();
  const bloodTypeOptions = React.useMemo(
    () => references.bloodTypes.map((b) => b.label || b.value),
    [references.bloodTypes]
  );
  const occupationOptions = React.useMemo(
    () => references.occupations.map((o) => o.name),
    [references.occupations]
  );
  const educationOptions = React.useMemo(
    () => references.educationLevels.map((e) => e.label || e.value),
    [references.educationLevels]
  );
  const religionOptions = React.useMemo(
    () => references.religions.map((r) => r.label || r.value),
    [references.religions]
  );
  const tetanusOptions = TETANUS_STATUS_OPTIONS;

  // Step 1: Identitas Ibu
  const [motherName, setMotherName] = React.useState(initialValues?.motherName || '');
  const [motherNik, setMotherNik] = React.useState(initialValues?.motherNik || '');
  const [motherBirthDate, setMotherBirthDate] = React.useState(
    initialValues?.motherBirthDate || ''
  );
  const [phoneNumber, setPhoneNumber] = React.useState(initialValues?.phoneNumber || '');
  const [religion, setReligion] = React.useState(initialValues?.religion || 'Islam');
  const [motherEducation, setMotherEducation] = React.useState(
    initialValues?.motherEducation || 'SMA/SMK'
  );
  const [motherJob, setMotherJob] = React.useState(
    initialValues?.motherJob || 'Ibu Rumah Tangga'
  );
  const [marriageOrder, setMarriageOrder] = React.useState(
    String(initialValues?.marriageOrder || 1)
  );
  const [marriageDate, setMarriageDate] = React.useState(
    initialValues?.marriageDate || ''
  );
  const [dasawisma, setDasawisma] = React.useState(initialValues?.dasawisma || '');
  const [posyandu, setPosyandu] = React.useState(initialValues?.posyandu || '');
  const [puskesmas, setPuskesmas] = React.useState(initialValues?.puskesmas || '');

  // Step 2: Domisili Tempat Tinggal
  const [region, setRegion] = React.useState<PatientRegionValues>({
    provinceCode: (initialValues as any)?.provinceCode || '',
    provinceName: (initialValues as any)?.provinceName || '',
    regencyCode: (initialValues as any)?.regencyCode || '',
    regencyName: (initialValues as any)?.regencyName || '',
    districtCode: (initialValues as any)?.districtCode || '',
    districtName: (initialValues as any)?.districtName || '',
    villageCode: (initialValues as any)?.villageCode || '',
    villageName: (initialValues as any)?.villageName || '',
    line1: (initialValues as any)?.line1 || initialValues?.domicileAddress || ''
  });

  // Step 3: Identitas Suami
  const [partnerName, setPartnerName] = React.useState(
    initialValues?.husband?.fullName || initialValues?.partnerName || ''
  );
  const [partnerNik, setPartnerNik] = React.useState(
    initialValues?.husband?.nik || initialValues?.partnerNik || ''
  );
  const [identityCardAddress, setIdentityCardAddress] = React.useState(
    initialValues?.identityCardAddress || ''
  );
  const [partnerBirthDate, setPartnerBirthDate] = React.useState(
    initialValues?.husband?.birthDate || initialValues?.partnerBirthDate || ''
  );
  const [partnerJob, setPartnerJob] = React.useState(
    initialValues?.husband?.job || initialValues?.partnerJob || ''
  );
  const [partnerEducation, setPartnerEducation] = React.useState(
    initialValues?.husband?.education || initialValues?.partnerEducation || ''
  );
  const [partnerBloodType, setPartnerBloodType] = React.useState(
    initialValues?.husband?.bloodType || initialValues?.partnerBloodType || ''
  );
  const [partnerPhone, setPartnerPhone] = React.useState(
    initialValues?.husband?.phoneNumber || ''
  );

  // Step 3: Baseline Fisik & Kehamilan Ini
  const [hpht, setHpht] = React.useState(initialValues?.hpht || '');
  const [currentComplaints, setCurrentComplaints] = React.useState(
    initialValues?.currentComplaints || ''
  );
  const [heightCm, setHeightCm] = React.useState(
    initialValues?.heightCm ? String(initialValues.heightCm) : ''
  );
  const [prePregnancyWeightKg, setPrePregnancyWeightKg] = React.useState(
    initialValues?.prePregnancyWeightKg ? String(initialValues.prePregnancyWeightKg) : ''
  );
  const [upperArmCircumferenceCm, setUpperArmCircumferenceCm] = React.useState(
    initialValues?.upperArmCircumferenceCm
      ? String(initialValues.upperArmCircumferenceCm)
      : ''
  );
  const [tetanusStatus, setTetanusStatus] = React.useState(
    initialValues?.tetanusStatus || 'T2'
  );
  const [motherBloodType, setMotherBloodType] = React.useState(
    initialValues?.motherBloodType || 'Tidak Tahu'
  );

  // Step 4: Riwayat Obstetri & KB
  const [gravidaCount, setGravidaCount] = React.useState(
    String(initialValues?.gravidaCount ?? 1)
  );
  const [parityCount, setParityCount] = React.useState(
    String(initialValues?.parityCount ?? 0)
  );
  const [abortionCount, setAbortionCount] = React.useState(
    String(initialValues?.abortionCount ?? 0)
  );
  const [livingChildrenCount, setLivingChildrenCount] = React.useState(
    String(initialValues?.livingChildrenCount ?? 0)
  );
  const [previousPregnancies, setPreviousPregnancies] = React.useState<
    MaternalPreviousPregnancy[]
  >(initialValues?.previousPregnancies || []);
  const [contraceptiveHistories, setContraceptiveHistories] = React.useState<
    MaternalContraceptiveHistory[]
  >(initialValues?.contraceptiveHistories || []);

  // Step 5: Skrining Penyakit & Pola Hidup
  const [healthConditions, setHealthConditions] = React.useState<
    MaternalConditionResponse[]
  >(initialValues?.healthConditions || []);
  const [smokedBeforePregnancy, setSmokedBeforePregnancy] = React.useState(
    initialValues?.smokedBeforePregnancy || 'Tidak'
  );
  const [alcoholBeforePregnancy, setAlcoholBeforePregnancy] = React.useState(
    Boolean(initialValues?.alcoholBeforePregnancy)
  );
  const [irregularDietBeforePregnancy, setIrregularDietBeforePregnancy] = React.useState(
    Boolean(initialValues?.irregularDietBeforePregnancy)
  );
  const [reducedPhysicalActivityBeforePregnancy, setReducedPhysicalActivityBeforePregnancy] =
    React.useState(Boolean(initialValues?.reducedPhysicalActivityBeforePregnancy));
  const [unprescribedMedicationBeforePregnancy, setUnprescribedMedicationBeforePregnancy] =
    React.useState(Boolean(initialValues?.unprescribedMedicationBeforePregnancy));
  const [concerningCosmeticUseBeforePregnancy, setConcerningCosmeticUseBeforePregnancy] =
    React.useState(Boolean(initialValues?.concerningCosmeticUseBeforePregnancy));
  const [pesticideExposureBeforePregnancy, setPesticideExposureBeforePregnancy] =
    React.useState(Boolean(initialValues?.pesticideExposureBeforePregnancy));
  const [chemicalExposureBeforePregnancy, setChemicalExposureBeforePregnancy] =
    React.useState(Boolean(initialValues?.chemicalExposureBeforePregnancy));
  const [smokeExposureBeforePregnancy, setSmokeExposureBeforePregnancy] = React.useState(
    Boolean(initialValues?.smokeExposureBeforePregnancy)
  );
  const [allergyInfo, setAllergyInfo] = React.useState(initialValues?.allergyInfo || '');
  const [otherNotes, setOtherNotes] = React.useState(initialValues?.otherNotes || '');

  // Validation Errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!motherName.trim()) errs.motherName = 'Nama ibu wajib diisi';
    if (!motherNik.trim()) errs.motherNik = 'NIK ibu wajib diisi';
    else if (!/^\d{16}$/.test(motherNik.trim())) errs.motherNik = 'NIK harus 16 digit angka';
    if (!motherBirthDate) errs.motherBirthDate = 'Tanggal lahir ibu wajib diisi';
    if (!phoneNumber.trim()) errs.phoneNumber = 'Nomor WhatsApp / HP wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!partnerName.trim()) errs.partnerName = 'Nama suami wajib diisi';
    if (partnerNik.trim() && !/^\d{16}$/.test(partnerNik.trim())) {
      errs.partnerNik = 'NIK suami harus 16 digit angka';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!hpht) {
      errs.hpht = 'HPHT (Hari Pertama Haid Terakhir) wajib diisi';
    } else {
      const hDate = new Date(hpht);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (hDate > today) {
        errs.hpht = 'Tanggal HPHT tidak boleh di masa depan';
      } else if (motherBirthDate) {
        const bDate = new Date(motherBirthDate);
        if (hDate <= bDate) {
          errs.hpht = 'Tanggal HPHT tidak boleh lebih awal dari tanggal lahir pasien';
        }
      }
    }
    if (!currentComplaints.trim()) errs.currentComplaints = 'Keluhan saat ini wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      if (validateStep4()) setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(6);
    } else if (currentStep === 6) {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = () => {
    if (!validateStep1() || !validateStep3() || !validateStep4()) {
      return;
    }

    const resolvedDomicileAddress = (() => {
      const parts = [
        region.line1,
        region.villageName ? `Kel. ${region.villageName}` : '',
        region.districtName ? `Kec. ${region.districtName}` : '',
        region.regencyName,
        region.provinceName ? `Prov. ${region.provinceName}` : ''
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : '';
    })();

    const husbandProfile: MaternalHusbandProfile = {
      fullName: partnerName.trim(),
      nik: partnerNik.trim() || null,
      birthDate: partnerBirthDate || null,
      job: partnerJob || null,
      education: partnerEducation || null,
      bloodType: partnerBloodType || null,
      phoneNumber: partnerPhone.trim() || null
    };

    const payload: CreateMaternityIntakePayload = {
      patientId,
      appointmentId: appointmentId || undefined,
      motherName: motherName.trim(),
      motherNik: motherNik.trim(),
      motherBirthDate: motherBirthDate || undefined,
      phoneNumber: phoneNumber.trim(),
      religion,
      motherEducation,
      motherJob,
      domicileAddress: resolvedDomicileAddress || undefined,
      line1: region.line1 || undefined,
      villageName: region.villageName || undefined,
      villageCode: region.villageCode || undefined,
      districtName: region.districtName || undefined,
      districtCode: region.districtCode || undefined,
      regencyName: region.regencyName || undefined,
      regencyCode: region.regencyCode || undefined,
      provinceName: region.provinceName || undefined,
      provinceCode: region.provinceCode || undefined,
      identityCardAddress: identityCardAddress.trim() || undefined,
      marriageOrder: Number(marriageOrder) || 1,
      marriageDate: marriageDate || undefined,
      dasawisma: dasawisma.trim() || undefined,
      posyandu: posyandu.trim() || undefined,
      puskesmas: puskesmas.trim() || undefined,

      partnerName: partnerName.trim(),
      partnerNik: partnerNik.trim() || undefined,
      partnerBirthDate: partnerBirthDate || undefined,
      partnerJob: partnerJob || undefined,
      partnerEducation: partnerEducation || undefined,
      partnerBloodType: partnerBloodType || undefined,
      husband: husbandProfile,

      heightCm: heightCm ? Number(heightCm) : undefined,
      prePregnancyWeightKg: prePregnancyWeightKg ? Number(prePregnancyWeightKg) : undefined,
      upperArmCircumferenceCm: upperArmCircumferenceCm
        ? Number(upperArmCircumferenceCm)
        : undefined,
      tetanusStatus,
      motherBloodType,

      hpht,
      currentComplaints: currentComplaints.trim(),
      gravidaCount: Number(gravidaCount) || 1,
      parityCount: Number(parityCount) || 0,
      abortionCount: Number(abortionCount) || 0,
      livingChildrenCount: Number(livingChildrenCount) || 0,

      hasPreviousPregnancyHistory: previousPregnancies.length > 0,
      hasContraceptionHistory: contraceptiveHistories.length > 0,
      previousPregnancies,
      contraceptiveHistories,
      healthConditions,

      smokedBeforePregnancy,
      alcoholBeforePregnancy,
      irregularDietBeforePregnancy,
      reducedPhysicalActivityBeforePregnancy,
      unprescribedMedicationBeforePregnancy,
      concerningCosmeticUseBeforePregnancy,
      pesticideExposureBeforePregnancy,
      chemicalExposureBeforePregnancy,
      smokeExposureBeforePregnancy,
      allergyInfo: allergyInfo.trim() || undefined,
      otherNotes: otherNotes.trim() || undefined
    };

    onComplete(payload);
  };

  const stepsList = [
    { step: 1, label: 'Identitas Ibu' },
    { step: 2, label: 'Domisili Tempat Tinggal' },
    { step: 3, label: 'Identitas Suami' },
    { step: 4, label: 'Pemeriksaan Fisik' },
    { step: 5, label: 'Obstetri & KB' },
    { step: 6, label: 'Skrining Penyakit' }
  ];

  return (
    <div className='flex flex-col h-full space-y-4'>
      {/* Stepper Navigation Indicator */}
      <div className='flex items-center justify-between border-b border-border/60 pb-3'>
        <div className='flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5'>
          {stepsList.map(({ step, label }) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;

            return (
              <div key={step} className='flex items-center gap-1.5 shrink-0'>
                <div
                  className={cn(
                    'flex size-6 sm:size-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
                    isActive && 'bg-primary text-primary-foreground shadow-xs',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Icons.check className='size-3 sm:size-3.5' /> : step}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden md:inline-block',
                    isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
                {step < 6 && <div className='h-[1px] w-3 sm:w-4 bg-border/80 mx-0.5' />}
              </div>
            );
          })}
        </div>

        <span className='text-xs text-muted-foreground font-medium shrink-0 pl-2'>
          Langkah {currentStep} dari 6
        </span>
      </div>

      {/* Stepper Body Content */}
      <div className='flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col'>
        {/* STEP 1: IDENTITAS IBU & PERNIKAHAN */}
        {currentStep === 1 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Identitas Calon Ibu</h3>
              <p className='text-xs text-muted-foreground'>
                Data lengkap calon ibu untuk lembar rekam medis Praktik Mandiri Bidan.
              </p>
            </div>

            <div className='space-y-3.5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Nama Lengkap Ibu <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    value={motherName}
                    onChange={(e) => {
                      setMotherName(e.target.value);
                      if (errors.motherName) setErrors((p) => ({ ...p, motherName: '' }));
                    }}
                    placeholder='cth: Ny. Siti Rahmawati'
                    className={cn('h-9 text-xs', errors.motherName && 'border-rose-500')}
                  />
                  {errors.motherName && (
                    <p className='text-[11px] text-rose-500'>{errors.motherName}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    NIK Ibu (16 Digit) <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    value={motherNik}
                    maxLength={16}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setMotherNik(numeric);
                      if (errors.motherNik) setErrors((p) => ({ ...p, motherNik: '' }));
                    }}
                    placeholder='16 digit NIK...'
                    className={cn(
                      'h-9 text-xs font-mono',
                      errors.motherNik && 'border-rose-500'
                    )}
                  />
                  {errors.motherNik && (
                    <p className='text-[11px] text-rose-500'>{errors.motherNik}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Tanggal Lahir Ibu <span className='text-rose-500'>*</span>
                  </Label>
                  <CustomDatePicker
                    value={motherBirthDate}
                    onChange={(val) => {
                      setMotherBirthDate(val || '');
                      if (errors.motherBirthDate) {
                        setErrors((p) => ({ ...p, motherBirthDate: '' }));
                      }
                    }}
                    placeholder='Pilih tanggal lahir'
                    disableFutureDates
                  />
                  {errors.motherBirthDate && (
                    <p className='text-[11px] text-rose-500'>{errors.motherBirthDate}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    No. WhatsApp / HP <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    type='tel'
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) setErrors((p) => ({ ...p, phoneNumber: '' }));
                    }}
                    placeholder='08xxxxxxxxxx'
                    className={cn(
                      'h-9 text-xs font-mono',
                      errors.phoneNumber && 'border-rose-500'
                    )}
                  />
                  {errors.phoneNumber && (
                    <p className='text-[11px] text-rose-500'>{errors.phoneNumber}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Agama</Label>
                  <Select value={religion} onValueChange={setReligion}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Pendidikan Terakhir</Label>
                  <Select value={motherEducation} onValueChange={setMotherEducation}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {educationOptions.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Pekerjaan</Label>
                  <Select value={motherJob} onValueChange={setMotherJob}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {occupationOptions.map((j) => (
                        <SelectItem key={j} value={j}>
                          {j}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Pernikahan Ke-</Label>
                  <Input
                    type='number'
                    min={1}
                    value={marriageOrder}
                    onChange={(e) => setMarriageOrder(e.target.value)}
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Tanggal Pernikahan</Label>
                  <CustomDatePicker
                    value={marriageDate}
                    onChange={(val) => setMarriageDate(val || '')}
                    placeholder='Pilih tanggal nikah'
                    disableFutureDates
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Dasawisma</Label>
                  <Input
                    value={dasawisma}
                    onChange={(e) => setDasawisma(e.target.value)}
                    placeholder='cth: Mawar 02'
                    className='h-9 text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Posyandu</Label>
                  <Input
                    value={posyandu}
                    onChange={(e) => setPosyandu(e.target.value)}
                    placeholder='cth: Posyandu Melati'
                    className='h-9 text-xs'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Puskesmas Pembina</Label>
                  <Input
                    value={puskesmas}
                    onChange={(e) => setPuskesmas(e.target.value)}
                    placeholder='cth: Puskesmas Godean'
                    className='h-9 text-xs'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DOMISILI TEMPAT TINGGAL */}
        {currentStep === 2 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                Domisili Tempat Tinggal
              </h3>
              <p className='text-xs text-muted-foreground'>
                Pilih wilayah administratif dan alamat detail tempat tinggal calon ibu saat ini.
              </p>
            </div>

            <div className='space-y-3.5'>
              <PatientRegionDropdown
                values={region}
                onChange={(updates) => setRegion((prev) => ({ ...prev, ...updates }))}
              />
            </div>
          </div>
        )}

        {/* STEP 3: IDENTITAS SUAMI */}
        {currentStep === 3 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                Identitas Suami / Penanggung Jawab
              </h3>
              <p className='text-xs text-muted-foreground'>
                Data suami pasien untuk kelengkapan administrasi dan persetujuan tindakan medis.
              </p>
            </div>

            <div className='space-y-3.5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Nama Lengkap Suami <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    value={partnerName}
                    onChange={(e) => {
                      setPartnerName(e.target.value);
                      if (errors.partnerName) setErrors((p) => ({ ...p, partnerName: '' }));
                    }}
                    placeholder='cth: Tn. Budi Santoso'
                    className={cn('h-9 text-xs', errors.partnerName && 'border-rose-500')}
                  />
                  {errors.partnerName && (
                    <p className='text-[11px] text-rose-500'>{errors.partnerName}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>NIK Suami (16 Digit)</Label>
                  <Input
                    value={partnerNik}
                    maxLength={16}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setPartnerNik(numeric);
                      if (errors.partnerNik) setErrors((p) => ({ ...p, partnerNik: '' }));
                    }}
                    placeholder='16 digit NIK suami...'
                    className={cn(
                      'h-9 text-xs font-mono',
                      errors.partnerNik && 'border-rose-500'
                    )}
                  />
                  {errors.partnerNik && (
                    <p className='text-[11px] text-rose-500'>{errors.partnerNik}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Tanggal Lahir Suami</Label>
                  <CustomDatePicker
                    value={partnerBirthDate}
                    onChange={(val) => setPartnerBirthDate(val || '')}
                    placeholder='Pilih tanggal lahir'
                    disableFutureDates
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Pendidikan Suami</Label>
                  <Select value={partnerEducation} onValueChange={setPartnerEducation}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {educationOptions.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Golongan Darah Suami</Label>
                  <Select value={partnerBloodType} onValueChange={setPartnerBloodType}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypeOptions.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Pekerjaan Suami</Label>
                  <Select value={partnerJob} onValueChange={setPartnerJob}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {occupationOptions.map((j) => (
                        <SelectItem key={j} value={j}>
                          {j}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Nomor HP / WhatsApp Suami</Label>
                  <Input
                    type='tel'
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder='08xxxxxxxxxx'
                    className='h-9 text-xs font-mono'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Alamat KTP Suami / Keluarga</Label>
                <Textarea
                  value={identityCardAddress}
                  onChange={(e) => setIdentityCardAddress(e.target.value)}
                  placeholder='Alamat sesuai KTP (jika berbeda dari domisili)...'
                  className='min-h-[60px] text-xs resize-none'
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BASELINE FISIK & KEHAMILAN INI */}
        {currentStep === 4 && (
          <div className='space-y-4 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                Pemeriksaan Fisik & Kehamilan Ini
              </h3>
              <p className='text-xs text-muted-foreground'>
                Tanggal HPHT dan tanda-tanda antropometri awal ibu hamil.
              </p>
            </div>

            <div className='space-y-3.5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    HPHT (Hari Pertama Haid Terakhir) <span className='text-rose-500'>*</span>
                  </Label>
                  <CustomDatePicker
                    value={hpht}
                    onChange={(val) => {
                      setHpht(val || '');
                      if (errors.hpht) setErrors((p) => ({ ...p, hpht: '' }));
                    }}
                    placeholder='Pilih tanggal HPHT'
                    disableFutureDates
                  />
                  {errors.hpht && <p className='text-[11px] text-rose-500'>{errors.hpht}</p>}
                  <span className='text-[11px] text-muted-foreground block'>
                    HPL dan Usia Kehamilan dihitung otomatis oleh sistem backend.
                  </span>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>
                    Keluhan Utama Saat Ini <span className='text-rose-500'>*</span>
                  </Label>
                  <Textarea
                    value={currentComplaints}
                    onChange={(e) => {
                      setCurrentComplaints(e.target.value);
                      if (errors.currentComplaints) {
                        setErrors((p) => ({ ...p, currentComplaints: '' }));
                      }
                    }}
                    placeholder='cth: Mual muntah di pagi hari, pusing ringan...'
                    className={cn(
                      'min-h-[70px] text-xs resize-none',
                      errors.currentComplaints && 'border-rose-500'
                    )}
                  />
                  {errors.currentComplaints && (
                    <p className='text-[11px] text-rose-500'>{errors.currentComplaints}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Tinggi Badan</Label>
                  <div className='relative flex items-center'>
                    <Input
                      type='number'
                      step='0.1'
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder='158'
                      className='h-9 text-xs pr-9'
                    />
                    <span className='absolute right-3 text-xs font-medium text-muted-foreground pointer-events-none select-none'>
                      cm
                    </span>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>BB Sebelum Hamil</Label>
                  <div className='relative flex items-center'>
                    <Input
                      type='number'
                      step='0.1'
                      value={prePregnancyWeightKg}
                      onChange={(e) => setPrePregnancyWeightKg(e.target.value)}
                      placeholder='52'
                      className='h-9 text-xs pr-9'
                    />
                    <span className='absolute right-3 text-xs font-medium text-muted-foreground pointer-events-none select-none'>
                      kg
                    </span>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Lingkar Lengan Atas (LiLA)</Label>
                  <div className='relative flex items-center'>
                    <Input
                      type='number'
                      step='0.1'
                      value={upperArmCircumferenceCm}
                      onChange={(e) => setUpperArmCircumferenceCm(e.target.value)}
                      placeholder='24.5'
                      className='h-9 text-xs pr-9'
                    />
                    <span className='absolute right-3 text-xs font-medium text-muted-foreground pointer-events-none select-none'>
                      cm
                    </span>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Status Imunisasi TT</Label>
                  <Select value={tetanusStatus} onValueChange={setTetanusStatus}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tetanusOptions.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Golongan Darah Ibu</Label>
                  <Select value={motherBloodType} onValueChange={setMotherBloodType}>
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypeOptions.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: RIWAYAT OBSTETRI & KB */}
        {currentStep === 5 && (
          <div className='flex-1 min-h-0 flex flex-col space-y-5 animate-in fade-in-50 duration-200'>
            <div className='shrink-0'>
              <h3 className='text-sm font-semibold text-foreground'>
                Riwayat Obstetri & Penggunaan Kontrasepsi
              </h3>
              <p className='text-xs text-muted-foreground'>
                Riwayat kehamilan, persalinan sebelumnya (GPAh), serta pemakaian alat kontrasepsi (KB).
              </p>
            </div>

            {/* GPAh Box */}
            <div className='rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 shrink-0'>
              <span className='text-xs font-semibold text-foreground block'>
                Status Obstetri (G - P - A - H)
              </span>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-medium text-muted-foreground'>
                    Gravida (Hamil Ke-)
                  </Label>
                  <Input
                    type='number'
                    min={1}
                    value={gravidaCount}
                    onChange={(e) => setGravidaCount(e.target.value)}
                    className='h-8 text-xs font-semibold text-center'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-medium text-muted-foreground'>
                    Partus (Melahirkan)
                  </Label>
                  <Input
                    type='number'
                    min={0}
                    value={parityCount}
                    onChange={(e) => setParityCount(e.target.value)}
                    className='h-8 text-xs text-center'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-medium text-muted-foreground'>
                    Abortus (Keguguran)
                  </Label>
                  <Input
                    type='number'
                    min={0}
                    value={abortionCount}
                    onChange={(e) => setAbortionCount(e.target.value)}
                    className='h-8 text-xs text-center'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-medium text-muted-foreground'>
                    Anak Hidup
                  </Label>
                  <Input
                    type='number'
                    min={0}
                    value={livingChildrenCount}
                    onChange={(e) => setLivingChildrenCount(e.target.value)}
                    className='h-8 text-xs text-center'
                  />
                </div>
              </div>
            </div>

            {/* Riwayat Kehamilan Lalu Table */}
            <div className='space-y-2 border-t border-border/40 pt-3 flex-1 min-h-0 flex flex-col'>
              <PregnancyHistoryTable
                items={previousPregnancies}
                isEditing={true}
                onChange={setPreviousPregnancies}
              />
            </div>

            {/* Riwayat KB Table */}
            <div className='space-y-2 border-t border-border/40 pt-3 flex-1 min-h-0 flex flex-col'>
              <ContraceptiveHistoryTable
                items={contraceptiveHistories}
                isEditing={true}
                onChange={setContraceptiveHistories}
              />
            </div>
          </div>
        )}

        {/* STEP 6: SKRINING PENYAKIT & POLA HIDUP */}
        {currentStep === 6 && (
          <div className='space-y-5 animate-in fade-in-50 duration-200'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                Skrining 14 Penyakit & Pola Hidup
              </h3>
              <p className='text-xs text-muted-foreground'>
                Deteksi dini risiko tinggi kehamilan sesuai standar Praktik Mandiri Bidan.
              </p>
            </div>

            {/* 14 Penyakit Checklist */}
            <div className='space-y-2'>
              <MaternalConditionChecklist
                conditions={healthConditions}
                isEditing={true}
                onChange={setHealthConditions}
              />
            </div>

            {/* Pola Hidup & Lingkungan */}
            <div className='rounded-xl border border-border/70 bg-card p-4 space-y-3.5'>
              <span className='text-xs font-semibold text-foreground block border-b border-border/40 pb-1.5'>
                Gaya Hidup & Paparan Sebelum/Selama Kehamilan
              </span>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Riwayat Merokok</Label>
                  <Select
                    value={smokedBeforePregnancy}
                    onValueChange={setSmokedBeforePregnancy}
                  >
                    <SelectTrigger className='h-9 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Tidak'>Tidak Pernah Merokok</SelectItem>
                      <SelectItem value='Pasif'>Perokok Pasif</SelectItem>
                      <SelectItem value='Aktif'>Aktif Merokok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Riwayat Alergi (Obat/Makanan)</Label>
                  <Input
                    value={allergyInfo}
                    onChange={(e) => setAllergyInfo(e.target.value)}
                    placeholder='cth: Alergi amoksisilin, alergi udang'
                    className='h-9 text-xs'
                  />
                </div>
              </div>

              <div className='space-y-2 pt-1'>
                <span className='text-[11px] font-medium text-muted-foreground block'>
                  Centang bila mengalami hal berikut sekitar 1 bulan sebelum hamil:
                </span>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={irregularDietBeforePregnancy}
                      onChange={(e) => setIrregularDietBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Pola makan tidak teratur / tinggi gula & lemak</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={reducedPhysicalActivityBeforePregnancy}
                      onChange={(e) => setReducedPhysicalActivityBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Aktivitas fisik jauh berkurang</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={unprescribedMedicationBeforePregnancy}
                      onChange={(e) => setUnprescribedMedicationBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Konsumsi obat tertentu tanpa arahan dokter/bidan</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={concerningCosmeticUseBeforePregnancy}
                      onChange={(e) => setConcerningCosmeticUseBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Penggunaan kosmetik / perawatan yang dikhawatirkan</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={alcoholBeforePregnancy}
                      onChange={(e) => setAlcoholBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Konsumsi minuman beralkohol</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={smokeExposureBeforePregnancy}
                      onChange={(e) => setSmokeExposureBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Sering terpapar asap rokok (Perokok Pasif)</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={pesticideExposureBeforePregnancy}
                      onChange={(e) => setPesticideExposureBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Terpapar pestisida / obat tanaman</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={chemicalExposureBeforePregnancy}
                      onChange={(e) => setChemicalExposureBeforePregnancy(e.target.checked)}
                      className='rounded border-border text-primary size-4'
                    />
                    <span>Terpapar bahan kimia kerja / industri</span>
                  </label>
                </div>
              </div>

              <div className='space-y-1.5 pt-1'>
                <Label className='text-xs font-medium'>Catatan Khusus Bidan / Dokter</Label>
                <Textarea
                  value={otherNotes}
                  onChange={(e) => setOtherNotes(e.target.value)}
                  placeholder='Catatan tambahan yang perlu diperhatikan...'
                  className='min-h-[50px] text-xs resize-none'
                />
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
          className='h-8 text-xs cursor-pointer'
        >
          {currentStep === 1 ? 'Batal' : 'Sebelumnya'}
        </Button>

        <Button
          type='button'
          size='sm'
          onClick={handleNext}
          disabled={isSubmitting}
          className='h-8 text-xs font-semibold px-4 cursor-pointer'
        >
          {isSubmitting ? (
            <div className='flex items-center gap-2'>
              <Icons.spinner className='size-3.5 animate-spin' />
              <span>Menyimpan...</span>
            </div>
          ) : currentStep === 6 ? (
            'Selesai & Lanjutkan ke Reservasi'
          ) : (
            'Lanjut'
          )}
        </Button>
      </div>
    </div>
  );
}
