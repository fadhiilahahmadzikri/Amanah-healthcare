'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface PatientProfileData {
  name: string;
  email: string;
  avatar: string;
  coverImage: string;
  patientUsername: string;
  registeredDate: string;
  totalVisits: string;
  bpjsStatus: string;
  medicalRecordNo: string;
  bloodType: string;
  emergencyContact: string;
  allergies: string;
}

const DEFAULT_PATIENT_PROFILE: PatientProfileData = {
  name: 'Hida cantik',
  email: 'Hidacantik@gmail.com',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  coverImage:
    'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1600&q=80',
  patientUsername: 'hidacantik',
  registeredDate: '14 Ags 2025',
  totalVisits: '12 Kunjungan',
  bpjsStatus: 'Aktif (Kelas 1)',
  medicalRecordNo: 'RM-88902',
  bloodType: 'O+',
  emergencyContact: '0812-3456-7890 (Ibu)',
  allergies: 'Alergi Seafood, Penicillin'
};

export function ClinicProfileView() {
  const [profile, setProfile] = useState<PatientProfileData>(DEFAULT_PATIENT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PatientProfileData>(DEFAULT_PATIENT_PROFILE);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleOpenEditDialog = () => {
    setEditForm({ ...profile });
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    setProfile({ ...editForm });
    setIsEditDialogOpen(false);
    toast.success('Profil Pasien Berhasil Disimpan', {
      description: 'Data profil umum dan catatan medis telah diperbarui.'
    });
  };

  const handleDirectFieldChange = (field: keyof PatientProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoutAllDevices = () => {
    toast.info('Keluar dari Semua Perangkat', {
      description: 'Seluruh sesi login pasien pada perangkat lain telah dinonaktifkan.'
    });
  };

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
              src={profile.coverImage}
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
                  src={profile.avatar}
                  alt={profile.name}
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
                className='rounded-xl gap-2 font-medium text-xs sm:text-sm border-border/80 hover:bg-muted'
              >
                <Icons.edit className='size-3.5' />
                <span>Edit profil</span>
              </Button>
            </div>

            {/* Patient Name and Email */}
            <div className='space-y-0.5'>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground flex items-center gap-1.5 tracking-tight'>
                <span>{profile.name}</span>
                <span className='inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary'>
                  <Icons.check className='size-3.5 stroke-[3]' />
                </span>
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground font-normal'>
                {profile.email}
              </p>
            </div>

            {/* 3. Metadata 4-Column Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-6 my-6 border-y border-border/50'>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>Terdaftar sejak</span>
                <p className='text-sm sm:text-base font-bold text-foreground'>
                  {profile.registeredDate}
                </p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>Total kunjungan</span>
                <p className='text-sm sm:text-base font-bold text-foreground'>
                  {profile.totalVisits}
                </p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>Status BPJS</span>
                <p className='text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400'>
                  {profile.bpjsStatus}
                </p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground font-normal'>No. Rekam Medis</span>
                <p className='text-sm sm:text-base font-bold text-foreground'>
                  {profile.medicalRecordNo}
                </p>
              </div>
            </div>

            {/* 4. Section 1: Profil Publik */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-border/50'>
              <div className='lg:col-span-4 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>Profil Publik</h3>
                <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                  Informasi umum yang ditampilkan pada profil pasien.
                </p>
              </div>

              <div className='lg:col-span-8 space-y-4 max-w-2xl'>
                {/* Field: Nama Lengkap */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>
                    Nama Lengkap
                  </label>
                  <Input
                    value={profile.name}
                    onChange={(e) => handleDirectFieldChange('name', e.target.value)}
                    placeholder='Nama lengkap pasien'
                    className='bg-muted/15 border-border/60 rounded-xl text-xs sm:text-sm h-10'
                  />
                </div>

                {/* Field: Tautan Pasien */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>
                    Tautan Pasien
                  </label>
                  <div className='flex items-center rounded-xl border border-border/60 overflow-hidden bg-muted/15 h-10'>
                    <span className='px-3.5 h-full flex items-center bg-muted/40 text-xs sm:text-sm text-muted-foreground border-r border-border/60 font-medium select-none'>
                      amanahhealth.id/
                    </span>
                    <input
                      type='text'
                      value={profile.patientUsername}
                      onChange={(e) => handleDirectFieldChange('patientUsername', e.target.value)}
                      className='flex-1 bg-transparent px-3.5 text-xs sm:text-sm text-foreground focus:outline-none'
                      placeholder='username'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Section 2: Informasi Medis */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 border-b border-border/50'>
              <div className='lg:col-span-4 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>Informasi Medis</h3>
                <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                  Catatan medis penting untuk rujukan dokter.
                </p>
              </div>

              <div className='lg:col-span-8 space-y-4 max-w-2xl'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* Field: Golongan Darah */}
                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold text-muted-foreground'>
                      Golongan Darah
                    </label>
                    <Select
                      value={profile.bloodType}
                      onValueChange={(val) => handleDirectFieldChange('bloodType', val)}
                    >
                      <SelectTrigger className='bg-muted/15 border-border/60 rounded-xl text-xs sm:text-sm h-10'>
                        <SelectValue placeholder='Pilih Golongan Darah' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='A+'>A+ (Rhesus Positif)</SelectItem>
                        <SelectItem value='B+'>B+ (Rhesus Positif)</SelectItem>
                        <SelectItem value='AB+'>AB+ (Rhesus Positif)</SelectItem>
                        <SelectItem value='O+'>O+ (Rhesus Positif)</SelectItem>
                        <SelectItem value='A-'>A- (Rhesus Negatif)</SelectItem>
                        <SelectItem value='B-'>B- (Rhesus Negatif)</SelectItem>
                        <SelectItem value='AB-'>AB- (Rhesus Negatif)</SelectItem>
                        <SelectItem value='O-'>O- (Rhesus Negatif)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Field: Kontak Darurat */}
                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold text-muted-foreground'>
                      Kontak Darurat
                    </label>
                    <Input
                      value={profile.emergencyContact}
                      onChange={(e) => handleDirectFieldChange('emergencyContact', e.target.value)}
                      placeholder='0812-3456-7890 (Ibu)'
                      className='bg-muted/15 border-border/60 rounded-xl text-xs sm:text-sm h-10'
                    />
                  </div>
                </div>

                {/* Field: Alergi Obat / Makanan */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>
                    Alergi Obat / Makanan
                  </label>
                  <Input
                    value={profile.allergies}
                    onChange={(e) => handleDirectFieldChange('allergies', e.target.value)}
                    placeholder='Contoh: Alergi Seafood, Penicillin'
                    className='bg-muted/15 border-border/60 rounded-xl text-xs sm:text-sm h-10'
                  />
                </div>
              </div>
            </div>

            {/* 6. Section 3: Keluar dari semua perangkat */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8'>
              <div className='lg:col-span-8 space-y-1'>
                <h3 className='text-sm sm:text-base font-bold text-foreground'>
                  Keluar dari semua perangkat
                </h3>
                <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                  Keluarkan akun ini dari seluruh sesi aktif di perangkat lain.
                </p>
              </div>

              <div className='lg:col-span-4 flex items-center justify-start lg:justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogoutAllDevices}
                  className='rounded-xl border-border/70 text-xs sm:text-sm font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40'
                >
                  Keluar Sesi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[500px] rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='text-base sm:text-lg font-bold'>Edit Profil Pasien</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Perbarui rincian identitas dan catatan medis Anda di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-3'>
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>Nama Lengkap</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className='h-9 text-xs rounded-lg'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>Email</label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className='h-9 text-xs rounded-lg'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>Golongan Darah</label>
                <Select
                  value={editForm.bloodType}
                  onValueChange={(v) => setEditForm({ ...editForm, bloodType: v })}
                >
                  <SelectTrigger className='h-9 text-xs rounded-lg'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='A+'>A+</SelectItem>
                    <SelectItem value='B+'>B+</SelectItem>
                    <SelectItem value='AB+'>AB+</SelectItem>
                    <SelectItem value='O+'>O+</SelectItem>
                    <SelectItem value='A-'>A-</SelectItem>
                    <SelectItem value='B-'>B-</SelectItem>
                    <SelectItem value='AB-'>AB-</SelectItem>
                    <SelectItem value='O-'>O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>Kontak Darurat</label>
                <Input
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className='h-9 text-xs rounded-lg'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>Alergi Obat / Makanan</label>
              <Input
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                className='h-9 text-xs rounded-lg'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditDialogOpen(false)}
              className='rounded-xl text-xs'
            >
              Batal
            </Button>
            <Button size='sm' onClick={handleSaveProfile} className='rounded-xl text-xs'>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
