'use client';

import * as React from 'react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { useAuthContext } from '@/lib/rbac/auth-context';
import {
  patientAffiliationService,
  type CreatePatientAffiliationDto,
  type PatientRelationshipType,
  type PatientGender,
  type PatientBloodType,
  type PatientAffiliationProfile,
  UNKNOWN_BLOOD_TYPE
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { PatientRegistrationStep } from '@/features/data-pasien/constants/registration-options';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';

export interface UseBookingRegularPatientFormOptions {
  onSuccess: (newPatient: PatientAffiliationProfile) => void;
  onCancel: () => void;
  targetFlow?: string;
  onRelationshipSubmit?: (relationship: PatientRelationshipType) => void;
  allowedRelationships?: ReferenceOptionItem[];
  hasExistingSelf?: boolean;
  initialRelationship?: PatientRelationshipType | string;
  existingPatients?: PatientAffiliationProfile[];
}

export function useBookingRegularPatientForm({
  onSuccess,
  onCancel,
  targetFlow: _targetFlow,
  onRelationshipSubmit: _onRelationshipSubmit,
  allowedRelationships,
  hasExistingSelf = false,
  initialRelationship,
  existingPatients = []
}: UseBookingRegularPatientFormOptions) {
  const { user } = useAuthContext();
  const references = usePatientFormReferences();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isEditingFromReview, setIsEditingFromReview] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleJumpToStep = React.useCallback((stepNumber: number) => {
    setIsEditingFromReview(true);
    setCurrentStep(stepNumber);
  }, []);

  const relationshipOptions = React.useMemo(() => {
    let opts =
      allowedRelationships && allowedRelationships.length > 0
        ? allowedRelationships
        : references.relationships;
    if (hasExistingSelf) {
      opts = opts.filter((o) => !(o as any).isSystem);
    }
    return opts;
  }, [allowedRelationships, references.relationships, hasExistingSelf]);

  const initialRelationshipValue: PatientRelationshipType = React.useMemo(() => {
    if (initialRelationship && relationshipOptions.some((r) => r.value === initialRelationship)) {
      return initialRelationship as PatientRelationshipType;
    }
    if (relationshipOptions.length > 0) {
      if (!hasExistingSelf) {
        const systemOpt = relationshipOptions.find((r) => (r as any).isSystem);
        if (systemOpt) return systemOpt.value as PatientRelationshipType;
      }
      return relationshipOptions[0].value as PatientRelationshipType;
    }
    return '' as PatientRelationshipType;
  }, [initialRelationship, relationshipOptions, hasExistingSelf]);

  const [relationship, setRelationship] =
    React.useState<PatientRelationshipType>(initialRelationshipValue);

  const selectedRelOption = React.useMemo(() => {
    return relationshipOptions.find((r) => r.value === relationship) || null;
  }, [relationshipOptions, relationship]);

  const isSelf = React.useMemo(() => {
    return Boolean((selectedRelOption as any)?.isSystem);
  }, [selectedRelOption]);

  React.useEffect(() => {
    if (relationshipOptions.length > 0) {
      const exists = relationshipOptions.some((r) => r.value === relationship);
      if (!exists) {
        setRelationship(relationshipOptions[0].value as PatientRelationshipType);
      } else if (hasExistingSelf && isSelf) {
        setRelationship(relationshipOptions[0].value as PatientRelationshipType);
      }
    }
  }, [relationshipOptions, hasExistingSelf, isSelf, relationship]);

  const [fullName, setFullName] = React.useState(() => (isSelf && user?.name ? user.name : ''));
  const [nik, setNik] = React.useState('');
  const [phone, setPhone] = React.useState(() => (isSelf && user?.phone ? user.phone : ''));
  const [email, setEmail] = React.useState(() => user?.email || '');
  const [emergencyContactName, setEmergencyContactName] = React.useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = React.useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = React.useState('');
  const [emergencyContactPatientId, setEmergencyContactPatientId] = React.useState<string>('');
  const [motherName, setMotherName] = React.useState('');
  const [placeOfBirth, setPlaceOfBirth] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [gender, setGender] = React.useState<PatientGender | ''>('');
  const [bloodType, setBloodType] = React.useState<PatientBloodType | ''>('');
  const [knowsBloodType, setKnowsBloodType] = React.useState<boolean | null>(null);
  const [region, setRegion] = React.useState<PatientRegionValues>({
    provinceName: '',
    provinceCode: '',
    regencyName: '',
    regencyCode: '',
    districtName: '',
    districtCode: '',
    villageName: '',
    villageCode: '',
    line1: ''
  });
  const [occupationCode, setOccupationCode] = React.useState('');

  // Auto-fill user identity when switching to Self
  React.useEffect(() => {
    if (isSelf) {
      if (user?.email && !email) setEmail(user.email);
      if (user?.name && !fullName) setFullName(user.name);
      if (user?.phone && !phone) setPhone(user.phone);
    }
  }, [isSelf, user, email, fullName, phone]);

  // DevTool AutoFill listener for standard patient registration
  React.useEffect(() => {
    const handleAutofill = (e: Event) => {
      const d = (
        e as CustomEvent<{
          flow: string;
          values: Record<string, string>;
          step?: number;
        }>
      ).detail;
      if (!d || d.flow !== 'regular-patient') return;

      React.startTransition(() => {
        const v = d.values;
        if (!v) return;

        if (v.relationship !== undefined && v.relationship !== '') {
          setRelationship(v.relationship as PatientRelationshipType);
        } else if (v.relationship === '') {
          setRelationship(initialRelationshipValue);
        }

        if (v.fullName !== undefined) setFullName(v.fullName);
        if (v.nik !== undefined) setNik(v.nik);
        if (v.motherName !== undefined) setMotherName(v.motherName);
        if (v.placeOfBirth !== undefined) setPlaceOfBirth(v.placeOfBirth);
        if (v.dateOfBirth !== undefined) setDateOfBirth(v.dateOfBirth);
        if (v.gender !== undefined) setGender(v.gender as PatientGender);
        if (v.bloodType !== undefined) {
          setBloodType(v.bloodType as PatientBloodType);
          setKnowsBloodType(v.bloodType !== '' && v.bloodType !== UNKNOWN_BLOOD_TYPE);
        }
        if (v.phone !== undefined) setPhone(v.phone);
        if (v.emergencyContactName !== undefined) setEmergencyContactName(v.emergencyContactName);
        if (v.emergencyContactPhone !== undefined) setEmergencyContactPhone(v.emergencyContactPhone);
        if (v.emergencyContactRelationship !== undefined) {
          setEmergencyContactRelationship(v.emergencyContactRelationship);
        }

        if (
          v.line1 !== undefined ||
          v.provinceName !== undefined ||
          v.regencyName !== undefined ||
          v.districtName !== undefined ||
          v.villageName !== undefined
        ) {
          setRegion((prev) => ({
            ...prev,
            ...(v.line1 !== undefined ? { line1: v.line1 } : {}),
            ...(v.provinceName !== undefined ? { provinceName: v.provinceName } : {}),
            ...(v.provinceCode !== undefined ? { provinceCode: v.provinceCode } : {}),
            ...(v.regencyName !== undefined ? { regencyName: v.regencyName } : {}),
            ...(v.regencyCode !== undefined ? { regencyCode: v.regencyCode } : {}),
            ...(v.districtName !== undefined ? { districtName: v.districtName } : {}),
            ...(v.districtCode !== undefined ? { districtCode: v.districtCode } : {}),
            ...(v.villageName !== undefined ? { villageName: v.villageName } : {}),
            ...(v.villageCode !== undefined ? { villageCode: v.villageCode } : {})
          }));
        }

        if (v.occupationCode !== undefined) setOccupationCode(v.occupationCode);

        if (typeof d.step === 'number') {
          setCurrentStep(d.step);
        }
      });
    };

    window.addEventListener('devtool:autofill', handleAutofill);
    return () => window.removeEventListener('devtool:autofill', handleAutofill);
  }, [initialRelationshipValue]);

  const stepContainerRef = React.useRef<HTMLDivElement>(null);
  const isAnimatingRef = React.useRef(false);

  const handleSelectRelationship = React.useCallback((newRel: PatientRelationshipType) => {
    setRelationship(newRel);
  }, []);

  const handleSelectTahu = React.useCallback(() => {
    setKnowsBloodType(true);
    setBloodType('');
  }, []);

  const handleSelectBelumTahu = React.useCallback(() => {
    setKnowsBloodType(false);
    setBloodType(UNKNOWN_BLOOD_TYPE);
    setTimeout(() => {
      if (isEditingFromReview) {
        setIsEditingFromReview(false);
        setCurrentStep(12);
      } else {
        setCurrentStep(8);
      }
    }, 120);
  }, [isEditingFromReview]);

  React.useEffect(() => {
    if (!stepContainerRef.current) return;
    gsap.fromTo(
      stepContainerRef.current,
      { y: 14, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.26,
        ease: 'power3.inOut',
        onComplete: () => {
          isAnimatingRef.current = false;
        }
      }
    );
  }, [currentStep, knowsBloodType]);

  const isCurrentStepValid = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return Boolean(relationship);
      case 2:
        return fullName.trim().length >= 3;
      case 3:
        return nik.length === 16 && /^\d+$/.test(nik);
      case 4:
        return motherName.trim().length >= 3;
      case 5:
        return placeOfBirth.trim().length >= 2 && Boolean(dateOfBirth);
      case 6:
        return Boolean(gender);
      case 7:
        return Boolean(bloodType && bloodType.trim().length > 0);
      case 8: {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 15;
      }
      case 9: {
        const cleanEmergencyPhone = emergencyContactPhone.replace(/\D/g, '');
        if (
          !emergencyContactName.trim() &&
          !cleanEmergencyPhone &&
          !emergencyContactRelationship.trim()
        ) {
          return true;
        }
        return cleanEmergencyPhone.length >= 8 && cleanEmergencyPhone.length <= 15;
      }
      case 10:
        return Boolean(region.line1.trim());
      case 11:
        return Boolean(occupationCode);
      case 12:
        return true;
      default:
        return false;
    }
  }, [
    currentStep,
    relationship,
    fullName,
    nik,
    phone,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    motherName,
    placeOfBirth,
    dateOfBirth,
    gender,
    bloodType,
    region.line1,
    occupationCode
  ]);

  const handleBack = () => {
    if (isEditingFromReview) {
      setIsEditingFromReview(false);
      setCurrentStep(12);
      return;
    }

    if (currentStep <= 1) {
      onCancel();
      return;
    }
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const selectedOccupation = references.occupations.find((o) => o.code === occupationCode);
    const resolvedBloodType: PatientBloodType = bloodType;
    const finalEmail = email.trim() || user?.email || undefined;

    const dto: CreatePatientAffiliationDto = {
      relationshipTypeId: (selectedRelOption as any)?.id,
      relationshipType: relationship,
      name: fullName.trim(),
      nik: nik.trim(),
      phone: phone.trim() || undefined,
      email: finalEmail,
      emergencyContactPatientId: emergencyContactPatientId || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      emergencyContactRelationship: emergencyContactRelationship.trim() || undefined,
      birthPlace: placeOfBirth.trim(),
      birthDate: dateOfBirth,
      gender: gender as PatientGender,
      bloodType: resolvedBloodType,
      motherName: motherName.trim(),
      line1: region.line1.trim(),
      isPrimary: isSelf,
      occupationId: selectedOccupation?.id,
      occupation: selectedOccupation?.name,
      provinceName: region.provinceName || undefined,
      provinceCode: region.provinceCode || undefined,
      regencyName: region.regencyName || undefined,
      regencyCode: region.regencyCode || undefined,
      districtName: region.districtName || undefined,
      districtCode: region.districtCode || undefined,
      villageName: region.villageName || undefined,
      villageCode: region.villageCode || undefined
    };

    try {
      setIsSubmitting(true);
      const newPatient = await patientAffiliationService.createAffiliation(dto);
      onSuccess(newPatient);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil pasien';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!isCurrentStepValid || isAnimatingRef.current) return;

    if (isEditingFromReview) {
      isAnimatingRef.current = true;
      setIsEditingFromReview(false);
      setCurrentStep(12);
      return;
    }

    if (currentStep < 12) {
      isAnimatingRef.current = true;
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const currentStepMeta: PatientRegistrationStep = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Siapa yang akan berobat?',
          description: 'Pilih profil yang akan berkonsultasi ke klinik hari ini'
        };
      case 2:
        if (isSelf) {
          return {
            title: 'Data identitas diri',
            description: 'Masukkan nama lengkap Anda sesuai KTP atau identitas resmi'
          };
        }
        return {
          title: `Nama lengkap ${selectedRelOption?.label || 'pasien'}`,
          description: 'Masukkan nama lengkap pasien sesuai KTP atau kartu keluarga'
        };
      case 3:
        if (isSelf) {
          return {
            title: 'Nomor Induk Kependudukan',
            description: '16 digit NIK KTP Anda untuk identifikasi rekam medis resmi'
          };
        }
        return {
          title: `NIK ${selectedRelOption?.label || 'pasien'}`,
          description: '16 digit NIK sesuai KTP atau KK untuk verifikasi rekam medis'
        };
      case 4:
        return {
          title: 'Nama ibu kandung',
          description: 'Data nama ibu kandung diperlukan untuk verifikasi identitas dan rekam medis'
        };
      case 5:
        return {
          title: 'Tempat dan tanggal lahir',
          description: 'Pastikan tempat dan tanggal lahir sesuai identitas resmi'
        };
      case 6:
        if (isSelf) {
          return {
            title: 'Jenis kelamin Anda',
            description: 'Pilih jenis kelamin sesuai identitas KTP Anda'
          };
        }
        return {
          title: `Jenis kelamin ${selectedRelOption?.label || 'pasien'}`,
          description: 'Pilih jenis kelamin sesuai identitas resmi'
        };
      case 7:
        return {
          title: 'Golongan darah pasien',
          description:
            'Pilih jenis golongan darah pasien atau pilih Belum Tahu jika belum diperiksa'
        };
      case 8:
        return {
          title: 'Nomor WhatsApp atau telepon',
          description:
            'Nomor aktif yang dapat dihubungi untuk konfirmasi antrean dan pengingat janji temu'
        };
      case 9:
        return {
          title: 'Kontak darurat kerabat',
          description:
            'Keluarga atau kerabat terdekat yang dapat dihubungi faskes dalam keadaan darurat medis'
        };
      case 10:
        return {
          title: 'Alamat domisili saat ini',
          description: 'Alamat tempat tinggal untuk rujukan dan data pasien'
        };
      case 11:
        return {
          title: 'Pekerjaan pasien',
          description: 'Pilih jenis pekerjaan atau kegiatan utama sehari-hari'
        };
      case 12:
        return {
          title: 'Konfirmasi data pendaftaran',
          description: 'Periksa kembali kelengkapan data sebelum disimpan'
        };
      default:
        return {
          title: 'Data pasien',
          description: 'Lengkapi data identitas'
        };
    }
  }, [currentStep, isSelf, selectedRelOption]);

  const isReviewStep = currentStep === 12;

  return {
    currentStep,
    totalSteps: 11,
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
    setEmail,
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
    knowsBloodType,
    handleSelectTahu,
    handleSelectBelumTahu,
    region,
    setRegion,
    relationship,
    handleSelectRelationship,
    occupationCode,
    setOccupationCode,

    references,
    relationshipOptions,
    existingPatients,
    isSelf,

    handleBack,
    handleNext,
    handleSubmit,
    handleJumpToStep,
    isEditingFromReview
  };
}
