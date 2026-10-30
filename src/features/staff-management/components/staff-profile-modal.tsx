'use client';

import { toast } from 'sonner';
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
import type { StaffMember } from '../api/staff-management.api';
import type { DoctorSchedule } from '@/features/jadwal-dokter/api/types';
import { useStaffProfileModal } from '../model/useStaffProfileModal';
import { StaffLeaveBanner } from './staff-card-atoms';

export interface StaffProfileModalProps {
  staff?: StaffMember | null;
  doctor?: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onExport?: (staff: StaffMember) => void;
}

export function StaffProfileModal(props: StaffProfileModalProps) {
  const { staff, doctor, isOpen, onClose, onExport } = props;
  const form = useStaffProfileModal(props);

  if (!staff && !doctor) return null;

  const headerStatus = form.leaveInfo?.isOnLeave
    ? 'on_leave'
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
              <span className='truncate'>{form.formData.fullName || 'Detail Staf'}</span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              {form.subtitleDescription}
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {onExport && form.rawStaffMember && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                shape='pill'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExport(form.rawStaffMember!);
                }}
                title={`Unduh Laporan ${form.formData.fullName}`}
                aria-label={`Unduh Laporan ${form.formData.fullName}`}
                className='size-7 text-muted-foreground hover:text-primary hover:border-primary/40 shrink-0 cursor-pointer'
              >
                <Icons.download className='size-3.5' />
              </Button>
            )}
            <StatusBadge status={headerStatus} size='sm' />
          </div>
        </div>

        {/* Scrollable Body - Form 3 Columns */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          {form.isLoadingProfile ? (
            <div className='flex items-center justify-center py-16 gap-2 text-xs text-muted-foreground'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span>Memuat rincian profil staf...</span>
            </div>
          ) : (
            <form
              id='staff-profile-form'
              onSubmit={(e) => {
                e.preventDefault();
                if (form.isEditing && form.hasChanges) {
                  form.handleSubmit(e);
                }
              }}
              className='p-0 space-y-0'
            >
              {form.leaveInfo?.isOnLeave && (
                <StaffLeaveBanner leaveInfo={form.leaveInfo} className='mb-5' />
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1'>
                {/* Kolom 1: Identitas Kependudukan & Kelahiran */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Identitas Kependudukan & Kelahiran
                  </span>

                  <PatientLineInput
                    id='staff_nationalId'
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
                    id='staff_fullName'
                    label='Nama Lengkap & Gelar *'
                    placeholder={
                      form.isClinical
                        ? 'dr. / Bdn. / Ns. Nama Lengkap & Gelar'
                        : 'Nama lengkap staf operasional'
                    }
                    value={form.formData.fullName}
                    onChange={(val) => form.handleChange('fullName', val)}
                    required
                    disabled={!form.isEditing}
                    autoComplete='name'
                  />

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                    <PatientLineInput
                      id='staff_birthPlace'
                      label='Tempat Lahir'
                      placeholder='Kota kelahiran'
                      value={form.formData.birthPlace}
                      onChange={(val) => form.handleChange('birthPlace', val)}
                      disabled={!form.isEditing}
                    />

                    <div className={cn(!form.isEditing && 'pointer-events-none opacity-60')}>
                      <PatientBirthdatePicker
                        id='staff_birthDate'
                        label='Tanggal Lahir'
                        placeholder='Pilih tanggal...'
                        value={form.formData.birthDate}
                        onChange={(val) => form.handleChange('birthDate', val)}
                      />
                    </div>
                  </div>

                  <PatientGenderSelector
                    id='staff_gender'
                    label='Jenis Kelamin'
                    variant='dropdown'
                    value={form.formData.gender || ''}
                    onChange={(val) => form.handleChange('gender', val)}
                    disabled={!form.isEditing}
                  />
                </div>

                {/* Kolom 2: Kontak & Domisili Tempat Tinggal */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Kontak & Domisili Tempat Tinggal
                  </span>

                  <PatientLineInput
                    id='staff_phoneNumber'
                    label='No. Telepon / WhatsApp'
                    type='tel'
                    placeholder='0812-3456-7890'
                    value={form.formData.phoneNumber}
                    onChange={(val) => form.handleChange('phoneNumber', val)}
                    disabled={!form.isEditing}
                    autoComplete='tel'
                  />

                  <PatientLineInput
                    id='staff_email'
                    label='Email Akun Staf'
                    type='email'
                    placeholder='staf@amanah.clinic'
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

                {/* Kolom 3: Kredensial Medis / Pekerjaan & Status Operasional */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    {form.isClinical
                      ? 'Kredensial Medis & Penugasan Unit'
                      : 'Informasi Posisi & Penugasan Staf'}
                  </span>

                  <PatientLineInput
                    id='staff_profession'
                    label='Profesi / Jabatan Staf'
                    placeholder={form.professionPlaceholder}
                    value={form.formData.profession}
                    onChange={(val) => form.handleChange('profession', val)}
                    disabled={!form.isEditing}
                  />

                  <PatientLineInput
                    id='staff_code_input'
                    label='Kode staf'
                    placeholder='STF-xxx'
                    value={form.formData.staffCode}
                    readOnly
                    isMonospace
                    trailingIcon={
                      form.formData.staffCode ? (
                        <button
                          type='button'
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const code = form.formData.staffCode;
                            if (code) {
                              await navigator.clipboard.writeText(code);
                              toast.success(`Kode staf ${code} disalin ke clipboard`);
                            }
                          }}
                          title='Salin kode staf'
                          aria-label='Salin kode staf'
                          className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer'
                        >
                          <Icons.copy className='size-3.5' />
                        </button>
                      ) : null
                    }
                  />

                  {/* Unit Poliklinik Penugasan (Radix UI Select) */}
                  <div className='space-y-1.5'>
                    <label
                      htmlFor='staff_poliklinik'
                      className='text-xs font-medium text-foreground block'
                    >
                      Unit Poliklinik Penugasan {form.isClinical ? '' : '(Opsional)'}
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
                          id='staff_poliklinik'
                          size='default'
                          className='w-full text-xs h-9 bg-background'
                        >
                          <SelectValue placeholder='Pilih unit poliklinik...' />
                        </SelectTrigger>
                        <SelectContent>
                          {form.polyclinics.map((p) => (
                            <SelectItem key={p.id} value={p.id} className='text-xs'>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* SIP/STR Kredensial Medis (Hanya untuk Dokter, Bidan, Perawat) */}
                  {form.isClinical && (
                    <PatientLineInput
                      id='staff_licenseNumber'
                      label={form.licenseNumberLabel}
                      placeholder='SIP.446/123/DISKES/2026'
                      value={form.formData.licenseNumber}
                      onChange={(val) => form.handleChange('licenseNumber', val)}
                      disabled={!form.isEditing}
                    />
                  )}

                  {/* Status Operasional (Active Switcher) */}
                  <div className='flex items-center justify-between pt-3 select-none border-t border-border/40'>
                    <div className='space-y-0.5'>
                      <label
                        htmlFor='staff_active_switch'
                        className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                      >
                        <span>Status Operasional</span>
                        <StatusBadge
                          status={form.formData.isActive ? 'active' : 'inactive'}
                          label={form.formData.isActive ? 'Aktif' : 'Non-Aktif'}
                          size='sm'
                        />
                      </label>
                      <p className='text-[11px] text-muted-foreground'>
                        {form.formData.isActive
                          ? `${form.workerCategoryLabel} aktif dalam operasional klinik dan penugasan jadwal.`
                          : `${form.workerCategoryLabel} dinonaktifkan sementara dari sistem operasional klinik.`}
                      </p>
                    </div>
                    <Switch
                      id='staff_active_switch'
                      checked={form.formData.isActive}
                      onCheckedChange={(checked) => form.handleChange('isActive', checked)}
                      disabled={!form.isEditing}
                      aria-label='Status Operasional'
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
                className='px-6 font-semibold cursor-pointer'
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
                className='px-6 font-bold cursor-pointer'
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
                className='px-6 font-semibold cursor-pointer'
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
                className='px-6 font-bold cursor-pointer'
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
