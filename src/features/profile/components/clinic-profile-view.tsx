'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import PageContainer from '@/components/layout/page-container';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { signOut } from '@/lib/auth-client';
import { logoutAction } from '@/server/actions/auth.actions';
import { DeleteAccountDialog } from './delete-account-dialog';
import type { PatientProfileDto } from '@/server/contracts/patients/patient-profile.dto';
import {
  getPatientProfileAction,
  updatePatientProfileAction
} from '@/features/data-pasien/api/patient-profile-actions';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';

const DEFAULT_PATIENT_PROFILE = {
  name: 'Pasien Amanah',
  email: 'pasien@amanah.health',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  coverImage:
    'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1600&q=80'
};

type Gender = 'male' | 'female';

function getGenderLabel(gender?: string | null): string {
  if (!gender) return '-';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'l' || g === 'laki-laki') return 'Laki-laki';
  if (g === 'female' || g === 'p' || g === 'perempuan') return 'Perempuan';
  return gender;
}

function ProfileStaticField({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id} className='text-xs font-semibold text-muted-foreground'>
        {label}
      </Label>
      <div
        id={id}
        className='w-full rounded-xl bg-muted/15 border border-border/50 px-3 py-2 text-xs sm:text-sm text-foreground select-text cursor-default flex items-center min-h-[40px]'
      >
        <span className='truncate'>{value}</span>
      </div>
    </div>
  );
}

