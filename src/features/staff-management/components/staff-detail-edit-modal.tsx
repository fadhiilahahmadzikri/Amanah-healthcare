'use client';

import { toast } from 'sonner';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import { PatientRegionDropdown } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import type { StaffMember } from '../api/staff-management.api';
import { useStaffDetailEditModal } from '../model/useStaffDetailEditModal';
import { StaffLeaveBanner } from './staff-card-atoms';

export interface StaffDetailEditModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StaffDetailEditModal(props: StaffDetailEditModalProps) {
  const { staff, isOpen, onClose } = props;
  const form = useStaffDetailEditModal(props);

  if (!staff) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-4xl w-[95vw]'
      showCloseButton={false}
      className='max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span className='truncate'>{form.formData.fullName || 'Detail Staf'}</span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Lihat dan perbarui informasi profil, identitas, dan domisili staf operasional klinik.
            </p>
          </div>

          {/* Status Akun Ringkas di Pojok Kanan Atas */}
          <div className='shrink-0 pt-0.5'>
            <StatusBadge
              status={form.formData.isActive ? 'active' : 'inactive'}
              label={form.formData.isActive ? 'Aktif' : 'Non-Aktif'}
              size='sm'
            />
          </div>
        </div>

        {/* Scrollable Body - Form Reguler 2 Columns */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          <form id='staff-detail-form' onSubmit={form.handleSubmit} className='p-0 space-y-0'>
            {staff.leaveInfo?.isOnLeave && (
              <StaffLeaveBanner leaveInfo={staff.leaveInfo} className='mb-4' />
            )}
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
                  value={form.formData.nationalId}
                  onChange={(val) => {
                    const numericOnly = val.replace(/\D/g, '').slice(0, 16);
                    form.handleChange('nationalId', numericOnly);
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
                  value={form.formData.fullName}
                  onChange={(val) => form.handleChange('fullName', val)}
                  required
                  autoComplete='name'
                />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  <PatientLineInput
                    id='staff_birthPlace'
                    label='Tempat Lahir'
                    placeholder='Kota kelahiran'
                    value={form.formData.birthPlace}
                    onChange={(val) => form.handleChange('birthPlace', val)}
                  />

                  <PatientBirthdatePicker
                    id='staff_birthDate'
                    label='Tanggal Lahir'
                    placeholder='Pilih tanggal...'
                    value={form.formData.birthDate}
                    onChange={(val) => form.handleChange('birthDate', val)}
                  />
                </div>

                <PatientGenderSelector
                  id='staff_gender'
                  label='Jenis Kelamin'
                  variant='dropdown'
                  value={form.formData.gender}
                  onChange={(val) => form.handleChange('gender', val)}
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
                  value={form.formData.profession}
                  onChange={(val) => form.handleChange('profession', val)}
                />

                <PatientLineInput
                  id='staff_code'
                  label='Kode staf'
                  placeholder='STF-xxx'
                  value={staff.idCardNumber || staff.staffCode || '-'}
                  readOnly
                  isMonospace
                  trailingIcon={
                    staff.idCardNumber || staff.staffCode ? (
                      <button
                        type='button'
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const code = staff.idCardNumber || staff.staffCode || '';
                          if (code && code !== '-') {
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

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  <PatientLineInput
                    id='staff_phoneNumber'
                    label='No. Telepon / WhatsApp'
                    type='tel'
                    placeholder='0812-3456-7890'
                    value={form.formData.phoneNumber}
                    onChange={(val) => form.handleChange('phoneNumber', val)}
                    autoComplete='tel'
                  />

                  <PatientLineInput
                    id='staff_email'
                    label='Email Staf'
                    type='email'
                    placeholder='staf@amanah.clinic'
                    value={form.formData.email}
                    onChange={(val) => form.handleChange('email', val)}
                    autoComplete='email'
                  />
                </div>

                {/* Domisili / Regional Cascader */}
                <div className='space-y-2 pt-1'>
                  <span className='text-xs font-medium text-foreground block'>
                    Domisili & Alamat
                  </span>
                  <PatientRegionDropdown
                    values={form.regionValues}
                    onChange={form.handleRegionChange}
                  />
                </div>

                {/* Kredensial Medis & Poliklinik (Hanya untuk Dokter & Bidan) */}
                {form.isClinical && (
                  <div className='space-y-4 pt-2 border-t border-border/40'>
                    <span className='text-xs font-semibold text-muted-foreground block pb-1'>
                      Kredensial Medis & Penugasan Klinis
                    </span>

                    <div className='space-y-1.5'>
                      <label
                        htmlFor='staff_poliklinik'
                        className='text-xs font-medium text-foreground block'
                      >
                        Unit Poliklinik Penugasan
                      </label>
                      {form.isLoadingPolyclinics ? (
                        <p className='text-xs text-muted-foreground'>
                          Memuat daftar unit poliklinik...
                        </p>
                      ) : (
                        <select
                          id='staff_poliklinik'
                          value={form.formData.poliklinikId}
                          onChange={(e) => form.handleChange('poliklinikId', e.target.value)}
                          className='w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                        >
                          <option value=''>Pilih unit poliklinik...</option>
                          {form.polyclinics.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.namaPoli || p.name || p.code || p.kodePoli || p.id}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <PatientLineInput
                      id='staff_licenseNumber'
                      label='Nomor Izin Praktik (SIP / STR)'
                      placeholder='SIP.446/123/DISKES/2026'
                      value={form.formData.licenseNumber}
                      onChange={(val) => form.handleChange('licenseNumber', val)}
                    />
                  </div>
                )}

                {/* Status Operasional Staf (Switcher dengan StatusBadge) */}
                <div className='flex items-center justify-between pt-2 select-none border-t border-border/40'>
                  <div className='space-y-0.5'>
                    <label
                      htmlFor='staff_active_switch'
                      className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                    >
                      <span>Status Operasional Staf</span>
                      <StatusBadge
                        status={form.formData.isActive ? 'active' : 'inactive'}
                        label={form.formData.isActive ? 'Aktif' : 'Non-Aktif'}
                        size='sm'
                      />
                    </label>
                    <p className='text-[11px] text-muted-foreground'>
                      {form.formData.isActive
                        ? 'Staf aktif dalam operasional dan penugasan roster klinik.'
                        : 'Staf dinonaktifkan sementara dari sistem klinik.'}
                    </p>
                  </div>
                  <Switch
                    id='staff_active_switch'
                    checked={form.formData.isActive}
                    onCheckedChange={(checked) => form.handleChange('isActive', checked)}
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
            disabled={form.isSubmitting}
            className='px-5 text-xs font-semibold cursor-pointer'
          >
            Batal
          </Button>
          <Button
            type='submit'
            form='staff-detail-form'
            size='sm'
            shape='pill'
            disabled={form.isSubmitting}
            className='px-6 text-xs font-semibold cursor-pointer'
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
        </div>
      </div>
    </ModalWrapper>
  );
}
