'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import {
  type PolyclinicUnit,
  type StaffMember,
  staffManagementApi
} from '@/features/staff-management';
import type { DoctorSchedule } from '../api/types';
import { getDoctorProfile, updateDoctorProfile } from '../api/service';

export interface UseDoctorDetailEditModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface DoctorDetailFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  profession: string;
  birthPlace: string;
  birthDate: string;
  gender: 'male' | 'female';
  nationalId: string;
  poliklinikId: string;
  licenseNumber: string;
  isActive: boolean;
}

export interface UseDoctorDetailEditModalResult {
  isEditing: boolean;
  hasChanges: boolean;
  handleUnlockEdit: () => void;
  handleCancelEdit: () => void;
  formData: DoctorDetailFormData;
  regionValues: PatientRegionValues;
  polyclinics: PolyclinicUnit[];
  isLoadingPolyclinics: boolean;
  polyclinicError: string | null;
  isLoadingProfile: boolean;
  isSubmitting: boolean;
  isBidan: boolean;
  handleChange: (field: keyof DoctorDetailFormData, value: unknown) => void;
  handleRegionChange: (updates: Partial<PatientRegionValues>) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
}

const INITIAL_FORM_DATA: DoctorDetailFormData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  profession: '',
  birthPlace: '',
  birthDate: '',
  gender: 'male',
  nationalId: '',
  poliklinikId: '',
  licenseNumber: '',
  isActive: true
};

const INITIAL_REGION_VALUES: PatientRegionValues = {
  provinsi: '',
  provinsiId: '',
  kabupaten: '',
  kabupatenId: '',
  kecamatan: '',
  kecamatanId: '',
  kelurahan: '',
  kelurahanId: '',
  alamatDetail: ''
};

export function useDoctorDetailEditModal({
  doctor,
  isOpen,
  onClose,
  onSuccess
}: UseDoctorDetailEditModalProps): UseDoctorDetailEditModalResult {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Poliklinik reference state
  const [polyclinics, setPolyclinics] = useState<PolyclinicUnit[]>([]);
  const [isLoadingPolyclinics, setIsLoadingPolyclinics] = useState(false);
  const [polyclinicError, setPolyclinicError] = useState<string | null>(null);

  // Form core & region states
  const [formData, setFormData] = useState<DoctorDetailFormData>(INITIAL_FORM_DATA);
  const [regionValues, setRegionValues] = useState<PatientRegionValues>(INITIAL_REGION_VALUES);

  // Snapshots for tracking changes and canceling edit
  const [snapshotFormData, setSnapshotFormData] = useState<DoctorDetailFormData>(INITIAL_FORM_DATA);
  const [snapshotRegionValues, setSnapshotRegionValues] =
    useState<PatientRegionValues>(INITIAL_REGION_VALUES);

  // Stable IDs to prevent infinite re-render loops (Maximum update depth exceeded)
  const doctorId = doctor?.id;
  const staffId = doctor?.staff_id || doctor?.practitioner_id || doctor?.id;

  // Load Polyclinics dynamically when opened
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // Load Doctor Profile on open & reset view mode
  useEffect(() => {
    if (!isOpen || !doctor) {
      setIsEditing(false);
      return;
    }

    let cancelled = false;
    setIsEditing(false);
    setIsLoadingProfile(true);

    const baseForm: DoctorDetailFormData = {
      fullName: doctor.nama_dokter || '',
      email: doctor.email || '',
      phoneNumber: doctor.nomor_telepon || '',
      profession: doctor.spesialisasi || '',
      birthPlace: '',
      birthDate: '',
      gender: 'male',
      nationalId: '',
      poliklinikId: '',
      licenseNumber: '',
      isActive: doctor.status_dokter !== 'PENDING' && (doctor.is_accepting_appointments ?? true)
    };

    setFormData(baseForm);
    setSnapshotFormData(baseForm);
    setRegionValues(INITIAL_REGION_VALUES);
    setSnapshotRegionValues(INITIAL_REGION_VALUES);

    const targetProfileId = staffId || doctorId;
    if (targetProfileId) {
      getDoctorProfile(targetProfileId)
        .then((profile: StaffMember) => {
          if (cancelled || !profile) return;

          const loadedForm: DoctorDetailFormData = {
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
          };

          const loadedRegion: PatientRegionValues = profile.address
            ? {
                provinsi: profile.address.provinceName || '',
                provinsiId: profile.address.provinceCode || '',
                kabupaten: profile.address.regencyName || '',
                kabupatenId: profile.address.regencyCode || '',
                kecamatan: profile.address.districtName || '',
                kecamatanId: profile.address.districtCode || '',
                kelurahan: profile.address.villageName || '',
                kelurahanId: profile.address.villageCode || '',
                alamatDetail: profile.address.line1 || profile.address.fullAddress || ''
              }
            : INITIAL_REGION_VALUES;

          setFormData(loadedForm);
          setSnapshotFormData(loadedForm);
          setRegionValues(loadedRegion);
          setSnapshotRegionValues(loadedRegion);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          console.warn('Could not load full profile from server, using card data:', err);
        })
        .finally(() => {
          if (!cancelled) setIsLoadingProfile(false);
        });
    } else {
      setIsLoadingProfile(false);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, doctorId, staffId]);

  // Compute whether user actually changed anything
  const hasChanges = useMemo(() => {
    const formKeys = Object.keys(formData) as (keyof DoctorDetailFormData)[];
    const formChanged = formKeys.some((k) => formData[k] !== snapshotFormData[k]);

    const regionKeys = Object.keys(regionValues) as (keyof PatientRegionValues)[];
    const regionChanged = regionKeys.some((k) => regionValues[k] !== snapshotRegionValues[k]);

    return formChanged || regionChanged;
  }, [formData, snapshotFormData, regionValues, snapshotRegionValues]);

  // Edit Profil ONLY opens the edit state - does not submit or claim edit
  const handleUnlockEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Cancel edit reverts to original snapshot
  const handleCancelEdit = useCallback(() => {
    setFormData(snapshotFormData);
    setRegionValues(snapshotRegionValues);
    setIsEditing(false);
  }, [snapshotFormData, snapshotRegionValues]);

  const handleChange = useCallback((field: keyof DoctorDetailFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRegionChange = useCallback((updates: Partial<PatientRegionValues>) => {
    setRegionValues((prev) => ({ ...prev, ...updates }));
  }, []);

  // Simpan Perubahan ONLY executes on explicit submit with actual changes
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      if (!doctor) return;

      if (!hasChanges) {
        toast.info('Tidak ada perubahan data.');
        setIsEditing(false);
        return;
      }

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

        const targetProfileId = staffId || doctorId || doctor.id;
        await updateDoctorProfile(targetProfileId, {
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
        setIsEditing(false);
        onSuccess?.();
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memperbarui data dokter.';
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [doctor, hasChanges, formData, regionValues, staffId, doctorId, onSuccess, onClose]
  );

  const isBidan = Boolean(
    doctor?.spesialisasi?.toLowerCase().includes('bidan') ||
    doctor?.nama_dokter?.toLowerCase().startsWith('bdn.') ||
    formData.profession?.toLowerCase().includes('bidan')
  );

  return {
    isEditing,
    hasChanges,
    handleUnlockEdit,
    handleCancelEdit,
    formData,
    regionValues,
    polyclinics,
    isLoadingPolyclinics,
    polyclinicError,
    isLoadingProfile,
    isSubmitting,
    isBidan,
    handleChange,
    handleRegionChange,
    handleSubmit
  };
}