export function ClinicProfileView() {
  const { user } = useAuthContext();
  const { bloodTypes } = usePatientFormReferences();
  const [patientData, setPatientData] = useState<PatientProfileDto | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState<{
    fullName: string;
    gender: Gender | '';
    birthPlace: string;
    birthDate: string;
    occupation: string;
    phoneNumber: string;
    alamatDetail: string;
    kelurahan: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    bloodType: string;
    allergies: string;
    medicalHistory: string;
  }>({
    fullName: '',
    gender: '',
    birthPlace: '',
    birthDate: '',
    occupation: '',
    phoneNumber: '',
    alamatDetail: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    bloodType: '',
    allergies: '',
    medicalHistory: ''
  });

  // Load live patient profile data from GET /api/v1/patients/me
  useEffect(() => {
    let isMounted = true;
    async function loadPatientProfile() {
      try {
        const data = await getPatientProfileAction();
        if (isMounted && data) {
          setPatientData(data);
        }
      } catch {
        // Fallback gracefully to user context
      } finally {
        if (isMounted) {
          setIsLoadingPatient(false);
        }
      }
    }
    loadPatientProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEditDialog = useCallback(() => {
    const rawAllergies = patientData?.allergies;
    const allergiesStr = Array.isArray(rawAllergies)
      ? rawAllergies.join(', ')
      : typeof rawAllergies === 'string'
        ? rawAllergies
        : '';

    setEditForm({
      fullName: patientData?.fullName || user?.name || '',
      gender: (patientData?.gender as Gender) || '',
      birthPlace: patientData?.birthPlace || '',
      birthDate: patientData?.birthDate || '',
      occupation: patientData?.occupation || '',
      phoneNumber: patientData?.phone || patientData?.phoneNumber || '',
      alamatDetail:
        patientData?.line1 ||
        patientData?.fullAddress ||
        patientData?.alamatDetail ||
        patientData?.address ||
        '',
      kelurahan: patientData?.villageName || patientData?.kelurahan || '',
      kecamatan: patientData?.districtName || patientData?.kecamatan || '',
      kabupaten: patientData?.regencyName || patientData?.kabupaten || '',
      provinsi: patientData?.provinceName || patientData?.provinsi || '',
      emergencyContactName:
        patientData?.emergencyContactName || patientData?.emergencyContactDetail?.name || '',
      emergencyContactPhone:
        patientData?.emergencyContactPhone || patientData?.emergencyContactDetail?.phone || '',
      emergencyContactRelationship:
        patientData?.emergencyContactRelationship ||
        patientData?.emergencyContactDetail?.relationship ||
        '',
      bloodType: patientData?.bloodType || '',
      allergies: allergiesStr,
      medicalHistory: patientData?.medicalHistory || ''
    });
    setIsEditDialogOpen(true);
  }, [patientData, user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const allergiesList = editForm.allergies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const result = await updatePatientProfileAction({
        fullName: editForm.fullName.trim() || undefined,
        gender: editForm.gender ? editForm.gender : undefined,
        birthPlace: editForm.birthPlace.trim() || undefined,
        birthDate: editForm.birthDate.trim() || undefined,
        occupation: editForm.occupation.trim() || undefined,
        phone: editForm.phoneNumber.trim() || undefined,
        phoneNumber: editForm.phoneNumber.trim() || undefined,
        line1: editForm.alamatDetail.trim() || undefined,
        fullAddress: editForm.alamatDetail.trim() || undefined,
        alamatDetail: editForm.alamatDetail.trim() || undefined,
        villageName: editForm.kelurahan.trim() || undefined,
        kelurahan: editForm.kelurahan.trim() || undefined,
        districtName: editForm.kecamatan.trim() || undefined,
        kecamatan: editForm.kecamatan.trim() || undefined,
        regencyName: editForm.kabupaten.trim() || undefined,
        kabupaten: editForm.kabupaten.trim() || undefined,
        provinceName: editForm.provinsi.trim() || undefined,
        provinsi: editForm.provinsi.trim() || undefined,
        emergencyContactName: editForm.emergencyContactName.trim() || undefined,
        emergencyContactPhone: editForm.emergencyContactPhone.trim() || undefined,
        emergencyContactRelationship: editForm.emergencyContactRelationship.trim() || undefined,
        bloodType: editForm.bloodType,
        allergies: allergiesList,
        medicalHistory: editForm.medicalHistory.trim() || undefined
      });

      if (result.success && result.data) {
        setPatientData(result.data);
        setIsEditDialogOpen(false);
        toast.success('Profil Pasien Berhasil Disimpan', {
          description: 'Seluruh data demografi, domisili, dan catatan medis telah diperbarui.'
        });
      } else {
        toast.error('Gagal Memperbarui Profil', {
          description: result.message || 'Terjadi kesalahan saat menyimpan data profil pasien.'
        });
      }
    } catch {
      toast.error('Gagal Menyimpan', {
        description: 'Terjadi kegagalan jaringan saat mengirim data profil.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutAllDevices = useCallback(async () => {
    try {
      await logoutAction();
    } catch {
      // ignore
    }
    try {
      await signOut();
    } catch {
      // ignore
    }
    window.location.href = '/auth/sign-in';
  }, []);

  // Display attributes with canonical backend fields & safe fallbacks
  const displayName = patientData?.fullName || user?.name || DEFAULT_PATIENT_PROFILE.name;
  const displayEmail = user?.email || DEFAULT_PATIENT_PROFILE.email;
  const displayAvatar = patientData?.avatarUrl || user?.image || DEFAULT_PATIENT_PROFILE.avatar;
  const displayMrn = patientData?.medicalRecordNumber || 'RM-Belum Terbit';
  const displayNik = patientData?.nik || '-';
  const displayGender = getGenderLabel(patientData?.gender);
  const displayBirth =
    patientData?.birthPlace || patientData?.birthDate
      ? `${patientData?.birthPlace || '-'}, ${patientData?.birthDate || '-'}`
      : '-';
  const displayIbu = patientData?.motherName || '-';
  const displayPekerjaan = patientData?.occupation || '-';
  const displayPhone = patientData?.phone || patientData?.phoneNumber || '-';

  const displayAlamat =
    patientData?.line1 ||
    patientData?.fullAddress ||
    patientData?.alamatDetail ||
    patientData?.address ||
    '-';
  const displayKelurahan = patientData?.villageName || patientData?.kelurahan || '-';
  const displayKecamatan = patientData?.districtName || patientData?.kecamatan || '-';
  const displayKabupaten = patientData?.regencyName || patientData?.kabupaten || '-';
  const displayProvinsi = patientData?.provinceName || patientData?.provinsi || '-';

  const displayEmName =
    patientData?.emergencyContactName || patientData?.emergencyContactDetail?.name || '-';
  const displayEmPhone =
    patientData?.emergencyContactPhone || patientData?.emergencyContactDetail?.phone || '-';
  const displayEmRel =
    patientData?.emergencyContactRelationship ||
    patientData?.emergencyContactDetail?.relationship ||
    '-';
  const displayBlood = patientData?.bloodType || '-';
  const displayAllergies = Array.isArray(patientData?.allergies)
    ? patientData.allergies.join(', ') || 'Tidak ada riwayat alergi'
    : patientData?.allergies || 'Tidak ada riwayat alergi';
  const displayHistory = patientData?.medicalHistory || 'Tidak ada riwayat penyakit terdokumentasi';

  return (
    <PageContainer
      pageTitle='Profil Pasien'
      pageDescription='Informasi rekam medis, kartu BPJS, dan data akun klinik Anda'
      scrollable
    >
      <div className='flex flex-col flex-1 w-full space-y-6 font-sans select-none pb-12'>
        {/* Main Card Container */}
        <div className='w-full bg-card rounded-2xl border border-border/60 overflow-hidden shadow-none'>
          {/* 1. Cover Landscape Banner */}
          <div className='relative w-full h-44 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-muted'>
            <Image
              src={DEFAULT_PATIENT_PROFILE.coverImage}
              alt='Cover Profile'
              fill
              unoptimized
              priority
              className='object-cover object-center w-full h-full'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />
          </div>

          {/* 2. Hero Section: Avatar Overlap, Edit Button, Name & Verified Check */}
          <div className='px-5 sm:px-8 pb-6'>
            <div className='flex items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4'>
              {/* Overlapping Avatar */}
              <div className='relative size-24 sm:size-28 md:size-32 rounded-full overflow-hidden ring-4 ring-card bg-muted shadow-sm shrink-0'>
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  width={140}
                  height={140}
                  unoptimized
                  className='size-full object-cover object-center rounded-full'
                />
              </div>

              {/* Edit Profile Button */}
              <Button
                variant='outline'
                size='sm'
                onClick={handleOpenEditDialog}
                disabled={isLoadingPatient}
                className='rounded-xl gap-2 font-medium text-xs sm:text-sm border-border/80 hover:bg-muted cursor-pointer'
              >
                <Icons.edit className='size-3.5' />
                <span>Edit profil</span>
              </Button>
            </div>

            {/* Patient Name, Badges, and Email */}
            <div className='space-y-1.5'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-xl sm:text-2xl font-bold text-foreground flex items-center gap-1.5 tracking-tight'>
                  <span>{displayName}</span>
                  <span className='inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary'>
                    <Icons.check className='size-3.5 stroke-[3]' />
                  </span>
                </h2>
                {patientData?.medicalRecordNumber && (
                  <Badge
                    variant='outline'
                    className='text-[11px] font-semibold bg-primary/5 text-primary border-primary/20'
                  >
                    Rekam Medis: {patientData.medicalRecordNumber}
                  </Badge>
                )}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground font-normal'>
                {displayEmail} {displayPhone !== '-' && `• ${displayPhone}`}
              </p>
            </div>

            {/* 3. Metadata 4-Column Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-6 my-6 border-y border-border/50'>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>No. Rekam Medis</span>
                <p className='text-sm sm:text-base font-bold text-foreground'>{displayMrn}</p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>NIK</span>
                <p className='text-sm sm:text-base font-bold text-foreground'>{displayNik}</p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>Jenis Kelamin</span>
                <p className='text-sm sm:text-base font-bold text-foreground'>{displayGender}</p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>
                  Tempat, Tanggal Lahir
                </span>
                <p className='text-sm sm:text-base font-bold text-foreground'>{displayBirth}</p>
              </div>
            </div>

            {/* 4. Section 1: Demografi Pasien */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-border/50'>
              <div className='lg:col-span-4 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>Demografi Pasien</h3>
              </div>

              <div className='lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl'>
                <ProfileStaticField
                  id='view-demografi-name'
                  label='Nama Lengkap Pasien'
                  value={displayName}
                />
                <ProfileStaticField
                  id='view-demografi-ibu'
                  label='Nama Ibu Kandung'
                  value={displayIbu}
                />
                <ProfileStaticField
                  id='view-demografi-pekerjaan'
                  label='Pekerjaan / Profesi'
                  value={displayPekerjaan}
                />
                <ProfileStaticField
                  id='view-demografi-phone'
                  label='Nomor Telepon / WhatsApp'
                  value={displayPhone}
                />
              </div>
            </div>

            {/* 5. Section 2: Alamat Domisili */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 border-b border-border/50'>
              <div className='lg:col-span-4 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>Alamat Domisili</h3>
              </div>

              <div className='lg:col-span-8 space-y-4 max-w-2xl'>
                <ProfileStaticField
                  id='view-domisili-detail'
                  label='Alamat Lengkap / Jalan'
                  value={displayAlamat}
                />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <ProfileStaticField
                    id='view-domisili-kelurahan'
                    label='Kelurahan / Desa'
                    value={displayKelurahan}
                  />
                  <ProfileStaticField
                    id='view-domisili-kecamatan'
                    label='Kecamatan'
                    value={displayKecamatan}
                  />
                  <ProfileStaticField
                    id='view-domisili-kabupaten'
                    label='Kabupaten / Kota'
                    value={displayKabupaten}
                  />
                  <ProfileStaticField
                    id='view-domisili-provinsi'
                    label='Provinsi'
                    value={displayProvinsi}
                  />
                </div>
              </div>
            </div>

            {/* 6. Section 3: Kontak Darurat & Catatan Medis */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 border-b border-border/50'>
              <div className='lg:col-span-4 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>
                  Kontak Darurat & Catatan Medis
                </h3>
              </div>

              <div className='lg:col-span-8 space-y-4 max-w-2xl'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <ProfileStaticField
                    id='view-medis-em-name'
                    label='Nama Kontak Darurat'
                    value={displayEmName}
                  />
                  <ProfileStaticField
                    id='view-medis-em-phone'
                    label='Nomor Telepon Kontak'
                    value={displayEmPhone}
                  />
                  <ProfileStaticField
                    id='view-medis-em-rel'
                    label='Hubungan'
                    value={displayEmRel}
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <ProfileStaticField
                    id='view-medis-blood'
                    label='Golongan Darah'
                    value={displayBlood}
                  />
                  <ProfileStaticField
                    id='view-medis-allergies'
                    label='Alergi Obat / Makanan'
                    value={displayAllergies}
                  />
                </div>

                <ProfileStaticField
                  id='view-medis-history'
                  label='Riwayat Penyakit / Catatan Tambahan'
                  value={displayHistory}
                />
              </div>
            </div>

            {/* 7. Section 4: Keluar dari semua perangkat */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 border-b border-border/50'>
              <div className='lg:col-span-8 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>
                  Keluar dari semua perangkat
                </h3>
              </div>

              <div className='lg:col-span-4 flex items-center justify-start lg:justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogoutAllDevices}
                  className='rounded-xl border-border/70 text-xs sm:text-sm font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 cursor-pointer'
                >
                  Keluar Sesi
                </Button>
              </div>
            </div>

            {/* 8. Section 5: Hapus Akun Permanen (Zona Bahaya / GDPR Right to Erasure) */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8'>
              <div className='lg:col-span-8 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-destructive flex items-center gap-2'>
                  <Icons.warning className='size-4' />
                  <span>Hapus Akun Permanen (Zona Bahaya)</span>
                </h3>
              </div>

              <div className='lg:col-span-4 flex items-center justify-start lg:justify-end'>
                <DeleteAccountDialog userEmail={displayEmail} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[620px] rounded-2xl max-h-[90vh] flex flex-col p-4 sm:p-6'>
          <DialogHeader>
            <DialogTitle className='text-base sm:text-lg font-bold'>Edit Profil Pasien</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Perbarui rincian identitas kependudukan, domisili, kontak darurat, dan catatan medis
              Anda di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue='demografi'
            className='w-full flex-1 overflow-hidden flex flex-col pt-2'
          >
            <TabsList className='grid grid-cols-3 gap-1 sm:gap-1.5 w-full mb-3 h-auto p-1 bg-muted/80 rounded-xl'>
              <TabsTrigger
                value='demografi'
                className='text-[11px] sm:text-xs font-medium px-1 sm:px-2 py-1.5 h-8 rounded-lg min-w-0 transition-all cursor-pointer'
              >
                <span className='truncate'>Demografi</span>
              </TabsTrigger>
              <TabsTrigger
                value='domisili'
                className='text-[11px] sm:text-xs font-medium px-1 sm:px-2 py-1.5 h-8 rounded-lg min-w-0 transition-all cursor-pointer'
              >
                <span className='truncate'>Alamat Domisili</span>
              </TabsTrigger>
              <TabsTrigger
                value='medis'
                className='text-[11px] sm:text-xs font-medium px-1 sm:px-2 py-1.5 h-8 rounded-lg min-w-0 transition-all cursor-pointer'
              >
                <span className='truncate'>Kontak & Medis</span>
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-y-auto pr-1'>
              {/* Tab 1: Demografi */}
              <TabsContent value='demografi' className='space-y-3.5 m-0'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-fullname'
                    className='text-xs font-medium text-foreground'
                  >
                    Nama Lengkap
                  </Label>
                  <Input
                    id='edit-profile-fullname'
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className='h-9 text-xs rounded-lg'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-gender'
                    className='text-xs font-medium text-foreground'
                  >
                    Jenis Kelamin
                  </Label>
                  <Select
                    value={editForm.gender || undefined}
                    onValueChange={(val: Gender) =>
                      setEditForm((prev) => ({ ...prev, gender: val }))
                    }
                  >
                    <SelectTrigger
                      id='edit-profile-gender'
                      aria-label='Pilih Jenis Kelamin'
                      className='h-9 text-xs rounded-lg'
                    >
                      <SelectValue placeholder='Pilih Jenis Kelamin' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Laki-laki</SelectItem>
                      <SelectItem value='female'>Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-birthplace'
                      className='text-xs font-medium text-foreground'
                    >
                      Tempat Lahir
                    </Label>
                    <Input
                      id='edit-profile-birthplace'
                      value={editForm.birthPlace}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, birthPlace: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-birthdate'
                      className='text-xs font-medium text-foreground'
                    >
                      Tanggal Lahir
                    </Label>
                    <Input
                      id='edit-profile-birthdate'
                      type='date'
                      value={editForm.birthDate}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, birthDate: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-pekerjaan'
                      className='text-xs font-medium text-foreground'
                    >
                      Pekerjaan / Profesi
                    </Label>
                    <Input
                      id='edit-profile-pekerjaan'
                      value={editForm.occupation}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, occupation: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-phone'
                      className='text-xs font-medium text-foreground'
                    >
                      Nomor Telepon / WhatsApp
                    </Label>
                    <Input
                      id='edit-profile-phone'
                      value={editForm.phoneNumber}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Alamat Domisili */}
              <TabsContent value='domisili' className='space-y-3.5 m-0'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-address-detail'
                    className='text-xs font-medium text-foreground'
                  >
                    Alamat Lengkap / Jalan
                  </Label>
                  <Textarea
                    id='edit-profile-address-detail'
                    value={editForm.alamatDetail}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, alamatDetail: e.target.value }))
                    }
                    className='text-xs rounded-lg min-h-[60px]'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-provinsi'
                      className='text-xs font-medium text-foreground'
                    >
                      Provinsi
                    </Label>
                    <Input
                      id='edit-profile-provinsi'
                      value={editForm.provinsi}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, provinsi: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-kabupaten'
                      className='text-xs font-medium text-foreground'
                    >
                      Kabupaten / Kota
                    </Label>
                    <Input
                      id='edit-profile-kabupaten'
                      value={editForm.kabupaten}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, kabupaten: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-kecamatan'
                      className='text-xs font-medium text-foreground'
                    >
                      Kecamatan
                    </Label>
                    <Input
                      id='edit-profile-kecamatan'
                      value={editForm.kecamatan}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, kecamatan: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-kelurahan'
                      className='text-xs font-medium text-foreground'
                    >
                      Kelurahan / Desa
                    </Label>
                    <Input
                      id='edit-profile-kelurahan'
                      value={editForm.kelurahan}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, kelurahan: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Kontak & Medis */}
              <TabsContent value='medis' className='space-y-3.5 m-0'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-em-name'
                    className='text-xs font-medium text-foreground'
                  >
                    Nama Kontak Darurat
                  </Label>
                  <Input
                    id='edit-profile-em-name'
                    value={editForm.emergencyContactName}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, emergencyContactName: e.target.value }))
                    }
                    className='h-9 text-xs rounded-lg'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-em-phone'
                      className='text-xs font-medium text-foreground'
                    >
                      Nomor Telepon Kontak
                    </Label>
                    <Input
                      id='edit-profile-em-phone'
                      value={editForm.emergencyContactPhone}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='edit-profile-em-rel'
                      className='text-xs font-medium text-foreground'
                    >
                      Hubungan
                    </Label>
                    <Input
                      id='edit-profile-em-rel'
                      value={editForm.emergencyContactRelationship}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          emergencyContactRelationship: e.target.value
                        }))
                      }
                      className='h-9 text-xs rounded-lg'
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-blood-type'
                    className='text-xs font-medium text-foreground'
                  >
                    Golongan Darah
                  </Label>
                  <Select
                    value={editForm.bloodType}
                    onValueChange={(val: string) =>
                      setEditForm((prev) => ({ ...prev, bloodType: val }))
                    }
                  >
                    <SelectTrigger
                      id='edit-profile-blood-type'
                      aria-label='Pilih Golongan Darah'
                      className='h-9 text-xs rounded-lg'
                    >
                      <SelectValue placeholder='Pilih Golongan Darah' />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map((opt) => (
                        <SelectItem key={opt.value} value={opt.label}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-allergies'
                    className='text-xs font-medium text-foreground'
                  >
                    Alergi Obat / Makanan (Pisahkan dengan koma)
                  </Label>
                  <Input
                    id='edit-profile-allergies'
                    value={editForm.allergies}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, allergies: e.target.value }))
                    }
                    placeholder='Contoh: Paracetamol, Seafood'
                    className='h-9 text-xs rounded-lg'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label
                    htmlFor='edit-profile-med-history'
                    className='text-xs font-medium text-foreground'
                  >
                    Riwayat Penyakit / Catatan Tambahan
                  </Label>
                  <Textarea
                    id='edit-profile-med-history'
                    value={editForm.medicalHistory}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, medicalHistory: e.target.value }))
                    }
                    placeholder='Contoh: Asma ringan, Hipertensi'
                    className='text-xs rounded-lg min-h-[60px]'
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className='gap-2 sm:gap-0 pt-3 border-t border-border/50'>
            <Button
              variant='outline'
              size='sm'
              disabled={isSaving}
              onClick={() => setIsEditDialogOpen(false)}
              className='rounded-xl text-xs cursor-pointer'
            >
              Batal
            </Button>
            <Button
              size='sm'
              disabled={isSaving}
              onClick={handleSaveProfile}
              className='rounded-xl text-xs cursor-pointer gap-2'
            >
              {isSaving && <Icons.spinner className='size-3.5 animate-spin' />}
              <span>Simpan Perubahan</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
