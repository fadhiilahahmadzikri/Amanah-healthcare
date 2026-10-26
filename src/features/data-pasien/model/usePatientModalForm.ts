'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppForm } from '@/components/ui/tanstack-form';
import { patientByIdOptions } from '../api/queries';
import { useCreatePatientMutation, useUpdatePatientMutation } from './usePatientMutations';
import { usePatientFormReferences } from './usePatientFormReferences';
import { patientSchema, type PatientFormValues } from '../schemas/patient-schema';
import type { Patient, PatientMutationPayload, PatientAccountStatus } from '../api/types';
import type { PatientSearchableSelectOption } from '../components/registration/molecules/patient-searchable-select';

export interface UsePatientModalFormOptions {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'view' | 'edit';
}

/**
 * Custom hook sentral untuk mengelola logika formulir, mutasi data,
 * sinkronisasi cache, serta kalkulasi otomatis modal pasien.
 */
export function usePatientModalForm({
  patient,
  isOpen,
  onClose,
  initialMode = 'view'
}: UsePatientModalFormOptions) {
  const isEdit = Boolean(patient);
  const [isEditing, setIsEditing] = useState<boolean>(!patient || initialMode === 'edit');
  const { genders, bloodTypes, occupations } = usePatientFormReferences();

  const { data: detailData, isLoading: isFetchingDetail } = useQuery({
    ...patientByIdOptions(patient?.id || ''),
    enabled: Boolean(isOpen && patient?.id)
  });

  const activePatient: Patient | null = detailData?.patient
    ? detailData.patient
    : (patient ?? null);

  const prevOpenRef = React.useRef(isOpen);
  const prevPatientIdRef = React.useRef(patient?.id);

  // Sinkronisasi mode edit hanya saat modal pertama kali terbuka atau ID pasien berganti
  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current;
    const patientChanged = patient?.id !== prevPatientIdRef.current;
    prevOpenRef.current = isOpen;
    prevPatientIdRef.current = patient?.id;

    if (justOpened || patientChanged) {
      setIsEditing(!patient || initialMode === 'edit');
    }
  }, [isOpen, initialMode, patient]);

  const occupationOptions: PatientSearchableSelectOption[] = useMemo(() => {
    return occupations.map((o) => ({
      id: o.id,
      name: o.name,
      label: o.name,
      value: o.name,
      description: o.description
    }));
  }, [occupations]);

  const createMutation = useCreatePatientMutation();
  const updateMutation = useUpdatePatientMutation();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useAppForm({
    defaultValues: {
      name: activePatient?.name ?? '',
      patient_id: activePatient?.patient_id ?? '',
      nik: (activePatient?.nik ?? '').replace(/^-$/, ''),
      nama_ibu_kandung: (activePatient?.mother_name ?? '').replace(/^-$/, ''),
      tempat_lahir: (activePatient?.birth_place ?? '').replace(/^-$/, ''),
      pekerjaan: (activePatient?.occupation ?? '').replace(/^-$/, ''),
      phone: (activePatient?.phone || '').replace(/^-$/, ''),
      email: (activePatient?.email || '').replace(/^-$/, ''),
      gender: (activePatient?.gender || '') as PatientFormValues['gender'],
      age: activePatient?.age ?? 0,
      birth_date: activePatient?.birth_date ?? '',
      blood_type: activePatient?.blood_type ?? '',
      address: (activePatient?.address || '').replace(/^-$/, ''),
      provinsi: activePatient?.province_name ?? '',
      provinsi_id: activePatient?.province_code ?? '',
      kabupaten: activePatient?.regency_name ?? '',
      kabupaten_id: activePatient?.regency_code ?? '',
      kecamatan: activePatient?.district_name ?? '',
      kecamatan_id: activePatient?.district_code ?? '',
      kelurahan: activePatient?.village_name ?? '',
      kelurahan_id: activePatient?.village_code ?? '',
      alamat_detail: (activePatient?.line1 || '').replace(/^-$/, ''),
      emergency_contact: (activePatient?.emergency_contact || '').replace(/^-$/, ''),
      account_status: (activePatient?.status === 'inactive'
        ? 'inactive'
        : 'active') as PatientAccountStatus
    } as PatientFormValues,
    validators: {
      onSubmit: patientSchema
    },
    onSubmit: async ({ value }) => {
      if (!isEditing) {
        return;
      }

      const payload: PatientMutationPayload = {
        name: value.name,
        patient_id: value.patient_id,
        nik: value.nik ? value.nik.trim() : '',
        mother_name: value.nama_ibu_kandung || '',
        birth_place: value.tempat_lahir || '',
        occupation: value.pekerjaan || '',
        phone: value.phone ? value.phone.trim() : '',
        email: value.email ? value.email.trim() : '',
        gender: value.gender as PatientMutationPayload['gender'],
        age: Number(value.age),
        birth_date: value.birth_date,
        blood_type: value.blood_type as PatientMutationPayload['blood_type'],
        address: value.alamat_detail || '',
        line1: value.alamat_detail || '',
        province_name: value.provinsi || '',
        province_code: value.provinsi_id || '',
        regency_name: value.kabupaten || '',
        regency_code: value.kabupaten_id || '',
        district_name: value.kecamatan || '',
        district_code: value.kecamatan_id || '',
        village_name: value.kelurahan || '',
        village_code: value.kelurahan_id || '',
        emergency_contact: value.emergency_contact || '',
        status: (value.account_status === 'inactive'
          ? 'inactive'
          : 'active') as PatientAccountStatus,
        avatarUrl: activePatient?.avatarUrl ?? '',
        registered_at: activePatient?.registered_at || new Date().toISOString(),
        first_login_at: activePatient?.first_login_at || null,
        last_visit_date: activePatient?.last_visit_date || null
      };

      try {
        if (isEdit && activePatient) {
          await updateMutation.mutateAsync({ id: activePatient.id, values: payload });
          toast.success('Data pasien berhasil diperbarui');
          setIsEditing(false);
          onClose();
        } else {
          await createMutation.mutateAsync(payload);
          toast.success('Data pasien berhasil ditambahkan');
          form.reset();
          onClose();
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : isEdit
              ? 'Gagal memperbarui data pasien'
              : 'Gagal menambahkan data pasien';
        toast.error(errorMsg);
      }
    }
  });

  // Sinkronisasi reset formulir dengan data pasien aktif saat modal dibuka
  useEffect(() => {
    if (activePatient && isOpen) {
      form.reset({
        name: activePatient.name ?? '',
        patient_id: activePatient.patient_id ?? '',
        nik: (activePatient.nik ?? '').replace(/^-$/, ''),
        nama_ibu_kandung: (activePatient.mother_name ?? '').replace(/^-$/, ''),
        tempat_lahir: (activePatient.birth_place ?? '').replace(/^-$/, ''),
        pekerjaan: (activePatient.occupation ?? '').replace(/^-$/, ''),
        phone: (activePatient.phone || '').replace(/^-$/, ''),
        email: (activePatient.email || '').replace(/^-$/, ''),
        gender: (activePatient.gender || '') as PatientFormValues['gender'],
        age: activePatient.age ?? 0,
        birth_date: activePatient.birth_date ?? '',
        blood_type: activePatient.blood_type ?? '',
        address: (activePatient.address || '').replace(/^-$/, ''),
        provinsi: activePatient.province_name ?? '',
        provinsi_id: activePatient.province_code ?? '',
        kabupaten: activePatient.regency_name ?? '',
        kabupaten_id: activePatient.regency_code ?? '',
        kecamatan: activePatient.district_name ?? '',
        kecamatan_id: activePatient.district_code ?? '',
        kelurahan: activePatient.village_name ?? '',
        kelurahan_id: activePatient.village_code ?? '',
        alamat_detail: (activePatient.line1 || '').replace(/^-$/, ''),
        emergency_contact: (activePatient.emergency_contact || '').replace(/^-$/, ''),
        account_status: (activePatient.status === 'inactive'
          ? 'inactive'
          : 'active') as PatientAccountStatus
      });
    }
  }, [activePatient, isOpen, form]);

  const handleUnlockEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  return {
    form,
    isEdit,
    isEditing,
    setIsEditing,
    isPending,
    isFetchingDetail,
    activePatient,
    genders,
    bloodTypes,
    occupationOptions,
    handleUnlockEdit,
    handleCancelEdit
  };
}
