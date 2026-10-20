'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
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
import {
  type PolyclinicUnit,
  type StaffMember,
  staffManagementApi
} from '@/features/staff-management';
import type { DoctorSchedule } from '../api/types';
import { getDoctorProfile, updateDoctorProfile } from '../api/service';

export interface DoctorDetailEditModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DoctorDetailEditModal({
  doctor,
  isOpen,
  onClose,
  onSuccess
}: DoctorDetailEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Poliklinik List State
  const [polyclinics, setPolyclinics] = useState<PolyclinicUnit[]>([]);
  const [isLoadingPolyclinics, setIsLoadingPolyclinics] = useState(false);
  const [polyclinicError, setPolyclinicError] = useState<string | null>(null);

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
    poliklinikId: '',
    licenseNumber: '',
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

  // Load Polyclinics dynamically
  useEffect(() => {
    if (isOpen) {
      let cancelled = false;
      setIsLoadingPolyclinics(true);
      setPolyclinicError(null);
      staffManagementApi
        .getPolyclinics()
        .then((units) => {
          if (cancelled) return;
          setPolyclinics(units);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : 'Gagal memuat poliklinik dari server.';
          setPolyclinicError(msg);
        })
        .finally(() => {
          if (!cancelled) setIsLoadingPolyclinics(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [isOpen]);

  // Load Full Doctor Profile on Open
  useEffect(() => {
    if (isOpen && doctor) {
      let cancelled = false;
      setIsLoadingProfile(true);

      // Initialize with basic data while fetching full profile
      setFormData((prev) => ({
        ...prev,
        fullName: doctor.nama_dokter || '',
        email: doctor.email || '',
        phoneNumber: doctor.nomor_telepon || '',
        profession: doctor.spesialisasi || '',
        isActive: doctor.status_dokter !== 'PENDING' && (doctor.is_accepting_appointments ?? true)
      }));

      getDoctorProfile(doctor.id)
        .then((profile: StaffMember) => {
          if (cancelled || !profile) return;
          setFormData({
            fullName: profile.fullName || doctor.nama_dokter || '',
            email: profile.email || doctor.email || '',
            phoneNumber: profile.phoneNumber || doctor.nomor_telepon || '',
            profession: profile.profession || doctor.spesialisasi || '',
            birthPlace: profile.birthPlace || '',
            birthDate: profile.birthDate ? String(profile.birthDate).slice(0, 10) : '',
            gender: profile.gender === 'female' ? 'female' : 'male',
            nationalId: profile.nationalId || '',
            poliklinikId: profile.poliklinikId || '',
            licenseNumber: profile.licenseNumber || '',
            isActive: profile.isActive ?? doctor.status_dokter !== 'PENDING'
          });

          if (profile.address) {
            setRegionValues({
              provinsi: profile.address.provinceName || '',
              provinsiId: profile.address.provinceCode || '',
              kabupaten: profile.address.regencyName || '',
              kabupatenId: profile.address.regencyCode || '',
              kecamatan: profile.address.districtName || '',
              kecamatanId: profile.address.districtCode || '',
              kelurahan: profile.address.villageName || '',
              kelurahanId: profile.address.villageCode || '',
              alamatDetail: profile.address.line1 || profile.address.fullAddress || ''
            });
          }
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          console.warn('Could not load full profile from server, using card fallback:', err);
        })
        .finally(() => {
          if (!cancelled) setIsLoadingProfile(false);
        });

      return () => {
        cancelled = true;
      };
    }
  }, [isOpen, doctor]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

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

      await updateDoctorProfile(doctor.id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
        profession: formData.profession.trim() || undefined,
        birthPlace: formData.birthPlace.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        nationalId: formData.nationalId.trim() || undefined,
        isActive: formData.isActive,
        poliklinikId: formData.poliklinikId || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
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

      toast.success(`Data dokter ${formData.fullName} berhasil diperbarui.`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui data dokter.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!doctor) return null;

  const isBidan =
    doctor.spesialisasi?.toLowerCase().includes('bidan') ||
    doctor.nama_dokter?.toLowerCase().startsWith('bdn.') ||
    formData.profession?.toLowerCase().includes('bidan');

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
              <span className='truncate'>{formData.fullName || doctor.nama_dokter}</span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Lihat dan kelola profil, identitas, domisili, kredensial, serta status operasional{' '}
              {isBidan ? 'bidan' : 'dokter'}.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <StatusBadge
              status={doctor.status_dokter || (formData.isActive ? 'OPEN' : 'CLOSED')}
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
          {isLoadingProfile ? (
            <div className='flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span>Memuat rincian profil medis...</span>
            </div>
          ) : (
            <form id='doctor-detail-form' onSubmit={handleSubmit} className='p-0 space-y-0'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-1'>
                {/* Kolom 1: Identitas & Kelahiran */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Identitas Kependudukan & Kelahiran
                  </span>

                  <PatientLineInput
                    id='doctor_nationalId'
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
                    id='doctor_fullName'
                    label='Nama Lengkap & Gelar Medis *'
                    placeholder={isBidan ? 'Bdn. Siti Rahma, S.Tr.Keb' : 'dr. Budi Santoso, Sp.A'}
                    value={formData.fullName}
                    onChange={(val) => handleChange('fullName', val)}
                    required
                    autoComplete='name'
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <PatientLineInput
                      id='doctor_birthPlace'
                      label='Tempat Lahir'
                      placeholder='Kota kelahiran'
                      value={formData.birthPlace}
                      onChange={(val) => handleChange('birthPlace', val)}
                    />

                    <PatientBirthdatePicker
                      id='doctor_birthDate'
                      label='Tanggal Lahir'
                      placeholder='Pilih tanggal...'
                      value={formData.birthDate}
                      onChange={(val) => handleChange('birthDate', val)}
                    />
                  </div>

                  <PatientGenderSelector
                    id='doctor_gender'
                    label='Jenis Kelamin'
                    variant='dropdown'
                    value={formData.gender}
                    onChange={(val) => handleChange('gender', val === 'female' ? 'female' : 'male')}
                  />
                </div>

                {/* Kolom 2: Kontak, Domisili, Kredensial & Status Operasional */}
                <div className='space-y-4'>
                  <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                    Kontak, Domisili & Kredensial
                  </span>

                  <PatientLineInput
                    id='doctor_profession'
                    label='Profesi / Jabatan Medis'
                    placeholder={isBidan ? 'Bidan Praktik Mandiri / KIA' : 'Dokter Spesialis Anak'}
                    value={formData.profession}
                    onChange={(val) => handleChange('profession', val)}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <PatientLineInput
                      id='doctor_phoneNumber'
                      label='No. Telepon / WhatsApp'
                      type='tel'
                      placeholder='0812-3456-7890'
                      value={formData.phoneNumber}
                      onChange={(val) => handleChange('phoneNumber', val)}
                      autoComplete='tel'
                    />

                    <PatientLineInput
                      id='doctor_email'
                      label='Email Akun Dokter'
                      type='email'
                      placeholder='dokter@amanah.clinic'
                      value={formData.email}
                      onChange={(val) => handleChange('email', val)}
                      autoComplete='email'
                    />
                  </div>

                  {/* Domisili / Regional Cascader */}
                  <div className='space-y-2 pt-1'>
                    <span className='text-xs font-medium text-foreground block'>
                      Domisili Tempat Tinggal
                    </span>
                    <PatientRegionDropdown
                      values={regionValues}
                      onChange={(updates) => setRegionValues((prev) => ({ ...prev, ...updates }))}
                    />
                  </div>

                  {/* Kredensial Medis & Poliklinik */}
                  <div className='space-y-4 pt-2 border-t border-border/40'>
                    <span className='text-xs font-semibold text-muted-foreground block pb-1'>
                      Kredensial Medis & Penugasan Unit
                    </span>

                    <div className='space-y-1.5'>
                      <label
                        htmlFor='doctor_poliklinik'
                        className='text-xs font-medium text-foreground block'
                      >
                        Unit Poliklinik Penugasan
                      </label>
                      {isLoadingPolyclinics ? (
                        <p className='text-xs text-muted-foreground'>Memuat unit poliklinik...</p>
                      ) : polyclinicError ? (
                        <p className='text-xs text-destructive'>{polyclinicError}</p>
                      ) : (
                        <select
                          id='doctor_poliklinik'
                          value={formData.poliklinikId}
                          onChange={(e) => handleChange('poliklinikId', e.target.value)}
                          className='w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                        >
                          <option value=''>Pilih unit poliklinik...</option>
                          {polyclinics.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.namaPoli || p.name || p.code || p.kodePoli || p.id}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <PatientLineInput
                      id='doctor_licenseNumber'
                      label={
                        isBidan
                          ? 'Nomor Izin Praktik Bidan (SIPB / STR)'
                          : 'Nomor Izin Praktik Dokter (SIP / STR)'
                      }
                      placeholder='SIP.446/123/DISKES/2026'
                      value={formData.licenseNumber}
                      onChange={(val) => handleChange('licenseNumber', val)}
                    />
                  </div>

                  {/* Status Operasional Praktik (Active Switcher) */}
                  <div className='flex items-center justify-between pt-2 select-none border-t border-border/40'>
                    <div className='space-y-0.5'>
                      <label
                        htmlFor='doctor_active_switch'
                        className='text-xs font-medium text-foreground flex items-center gap-2 cursor-pointer'
                      >
                        <span>Status Operasional Praktik</span>
                        <StatusBadge
                          status={formData.isActive ? 'active' : 'inactive'}
                          label={formData.isActive ? 'Aktif' : 'Non-Aktif'}
                          size='sm'
                        />
                      </label>
                      <p className='text-[11px] text-muted-foreground'>
                        {formData.isActive
                          ? 'Dokter aktif dalam operasional klinik dan dapat menerima janji temu pasien.'
                          : 'Dokter dinonaktifkan sementara dari sistem klinik & penugasan antrean.'}
                      </p>
                    </div>
                    <Switch
                      id='doctor_active_switch'
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleChange('isActive', checked)}
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
            form='doctor-detail-form'
            size='sm'
            shape='pill'
            disabled={isSubmitting || isLoadingProfile}
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
