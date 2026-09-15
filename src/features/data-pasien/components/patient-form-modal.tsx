'use client';

import React from 'react';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { createPatientMutation, updatePatientMutation } from '../api/mutations';
import type { Patient, PatientMutationPayload } from '../api/types';
import { toast } from 'sonner';
import { patientSchema, type PatientFormValues } from '../schemas/patient-schema';
import { GENDER_OPTIONS, STATUS_OPTIONS, BLOOD_TYPE_OPTIONS } from '../constants/options';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';

export interface PatientFormModalProps {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientFormModal({ patient, isOpen, onClose }: PatientFormModalProps) {
  const isEdit = !!patient;
  const statusConfig = getStatusConfig(patient?.account_status || 'Aktif');

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
      onClose();
    },
    onError: () => toast.error('Gagal memperbarui data pasien')
  });

  const form = useAppForm({
    defaultValues: {
      name: patient?.name ?? '',
      patient_id: patient?.patient_id ?? '',
      nik: patient?.nik_ktp ?? patient?.nik ?? '',
      nama_ibu_kandung: patient?.nama_ibu_kandung ?? '',
      tempat_lahir: patient?.tempat_lahir ?? '',
      pekerjaan: patient?.pekerjaan ?? '',
      phone: patient?.nomor_telepon_wa ?? patient?.phone ?? '',
      email: patient?.email_pasien ?? patient?.email ?? '',
      gender: patient?.gender ?? ('' as PatientFormValues['gender']),
      age: patient?.age ?? 0,
      birth_date: patient?.birth_date ?? '',
      blood_type: (patient?.blood_type as Patient['blood_type']) ?? '',
      address: patient?.domisili ?? patient?.address ?? '',
      domisili: patient?.domisili ?? patient?.address ?? '',
      emergency_contact: patient?.emergency_contact ?? '',
      allergies: (patient?.allergies ?? []).join(', '),
      medical_history: patient?.medical_history ?? '',
      account_status:
        patient?.account_status === 'NONAKTIF' || patient?.account_status === 'Nonaktif'
          ? 'Nonaktif'
          : 'Aktif'
    } as PatientFormValues,
    validators: {
      onSubmit: patientSchema
    },
    onSubmit: async ({ value }) => {
      const normalizedStatus =
        value.account_status.toUpperCase() === 'NONAKTIF' ? 'Nonaktif' : 'Aktif';

      const payload: PatientMutationPayload = {
        name: value.name,
        patient_id: value.patient_id,
        nik: value.nik,
        nik_ktp: value.nik,
        nama_ibu_kandung: value.nama_ibu_kandung || '',
        tempat_lahir: value.tempat_lahir || '',
        pekerjaan: value.pekerjaan || '',
        domisili: value.address,
        nomor_telepon_wa: value.phone,
        email_pasien: value.email || '',
        phone: value.phone,
        email: value.email || '',
        gender: value.gender,
        age: Number(value.age),
        birth_date: value.birth_date,
        tanggal_lahir: value.birth_date,
        blood_type: value.blood_type,
        address: value.address,
        avatar: patient?.avatar ?? '',
        allergies: value.allergies
          ? value.allergies
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        emergency_contact: value.emergency_contact || '',
        medical_history: value.medical_history || '',
        account_status: normalizedStatus,
        tanggal_registrasi_akun:
          patient?.tanggal_registrasi_akun || new Date().toLocaleDateString('id-ID'),
        login_pertama_kali: patient?.login_pertama_kali || '',
        kunjungan_terakhir: patient?.kunjungan_terakhir || '',
        total_kunjungan: patient?.total_kunjungan ?? 0
      };

      if (isEdit && patient) {
        await updateMutation.mutateAsync({ id: patient.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<PatientFormValues>();

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[880px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-3.5'>
        {/* 1. Modal Header */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {isEdit ? `Edit Data Pasien: ${patient?.name}` : 'Tambah Pasien Baru'}
            </h3>
            <p className='text-xs text-muted-foreground'>
              Formulir pembaruan rekam medis dan data demografi pasien klinik Amanah.
            </p>
          </div>

          {/* Status Badge in Top-Right Position (Harmonized with Janji Temu Cards) */}
          <div className='shrink-0 pt-0.5'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm select-none shadow-none',
                statusConfig.pillBg,
                statusConfig.pillBorder
              )}
            >
              <span
                className={cn(
                  'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                  statusConfig.dotGradient
                )}
              />
              <span
                className={cn(
                  'bg-clip-text text-transparent font-bold tracking-tight',
                  statusConfig.textGradient
                )}
              >
                {statusConfig.label}
              </span>
            </span>
          </div>
        </div>

        {/* 2. Landscape 2-Column Grid Form (No Boxed Wrapper, No Icon on Section Heading, Title Case) */}
        <form.AppForm>
          <form.Form id='patient-modal-form' className='p-0 space-y-0'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 pt-1'>
              {/* Kolom 1: Data Demografis & Identitas */}
              <div className='space-y-2.5'>
                <span className='text-xs font-normal text-muted-foreground block mb-2 pb-1 border-b border-border/40'>
                  Data Demografis & Identitas
                </span>

                <div className='grid grid-cols-2 gap-2.5'>
                  <FormTextField
                    name='patient_id'
                    label='No. Rekam Medis'
                    required
                    placeholder='RM-2026-0001'
                  />
                  <FormTextField
                    name='nik'
                    label='NIK (KTP)'
                    required
                    placeholder='3201xxxxxxxxxxxx'
                  />
                </div>

                <FormTextField
                  name='name'
                  label='Nama Lengkap Pasien'
                  required
                  placeholder='Nama lengkap pasien sesuai KTP'
                />

                <div className='grid grid-cols-2 gap-2.5'>
                  <FormTextField
                    name='nama_ibu_kandung'
                    label='Nama Ibu Kandung'
                    placeholder='Nama ibu kandung'
                  />
                  <FormTextField
                    name='pekerjaan'
                    label='Pekerjaan'
                    placeholder='Contoh: Wiraswasta'
                  />
                </div>

                <div className='grid grid-cols-2 gap-2.5'>
                  <FormTextField
                    name='tempat_lahir'
                    label='Tempat Lahir'
                    placeholder='Kota kelahiran'
                  />
                  <FormTextField
                    name='birth_date'
                    label='Tanggal Lahir'
                    required
                    type='text'
                    placeholder='YYYY-MM-DD'
                  />
                </div>

                <div className='grid grid-cols-3 gap-2'>
                  <FormSelectField
                    name='gender'
                    label='Jenis Kelamin'
                    required
                    options={GENDER_OPTIONS}
                    placeholder='Pilih'
                  />
                  <FormTextField
                    name='age'
                    label='Umur (Tahun)'
                    required
                    type='number'
                    placeholder='40'
                  />
                  <FormSelectField
                    name='blood_type'
                    label='Golongan Darah'
                    required
                    options={BLOOD_TYPE_OPTIONS}
                    placeholder='Pilih'
                  />
                </div>
              </div>

              {/* Kolom 2: Kontak, Domisili & Akun */}
              <div className='space-y-2.5'>
                <span className='text-xs font-normal text-muted-foreground block mb-2 pb-1 border-b border-border/40'>
                  Kontak, Domisili & Riwayat Akun
                </span>

                <div className='grid grid-cols-2 gap-2.5'>
                  <FormTextField
                    name='phone'
                    label='No. Telepon / WhatsApp'
                    required
                    type='tel'
                    placeholder='0812-3456-7890'
                  />
                  <FormTextField
                    name='email'
                    label='Email Pasien'
                    type='email'
                    placeholder='pasien@email.com'
                  />
                </div>

                <FormTextField
                  name='address'
                  label='Alamat Domisili Lengkap'
                  required
                  placeholder='Jl. Alamat lengkap domisili pasien...'
                />

                <div className='grid grid-cols-2 gap-2.5'>
                  <FormSelectField
                    name='account_status'
                    label='Status Akun'
                    required
                    options={STATUS_OPTIONS}
                    placeholder='Pilih Status'
                  />
                  <FormTextField
                    name='emergency_contact'
                    label='Kontak Darurat'
                    placeholder='Nama & nomor kerabat'
                  />
                </div>

                <FormTextField
                  name='allergies'
                  label='Riwayat Alergi (Pisahkan Koma)'
                  placeholder='Contoh: Penicillin, Seafood, Debu'
                />

                <FormTextField
                  name='medical_history'
                  label='Catatan Riwayat Medis / Diagnosis'
                  placeholder='Hipertensi, Riwayat Jantung, dll...'
                />
              </div>
            </div>
          </form.Form>
        </form.AppForm>

        {/* 3. Modal Footer Action Buttons */}
        <div className='pt-2.5 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-6 font-medium'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            form='patient-modal-form'
            disabled={isPending}
            className='px-7 font-semibold'
          >
            {isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pasien'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
