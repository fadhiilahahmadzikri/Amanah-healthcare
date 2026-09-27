'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  patientAffiliationService,
  type OccupationItem,
  type CreateAffiliationPayload,
  type PatientAffiliationProfile
} from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingOnDemandPatientFormProps {
  onSuccess: (newPatient: PatientAffiliationProfile) => void;
  onCancel: () => void;
}

export function BookingOnDemandPatientForm({
  onSuccess,
  onCancel
}: BookingOnDemandPatientFormProps) {
  const [occupations, setOccupations] = useState<OccupationItem[]>([]);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAffiliationPayload>({
    fullName: '',
    nik: '',
    motherName: '',
    placeOfBirth: '',
    dateOfBirth: '',
    gender: 'L',
    bloodType: 'O',
    address: '',
    relationship: 'child',
    occupationCode: 'belum_bekerja'
  });

  useEffect(() => {
    let isMounted = true;
    patientAffiliationService.getOccupations().then((list) => {
      if (isMounted) {
        setOccupations(list);
        if (list.length > 0 && !formData.occupationCode) {
          setFormData((prev) => ({ ...prev, occupationCode: list[0].code }));
        }
        setIsLoadingOccupations(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [formData.occupationCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim()) {
      setErrorMsg('Nama lengkap pasien wajib diisi.');
      return;
    }
    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka.');
      return;
    }
    if (!formData.motherName.trim()) {
      setErrorMsg('Nama ibu kandung wajib diisi.');
      return;
    }
    if (!formData.dateOfBirth) {
      setErrorMsg('Tanggal lahir wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPatient = await patientAffiliationService.createAffiliation(formData);
      onSuccess(newPatient);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyimpan profil pasien. Pastikan data valid.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 max-h-[460px] overflow-y-auto px-1 pr-2'>
      <div className='border-b border-border/50 pb-2 mb-3'>
        <h4 className='text-sm sm:text-base font-bold text-foreground'>
          Formulir Data Pasien (On-Demand)
        </h4>
        <p className='text-xs text-muted-foreground'>
          Data identitas pre-service disimpan langsung dan terhubung ke akun Anda
        </p>
      </div>

      {errorMsg && (
        <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold'>
          {errorMsg}
        </div>
      )}

      {/* Row 1: Hubungan & Nama Lengkap */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Hubungan dengan Akun</Label>
          <Select
            value={formData.relationship}
            onValueChange={(val: CreateAffiliationPayload['relationship']) =>
              setFormData((p) => ({ ...p, relationship: val }))
            }
          >
            <SelectTrigger className='h-9 text-xs rounded-xl'>
              <SelectValue placeholder='Pilih Hubungan' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='self'>Diri Sendiri</SelectItem>
              <SelectItem value='spouse'>Pasangan (Suami / Istri)</SelectItem>
              <SelectItem value='child'>Anak</SelectItem>
              <SelectItem value='parent'>Orang Tua</SelectItem>
              <SelectItem value='sibling'>Saudara Kandung</SelectItem>
              <SelectItem value='relative'>Kerabat / Keluarga Lain</SelectItem>
              <SelectItem value='other'>Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Nama Lengkap Pasien *</Label>
          <Input
            required
            value={formData.fullName}
            onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
            placeholder='cth. Fadhiilah Ahmad'
            className='h-9 text-xs rounded-xl'
          />
        </div>
      </div>

      {/* Row 2: NIK & Nama Ibu Kandung */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>NIK (16 Digit) *</Label>
          <Input
            required
            maxLength={16}
            value={formData.nik}
            onChange={(e) =>
              setFormData((p) => ({ ...p, nik: e.target.value.replace(/\D/g, '').slice(0, 16) }))
            }
            placeholder='3201xxxxxxxxxxxx'
            className='h-9 text-xs rounded-xl font-mono'
          />
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Nama Ibu Kandung *</Label>
          <Input
            required
            value={formData.motherName}
            onChange={(e) => setFormData((p) => ({ ...p, motherName: e.target.value }))}
            placeholder='Nama ibu kandung'
            className='h-9 text-xs rounded-xl'
          />
        </div>
      </div>

      {/* Row 3: Tempat & Tanggal Lahir */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Tempat Lahir</Label>
          <Input
            value={formData.placeOfBirth}
            onChange={(e) => setFormData((p) => ({ ...p, placeOfBirth: e.target.value }))}
            placeholder='cth. Yogyakarta'
            className='h-9 text-xs rounded-xl'
          />
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Tanggal Lahir *</Label>
          <Input
            required
            type='date'
            value={formData.dateOfBirth}
            onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
            className='h-9 text-xs rounded-xl'
          />
        </div>
      </div>

      {/* Row 4: Jenis Kelamin & Golongan Darah */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Jenis Kelamin</Label>
          <div className='grid grid-cols-2 gap-2'>
            {[
              { val: 'L', label: 'Laki-laki' },
              { val: 'P', label: 'Perempuan' }
            ].map((g) => (
              <button
                key={g.val}
                type='button'
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    gender: g.val as CreateAffiliationPayload['gender']
                  }))
                }
                className={cn(
                  'h-9 rounded-xl text-xs font-medium border transition-colors select-none',
                  formData.gender === g.val
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border/60 bg-muted/20 text-muted-foreground'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold text-foreground'>Golongan Darah</Label>
          <div className='grid grid-cols-4 gap-1.5'>
            {['A', 'B', 'AB', 'O'].map((b) => (
              <button
                key={b}
                type='button'
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    bloodType: b as CreateAffiliationPayload['bloodType']
                  }))
                }
                className={cn(
                  'h-9 rounded-xl text-xs font-bold border transition-colors select-none',
                  formData.bloodType === b
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/60 bg-muted/20 text-muted-foreground'
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: Pekerjaan (DB Driven) */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-semibold text-foreground'>Pekerjaan</Label>
        <Select
          disabled={isLoadingOccupations}
          value={formData.occupationCode}
          onValueChange={(val) => setFormData((p) => ({ ...p, occupationCode: val }))}
        >
          <SelectTrigger className='h-9 text-xs rounded-xl'>
            <SelectValue
              placeholder={isLoadingOccupations ? 'Memuat pekerjaan...' : 'Pilih Pekerjaan'}
            />
          </SelectTrigger>
          <SelectContent className='max-h-[220px]'>
            {occupations.map((occ) => (
              <SelectItem key={occ.code} value={occ.code} className='text-xs'>
                {occ.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 6: Alamat / Domisili */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-semibold text-foreground'>Alamat / Domisili</Label>
        <Textarea
          rows={2}
          value={formData.address}
          onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
          placeholder='Alamat lengkap tempat tinggal saat ini'
          className='text-xs rounded-xl min-h-[50px]'
        />
      </div>

      {/* Buttons */}
      <div className='flex items-center justify-end gap-2.5 pt-3 border-t border-border/40'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          shape='pill'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Kembali
        </Button>
        <Button
          type='submit'
          variant='default'
          size='sm'
          shape='pill'
          disabled={isSubmitting}
          className='font-bold px-6'
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
        </Button>
      </div>
    </form>
  );
}
