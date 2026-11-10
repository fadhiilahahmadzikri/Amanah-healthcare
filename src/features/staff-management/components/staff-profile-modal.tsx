'use client';

import React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import { PatientRegionDropdown } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { cn } from '@/lib/utils';
import type { StaffMember } from '../api/staff-management.api';
import type { DoctorSchedule } from '@/features/jadwal-dokter/api/types';
import { useStaffProfileModal } from '../model/useStaffProfileModal';
import { StaffLeaveBanner } from './staff-card-atoms';
import { MaskedNik } from '@/components/ui/masked-nik';

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

  const [showNik, setShowNik] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  React.useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const toggleShowNik = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showNik) {
      setShowNik(false);
      clearTimers();
    } else {
      setShowNik(true);
      clearTimers();
      setCountdown(15);
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => (prev === null || prev <= 1 ? 0 : prev - 1));
      }, 1000);
      timerRef.current = setTimeout(() => {
        setShowNik(false);
        clearTimers();
      }, 15000);
    }
  };

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
        {/* Pinned Header with Petak Rounded Avatar */}
        <div className='shrink-0 pb-3.5 border-b border-border/40 flex items-center justify-between gap-3 min-w-0'>
          <div className='flex items-center gap-3.5 min-w-0 flex-1'>
            <Avatar className='size-13 sm:size-14 rounded-2xl ring-2 ring-primary/20 shrink-0 shadow-xs overflow-hidden aspect-square bg-muted/40'>
              <AvatarImage
                src={staff?.photoUrl || doctor?.avatar || DEFAULT_AVATAR_PATH}
                alt={form.formData.fullName}
                className='size-full object-cover aspect-square rounded-2xl'
              />
              <AvatarFallback className='p-0 bg-transparent overflow-hidden rounded-2xl'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={form.formData.fullName}
                  width={64}
                  height={64}
                  unoptimized
                  className='size-full object-cover rounded-2xl aspect-square'
                />
              </AvatarFallback>
            </Avatar>

            <div className='space-y-0.5 min-w-0 flex-1'>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
                <span className='truncate'>{form.formData.fullName || 'Detail Staf'}</span>
              </h3>
              <p className='text-xs text-muted-foreground truncate font-medium'>
                {form.subtitleDescription}
              </p>
            </div>
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
                <div className='rounded-2xl bg-muted/30 dark:bg-muted/15 p-4 sm:p-5 space-y-4'>
                  <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
                    Identitas Kependudukan & Kelahiran
                  </span>

                  {form.isEditing ? (
                    <div className='space-y-1.5'>
                      <div className='flex items-center justify-between'>
                        <label
                          htmlFor='staff_nationalId'
                          className='text-xs font-medium text-foreground block'
                        >
                          NIK KTP (16 Digit){' '}
                          <span className='text-[10px] text-muted-foreground font-normal'>
                            (Opsional)
                          </span>
                        </label>
                        {showNik && countdown !== null && countdown > 0 && (
                          <span
                            className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium select-none'
                            title={`NIK akan otomatis disensor dalam ${countdown} detik`}
                          >
                            Sensor otomatis dalam {countdown}s
                          </span>
                        )}
                      </div>
                      <div className='relative'>
                        <Input
                          id='staff_nationalId'
                          type={showNik ? 'text' : 'password'}
                          placeholder='Kosongkan jika tidak ada, atau masukkan 16 digit'
                          value={form.formData.nationalId}
                          onChange={(e) => {
                            const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
                            form.handleChange('nationalId', numericOnly);
                          }}
                          onBlur={() => form.handleBlur('nationalId')}
                          maxLength={16}
                          inputMode='numeric'
                          autoComplete='off'
                          className='h-9 rounded-xl text-xs bg-background pr-10 font-mono tracking-wider'
                          aria-invalid={!!form.errors.nationalId}
                        />
                        <button
                          type='button'
                          onClick={toggleShowNik}
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer'
                          title={
                            showNik
                              ? 'Sembunyikan NIK'
                              : 'Tampilkan NIK (Otomatis disensor setelah 15s)'
                          }
                          aria-label={
                            showNik
                              ? 'Sembunyikan NIK'
                              : 'Tampilkan NIK (Otomatis disensor setelah 15s)'
                          }
                          tabIndex={-1}
                        >
                          {showNik ? (
                            <Icons.eyeOff className='size-4 text-primary' />
                          ) : (
                            <Icons.eye className='size-4' />
                          )}
                        </button>
                      </div>
                      {form.errors.nationalId && (
                        <p className='text-[11px] text-destructive'>{form.errors.nationalId}</p>
                      )}
                    </div>
                  ) : (
                    <div className='space-y-1.5'>
                      <span className='text-xs font-medium text-muted-foreground block'>
                        NIK KTP (16 Digit)
                      </span>
                      <div className='h-9 flex items-center px-3 rounded-xl border border-input bg-muted/40 font-mono text-xs'>
                        <MaskedNik
                          nik={form.formData.nationalId}
                          autoMaskSeconds={15}
                          size='sm'
                        />
                      </div>
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <label
                      htmlFor='staff_fullName'
                      className='text-xs font-medium text-foreground block'
                    >
                      Nama Lengkap &amp; Gelar{' '}
                      <span className='text-destructive font-bold'>*</span>
                    </label>
                    <Input
                      id='staff_fullName'
                      placeholder={
                        form.isClinical
                          ? 'dr. / Bdn. / Ns. Nama Lengkap & Gelar'
                          : 'Nama lengkap staf operasional'
                      }
                      value={form.formData.fullName}
                      onChange={(e) => form.handleChange('fullName', e.target.value)}
                      onBlur={() => form.handleBlur('fullName')}
                      disabled={!form.isEditing}
                      autoComplete='name'
                      className='h-9 rounded-xl text-xs bg-background disabled:bg-muted/40 disabled:opacity-80'
                      aria-invalid={!!form.errors.fullName}
                    />
                    {form.errors.fullName && (
                      <p className='text-[11px] text-destructive'>{form.errors.fullName}</p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                    <div className='space-y-1.5'>
                      <label
                        htmlFor='staff_birthPlace'
                        className='text-xs font-medium text-foreground block'
                      >
                        Tempat Lahir
                      </label>
                      <Input
                        id='staff_birthPlace'
                        placeholder='Kota kelahiran'
                        value={form.formData.birthPlace}
                        onChange={(e) => form.handleChange('birthPlace', e.target.value)}
                        disabled={!form.isEditing}
                        className='h-9 rounded-xl text-xs bg-background disabled:bg-muted/40 disabled:opacity-80'
                      />
                    </div>

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
                <div className='rounded-2xl bg-muted/30 dark:bg-muted/15 p-4 sm:p-5 space-y-4'>
                  <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
                    Kontak & Domisili Tempat Tinggal
                  </span>

                  <div className='space-y-1.5'>
                    <label
                      htmlFor='staff_phoneNumber'
                      className='text-xs font-medium text-foreground block'
                    >
                      No. Telepon / WhatsApp
                    </label>
                    <Input
                      id='staff_phoneNumber'
                      type='tel'
                      placeholder='0812-3456-7890'
                      value={form.formData.phoneNumber}
                      onChange={(e) => form.handleChange('phoneNumber', e.target.value)}
                      onBlur={() => form.handleBlur('phoneNumber')}
                      disabled={!form.isEditing}
                      autoComplete='tel'
                      className='h-9 rounded-xl text-xs bg-background disabled:bg-muted/40 disabled:opacity-80'
                      aria-invalid={!!form.errors.phoneNumber}
                    />
                    {form.errors.phoneNumber && (
                      <p className='text-[11px] text-destructive'>{form.errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className='space-y-1.5'>
                    <label
                      htmlFor='staff_email'
                      className='text-xs font-medium text-foreground block'
                    >
                      Email Akun Staf (Dikelola Pemilik Akun)
                    </label>
                    <Input
                      id='staff_email'
                      type='email'
                      placeholder='staf@amanah.clinic'
                      value={form.formData.email}
                      disabled={true}
                      autoComplete='email'
                      className='h-9 rounded-xl text-xs bg-muted/40 text-muted-foreground opacity-90'
                    />
                    <span className='text-[10px] text-muted-foreground block px-0.5'>
                      Alamat email akun hanya dapat diubah oleh pemilik akun melalui verifikasi OTP
                      mandiri.
                    </span>

                    {/* Lencana Metode Autentikasi Login Akun */}
                    <div className='flex items-center gap-1.5 pt-0.5 px-0.5 flex-wrap'>
                      {form.hasGoogle && (
                        <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'>
                          <Icons.google className='size-3' />
                          Terhubung Google
                        </span>
                      )}
                      {form.hasPassword && (
                        <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'>
                          <Icons.lock className='size-3' />
                          Kata Sandi Aktif
                        </span>
                      )}
                      {!form.hasGoogle && !form.hasPassword && (
                        <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'>
                          <Icons.mail className='size-3' />
                          Menunggu Aktivasi Akun
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Domisili / Regional Cascader */}
                  <div className='space-y-1.5 pt-1'>
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
                <div className='rounded-2xl bg-muted/30 dark:bg-muted/15 p-4 sm:p-5 space-y-4'>
                  <span className='text-xs font-bold text-foreground block pb-1 border-b border-border/40 uppercase tracking-wider'>
                    {form.isClinical
                      ? 'Kredensial Medis & Penugasan Unit'
                      : 'Informasi Posisi & Penugasan Staf'}
                  </span>

                  <div className='space-y-1.5'>
                    <label
                      htmlFor='staff_profession'
                      className='text-xs font-medium text-foreground block'
                    >
                      Profesi / Jabatan Staf
                    </label>
                    <Input
                      id='staff_profession'
                      placeholder={form.professionPlaceholder}
                      value={form.formData.profession}
                      onChange={(e) => form.handleChange('profession', e.target.value)}
                      disabled={!form.isEditing}
                      className='h-9 rounded-xl text-xs bg-background disabled:bg-muted/40 disabled:opacity-80'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label
                      htmlFor='staff_code_input'
                      className='text-xs font-medium text-foreground block'
                    >
                      Kode Staf
                    </label>
                    <div className='relative'>
                      <Input
                        id='staff_code_input'
                        placeholder='STF-xxx'
                        value={form.formData.staffCode}
                        readOnly
                        className='h-9 rounded-xl font-mono text-xs bg-muted/40 pr-9 text-muted-foreground'
                      />
                      {form.formData.staffCode && (
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
                          className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer'
                        >
                          <Icons.copy className='size-3.5' />
                        </button>
                      )}
                    </div>
                  </div>

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
                          className='w-full text-xs h-9 rounded-xl bg-background'
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
                    <div className='space-y-1.5'>
                      <label
                        htmlFor='staff_licenseNumber'
                        className='text-xs font-medium text-foreground block'
                      >
                        {form.licenseNumberLabel}
                      </label>
                      <Input
                        id='staff_licenseNumber'
                        placeholder='SIP.446/123/DISKES/2026'
                        value={form.formData.licenseNumber}
                        onChange={(e) => form.handleChange('licenseNumber', e.target.value)}
                        disabled={!form.isEditing}
                        className='h-9 rounded-xl font-mono text-xs bg-background disabled:bg-muted/40 disabled:opacity-80'
                      />
                    </div>
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
