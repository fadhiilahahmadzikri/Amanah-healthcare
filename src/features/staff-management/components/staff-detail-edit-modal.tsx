'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { StaffMember, staffManagementApi } from '../api/staff-management.api';

export interface StaffDetailEditModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StaffDetailEditModal({
  staff,
  isOpen,
  onClose,
  onSuccess
}: StaffDetailEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Core State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profession: '',
    birthPlace: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    nationalId: '',
    isActive: true
  });

  // Region / Domisili State
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

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    if (!formData.fullName.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const fullAddress = [
        regionValues.alamatDetail,
        regionValues.kelurahan ? `Kel. ${regionValues.kelurahan}` : null,
        regionValues.kecamatan ? `Kec. ${regionValues.kecamatan}` : null,
        regionValues.kabupaten,
        regionValues.provinsi
      ]
        .filter(Boolean)
        .join(', ');

      await staffManagementApi.updateStaff(staff.id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
        profession: formData.profession.trim() || 'Staf Operasional',
        birthPlace: formData.birthPlace.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        nationalId: formData.nationalId.trim() || undefined,
        isActive: formData.isActive,
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
      });

      toast.success(`Data staf ${formData.fullName} berhasil diperbarui.`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui data staf.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!staff) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-4xl w-[95vw]'
      showCloseButton={false}
      className='max-h-[90vh] flex flex-col p-5 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <Icons.user className='size-4 text-primary shrink-0' />
              <span className='truncate'>{formData.fullName || 'Detail Staf'}</span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Lihat dan perbarui informasi profil, identitas, dan domisili staf operasional klinik.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <StatusBadge
              status={formData.isActive ? 'active' : 'inactive'}
              label={formData.isActive ? 'Aktif' : 'Non-Aktif'}
              size='sm'
            />
            <button
              type='button'
              onClick={onClose}
              className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            >
              <Icons.close className='size-4' />
            </button>
          </div>
        </div>

        {/* Scrollable Body - Form Reguler 2 Columns */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          <form id='staff-detail-form' onSubmit={handleSubmit} className='p-0 space-y-0'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-1'>
              {/* Kolom 1: Identitas & Kelahiran */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas & Kelahiran
                </span>

                <PatientLineInput
                  id='staff_nationalId'
                  label='NIK KTP (16 Digit)'
                  placeholder='3201xxxxxxxxxxxx'
                  value={formData.nationalId}
                  onChange={(val) => {
                    const numericOnly = val.replace(/\D/g, '').slice(0, 16);
                    handleChange('nationalId', numericOnly);
                  }}
                  maxLength={16}
                  inputMode='numeric'
                  isMonospace
                  autoComplete='off'
                />

                <PatientLineInput
                  id='staff_fullName'
                  label='Nama Lengkap Staf *'
                  placeholder='Nama lengkap staf operasional'
                  value={formData.fullName}
                  onChange={(val) => handleChange('fullName', val)}
                  required
                  autoComplete='name'
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='staff_birthPlace'
                    label='Tempat Lahir'
                    placeholder='Kota kelahiran'
                    value={formData.birthPlace}
                    onChange={(val) => handleChange('birthPlace', val)}
                  />

                  <PatientBirthdatePicker
                    id='staff_birthDate'
                    label='Tanggal Lahir'
                    placeholder='Pilih tanggal...'
                    value={formData.birthDate}
                    onChange={(val) => handleChange('birthDate', val)}
                  />
                </div>

                <PatientGenderSelector
                  id='staff_gender'
                  label='Jenis Kelamin'
                  variant='dropdown'
                  value={formData.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
                  onChange={(val) => {
                    const isFemale = val === 'Perempuan' || val === 'female' || val === 'P';
                    handleChange('gender', isFemale ? 'female' : 'male');
                  }}
                />
              </div>

              {/* Kolom 2: Pekerjaan, Domisili & Kontak */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Pekerjaan, Domisili & Kontak
                </span>

                <PatientLineInput
                  id='staff_profession'
                  label='Jabatan / Posisi Kerja'
                  placeholder='Staf IT, Front Desk, CS, dll.'
                  value={formData.profession}
                  onChange={(val) => handleChange('profession', val)}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='staff_phoneNumber'
                    label='No. Telepon / WhatsApp'
                    type='tel'
                    placeholder='0812-3456-7890'
                    value={formData.phoneNumber}
                    onChange={(val) => handleChange('phoneNumber', val)}
                    autoComplete='tel'
                  />

                  <PatientLineInput
                    id='staff_email'
                    label='Email Staf'
                    type='email'
                    placeholder='staf@amanah.clinic'
                    value={formData.email}
                    onChange={(val) => handleChange('email', val)}
                    autoComplete='email'
                  />
                </div>

                {/* Domisili / Regional Cascader */}
                <div className='space-y-2 pt-1'>
                  <span className='text-xs font-medium text-foreground block'>
                    Domisili & Alamat
                  </span>
                  <PatientRegionDropdown
                    values={regionValues}
                    onChange={(updates) => setRegionValues((prev) => ({ ...prev, ...updates }))}
                  />
                </div>

                {/* Status Operasional Staf (Switcher dengan StatusBadge) */}
                <div className='flex items-center justify-between pt-2 select-none border-t border-border/40'>
                  <div className='space-y-0.5'>
                    <label
                      htmlFor='staff_active_switch'
                      className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                    >
                      <span>Status Operasional Staf</span>
                      <StatusBadge
                        status={formData.isActive ? 'active' : 'inactive'}
                        label={formData.isActive ? 'Aktif' : 'Non-Aktif'}
                        size='sm'
                      />
                    </label>
                    <p className='text-[11px] text-muted-foreground'>
                      {formData.isActive
                        ? 'Staf aktif dalam operasional dan penugasan roster klinik.'
                        : 'Staf dinonaktifkan sementara dari sistem klinik.'}
                    </p>
                  </div>
                  <Switch
                    id='staff_active_switch'
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                    aria-label='Status Operasional Staf'
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            shape='pill'
            onClick={onClose}
            disabled={isSubmitting}
            className='px-5 text-xs font-semibold'
          >
            Batal
          </Button>
          <Button
            type='submit'
            form='staff-detail-form'
            size='sm'
            shape='pill'
            disabled={isSubmitting}
            className='px-6 text-xs font-semibold'
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className='size-3.5 mr-1.5 animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <Icons.check className='size-3.5 mr-1.5' />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
