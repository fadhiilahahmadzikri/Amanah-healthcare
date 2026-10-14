'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppForm } from '@/components/ui/tanstack-form';
import { patientByIdOptions } from '../api/queries';
import {
  useCreatePatientMutation,
  useUpdatePatientMutation,
} from './usePatientMutations';
import { usePatientFormReferences } from './usePatientFormReferences';
import {
  patientSchema,
  type PatientFormValues,
} from '../schemas/patient-schema';
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
  initialMode = 'view',
}: UsePatientModalFormOptions) {
  const isEdit = Boolean(patient);
  const [isEditing, setIsEditing] = useState<boolean>(!patient || initialMode === 'edit');
  const { genders, bloodTypes, occupations } = usePatientFormReferences();

  const { data: detailData, isLoading: isFetchingDetail } = useQuery({
    ...patientByIdOptions(patient?.id || ''),
    enabled: Boolean(isOpen && patient?.id),
  });

  const activePatient: Patient | null = detailData?.patient ?? patient ?? null;

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
      description: o.description,
    }));
  }, [occupations]);

  const createMutation = useCreatePatientMutation();
  const updateMutation = useUpdatePatientMutation();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useAppForm({
    defaultValues: {
      name: activePatient?.name ?? '',
      patient_id: activePatient?.patient_id ?? '',
      nik: (activePatient?.nik_ktp ?? activePatient?.nik ?? '').replace(/^-$/, ''),
      nama_ibu_kandung: (activePatient?.nama_ibu_kandung ?? '').replace(/^-$/, ''),
      tempat_lahir: (activePatient?.tempat_lahir ?? '').replace(/^-$/, ''),
      pekerjaan: (activePatient?.pekerjaan ?? '').replace(/^-$/, ''),
      phone: (activePatient?.nomor_telepon_wa || activePatient?.phone || '').replace(/^-$/, ''),
      email: (activePatient?.email_pasien || activePatient?.email || '').replace(/^-$/, ''),
      gender: (activePatient?.gender || '') as PatientFormValues['gender'],
      age: activePatient?.age ?? 0,
      birth_date: activePatient?.birth_date ?? activePatient?.tanggal_lahir ?? '',
      blood_type: activePatient?.blood_type ?? '',
      address: (activePatient?.domisili || activePatient?.address || '').replace(/^-$/, ''),
      domisili: (activePatient?.domisili || activePatient?.address || '').replace(/^-$/, ''),
      provinsi: activePatient?.provinsi ?? '',
      provinsi_id: activePatient?.provinsi_id ?? '',
      kabupaten: activePatient?.kabupaten ?? '',
      kabupaten_id: activePatient?.kabupaten_id ?? '',
      kecamatan: activePatient?.kecamatan ?? '',
      kecamatan_id: activePatient?.kecamatan_id ?? '',
      kelurahan: activePatient?.kelurahan ?? '',
      kelurahan_id: activePatient?.kelurahan_id ?? '',
      alamat_detail:
        (activePatient?.alamat_detail || activePatient?.domisili || activePatient?.address || '').replace(/^-$/, ''),
      emergency_contact: (activePatient?.emergency_contact || '').replace(/^-$/, ''),
      account_status: (activePatient?.account_status === 'inactive' ? 'inactive' : 'active') as PatientAccountStatus,
    } as PatientFormValues,
    validators: {
      onSubmit: patientSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isEditing) {
        return;
      }

      const payload: PatientMutationPayload = {
        name: value.name,
        patient_id: value.patient_id,
        nik: value.nik ? value.nik.trim() : '',
        nik_ktp: value.nik ? value.nik.trim() : '',
        nama_ibu_kandung: value.nama_ibu_kandung || '',
        tempat_lahir: value.tempat_lahir || '',
        pekerjaan: value.pekerjaan || '',
        domisili: value.alamat_detail || value.domisili || value.address || '',
        nomor_telepon_wa: value.phone ? value.phone.trim() : '',
        email_pasien: value.email ? value.email.trim() : '',
        phone: value.phone ? value.phone.trim() : '',
        email: value.email ? value.email.trim() : '',
        gender: value.gender as PatientMutationPayload['gender'],
        age: Number(value.age),
        birth_date: value.birth_date,
        tanggal_lahir: value.birth_date,
        blood_type: value.blood_type as PatientMutationPayload['blood_type'],
        address: value.alamat_detail || value.address || '',
        provinsi: value.provinsi || '',
        provinsi_id: value.provinsi_id || '',
        kabupaten: value.kabupaten || '',
        kabupaten_id: value.kabupaten_id || '',
        kecamatan: value.kecamatan || '',
        kecamatan_id: value.kecamatan_id || '',
        kelurahan: value.kelurahan || '',
        kelurahan_id: value.kelurahan_id || '',
        alamat_detail: value.alamat_detail || '',
        emergency_contact: value.emergency_contact || '',
        account_status: value.account_status as PatientMutationPayload['account_status'],
        avatar: activePatient?.avatar ?? '',
        tanggal_registrasi_akun:
          activePatient?.tanggal_registrasi_akun || new Date().toLocaleDateString('id-ID'),
        login_pertama_kali: activePatient?.login_pertama_kali || '',
        kunjungan_terakhir: activePatient?.kunjungan_terakhir || '',
        total_kunjungan: activePatient?.total_kunjungan ?? 0,
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
    },
  });

  // Sinkronisasi reset formulir dengan data pasien aktif saat modal dibuka
  useEffect(() => {
    if (activePatient && isOpen) {
      form.reset({
        name: activePatient.name ?? '',
        patient_id: activePatient.patient_id ?? '',
        nik: (activePatient.nik_ktp ?? activePatient.nik ?? '').replace(/^-$/, ''),
        nama_ibu_kandung: (activePatient.nama_ibu_kandung ?? '').replace(/^-$/, ''),
        tempat_lahir: (activePatient.tempat_lahir ?? '').replace(/^-$/, ''),
        pekerjaan: (activePatient.pekerjaan ?? '').replace(/^-$/, ''),
        phone: (activePatient.nomor_telepon_wa || activePatient.phone || '').replace(/^-$/, ''),
        email: (activePatient.email_pasien || activePatient.email || '').replace(/^-$/, ''),
        gender: (activePatient.gender || '') as PatientFormValues['gender'],
        age: activePatient.age ?? 0,
        birth_date: activePatient.birth_date ?? activePatient.tanggal_lahir ?? '',
        blood_type: activePatient.blood_type ?? '',
        address: (activePatient.domisili || activePatient.address || '').replace(/^-$/, ''),
        domisili: (activePatient.domisili || activePatient.address || '').replace(/^-$/, ''),
        provinsi: activePatient.provinsi ?? '',
        provinsi_id: activePatient.provinsi_id ?? '',
        kabupaten: activePatient.kabupaten ?? '',
        kabupaten_id: activePatient.kabupaten_id ?? '',
        kecamatan: activePatient.kecamatan ?? '',
        kecamatan_id: activePatient.kecamatan_id ?? '',
        kelurahan: activePatient.kelurahan ?? '',
        kelurahan_id: activePatient.kelurahan_id ?? '',
        alamat_detail:
          (activePatient.alamat_detail || activePatient.domisili || activePatient.address || '').replace(/^-$/, ''),
        emergency_contact: (activePatient.emergency_contact || '').replace(/^-$/, ''),
        account_status: (activePatient.account_status === 'inactive' ? 'inactive' : 'active') as PatientAccountStatus,
      });
    }
  }, [activePatient, isOpen]);

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
    handleCancelEdit,
  };
}
