'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createPatientMutation, updatePatientMutation } from '../api/mutations';
import { patientByIdOptions } from '../api/queries';
import type { Patient, PatientMutationPayload } from '../api/types';
import { toast } from 'sonner';
import { patientSchema, type PatientFormValues } from '../schemas/patient-schema';
import { usePatientFormReferences } from '../model/usePatientFormReferences';
import { cn } from '@/lib/utils';
import { PatientLineInput } from './registration/atoms/patient-line-input';
import { Switch } from '@/components/ui/switch';
import { PatientBirthdatePicker } from './registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from './registration/molecules/patient-gender-selector';
import { PatientBloodTypeSelector } from './registration/molecules/patient-blood-type-selector';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from './registration/molecules/patient-region-dropdown';
import {
  PatientSearchableSelect,
  type PatientSearchableSelectOption
} from './registration/molecules/patient-searchable-select';

export interface PatientModalProps {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'view' | 'edit';
}

function getErrorMessage(errors: unknown[]): string | undefined {
  if (!errors || errors.length === 0) return undefined;
  const first = errors[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'message' in first) {
    return String((first as { message: unknown }).message);
  }
  return undefined;
}

export function PatientModal({
  patient,
  isOpen,
  onClose,
  initialMode = 'view'
}: PatientModalProps) {
  const isEdit = Boolean(patient);
  const [isEditing, setIsEditing] = useState<boolean>(!patient || initialMode === 'edit');
  const { genders, bloodTypes, occupations } = usePatientFormReferences();

  const { data: detailData, isLoading: isFetchingDetail } = useQuery({
    ...patientByIdOptions(patient?.id || ''),
    enabled: Boolean(isOpen && patient?.id)
  });

  const activePatient: Patient | null = detailData?.patient ?? patient ?? null;

  // Sync edit mode when modal opens or patient changes
  useEffect(() => {
    if (isOpen) {
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

  const createMutation = useMutation({
    ...createPatientMutation,
    onSuccess: () => {
      toast.success('Data pasien berhasil ditambahkan');
      onClose();
      form.reset();
    },
    onError: () => toast.error('Gagal menambahkan data pasien')
  });

  const updateMutation = useMutation({
    ...updatePatientMutation,
    onSuccess: () => {
      toast.success('Data pasien berhasil diperbarui');
      setIsEditing(false);
      onClose();
    },
    onError: () => toast.error('Gagal memperbarui data pasien')
  });

  const form = useAppForm({
    defaultValues: {
      name: activePatient?.name ?? '',
      patient_id: activePatient?.patient_id ?? '',
      nik: activePatient?.nik_ktp ?? activePatient?.nik ?? '',
      nama_ibu_kandung: activePatient?.nama_ibu_kandung ?? '',
      tempat_lahir: activePatient?.tempat_lahir ?? '',
      pekerjaan: activePatient?.pekerjaan ?? '',
      phone: activePatient?.nomor_telepon_wa ?? activePatient?.phone ?? '',
      email: activePatient?.email_pasien ?? activePatient?.email ?? '',
      gender: (activePatient?.gender || '') as PatientFormValues['gender'],
      age: activePatient?.age ?? 0,
      birth_date: activePatient?.birth_date ?? activePatient?.tanggal_lahir ?? '',
      blood_type: activePatient?.blood_type ?? '',
      address: activePatient?.domisili ?? activePatient?.address ?? '',
      domisili: activePatient?.domisili ?? activePatient?.address ?? '',
      provinsi: activePatient?.provinsi ?? '',
      provinsi_id: activePatient?.provinsi_id ?? '',
      kabupaten: activePatient?.kabupaten ?? '',
      kabupaten_id: activePatient?.kabupaten_id ?? '',
      kecamatan: activePatient?.kecamatan ?? '',
      kecamatan_id: activePatient?.kecamatan_id ?? '',
      kelurahan: activePatient?.kelurahan ?? '',
      kelurahan_id: activePatient?.kelurahan_id ?? '',
      alamat_detail:
        activePatient?.alamat_detail ?? activePatient?.domisili ?? activePatient?.address ?? '',
      emergency_contact: activePatient?.emergency_contact ?? '',
      account_status: activePatient?.account_status === 'Nonaktif' ? 'Nonaktif' : 'Aktif'
    } as PatientFormValues,
    validators: {
      onSubmit: patientSchema
    },
    onSubmit: async ({ value }) => {
      const payload: PatientMutationPayload = {
        name: value.name,
        patient_id: value.patient_id,
        nik: value.nik,
        nik_ktp: value.nik,
        nama_ibu_kandung: value.nama_ibu_kandung || '',
        tempat_lahir: value.tempat_lahir || '',
        pekerjaan: value.pekerjaan || '',
        domisili: value.alamat_detail || value.domisili || value.address || '',
        nomor_telepon_wa: value.phone,
        email_pasien: value.email || '',
        phone: value.phone,
        email: value.email || '',
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
        total_kunjungan: activePatient?.total_kunjungan ?? 0
      };

      if (isEdit && activePatient) {
        await updateMutation.mutateAsync({ id: activePatient.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  useEffect(() => {
    if (activePatient && isOpen) {
      form.reset({
        name: activePatient.name ?? '',
        patient_id: activePatient.patient_id ?? '',
        nik: activePatient.nik_ktp ?? activePatient.nik ?? '',
        nama_ibu_kandung: activePatient.nama_ibu_kandung ?? '',
        tempat_lahir: activePatient.tempat_lahir ?? '',
        pekerjaan: activePatient.pekerjaan ?? '',
        phone: activePatient.nomor_telepon_wa ?? activePatient.phone ?? '',
        email: activePatient.email_pasien ?? activePatient.email ?? '',
        gender: (activePatient.gender || '') as PatientFormValues['gender'],
        age: activePatient.age ?? 0,
        birth_date: activePatient.birth_date ?? activePatient.tanggal_lahir ?? '',
        blood_type: activePatient.blood_type ?? '',
        address: activePatient.domisili ?? activePatient.address ?? '',
        domisili: activePatient.domisili ?? activePatient.address ?? '',
        provinsi: activePatient.provinsi ?? '',
        provinsi_id: activePatient.provinsi_id ?? '',
        kabupaten: activePatient.kabupaten ?? '',
        kabupaten_id: activePatient.kabupaten_id ?? '',
        kecamatan: activePatient.kecamatan ?? '',
        kecamatan_id: activePatient.kecamatan_id ?? '',
        kelurahan: activePatient.kelurahan ?? '',
        kelurahan_id: activePatient.kelurahan_id ?? '',
        alamat_detail:
          activePatient.alamat_detail ?? activePatient.domisili ?? activePatient.address ?? '',
        emergency_contact: activePatient.emergency_contact ?? '',
        account_status: activePatient.account_status === 'Nonaktif' ? 'Nonaktif' : 'Aktif'
      });
    }
  }, [activePatient, isOpen]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      className='max-h-[90vh] h-[90vh] flex flex-col p-6 sm:p-7 overflow-hidden'
      showCloseButton={false}
    >
      <div className='relative font-sans flex flex-col min-h-0 flex-1 h-full'>
        {/* 1. Modal Header (Pinned) */}
        <div className='shrink-0 pb-3.5 border-b border-border/40 flex items-start justify-between gap-4'>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span>
                {!patient ? 'Tambah Pasien Baru' : (activePatient?.name || 'Data Pasien')}
              </span>
              {isFetchingDetail && (
                <Icons.spinner className='size-3.5 animate-spin text-primary' />
              )}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {isEditing
                ? 'Perbarui data rekam medis dan informasi demografi pasien klinik Amanah.'
                : 'Informasi lengkap rekam medis dan data demografi pasien klinik Amanah.'}
            </p>
          </div>

          {/* Afiliasi pill in top-right position (replacing the status pill) */}
          <div className='shrink-0 pt-0.5'>
            {activePatient?.master_patient_name ? (
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'>
                Afiliasi ({activePatient.relation_label || activePatient.relationship_type || 'Keluarga'}) dari {activePatient.master_patient_name}
              </span>
            ) : (activePatient?.affiliate_count ?? 0) > 0 ? (
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
                Akun Utama ({activePatient?.affiliate_count} Afiliasi)
              </span>
            ) : null}
          </div>
        </div>

        {/* 2. Modal Body / Content (Scrollable - footer will never sink) */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 pr-1'>
          <form.AppForm>
            <form.Form id='patient-modal-form' className='p-0 space-y-0'>
              <div
                className={cn(
                  'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1 transition-opacity duration-150',
                  !isEditing && 'pointer-events-none select-text'
                )}
              >
              {/* Kolom 1: Identitas & Kelahiran */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas & Kelahiran
                </span>

                <div className='grid grid-cols-2 gap-4'>
                  <form.AppField name='patient_id'>
                    {(field) => (
                      <PatientLineInput
                        id='patient_id'
                        label='No. Rekam Medis'
                        placeholder='RM-2026-0001'
                        value={field.state.value}
                        onChange={() => {}}
                        disabled
                        isMonospace
                      />
                    )}
                  </form.AppField>

                  <form.AppField name='nik'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientLineInput
                          id='nik'
                          label='NIK KTP (16 Digit)'
                          placeholder='3201xxxxxxxxxxxx'
                          value={field.state.value}
                          onChange={(val) => {
                            const numericOnly = val.replace(/\D/g, '').slice(0, 16);
                            field.handleChange(numericOnly);
                          }}
                          onBlur={field.handleBlur}
                          error={error}
                          maxLength={16}
                          inputMode='numeric'
                          isMonospace
                          autoComplete='off'
                        />
                      );
                    }}
                  </form.AppField>
                </div>

                <form.AppField name='name'>
                  {(field) => {
                    const error = field.state.meta.isTouched
                      ? getErrorMessage(field.state.meta.errors)
                      : undefined;
                    return (
                      <PatientLineInput
                        id='name'
                        label='Nama Lengkap Pasien'
                        placeholder='Nama lengkap pasien sesuai KTP'
                        value={field.state.value}
                        onChange={(val) => field.handleChange(val)}
                        onBlur={field.handleBlur}
                        error={error}
                        autoComplete='name'
                      />
                    );
                  }}
                </form.AppField>

                <div className='grid grid-cols-2 gap-4'>
                  <form.AppField name='nama_ibu_kandung'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientLineInput
                          id='nama_ibu_kandung'
                          label='Nama Ibu Kandung'
                          placeholder='Nama ibu kandung'
                          value={field.state.value ?? ''}
                          onChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          error={error}
                          autoComplete='off'
                        />
                      );
                    }}
                  </form.AppField>

                  <form.AppField name='tempat_lahir'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientLineInput
                          id='tempat_lahir'
                          label='Tempat Lahir (Sesuai KTP)'
                          placeholder='Kota kelahiran'
                          value={field.state.value ?? ''}
                          onChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          error={error}
                          autoComplete='off'
                        />
                      );
                    }}
                  </form.AppField>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <form.AppField name='birth_date'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientBirthdatePicker
                          id='birth_date'
                          label='Tanggal Lahir'
                          placeholder='Pilih tanggal lahir...'
                          value={field.state.value}
                          onChange={(iso) => {
                            field.handleChange(iso);
                            field.handleBlur();
                            if (iso) {
                              const birth = new Date(iso);
                              const now = new Date();
                              let calculatedAge = now.getFullYear() - birth.getFullYear();
                              const monthDiff = now.getMonth() - birth.getMonth();
                              if (
                                monthDiff < 0 ||
                                (monthDiff === 0 && now.getDate() < birth.getDate())
                              ) {
                                calculatedAge--;
                              }
                              if (!isNaN(calculatedAge) && calculatedAge >= 0) {
                                form.setFieldValue('age', calculatedAge);
                              }
                            }
                          }}
                          error={error}
                        />
                      );
                    }}
                  </form.AppField>

                  <form.AppField name='age'>
                    {(field) => (
                      <PatientLineInput
                        id='age'
                        label='Usia (Tahun)'
                        value={field.state.value !== undefined ? String(field.state.value) : ''}
                        onChange={(val) => form.setFieldValue('age', Number(val) || 0)}
                        type='number'
                        placeholder='Otomatis dari tanggal lahir'
                      />
                    )}
                  </form.AppField>
                </div>

                {/* Jenis Kelamin */}
                <div className='space-y-1.5'>
                  <span className='text-xs font-medium text-foreground block'>
                    Jenis Kelamin <span className='text-destructive'>*</span>
                  </span>
                  <form.AppField name='gender'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientGenderSelector
                          value={field.state.value}
                          onChange={(val) => {
                            field.handleChange(val as PatientFormValues['gender']);
                            field.handleBlur();
                          }}
                          options={genders}
                          error={error}
                        />
                      );
                    }}
                  </form.AppField>
                </div>

                {/* Golongan Darah */}
                <form.AppField name='blood_type'>
                  {(field) => {
                    const error = field.state.meta.isTouched
                      ? getErrorMessage(field.state.meta.errors)
                      : undefined;
                    return (
                      <PatientBloodTypeSelector
                        id='patient_blood_type'
                        label='Golongan Darah'
                        required
                        placeholder='Pilih golongan darah...'
                        value={field.state.value}
                        onChange={(val) => {
                          field.handleChange(val);
                          field.handleBlur();
                        }}
                        options={bloodTypes}
                        error={error}
                      />
                    );
                  }}
                </form.AppField>
              </div>

              {/* Kolom 2: Pekerjaan, Domisili & Akun */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Pekerjaan, Domisili & Kontak
                </span>

                {/* Pekerjaan */}
                <form.AppField name='pekerjaan'>
                  {(field) => {
                    const error = field.state.meta.isTouched
                      ? getErrorMessage(field.state.meta.errors)
                      : undefined;
                    return (
                      <PatientSearchableSelect
                        id='pekerjaan'
                        label='Pekerjaan'
                        value={field.state.value ?? ''}
                        placeholder='Pilih pekerjaan...'
                        options={occupationOptions}
                        onSelect={(item) => {
                          field.handleChange(item.name);
                          field.handleBlur();
                        }}
                        searchPlaceholder='Cari pekerjaan...'
                        error={error}
                      />
                    );
                  }}
                </form.AppField>

                {/* Domisili / Regional Cascader */}
                <div className='space-y-2 pt-1'>
                  <span className='text-xs font-medium text-foreground block'>
                    Domisili & Alamat
                  </span>
                  <form.Subscribe selector={(state) => state.values}>
                    {(values) => {
                      const regionValues: PatientRegionValues = {
                        provinsi: values.provinsi ?? '',
                        provinsiId: values.provinsi_id ?? '',
                        kabupaten: values.kabupaten ?? '',
                        kabupatenId: values.kabupaten_id ?? '',
                        kecamatan: values.kecamatan ?? '',
                        kecamatanId: values.kecamatan_id ?? '',
                        kelurahan: values.kelurahan ?? '',
                        kelurahanId: values.kelurahan_id ?? '',
                        alamatDetail: values.alamat_detail ?? ''
                      };

                      return (
                        <PatientRegionDropdown
                          values={regionValues}
                          onChange={(updates) => {
                            if (updates.provinsi !== undefined)
                              form.setFieldValue('provinsi', updates.provinsi);
                            if (updates.provinsiId !== undefined)
                              form.setFieldValue('provinsi_id', updates.provinsiId);
                            if (updates.kabupaten !== undefined)
                              form.setFieldValue('kabupaten', updates.kabupaten);
                            if (updates.kabupatenId !== undefined)
                              form.setFieldValue('kabupaten_id', updates.kabupatenId);
                            if (updates.kecamatan !== undefined)
                              form.setFieldValue('kecamatan', updates.kecamatan);
                            if (updates.kecamatanId !== undefined)
                              form.setFieldValue('kecamatan_id', updates.kecamatanId);
                            if (updates.kelurahan !== undefined)
                              form.setFieldValue('kelurahan', updates.kelurahan);
                            if (updates.kelurahanId !== undefined)
                              form.setFieldValue('kelurahan_id', updates.kelurahanId);
                            if (updates.alamatDetail !== undefined) {
                              form.setFieldValue('alamat_detail', updates.alamatDetail);
                              form.setFieldValue('address', updates.alamatDetail);
                              form.setFieldValue('domisili', updates.alamatDetail);
                            }
                          }}
                        />
                      );
                    }}
                  </form.Subscribe>
                </div>

                {/* Kontak */}
                <div className='grid grid-cols-2 gap-4'>
                  <form.AppField name='phone'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientLineInput
                          id='phone'
                          label='No. Telepon / WhatsApp'
                          type='tel'
                          placeholder='0812-3456-7890'
                          value={field.state.value}
                          onChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          error={error}
                          autoComplete='tel'
                        />
                      );
                    }}
                  </form.AppField>

                  <form.AppField name='email'>
                    {(field) => {
                      const error = field.state.meta.isTouched
                        ? getErrorMessage(field.state.meta.errors)
                        : undefined;
                      return (
                        <PatientLineInput
                          id='email'
                          label='Email Pasien'
                          type='email'
                          placeholder='pasien@email.com'
                          value={field.state.value}
                          onChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          error={error}
                          autoComplete='email'
                        />
                      );
                    }}
                  </form.AppField>
                </div>

                <form.AppField name='emergency_contact'>
                  {(field) => {
                    const error = field.state.meta.isTouched
                      ? getErrorMessage(field.state.meta.errors)
                      : undefined;
                    return (
                      <PatientLineInput
                        id='emergency_contact'
                        label='Kontak Darurat (Nama & Nomor Kerabat)'
                        placeholder='Contoh: Siti (Ibu) - 08123456789'
                        value={field.state.value ?? ''}
                        onChange={(val) => field.handleChange(val)}
                        onBlur={field.handleBlur}
                        error={error}
                      />
                    );
                  }}
                </form.AppField>

                {/* Status Akun Pasien (Switch Minimalist Tanpa Wrap) */}
                <form.AppField name='account_status'>
                  {(field) => {
                    const isActive = field.state.value === 'Aktif';
                    return (
                      <div className='flex items-center justify-between pt-2 select-none'>
                        <div className='space-y-0.5'>
                          <label
                            htmlFor='account_status_switch'
                            className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                          >
                            <span>Status Akun Pasien</span>
                            <span
                              className={cn(
                                'text-[11px] font-semibold',
                                isActive
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-muted-foreground'
                              )}
                            >
                              ({isActive ? 'Aktif' : 'Nonaktif'})
                            </span>
                          </label>
                          <p className='text-[11px] text-muted-foreground'>
                            {isActive
                              ? 'Akun aktif untuk janji temu dan pelayanan klinik.'
                              : 'Akun dinonaktifkan sementara dari sistem.'}
                          </p>
                        </div>
                        <Switch
                          id='account_status_switch'
                          checked={isActive}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked ? 'Aktif' : 'Nonaktif')
                          }
                          aria-label='Status Akun Pasien'
                        />
                      </div>
                    );
                  }}
                </form.AppField>
              </div>
            </div>
          </form.Form>
        </form.AppForm>
        </div>

        {/* 3. Modal Footer (Pinned at Bottom, no border-t, simple split) */}
        <div className='shrink-0 pt-3 flex items-center justify-end gap-2.5'>
          {!isEditing ? (
            <>
              <Button
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                onClick={onClose}
                className='px-6 font-semibold cursor-pointer'
              >
                Tutup
              </Button>
              <Button
                type='button'
                variant='default'
                size='md'
                shape='pill'
                onClick={() => setIsEditing(true)}
                className='px-6 font-semibold cursor-pointer'
              >
                <Icons.edit className='mr-1.5 size-3.5' />
                Edit Pasien
              </Button>
            </>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                onClick={() => {
                  if (isEdit) {
                    setIsEditing(false);
                  } else {
                    onClose();
                  }
                }}
                className='px-6 font-semibold cursor-pointer'
              >
                Batal
              </Button>
              <Button
                type='submit'
                variant='default'
                size='md'
                shape='pill'
                form='patient-modal-form'
                disabled={isPending}
                className='px-7 font-semibold cursor-pointer'
              >
                {isPending ? (
                  <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                ) : (
                  <Icons.check className='mr-1.5 size-3.5' />
                )}
                {isEdit ? 'Simpan Perubahan' : 'Tambah Pasien'}
              </Button>
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

// Export aliases for backwards compatibility with any other callers
export { PatientModal as PatientFormModal };
