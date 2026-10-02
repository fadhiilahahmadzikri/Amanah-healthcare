'use client';

import * as React from 'react';
import gsap from 'gsap';
import { toast } from 'sonner';
import {
  patientAffiliationService,
  type CreatePatientAffiliationDto,
  type PatientRelationshipType,
  type PatientGender,
  type PatientBloodType,
  type PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { PatientRegistrationStep } from '@/features/data-pasien/constants/registration-options';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';

export interface UseBookingRegularPatientFormOptions {
  onSuccess: (newPatient: PatientAffiliationProfile) => void;
  onCancel: () => void;
  targetFlow?: 'pregnancy' | 'immunization' | 'regular';
  onRelationshipSubmit?: (relationship: PatientRelationshipType) => void;
}

export function useBookingRegularPatientForm({
  onSuccess,
  onCancel,
  targetFlow,
  onRelationshipSubmit
}: UseBookingRegularPatientFormOptions) {
  const references = usePatientFormReferences();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isEditingFromReview, setIsEditingFromReview] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleJumpToStep = React.useCallback((stepNumber: number) => {
    setIsEditingFromReview(true);
    setCurrentStep(stepNumber);
  }, []);

  const [relationship, setRelationship] = React.useState<PatientRelationshipType>('self');
  const [fullName, setFullName] = React.useState('');
  const [nik, setNik] = React.useState('');
  const [motherName, setMotherName] = React.useState('');
  const [placeOfBirth, setPlaceOfBirth] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [gender, setGender] = React.useState<PatientGender | ''>('');
  const [bloodType, setBloodType] = React.useState<PatientBloodType | ''>('');
  const [knowsBloodType, setKnowsBloodType] = React.useState<boolean | null>(null);
  const [region, setRegion] = React.useState<PatientRegionValues>({
    provinsi: '',
    provinsiId: '',
    kabupaten: '',
    kabupatenId: '',
    kecamatan: '',
    kecamatanId: '',
    kelurahan: '',
    kelurahanId: '',
    alamatDetail: ''
  });
  const [occupationCode, setOccupationCode] = React.useState('');

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
    setBloodType('Belum Tahu');
    setTimeout(() => {
      if (isEditingFromReview) {
        setIsEditingFromReview(false);
        setCurrentStep(10);
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
        if (knowsBloodType === null) return false;
        if (knowsBloodType === false) return bloodType === 'Belum Tahu';
        return Boolean(bloodType && bloodType !== 'Belum Tahu');
      case 8:
        return Boolean(region.alamatDetail.trim());
      case 9:
        return Boolean(occupationCode);
      case 10:
        return true;
      default:
        return false;
    }
  }, [
    currentStep,
    relationship,
    fullName,
    nik,
    motherName,
    placeOfBirth,
    dateOfBirth,
    gender,
    knowsBloodType,
    bloodType,
    region.alamatDetail,
    occupationCode,
    references.isLoading
  ]);

  const handleBack = () => {
    if (currentStep === 7 && knowsBloodType === true) {
      setKnowsBloodType(null);
      setBloodType('');
      return;
    }

    if (isEditingFromReview) {
      setIsEditingFromReview(false);
      setCurrentStep(10);
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

    const fullAddress = [
      region.alamatDetail.trim(),
      region.kelurahan,
      region.kecamatan,
      region.kabupaten,
      region.provinsi
    ]
      .filter(Boolean)
      .join(', ');

    const selectedOccupation = references.occupations.find((o) => o.code === occupationCode);
    const resolvedGender: PatientGender = gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki';
    const resolvedBloodType: PatientBloodType = (bloodType || 'Belum Tahu') as PatientBloodType;

    const dto: CreatePatientAffiliationDto = {
      relationship_type: relationship,
      name: fullName.trim(),
      nik: nik.trim(),
      tempat_lahir: placeOfBirth.trim(),
      birth_date: dateOfBirth,
      gender: resolvedGender,
      blood_type: resolvedBloodType,
      nama_ibu_kandung: motherName.trim(),
      alamat_detail: region.alamatDetail.trim() || fullAddress,
      is_primary: relationship === 'self',
      occupation_id: selectedOccupation?.id,
      pekerjaan: selectedOccupation?.name,
      provinsi: region.provinsi || undefined,
      provinsi_id: region.provinsiId || undefined,
      kabupaten: region.kabupaten || undefined,
      kabupaten_id: region.kabupatenId || undefined,
      kecamatan: region.kecamatan || undefined,
      kecamatan_id: region.kecamatanId || undefined,
      kelurahan: region.kelurahan || undefined,
      kelurahan_id: region.kelurahanId || undefined
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

    if (
      currentStep === 1 &&
      (targetFlow === 'pregnancy' || targetFlow === 'immunization') &&
      onRelationshipSubmit
    ) {
      onRelationshipSubmit(relationship);
      return;
    }

    if (isEditingFromReview) {
      isAnimatingRef.current = true;
      setIsEditingFromReview(false);
      setCurrentStep(10);
      return;
    }

    if (currentStep < 10) {
      isAnimatingRef.current = true;
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const currentStepMeta: PatientRegistrationStep = React.useMemo(() => {
    const isSelf = relationship === 'self';
    const isChild = relationship === 'child';
    const isSpouse = relationship === 'spouse';
    const isParent = relationship === 'parent';

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
            description: 'Masukkan nama lengkap Anda sesuai KTP atau KK'
          };
        }
        if (isChild) {
          return {
            title: 'Nama anak',
            description: 'Masukkan nama lengkap anak sesuai akta atau kartu keluarga'
          };
        }
        if (isSpouse) {
          return {
            title: 'Nama pasangan',
            description: 'Masukkan nama lengkap pasangan sesuai KTP'
          };
        }
        if (isParent) {
          return {
            title: 'Nama orang tua',
            description: 'Masukkan nama lengkap orang tua sesuai KTP'
          };
        }
        return {
          title: 'Nama lengkap pasien',
          description: 'Masukkan nama lengkap yang akan berobat sesuai KTP'
        };
      case 3:
        if (isSelf) {
          return {
            title: 'Nomor Induk Kependudukan',
            description: '16 digit NIK KTP Anda untuk identifikasi rekam medis resmi'
          };
        }
        if (isChild) {
          return {
            title: 'NIK anak',
            description: '16 digit NIK anak sesuai kartu keluarga atau KIA'
          };
        }
        return {
          title: 'NIK pasien',
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
        if (isChild) {
          return {
            title: 'Jenis kelamin anak',
            description: 'Pilih jenis kelamin anak'
          };
        }
        if (isSpouse) {
          return {
            title: 'Jenis kelamin pasangan',
            description: 'Pilih jenis kelamin pasangan'
          };
        }
        return {
          title: 'Jenis kelamin pasien',
          description: 'Pilih jenis kelamin sesuai identitas resmi'
        };
      case 7:
        if (knowsBloodType === true) {
          return {
            title: 'Pilih golongan darah',
            description: 'Pilih tipe golongan darah sesuai hasil pemeriksaan laboratorium'
          };
        }
        return {
          title: 'Golongan darah pasien',
          description: 'Tentukan apakah sudah mengetahui golongan darah atau belum'
        };
      case 8:
        return {
          title: 'Alamat domisili saat ini',
          description: 'Alamat tempat tinggal untuk rujukan dan data pasien'
        };
      case 9:
        return {
          title: 'Pekerjaan pasien',
          description: 'Pilih jenis pekerjaan atau kegiatan utama sehari-hari'
        };
      case 10:
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
  }, [currentStep, relationship, knowsBloodType]);

  const isReviewStep = currentStep === 10;

  return {
    currentStep,
    totalSteps: 9,
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

    handleBack,
    handleNext,
    handleSubmit,
    handleJumpToStep,
    isEditingFromReview
  };
}

export default useBookingRegularPatientForm;
