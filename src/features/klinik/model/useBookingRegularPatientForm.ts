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
}

export function useBookingRegularPatientForm({
  onSuccess,
  onCancel
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

  // Form values - strictly aligned to backend SSOT
  const [relationship, setRelationship] =
    React.useState<PatientRelationshipType>('self');
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

  // Handle relationship selection
  const handleSelectRelationship = React.useCallback(
    (newRel: PatientRelationshipType) => {
      setRelationship(newRel);
    },
    []
  );

  // Handle knows blood type selection
  const handleSelectTahu = React.useCallback(() => {
    setKnowsBloodType(true);
    setBloodType('');
  }, []);

  const handleSelectBelumTahu = React.useCallback(() => {
    setKnowsBloodType(false);
    setBloodType('Belum Tahu');
    // Auto-advance to next step or return to review
    setTimeout(() => {
      if (isEditingFromReview) {
        setIsEditingFromReview(false);
        setCurrentStep(10);
      } else {
        setCurrentStep(8);
      }
    }, 120);
  }, [isEditingFromReview]);

  // Step transition animation with GSAP (Steep upward spike acceleration)
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

  // Validation per step (1 through 10)
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
    // If in Step 7 and in swapped "knowsBloodType" state, revert to the initial question first
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

  // Conversational sentence-case diksi (Huruf awal kapital, selebihnya kecil)
  const currentStepMeta: PatientRegistrationStep = React.useMemo(() => {
    const isSelf = relationship === 'self';
    const isChild = relationship === 'child';
    const isSpouse = relationship === 'spouse';
    const isParent = relationship === 'parent';

    switch (currentStep) {
      case 1:
        return {
          title: 'Siapa yang akan berobat? 🩺',
          description: 'Pilih siapa yang akan berkonsultasi ke Klinik Amanah hari ini 😊'
        };
      case 2:
        if (isSelf) {
          return {
            title: 'Halo kak! Kenalan dulu yuk 😊',
            description: 'Boleh tahu nama lengkap kamu sesuai KTP / KK?'
          };
        }
        if (isChild) {
          return {
            title: 'Siapa nama buah hati kamu? 👶',
            description: 'Boleh tahu nama lengkap anak sesuai akta / kartu keluarga?'
          };
        }
        if (isSpouse) {
          return {
            title: 'Siapa nama pasangan kamu? 💍',
            description: 'Boleh tahu nama lengkap suami / istri sesuai KTP?'
          };
        }
        if (isParent) {
          return {
            title: 'Siapa nama orang tua kamu? 🧓',
            description: 'Boleh tahu nama lengkap ayah / ibu sesuai KTP?'
          };
        }
        return {
          title: 'Siapa nama lengkapnya? 👥',
          description: 'Boleh tahu nama lengkap yang akan berobat sesuai KTP?'
        };
      case 3:
        if (isSelf) {
          return {
            title: 'Sip! Minta NIK kamu ya 🪪',
            description: '16 digit NIK KTP kamu untuk identifikasi rekam medis resmi.'
          };
        }
        if (isChild) {
          return {
            title: 'Sip! Minta NIK anak ya 🪪',
            description: '16 digit NIK anak sesuai kartu keluarga atau KIA.'
          };
        }
        return {
          title: 'Sip! Minta NIK-nya ya 🪪',
          description: '16 digit NIK sesuai KTP / KK untuk verifikasi rekam medis.'
        };
      case 4:
        if (isSelf) {
          return {
            title: 'Boleh tahu nama ibu kandung kamu? 👩‍👧',
            description: 'Data nama ibu kandung diperlukan untuk verifikasi identitas & rekam medis.'
          };
        }
        if (isChild) {
          return {
            title: 'Boleh tahu nama ibu kandung anak? 👩‍👧',
            description: 'Data nama ibu kandung diperlukan untuk verifikasi identitas & rekam medis.'
          };
        }
        return {
          title: 'Boleh tahu nama ibu kandungnya? 👩‍👧',
          description: 'Data nama ibu kandung diperlukan untuk verifikasi identitas & rekam medis.'
        };
      case 5:
        if (isSelf) {
          return {
            title: 'Di mana & kapan kamu lahir? 🎂',
            description: 'Pastikan tempat dan tanggal lahir sesuai KTP kamu ya.'
          };
        }
        if (isChild) {
          return {
            title: 'Di mana & kapan anak lahir? 🎂',
            description: 'Pastikan tempat dan tanggal lahir sesuai akta / kartu keluarga.'
          };
        }
        return {
          title: 'Di mana & kapan tanggal lahirnya? 🎂',
          description: 'Pastikan tempat dan tanggal lahir sesuai identitas KTP / KK.'
        };
      case 6:
        if (isSelf) {
          return {
            title: 'Pilih jenis kelamin kamu 🚻',
            description: 'Pilih jenis kelamin sesuai identitas KTP kamu.'
          };
        }
        if (isChild) {
          return {
            title: 'Apa jenis kelamin buah hati kamu? 👶',
            description: 'Pilih jenis kelamin anak.'
          };
        }
        if (isSpouse) {
          return {
            title: 'Apa jenis kelamin pasangan kamu? 💍',
            description: 'Pilih jenis kelamin pasangan.'
          };
        }
        if (isParent) {
          return {
            title: 'Apa jenis kelamin orang tua kamu? 🧓',
            description: 'Pilih jenis kelamin orang tua.'
          };
        }
        return {
          title: 'Apa jenis kelaminnya? 🚻',
          description: 'Pilih jenis kelamin sesuai identitas KTP.'
        };
      case 7:
        if (knowsBloodType === true) {
          return {
            title: isSelf ? 'Pilih golongan darah kamu 🩸' : 'Pilih golongan darahnya 🩸',
            description: 'Pilih tipe golongan darah sesuai hasil pemeriksaan laboratorium.'
          };
        }
        return {
          title: isSelf ? 'Apakah kamu tahu golongan darah kamu? 🩸' : 'Apakah kamu tahu golongan darahnya? 🩸',
          description: 'Pilih tahu jika kamu mengetahui golongan darah, atau belum tahu.'
        };
      case 8:
        if (isSelf) {
          return {
            title: 'Sekarang kamu tinggal di mana? 🏡',
            description: 'Alamat domisili saat ini untuk rujukan & pengiriman obat.'
          };
        }
        return {
          title: 'Sekarang tinggal di mana? 🏡',
          description: 'Alamat domisili saat ini untuk rujukan & pengiriman obat.'
        };
      case 9:
        if (isSelf) {
          return {
            title: 'Dikit lagi kelar nih! 💼',
            description: 'Apa pekerjaan atau kegiatan kamu sehari-hari?'
          };
        }
        if (isChild) {
          return {
            title: 'Dikit lagi kelar nih! 👶',
            description: 'Pilih status kegiatan anak (misal: belum bekerja / pelajar).'
          };
        }
        return {
          title: 'Dikit lagi kelar nih! 💼',
          description: 'Apa pekerjaan atau kegiatan sehari-hari?'
        };
      case 10:
        return {
          title: 'Hore! Data udah rapi 🎉',
          description: 'Ketuk data yang ingin diubah, atau simpan jika sudah sesuai.'
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
    // Stepper state
    currentStep,
    totalSteps: 9,
    isReviewStep,
    currentStepMeta,
    stepContainerRef,
    isSubmitting,
    errorMessage,
    isCurrentStepValid,

    // Form values & setters
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

    // Backend reference options
    references,

    // Actions
    handleBack,
    handleNext,
    handleSubmit,
    handleJumpToStep,
    isEditingFromReview
  };
}
