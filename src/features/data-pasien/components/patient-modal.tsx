'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Patient } from '../api/types';
import { usePatientModalForm } from '../model/usePatientModalForm';
import { PatientModalIdentityFields } from './patient-modal-identity-fields';
import { PatientModalContactFields } from './patient-modal-contact-fields';
import { StatusBadge } from '@/components/ui/status-badge';
import { getRelationshipLabel } from './patient-tables/columns-helpers';

export interface PatientModalProps {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'view' | 'edit';
}

/**
 * Komponen modal tampilan detail dan penyuntingan data rekam medis pasien.
 * Arsitektur berbasis Presentational Shell yang mengonsumsi hook usePatientModalForm.
 */
export function PatientModal({
  patient,
  isOpen,
  onClose,
  initialMode = 'view',
}: PatientModalProps) {
  const {
    form,
    isEdit,
    isEditing,
    isPending,
    isFetchingDetail,
    activePatient,
    genders,
    bloodTypes,
    occupationOptions,
    handleUnlockEdit,
    handleCancelEdit,
  } = usePatientModalForm({
    patient,
    isOpen,
    onClose,
    initialMode,
  });

  const subtitleText = (() => {
    if (isEditing) {
      return isEdit ? 'Perbarui data rekam medis pasien' : 'Pendaftaran rekam medis baru';
    }
    if (activePatient?.master_patient_name) {
      const rel = getRelationshipLabel(activePatient.relationship_type, activePatient.relation_label);
      return `${rel} dari ${activePatient.master_patient_name}`;
    }
    if ((activePatient?.affiliate_count ?? 0) > 0) {
      return `Akun Utama (${activePatient?.affiliate_count} Afiliasi)`;
    }
    return 'Rekam medis pasien';
  })();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      className='max-h-[90vh] h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
    >
      <div className='relative font-sans flex flex-col min-h-0 flex-1 h-full'>
        {/* 1. Modal Header (Pinned) - Fused Clean Subtitle, No Bulky Pills */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span className='truncate'>
                {!patient ? 'Tambah Pasien Baru' : (activePatient?.name || 'Data Pasien')}
              </span>
              {isFetchingDetail && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              {subtitleText}
            </p>
          </div>

          {/* Status Akun Ringkas di Pojok Kanan Atas */}
          {activePatient?.account_status && (
            <div className='shrink-0 pt-0.5'>
              <StatusBadge status={activePatient.account_status} size='sm' />
            </div>
          )}
        </div>

        {/* 2. Modal Body / Content (Scrollable) */}
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
                <PatientModalIdentityFields
                  form={form}
                  genders={genders}
                  bloodTypes={bloodTypes}
                />

                {/* Kolom 2: Pekerjaan, Domisili & Kontak */}
                <PatientModalContactFields
                  form={form}
                  occupationOptions={occupationOptions}
                />
              </div>
            </form.Form>
          </form.AppForm>
        </div>

        {/* 3. Modal Footer (Pinned at Bottom) */}
        <div className='shrink-0 pt-3 flex items-center justify-end gap-2.5'>
          {!isEditing ? (
            <>
              <Button
                key='btn-view-close'
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
                key='btn-view-unlock-edit'
                type='button'
                variant='default'
                size='md'
                shape='pill'
                onClick={handleUnlockEdit}
                className='px-6 font-semibold cursor-pointer'
              >
                <Icons.edit className='mr-1.5 size-3.5' />
                Edit Pasien
              </Button>
            </>
          ) : (
            <>
              <Button
                key='btn-edit-cancel'
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                onClick={handleCancelEdit}
                className='px-6 font-semibold cursor-pointer'
              >
                Batal
              </Button>
              <Button
                key='btn-edit-submit'
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

// Export aliases for backwards compatibility with any existing callers
export { PatientModal as PatientFormModal };
export type { PatientModalProps as PatientFormModalProps };
