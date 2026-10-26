'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import type { Gender } from '@/constants/gender.constants';
import type { PolyclinicUnit, StaffMember } from '../api/staff-management.api';
import { polyclinicsQueryOptions } from '../api/queries';
import { useUpdateStaffProfileMutation } from '../api/mutations';

export interface UseStaffDetailEditModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface StaffDetailFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  profession: string;
  birthPlace: string;
  birthDate: string;
  gender?: Gender;
  nationalId: string;
  poliklinikId: string;
  licenseNumber: string;
  isActive: boolean;
}

export interface UseStaffDetailEditModalResult {
  formData: StaffDetailFormData;
  regionValues: PatientRegionValues;
  isClinical: boolean;
  polyclinics: PolyclinicUnit[];
  isLoadingPolyclinics: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof StaffDetailFormData, value: unknown) => void;
  handleRegionChange: (updates: Partial<PatientRegionValues>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
}

export function useStaffDetailEditModal({
  staff,
  isOpen,
  onClose,
  onSuccess
}: UseStaffDetailEditModalProps): UseStaffDetailEditModalResult {
  const isClinical = staff?.staffType === 'doctor' || staff?.staffType === 'midwife';

  const { data: polyclinics = [], isLoading: isLoadingPolyclinics } = useQuery({
    ...polyclinicsQueryOptions(),
    enabled: Boolean(isOpen && isClinical)
  });

  const updateMutation = useUpdateStaffProfileMutation();

  const [formData, setFormData] = useState<StaffDetailFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    profession: '',
    birthPlace: '',
    birthDate: '',
    gender: staff?.gender,
    nationalId: '',
    poliklinikId: '',
    licenseNumber: '',
    isActive: true
  });

  const [regionValues, setRegionValues] = useState<PatientRegionValues>({
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

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.fullName || '',
        email: staff.email || '',
        phoneNumber: staff.phoneNumber || '',
        profession: staff.profession || '',
        birthPlace: staff.birthPlace || '',
        birthDate: staff.birthDate ? String(staff.birthDate).slice(0, 10) : '',
        gender: staff.gender,
        nationalId: staff.nationalId || '',
        poliklinikId: staff.poliklinikId || '',
        licenseNumber: staff.licenseNumber || '',
        isActive: staff.isActive ?? true
      });

      setRegionValues({
        provinceName: staff.address?.provinceName || '',
        provinceCode: staff.address?.provinceCode || '',
        regencyName: staff.address?.regencyName || '',
        regencyCode: staff.address?.regencyCode || '',
        districtName: staff.address?.districtName || '',
        districtCode: staff.address?.districtCode || '',
        villageName: staff.address?.villageName || '',
        villageCode: staff.address?.villageCode || '',
        line1: staff.address?.line1 || ''
      });
    }
  }, [staff]);

  const handleChange = useCallback((field: keyof StaffDetailFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRegionChange = useCallback((updates: Partial<PatientRegionValues>) => {
    setRegionValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!staff) return;

      if (!formData.fullName.trim()) {
        toast.error('Nama lengkap wajib diisi');
        return;
      }

      const fullAddress = [
        regionValues.line1,
        regionValues.villageName ? `Kel. ${regionValues.villageName}` : null,
        regionValues.districtName ? `Kec. ${regionValues.districtName}` : null,
        regionValues.regencyName,
        regionValues.provinceName
      ]
        .filter(Boolean)
        .join(', ');

      try {
        await updateMutation.mutateAsync({
          id: staff.id,
          payload: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim() || undefined,
            phoneNumber: formData.phoneNumber.trim(),
            profession: formData.profession.trim() || 'Staf Operasional',
            birthPlace: formData.birthPlace.trim() || undefined,
            birthDate: formData.birthDate || undefined,
            gender: formData.gender,
            nationalId: formData.nationalId.trim() || undefined,
            isActive: formData.isActive,
            poliklinikId: isClinical ? formData.poliklinikId || undefined : undefined,
            licenseNumber: isClinical ? formData.licenseNumber.trim() || undefined : undefined,
            address: {
              provinceCode: regionValues.provinceCode || undefined,
              provinceName: regionValues.provinceName || undefined,
              regencyCode: regionValues.regencyCode || undefined,
              regencyName: regionValues.regencyName || undefined,
              districtCode: regionValues.districtCode || undefined,
              districtName: regionValues.districtName || undefined,
              villageCode: regionValues.villageCode || undefined,
              villageName: regionValues.villageName || undefined,
              line1: regionValues.line1 || undefined,
              fullAddress: fullAddress || undefined
            }
          }
        });

        onSuccess?.();
        onClose();
      } catch {
        // Handled by mutation onError toast
      }
    },
    [staff, formData, regionValues, isClinical, updateMutation, onSuccess, onClose]
  );

  return {
    formData,
    regionValues,
    isClinical,
    polyclinics,
    isLoadingPolyclinics,
    isSubmitting: updateMutation.isPending,
    handleChange,
    handleRegionChange,
    handleSubmit
  };
}
