'use client';

import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import { PatientRegionDropdown } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../api/types';
import { useDoctorDetailEditModal } from '../model/useDoctorDetailEditModal';
import { getDoctorCardStatus } from '../utils/doctor-schedule-card-utils';

export interface DoctorDetailEditModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DoctorDetailEditModal(props: DoctorDetailEditModalProps) {
  const { doctor, isOpen, onClose } = props;
  const form = useDoctorDetailEditModal(props);

  if (!doctor) return null;

  const headerStatus = doctor
    ? getDoctorCardStatus(doctor)
    : form.formData.isActive
      ? 'active'
      : 'inactive';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      showCloseButton={false}
      className='max-h-[92vh] flex flex-col p-5 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span className='truncate'>{form.formData.fullName || doctor.nama_dokter}</span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Lihat dan kelola profil, identitas, domisili, kredensial, serta status operasional{' '}
              {form.isBidan ? 'bidan' : 'dokter'}.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <StatusBadge status={headerStatus} size='sm' />
          </div>
        </div>

        {/* Scrollable Body - Form 3 Columns */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          {form.isLoadingProfile ? (
            <div className='flex items-center justify-center py-16 gap-2 text-xs text-muted-foreground'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span>Memuat rincian profil medis...</span>
            </div>
          ) : (
            <form
              id='doctor-detail-form'
              onSubmit={(e) => {
                e.preventDefault();
                if (form.isEditing && form.hasChanges) {
                  form.handleSubmit(e);
                }
              }}
              className='p-0 space-y-0'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1'>
                {/* Kolom 1: Identitas Kependudukan & Kelahiran */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Identitas Kependudukan & Kelahiran
                  </span>

                  <PatientLineInput
                    id='doctor_nationalId'
                    label='NIK KTP (16 Digit)'
                    placeholder='3201xxxxxxxxxxxx'
                    value={form.formData.nationalId}
                    onChange={(val) => {
                      const numericOnly = val.replace(/\D/g, '').slice(0, 16);
                      form.handleChange('nationalId', numericOnly);
                    }}
                    maxLength={16}
                    inputMode='numeric'
                    isMonospace
                    disabled={!form.isEditing}
                    autoComplete='off'
                  />

                  <PatientLineInput
                    id='doctor_fullName'
                    label='Nama Lengkap & Gelar Medis *'
                    placeholder={
                      form.isBidan ? 'Bdn. Siti Rahma, S.Tr.Keb' : 'dr. Budi Santoso, Sp.A'
                    }
                    value={form.formData.fullName}
                    onChange={(val) => form.handleChange('fullName', val)}
                    required
                    disabled={!form.isEditing}
                    autoComplete='name'
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <PatientLineInput
                      id='doctor_birthPlace'
                      label='Tempat Lahir'
                      placeholder='Kota kelahiran'
                      value={form.formData.birthPlace}
                      onChange={(val) => form.handleChange('birthPlace', val)}
                      disabled={!form.isEditing}
                    />

                    <div className={cn(!form.isEditing && 'pointer-events-none opacity-60')}>
                      <PatientBirthdatePicker
                        id='doctor_birthDate'
                        label='Tanggal Lahir'
                        placeholder='Pilih tanggal...'
                        value={form.formData.birthDate}
                        onChange={(val) => form.handleChange('birthDate', val)}
                      />
                    </div>
                  </div>

                  <PatientGenderSelector
                    id='doctor_gender'
                    label='Jenis Kelamin'
                    variant='dropdown'
                    value={form.formData.gender}
                    onChange={(val) =>
                      form.handleChange('gender', val === 'female' ? 'female' : 'male')
                    }
                    disabled={!form.isEditing}
                  />
                </div>

                {/* Kolom 2: Kontak & Domisili Tempat Tinggal */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Kontak & Domisili Tempat Tinggal
                  </span>

                  <PatientLineInput
                    id='doctor_phoneNumber'
                    label='No. Telepon / WhatsApp'
                    type='tel'
                    placeholder='0812-3456-7890'
                    value={form.formData.phoneNumber}
                    onChange={(val) => form.handleChange('phoneNumber', val)}
                    disabled={!form.isEditing}
                    autoComplete='tel'
                  />

                  <PatientLineInput
                    id='doctor_email'
                    label='Email Akun Dokter'
                    type='email'
                    placeholder='dokter@amanah.clinic'
                    value={form.formData.email}
                    onChange={(val) => form.handleChange('email', val)}
                    disabled={!form.isEditing}
                    autoComplete='email'
                  />

                  {/* Domisili / Regional Cascader */}
                  <div className='space-y-2 pt-1'>
                    <span className='text-xs font-medium text-foreground block'>
                      Domisili Tempat Tinggal
                    </span>
                    <fieldset
                      disabled={!form.isEditing}
                      className={cn(!form.isEditing && 'pointer-events-none opacity-60')}
                    >
                      <PatientRegionDropdown
                        values={form.regionValues}
                        onChange={form.handleRegionChange}
                      />
                    </fieldset>
                  </div>
                </div>

                {/* Kolom 3: Kredensial Medis, Penugasan Unit & Status Operasional */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Kredensial Medis & Penugasan Unit
                  </span>

                  <PatientLineInput
                    id='doctor_profession'
                    label='Profesi / Jabatan Medis'
                    placeholder={
                      form.isBidan ? 'Bidan Praktik Mandiri / KIA' : 'Dokter Spesialis Anak'
                    }
                    value={form.formData.profession}
                    onChange={(val) => form.handleChange('profession', val)}
                    disabled={!form.isEditing}
                  />

                  {/* Unit Poliklinik Penugasan (Radix UI Select) */}
                  <div className='space-y-1.5'>
                    <label
                      htmlFor='doctor_poliklinik'
                      className='text-xs font-medium text-foreground block'
                    >
                      Unit Poliklinik Penugasan
                    </label>
                    {form.isLoadingPolyclinics ? (
                      <p className='text-xs text-muted-foreground'>Memuat unit poliklinik...</p>
                    ) : form.polyclinicError ? (
                      <p className='text-xs text-destructive'>{form.polyclinicError}</p>
                    ) : (
                      <Select
                        value={form.formData.poliklinikId || undefined}
                        onValueChange={(val) => form.handleChange('poliklinikId', val)}
                        disabled={!form.isEditing}
                      >
                        <SelectTrigger
                          id='doctor_poliklinik'
                          size='default'
                          className='w-full text-xs h-9 bg-background'
                        >
                          <SelectValue placeholder='Pilih unit poliklinik...' />
                        </SelectTrigger>
                        <SelectContent>
                          {form.polyclinics.map((p) => (
                            <SelectItem key={p.id} value={p.id} className='text-xs'>
                              {p.namaPoli || p.name || p.code || p.kodePoli || p.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <PatientLineInput
                    id='doctor_licenseNumber'
                    label={
                      form.isBidan
                        ? 'Nomor Izin Praktik Bidan (SIPB / STR)'
                        : 'Nomor Izin Praktik Dokter (SIP / STR)'
                    }
                    placeholder='SIP.446/123/DISKES/2026'
                    value={form.formData.licenseNumber}
                    onChange={(val) => form.handleChange('licenseNumber', val)}
                    disabled={!form.isEditing}
                  />

                  {/* Status Operasional Praktik (Active Switcher) */}
                  <div className='flex items-center justify-between pt-3 select-none border-t border-border/40'>
                    <div className='space-y-0.5'>
                      <label
                        htmlFor='doctor_active_switch'
                        className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                      >
                        <span>Status Operasional Praktik</span>
                        <StatusBadge
                          status={form.formData.isActive ? 'active' : 'inactive'}
                          label={form.formData.isActive ? 'Aktif' : 'Non-Aktif'}
                          size='sm'
                        />
                      </label>
                      <p className='text-[11px] text-muted-foreground'>
                        {form.formData.isActive
                          ? 'Dokter aktif dalam operasional klinik dan dapat menerima antrean.'
                          : 'Dokter dinonaktifkan sementara dari sistem klinik & penugasan antrean.'}
                      </p>
                    </div>
                    <Switch
                      id='doctor_active_switch'
                      checked={form.formData.isActive}
                      onCheckedChange={(checked) => form.handleChange('isActive', checked)}
                      disabled={!form.isEditing}
                      aria-label='Status Operasional Praktik'
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/40 flex items-center justify-end gap-2.5'>
          {!form.isEditing ? (
            <>
              <Button
                key='btn-close-view'
                type='button'
                variant='outline'
                size='card-action'
                shape='pill'
                onClick={onClose}
                className='px-6 font-semibold'
              >
                Tutup
              </Button>
              <Button
                key='btn-unlock-edit'
                type='button'
                variant='default'
                size='card-action'
                shape='pill'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleUnlockEdit();
                }}
                disabled={form.isLoadingProfile}
                className='px-6 font-bold'
              >
                <Icons.edit className='size-3.5 mr-1.5' />
                Edit Profil
              </Button>
            </>
          ) : (
            <>
              <Button
                key='btn-cancel-edit'
                type='button'
                variant='outline'
                size='card-action'
                shape='pill'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleCancelEdit();
                }}
                disabled={form.isSubmitting}
                className='px-6 font-semibold'
              >
                Batal
              </Button>
              <Button
                key='btn-submit-save'
                type='button'
                variant='default'
                size='card-action'
                shape='pill'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit(e);
                }}
                disabled={form.isSubmitting || !form.hasChanges}
                className='px-6 font-bold'
              >
                {form.isSubmitting ? (
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
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
