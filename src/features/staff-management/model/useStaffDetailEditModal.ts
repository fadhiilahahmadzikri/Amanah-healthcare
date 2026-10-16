'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
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
  gender: 'male' | 'female';
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
    gender: 'male',
    nationalId: '',
    poliklinikId: '',
    licenseNumber: '',
    isActive: true
  });

  const [regionValues, setRegionValues] = useState<PatientRegionValues>({
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

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.fullName || '',
        email: staff.email || '',
        phoneNumber: staff.phoneNumber || '',
        profession: staff.profession || '',
        birthPlace: staff.birthPlace || '',
        birthDate: staff.birthDate ? String(staff.birthDate).slice(0, 10) : '',
        gender: staff.gender === 'female' ? 'female' : 'male',
        nationalId: staff.nationalId || '',
        poliklinikId: staff.poliklinikId || '',
        licenseNumber: staff.licenseNumber || '',
        isActive: staff.isActive ?? true
      });

      setRegionValues({
        provinsi: staff.address?.provinceName || '',
        provinsiId: staff.address?.provinceCode || '',
        kabupaten: staff.address?.regencyName || '',
        kabupatenId: staff.address?.regencyCode || '',
        kecamatan: staff.address?.districtName || '',
        kecamatanId: staff.address?.districtCode || '',
        kelurahan: staff.address?.villageName || '',
        kelurahanId: staff.address?.villageCode || '',
        alamatDetail: staff.address?.line1 || staff.address?.fullAddress || ''
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
        regionValues.alamatDetail,
        regionValues.kelurahan ? `Kel. ${regionValues.kelurahan}` : null,
        regionValues.kecamatan ? `Kec. ${regionValues.kecamatan}` : null,
        regionValues.kabupaten,
        regionValues.provinsi
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
              provinceCode: regionValues.provinsiId || undefined,
              provinceName: regionValues.provinsi || undefined,
              regencyCode: regionValues.kabupatenId || undefined,
              regencyName: regionValues.kabupaten || undefined,
              districtCode: regionValues.kecamatanId || undefined,
              districtName: regionValues.kecamatan || undefined,
              villageCode: regionValues.kelurahanId || undefined,
              villageName: regionValues.kelurahan || undefined,
              line1: regionValues.alamatDetail || undefined,
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
