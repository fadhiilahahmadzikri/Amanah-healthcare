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
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { appointmentDraftService } from '../services/appointment-draft.service';
import {
  getBookingStepMeta,
  REGULAR_BOOKING_STEPS,
  type UseBookingRegularPatientFormOptions
} from './booking-regular-form-steps';

export type { UseBookingRegularPatientFormOptions };

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

  const initialDraft = React.useMemo(() => {
    return user?.id ? appointmentDraftService.getBookingDraft(user.id) : null;
  }, [user?.id]);

  const [currentStep, setCurrentStep] = React.useState(() => {
    return initialDraft?.newPatientStep && initialDraft.newPatientStep > 1
      ? initialDraft.newPatientStep
      : 1;
  });
  const [isEditingFromReview, setIsEditingFromReview] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleJumpToStep = React.useCallback((stepNumber: number) => {
    setIsEditingFromReview(true);
    setCurrentStep(stepNumber);
  }, []);

  const relationshipOptions = React.useMemo(() => {
    if (allowedRelationships && allowedRelationships.length > 0) {
      return allowedRelationships;
    }
    return references.relationships;
  }, [allowedRelationships, references.relationships]);

  const initialRelationshipValue: PatientRelationshipType = React.useMemo(() => {
    const draftRel = initialDraft?.newPatientData?.relationship;
    if (draftRel && relationshipOptions.some((r) => r.value === draftRel)) {
      return draftRel as PatientRelationshipType;
    }
    if (initialRelationship && relationshipOptions.some((r) => r.value === initialRelationship)) {
      return initialRelationship as PatientRelationshipType;
    }
    if (relationshipOptions.length > 0) {
      const systemOpt = relationshipOptions.find((r) => (r as any).isSystem);
      if (systemOpt) return systemOpt.value as PatientRelationshipType;
      return relationshipOptions[0].value as PatientRelationshipType;
    }
    return (draftRel || '') as PatientRelationshipType;
  }, [initialDraft?.newPatientData?.relationship, initialRelationship, relationshipOptions]);

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
      }
    }
  }, [relationshipOptions, relationship]);

  const [fullName, setFullName] = React.useState(() => {
    if (initialDraft?.newPatientData?.fullName !== undefined) {
      return initialDraft.newPatientData.fullName;
    }
    return isSelf && user?.name ? user.name : '';
  });
  const [nik, setNik] = React.useState(() => initialDraft?.newPatientData?.nik ?? '');
  const [nikError, setNikError] = React.useState<string | null>(null);

  const [phone, setPhone] = React.useState(() => {
    if (initialDraft?.newPatientData?.phone !== undefined) {
      return initialDraft.newPatientData.phone;
    }
    return isSelf && user?.phone ? user.phone : '';
  });
  const [email, setEmail] = React.useState(() => {
    if (initialDraft?.newPatientData?.email !== undefined) {
      return initialDraft.newPatientData.email;
    }
    return user?.email || '';
  });
  const [emergencyContactName, setEmergencyContactName] = React.useState(
    () => initialDraft?.newPatientData?.emergencyContactName ?? ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = React.useState(
    () => initialDraft?.newPatientData?.emergencyContactPhone ?? ''
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] = React.useState(
    () => initialDraft?.newPatientData?.emergencyContactRelationship ?? ''
  );
  const [emergencyContactPatientId, setEmergencyContactPatientId] = React.useState<string>(
    () => initialDraft?.newPatientData?.emergencyContactPatientId ?? ''
  );
  const [isEnteringManualEmergency, setIsEnteringManualEmergency] = React.useState(() => {
    const d = initialDraft?.newPatientData;
    return Boolean(d?.emergencyContactName || d?.emergencyContactPhone);
  });

  const handleSkipEmergencyContact = React.useCallback(() => {
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setEmergencyContactRelationship('');
    setEmergencyContactPatientId('');
    setIsEnteringManualEmergency(false);
    if (isEditingFromReview) {
      setIsEditingFromReview(false);
      setCurrentStep(12);
    } else {
      setCurrentStep(10);
    }
  }, [isEditingFromReview]);

  const handleChooseManualEmergencyContact = React.useCallback(() => {
    setIsEnteringManualEmergency(true);
  }, []);
  const [motherName, setMotherName] = React.useState(
    () => initialDraft?.newPatientData?.motherName ?? ''
  );
  const [placeOfBirth, setPlaceOfBirth] = React.useState(
    () => initialDraft?.newPatientData?.placeOfBirth ?? ''
  );
  const [dateOfBirth, setDateOfBirth] = React.useState(
    () => initialDraft?.newPatientData?.dateOfBirth ?? ''
  );
  const [gender, setGender] = React.useState<PatientGender | ''>(
    () => (initialDraft?.newPatientData?.gender as PatientGender) ?? ''
  );
  const [bloodType, setBloodType] = React.useState<PatientBloodType | ''>(
    () => (initialDraft?.newPatientData?.bloodType as PatientBloodType) ?? ''
  );
  const [knowsBloodType, setKnowsBloodType] = React.useState<boolean | null>(
    () => initialDraft?.newPatientData?.knowsBloodType ?? null
  );
  const [region, setRegion] = React.useState<PatientRegionValues>(() => {
    if (initialDraft?.newPatientData?.region) {
      const reg = initialDraft.newPatientData.region;
      return {
        provinceName: reg.provinceName || '',
        provinceCode: reg.provinceCode || '',
        regencyName: reg.regencyName || '',
        regencyCode: reg.regencyCode || '',
        districtName: reg.districtName || '',
        districtCode: reg.districtCode || '',
        villageName: reg.villageName || '',
        villageCode: reg.villageCode || '',
        line1: reg.line1 || ''
      };
    }
    return {
      provinceName: '',
      provinceCode: '',
      regencyName: '',
      regencyCode: '',
      districtName: '',
      districtCode: '',
      villageName: '',
      villageCode: '',
      line1: ''
    };
  });
  const [occupationCode, setOccupationCode] = React.useState(
    () => initialDraft?.newPatientData?.occupationCode ?? ''
  );

  // Auto-fill user identity when switching to Self
  React.useEffect(() => {
    if (isSelf) {
      if (user?.email && !email) setEmail(user.email);
      if (user?.name && !fullName) setFullName(user.name);
      if (user?.phone && !phone) setPhone(user.phone);
    }
  }, [isSelf, user, email, fullName, phone]);

  const isRestoredRef = React.useRef(false);

  React.useEffect(() => {
    if (!user?.id) return;
    const draft = appointmentDraftService.getBookingDraft(user.id);
    if (!isRestoredRef.current && draft?.newPatientData) {
      const d = draft.newPatientData;
      if (d.relationship) setRelationship(d.relationship as PatientRelationshipType);
      if (d.fullName !== undefined) setFullName(d.fullName);
      if (d.nik !== undefined) setNik(d.nik);
      if (d.motherName !== undefined) setMotherName(d.motherName);
      if (d.placeOfBirth !== undefined) setPlaceOfBirth(d.placeOfBirth);
      if (d.dateOfBirth !== undefined) setDateOfBirth(d.dateOfBirth);
      if (d.gender !== undefined) setGender(d.gender as PatientGender);
      if (d.bloodType !== undefined) setBloodType(d.bloodType as PatientBloodType);
      if (d.knowsBloodType !== undefined) setKnowsBloodType(d.knowsBloodType);
      if (d.phone !== undefined) setPhone(d.phone);
      if (d.email !== undefined) setEmail(d.email);
      if (d.emergencyContactName !== undefined) setEmergencyContactName(d.emergencyContactName);
      if (d.emergencyContactPhone !== undefined) setEmergencyContactPhone(d.emergencyContactPhone);
      if (d.emergencyContactRelationship !== undefined) setEmergencyContactRelationship(d.emergencyContactRelationship);
      if (d.emergencyContactPatientId !== undefined) setEmergencyContactPatientId(d.emergencyContactPatientId);
      if (d.region) {
        setRegion((prev) => ({
          ...prev,
          ...d.region
        }));
      }
      if (d.occupationCode !== undefined) setOccupationCode(d.occupationCode);
      if (draft.newPatientStep && draft.newPatientStep > 1) {
        setCurrentStep(draft.newPatientStep);
      }
    }
    isRestoredRef.current = true;
  }, [user?.id]);

  // Real-time auto-save for new patient registration
  React.useEffect(() => {
    if (!isRestoredRef.current || !user?.id) return;

    appointmentDraftService.saveBookingDraft(user.id, {
      step: 'create_profile',
      newPatientStep: currentStep,
      newPatientData: {
        relationship,
        fullName,
        nik,
        motherName,
        placeOfBirth,
        dateOfBirth,
        gender,
        bloodType,
        knowsBloodType,
        phone,
        email,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        emergencyContactPatientId,
        region,
        occupationCode
      }
    });
  }, [
    user?.id,
    currentStep,
    relationship,
    fullName,
    nik,
    motherName,
    placeOfBirth,
    dateOfBirth,
    gender,
    bloodType,
    knowsBloodType,
    phone,
    email,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    emergencyContactPatientId,
    region,
    occupationCode
  ]);

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
      case REGULAR_BOOKING_STEPS.TARGET_PATIENT:
        return Boolean(relationship);
      case REGULAR_BOOKING_STEPS.FULL_NAME:
        return fullName.trim().length >= 3;
      case REGULAR_BOOKING_STEPS.NIK:
        return nik.length === 16 && /^\d+$/.test(nik);
      case REGULAR_BOOKING_STEPS.MOTHER_NAME:
        return motherName.trim().length >= 3;
      case REGULAR_BOOKING_STEPS.BIRTH_INFO:
        return placeOfBirth.trim().length >= 2 && Boolean(dateOfBirth);
      case REGULAR_BOOKING_STEPS.GENDER:
        return Boolean(gender);
      case REGULAR_BOOKING_STEPS.BLOOD_TYPE:
        return Boolean(bloodType && bloodType.trim().length > 0);
      case REGULAR_BOOKING_STEPS.PHONE: {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 15;
      }
      case REGULAR_BOOKING_STEPS.EMERGENCY_CONTACT: {
        if (isSelf && !isEnteringManualEmergency) {
          return true;
        }
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
      case REGULAR_BOOKING_STEPS.ADDRESS:
        return Boolean(region.line1.trim());
      case REGULAR_BOOKING_STEPS.OCCUPATION:
        return Boolean(occupationCode);
      case REGULAR_BOOKING_STEPS.CONFIRMATION:
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
    occupationCode,
    isSelf,
    isEnteringManualEmergency
  ]);

  const handleBack = () => {
    if (isEditingFromReview) {
      setIsEditingFromReview(false);
      setCurrentStep(12);
      return;
    }

    if (currentStep <= 1) {
      if (user?.id) {
        appointmentDraftService.saveBookingDraft(user.id, {
          step: existingPatients.length > 0 ? 'select_profile' : 'service',
          newPatientStep: 1,
          newPatientData: null
        });
      }
      onCancel();
      return;
    }
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    if (
      currentStep === REGULAR_BOOKING_STEPS.EMERGENCY_CONTACT &&
      isSelf &&
      isEnteringManualEmergency
    ) {
      setIsEnteringManualEmergency(false);
      isAnimatingRef.current = false;
      return;
    }

    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const selectedOccupation = references.occupations.find((o) => o.code === occupationCode);
    const resolvedBloodType: PatientBloodType = bloodType;
    const finalEmail = email.trim() || user?.email || undefined;
    const hasEmergencyPhone = Boolean(emergencyContactPhone.trim());

    const dto: CreatePatientAffiliationDto = {
      relationshipTypeId: (selectedRelOption as any)?.id,
      relationshipType: relationship,
      name: fullName.trim(),
      nik: nik.trim(),
      phone: phone.trim() || undefined,
      email: finalEmail,
      emergencyContactPatientId: hasEmergencyPhone ? (emergencyContactPatientId || undefined) : undefined,
      emergencyContactName: hasEmergencyPhone ? (emergencyContactName.trim() || undefined) : undefined,
      emergencyContactPhone: hasEmergencyPhone ? emergencyContactPhone.trim() : undefined,
      emergencyContactRelationship: hasEmergencyPhone ? (emergencyContactRelationship.trim() || undefined) : undefined,
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
      if (user?.id) {
        appointmentDraftService.saveBookingDraft(user.id, {
          newPatientStep: 1,
          newPatientData: null
        });
      }
      onSuccess(newPatient);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil pasien';
      const appErr = err as any;
      const errorCode =
        appErr?.problemDetails?.code ||
        appErr?.code ||
        appErr?.problemDetails?.errors?.[0]?.code;

      if (errorCode === 'NIK_ALREADY_REGISTERED' || errorCode === 'DUPLICATE_NIK') {
        setErrorMessage(null);
        setNikError('Periksa kembali nomor identitas Anda.');
        setCurrentStep(3);
        toast.error(
          'Gagal memproses pendaftaran. Mohon periksa kembali kelengkapan identitas Anda atau hubungi admin klinik.'
        );
        return;
      }

      setErrorMessage(msg);
      if (
        errorCode === 'PRIMARY_PROFILE_EXISTS' ||
        errorCode === 'RELATIONSHIP_LIMIT_REACHED'
      ) {
        setCurrentStep(1);
      }
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

    if (
      currentStep === REGULAR_BOOKING_STEPS.EMERGENCY_CONTACT &&
      isSelf &&
      !isEnteringManualEmergency
    ) {
      handleSkipEmergencyContact();
      return;
    }

    if (currentStep < REGULAR_BOOKING_STEPS.CONFIRMATION) {
      isAnimatingRef.current = true;
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const currentStepMeta = React.useMemo(
    () => getBookingStepMeta(currentStep, isSelf, selectedRelOption?.label),
    [currentStep, isSelf, selectedRelOption]
  );

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
    nikError,
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
    isEnteringManualEmergency,
    setIsEnteringManualEmergency,
    handleSkipEmergencyContact,
    handleChooseManualEmergencyContact,

    handleBack,
    handleNext,
    handleSubmit,
    handleJumpToStep,
    isEditingFromReview
  };
}
