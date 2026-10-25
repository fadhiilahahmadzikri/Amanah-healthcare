'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import type { Gender } from '@/constants/gender.constants';
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
  staffId: string;
  staffCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profession: string;
  birthPlace: string;
  birthDate: string;
  gender?: Gender;
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
  staffId: '',
  staffCode: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  profession: '',
  birthPlace: '',
  birthDate: '',
  gender: undefined,
  nationalId: '',
  poliklinikId: '',
  licenseNumber: '',
  isActive: true
};

const INITIAL_REGION_VALUES: PatientRegionValues = {
  provinceName: '',
  provinceCode: '',
  regencyName: '',
  regencyCode: '',
  districtName: '',
  districtCode: '',
  villageName: '',
  villageCode: '',
  line1: ''
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
      staffId: doctor.staff_id || doctor.staff_profile_id || '',
      staffCode: doctor.staff_code || '',
      fullName: doctor.nama_dokter || '',
      email: doctor.email || '',
      phoneNumber: doctor.nomor_telepon || '',
      profession: doctor.spesialisasi || '',
      birthPlace: '',
      birthDate: '',
      gender: undefined,
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
            staffId: profile.id || doctor.staff_id || doctor.staff_profile_id || '',
            staffCode: profile.staffCode || profile.idCardNumber || doctor.staff_code || '',
            fullName: profile.fullName || doctor.nama_dokter || '',
            email: profile.email || doctor.email || '',
            phoneNumber: profile.phoneNumber || doctor.nomor_telepon || '',
            profession: profile.profession || doctor.spesialisasi || '',
            birthPlace: profile.birthPlace || '',
            birthDate: profile.birthDate ? String(profile.birthDate).slice(0, 10) : '',
            gender: profile.gender,
            nationalId: profile.nationalId || '',
            poliklinikId: profile.poliklinikId || '',
            licenseNumber: profile.licenseNumber || '',
            isActive: profile.isActive ?? doctor.status_dokter !== 'PENDING'
          };

          const loadedRegion: PatientRegionValues = profile.address
            ? {
                provinceName: profile.address.provinceName || '',
                provinceCode: profile.address.provinceCode || '',
                regencyName: profile.address.regencyName || '',
                regencyCode: profile.address.regencyCode || '',
                districtName: profile.address.districtName || '',
                districtCode: profile.address.districtCode || '',
                villageName: profile.address.villageName || '',
                villageCode: profile.address.villageCode || '',
                line1: profile.address.line1 || profile.address.fullAddress || ''
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
          regionValues.line1,
          regionValues.villageName ? `Kel. ${regionValues.villageName}` : null,
          regionValues.districtName ? `Kec. ${regionValues.districtName}` : null,
          regionValues.regencyName,
          regionValues.provinceName
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
            provinceCode: regionValues.provinceCode || undefined,
            provinceName: regionValues.provinceName || undefined,
            regencyCode: regionValues.regencyCode || undefined,
            regencyName: regionValues.regencyName || undefined,
            districtCode: regionValues.districtCode || undefined,
            districtName: regionValues.districtName || undefined,
            villageCode: regionValues.villageCode || undefined,
            villageName: regionValues.villageName || undefined,
            line1: regionValues.line1 || undefined,
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
