'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import type { Gender } from '@/constants/gender.constants';
import {
  type PatientAffiliationProfile,
  type PatientRelationshipType,
  type PatientBloodType
} from '@/features/data-pasien/api/patient-affiliation-service';
import { updatePatient } from '@/features/data-pasien/api/service';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientGenderSelector } from '@/features/data-pasien/components/registration/molecules/patient-gender-selector';
import { PatientBloodTypeSelector } from '@/features/data-pasien/components/registration/molecules/patient-blood-type-selector';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { PatientSearchableSelect } from '@/features/data-pasien/components/registration/molecules/patient-searchable-select';

export interface BookingRegularPatientEditModalProps {
  patient: PatientAffiliationProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PatientAffiliationProfile) => void;
  allowedRelationships?: { value: string; label: string; description?: string }[];
}

export function BookingRegularPatientEditModal({
  patient,
  isOpen,
  onClose,
  onSuccess,
  allowedRelationships
}: BookingRegularPatientEditModalProps) {
  const queryClient = useQueryClient();
  const references = usePatientFormReferences();

  const [relationship, setRelationship] = React.useState<PatientRelationshipType>('spouse');
  const [fullName, setFullName] = React.useState('');
  const [nik, setNik] = React.useState('');
  const [motherName, setMotherName] = React.useState('');
  const [placeOfBirth, setPlaceOfBirth] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [gender, setGender] = React.useState<Gender>('male');
  const [bloodType, setBloodType] = React.useState<PatientBloodType>('');
  const [region, setRegion] = React.useState<PatientRegionValues>({
    provinceName: '',
    provinceCode: '',
    regencyName: '',
    regencyCode: '',
    districtName: '',
    districtCode: '',
    villageName: '',
    villageCode: '',
    line1: ''
  });
  const [occupationCode, setOccupationCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (patient && isOpen) {
      const currentRel =
        (patient.relationship as PatientRelationshipType) || (patient.isSelf ? 'self' : 'spouse');
      setRelationship(currentRel);
      setFullName(patient.fullName || '');
      setNik(patient.nik || '');
      setMotherName(patient.motherName || '');
      setPlaceOfBirth(patient.birthPlace || '');
      const rawDate = patient.birthDate || '';
      setDateOfBirth(rawDate ? rawDate.split('T')[0] : '');
      setGender(patient.gender);
      setBloodType((patient.bloodType as PatientBloodType) || '');
      setRegion({
        provinceName: patient.provinceName || '',
        provinceCode: patient.provinceCode || '',
        regencyName: patient.regencyName || '',
        regencyCode: patient.regencyCode || '',
        districtName: patient.districtName || '',
        districtCode: patient.districtCode || '',
        villageName: patient.villageName || '',
        villageCode: patient.villageCode || '',
        line1: patient.line1 || ''
      });
      if (patient.occupationCode) {
        setOccupationCode(patient.occupationCode);
      } else if (patient.occupationName && references.occupations.length > 0) {
        const found = references.occupations.find((o) => o.name === patient.occupationName);
        setOccupationCode(found ? found.code : '');
      } else {
        setOccupationCode('');
      }
      setErrorMessage(null);
    }
  }, [patient, isOpen, references.occupations]);

  const relationshipOptions = React.useMemo(() => {
    const base =
      allowedRelationships && allowedRelationships.length > 0
        ? [...allowedRelationships]
        : [...references.relationships];

    const currentRel = patient?.relationship || (patient?.isSelf ? 'self' : '');
    if (currentRel && !base.some((r) => r.value === currentRel)) {
      if (currentRel === 'self') {
        base.unshift({
          value: 'self',
          label: 'Diri Sendiri',
          description: 'Profil pemilik akun utama'
        });
      } else {
        base.push({
          value: currentRel,
          label: patient?.relationshipLabel || currentRel
        });
      }
    }
    return base;
  }, [
    allowedRelationships,
    references.relationships,
    patient?.relationship,
    patient?.isSelf,
    patient?.relationshipLabel
  ]);

  const activeOccupationName = React.useMemo(() => {
    const found = references.occupations.find((o) => o.code === occupationCode);
    return found ? found.name : patient?.occupationName || '';
  }, [references.occupations, occupationCode, patient?.occupationName]);

  const isValid = React.useMemo(() => {
    return (
      fullName.trim().length >= 3 &&
      nik.length === 16 &&
      /^\d+$/.test(nik) &&
      motherName.trim().length >= 3 &&
      placeOfBirth.trim().length >= 2 &&
      Boolean(dateOfBirth) &&
      Boolean(gender) &&
      Boolean(bloodType) &&
      Boolean(region.line1.trim() || region.provinceName)
    );
  }, [
    fullName,
    nik,
    motherName,
    placeOfBirth,
    dateOfBirth,
    gender,
    bloodType,
    region.line1,
    region.provinceName
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!isValid) return;
    if (isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const selectedOccupation = references.occupations.find((o) => o.code === occupationCode);
    const resolvedOccupationName = selectedOccupation?.name ?? patient.occupationName;

    const payload = {
      name: fullName.trim(),
      nik: nik.trim(),
      birth_place: placeOfBirth.trim(),
      birth_date: dateOfBirth,
      gender: gender,
      blood_type: bloodType,
      mother_name: motherName.trim(),
      line1: region.line1.trim(),
      occupation: resolvedOccupationName || undefined,
      province_name: region.provinceName || undefined,
      province_code: region.provinceCode || undefined,
      regency_name: region.regencyName || undefined,
      regency_code: region.regencyCode || undefined,
      district_name: region.districtName || undefined,
      district_code: region.districtCode || undefined,
      village_name: region.villageName || undefined,
      village_code: region.villageCode || undefined
    };

    try {
      const res = await updatePatient(patient.id, payload);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['patient-affiliations'] });
        queryClient.invalidateQueries({ queryKey: ['booking-context'] });
        toast.success('Data pasien berhasil diperbarui');
        const updatedProfile: PatientAffiliationProfile = {
          ...patient,
          fullName: fullName.trim(),
          nik: nik.trim(),
          motherName: motherName.trim(),
          birthPlace: placeOfBirth.trim(),
          birthDate: dateOfBirth,
          gender: gender,
          bloodType: bloodType,
          line1: region.line1.trim(),
          provinceName: region.provinceName || null,
          provinceCode: region.provinceCode || null,
          regencyName: region.regencyName || null,
          regencyCode: region.regencyCode || null,
          districtName: region.districtName || null,
          districtCode: region.districtCode || null,
          villageName: region.villageName || null,
          villageCode: region.villageCode || null,
          occupationName: resolvedOccupationName || null
        };
        onSuccess(updatedProfile);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil pasien';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !patient) return null;

  const titleName = fullName.trim() || patient.fullName;
  const currentRelationshipLabel =
    relationshipOptions.find((opt) => opt.value === relationship)?.label ||
    (relationship === 'self' ? 'Diri Sendiri' : 'Anggota Keluarga');

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[95vw] w-[95vw]'
      showCloseButton={false}
      className='max-h-[90vh] h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'
    >
      <div className='flex flex-col font-sans h-full min-h-0 flex-1'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3 border-b border-border/40 flex items-start justify-between gap-3 min-w-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <Icons.user className='size-4 text-primary shrink-0' />
              <span className='truncate'>{titleName || 'Edit Profil Pasien'}</span>
            </h3>
            <p className='text-xs text-muted-foreground truncate font-medium'>
              Lihat dan perbarui informasi profil, identitas, kelahiran, dan domisili pasien.
            </p>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {errorMessage && (
          <div className='mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs shrink-0'>
            {errorMessage}
          </div>
        )}

        {/* Scrollable Body - 2 Columns Layout */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
          <form id='patient-detail-form' onSubmit={handleSubmit} className='p-0 space-y-0'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-1'>
              {/* Kolom 1: Identitas & Kelahiran */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Identitas & Kelahiran
                </span>

                {/* Hubungan dengan Akun (Terkunci / Committed dari awal registrasi) */}
                <div className='space-y-1.5'>
                  <span className='text-xs font-semibold text-muted-foreground block'>
                    Hubungan dengan Akun
                  </span>
                  <div className='flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 border border-border/50 text-xs text-foreground cursor-default'>
                    <div className='size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                      <Icons.user className='size-3' />
                    </div>
                    <span className='font-semibold text-xs text-foreground'>
                      {currentRelationshipLabel}
                    </span>
                    <span className='text-[11px] text-muted-foreground ml-auto'>
                      (Telah terikat pada janji temu)
                    </span>
                  </div>
                </div>

                <PatientLineInput
                  id='edit_nationalId'
                  label='NIK KTP (16 Digit)'
                  placeholder='3201xxxxxxxxxxxx'
                  value={nik}
                  onChange={(val) => {
                    const numericOnly = val.replace(/\D/g, '').slice(0, 16);
                    setNik(numericOnly);
                  }}
                  maxLength={16}
                  inputMode='numeric'
                  isMonospace
                  autoComplete='off'
                />

                <PatientLineInput
                  id='edit_fullName'
                  label='Nama Lengkap Pasien *'
                  placeholder='Nama lengkap sesuai KTP / KK'
                  value={fullName}
                  onChange={setFullName}
                  required
                  autoComplete='name'
                />

                <div className='grid grid-cols-2 gap-4'>
                  <PatientLineInput
                    id='edit_birthPlace'
                    label='Tempat Lahir'
                    placeholder='Kota kelahiran'
                    value={placeOfBirth}
                    onChange={setPlaceOfBirth}
                  />

                  <PatientBirthdatePicker
                    id='edit_birthDate'
                    label='Tanggal Lahir'
                    placeholder='Pilih tanggal...'
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                  />
                </div>

                <PatientGenderSelector
                  id='edit_gender'
                  label='Jenis Kelamin'
                  variant='dropdown'
                  value={gender}
                  onChange={setGender}
                />

                <PatientLineInput
                  id='edit_motherName'
                  label='Nama Ibu Kandung *'
                  placeholder='Nama ibu kandung pasien'
                  value={motherName}
                  onChange={setMotherName}
                  required
                />
              </div>

              {/* Kolom 2: Pekerjaan & Domisili */}
              <div className='space-y-4'>
                <span className='text-xs font-semibold text-muted-foreground block pb-1 border-b border-border/40'>
                  Pekerjaan & Domisili
                </span>

                <PatientBloodTypeSelector
                  id='edit_bloodType'
                  label='Golongan Darah'
                  required
                  placeholder='Pilih golongan darah...'
                  value={bloodType}
                  onChange={(val) => setBloodType(val as PatientBloodType)}
                  options={references.bloodTypes}
                />

                <PatientSearchableSelect
                  id='edit_occupation'
                  label='Pekerjaan Pasien'
                  value={activeOccupationName}
                  placeholder='Pilih jenis profesi / pekerjaan...'
                  options={references.occupations.map((occ) => ({
                    id: occ.code,
                    name: occ.name,
                    description: occ.description
                  }))}
                  isLoading={references.isLoading}
                  onSelect={(item) => setOccupationCode(item.id)}
                  searchPlaceholder='Cari pekerjaan...'
                />

                <div className='space-y-2 pt-1'>
                  <span className='text-xs font-medium text-foreground block'>
                    Domisili & Wilayah Alamat
                  </span>
                  <PatientRegionDropdown
                    values={region}
                    onChange={(updates) => setRegion((prev) => ({ ...prev, ...updates }))}
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
            form='patient-detail-form'
            size='sm'
            shape='pill'
            disabled={!isValid || isSubmitting}
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
