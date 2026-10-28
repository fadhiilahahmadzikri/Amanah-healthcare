'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import type { Gender } from '@/constants/gender.constants';
import { STAFF_TYPES, STAFF_TYPE_LABELS, type StaffType } from '@/constants/staff-types.constant';
import {
  type PolyclinicUnit,
  type StaffMember,
  type StaffLeaveInfo,
  staffManagementApi
} from '../api/staff-management.api';
import { syncAllStaffQueries } from '../api/mutations';
import { staffManagementKeys } from '../api/query-keys';
import type { DoctorSchedule } from '@/features/jadwal-dokter/api/types';

export interface UseStaffProfileModalProps {
  staff?: StaffMember | null;
  doctor?: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface StaffProfileFormData {
  staffId: string;
  staffCode: string;
  staffType?: StaffType;
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

export interface UseStaffProfileModalResult {
  isEditing: boolean;
  hasChanges: boolean;
  handleUnlockEdit: () => void;
  handleCancelEdit: () => void;
  formData: StaffProfileFormData;
  regionValues: PatientRegionValues;
  polyclinics: PolyclinicUnit[];
  isLoadingPolyclinics: boolean;
  polyclinicError: string | null;
  isLoadingProfile: boolean;
  isSubmitting: boolean;
  isClinical: boolean;
  isDoctor: boolean;
  isBidan: boolean;
  workerCategoryLabel: string;
  subtitleDescription: string;
  licenseNumberLabel: string;
  professionPlaceholder: string;
  leaveInfo?: StaffLeaveInfo | null;
  rawStaffMember: StaffMember | null;
  handleChange: (field: keyof StaffProfileFormData, value: unknown) => void;
  handleRegionChange: (updates: Partial<PatientRegionValues>) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
}

const INITIAL_FORM_DATA: StaffProfileFormData = {
  staffId: '',
  staffCode: '',
  staffType: undefined,
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

export function useStaffProfileModal({
  staff,
  doctor,
  isOpen,
  onClose,
  onSuccess
}: UseStaffProfileModalProps): UseStaffProfileModalResult {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable Profile ID (support both StaffMember and DoctorSchedule inputs)
  const profileId = staff?.id || doctor?.id || doctor?.staffId;

  // Poliklinik reference state backed by TanStack Query
  const {
    data: polyclinics = [],
    isLoading: isLoadingPolyclinics,
    error: polyclinicErrorObj
  } = useQuery<PolyclinicUnit[]>({
    queryKey: ['polyclinics'],
    queryFn: () => staffManagementApi.getPolyclinics(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const polyclinicError = polyclinicErrorObj instanceof Error ? polyclinicErrorObj.message : null;

  // Fetch full staff profile details backed by TanStack Query
  const { data: fetchedProfile, isLoading: isLoadingProfile } = useQuery<StaffMember>({
    queryKey: ['staff-profile', profileId],
    queryFn: () => staffManagementApi.getStaffById(profileId!),
    enabled: Boolean(isOpen && profileId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: staff || undefined
  });

  const profile = fetchedProfile || staff;

  // Form core & region states
  const [formData, setFormData] = useState<StaffProfileFormData>(INITIAL_FORM_DATA);
  const [regionValues, setRegionValues] = useState<PatientRegionValues>(INITIAL_REGION_VALUES);

  // Snapshots for tracking changes and canceling edit
  const [snapshotFormData, setSnapshotFormData] = useState<StaffProfileFormData>(INITIAL_FORM_DATA);
  const [snapshotRegionValues, setSnapshotRegionValues] =
    useState<PatientRegionValues>(INITIAL_REGION_VALUES);

  // Synchronize form whenever modal opens or profile changes
  useEffect(() => {
    if (!isOpen || (!staff && !doctor)) {
      setIsEditing(false);
      return;
    }

    if (profile) {
      const loadedForm: StaffProfileFormData = {
        staffId: profile.id,
        staffCode: profile.staffCode || '',
        staffType: profile.staffType,
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        profession: profile.profession || '',
        birthPlace: profile.birthPlace || '',
        birthDate: profile.birthDate ? String(profile.birthDate).slice(0, 10) : '',
        gender: profile.gender,
        nationalId: profile.nationalId || '',
        poliklinikId: profile.poliklinikId || '',
        licenseNumber: profile.licenseNumber || '',
        isActive: profile.isActive ?? true
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
            line1: profile.address.line1 || ''
          }
        : INITIAL_REGION_VALUES;

      setFormData(loadedForm);
      setSnapshotFormData(loadedForm);
      setRegionValues(loadedRegion);
      setSnapshotRegionValues(loadedRegion);
    } else if (doctor) {
      const baseForm: StaffProfileFormData = {
        staffId: doctor.id,
        staffCode: doctor.staffCode || '',
        staffType: doctor.staffType,
        fullName: doctor.fullName,
        email: doctor.email || '',
        phoneNumber: doctor.phone || '',
        profession: doctor.specialty || '',
        birthPlace: '',
        birthDate: '',
        gender: undefined,
        nationalId: '',
        poliklinikId: '',
        licenseNumber: '',
        isActive: doctor.doctorStatus !== 'PENDING' && (doctor.isAcceptingAppointments ?? true)
      };

      setFormData(baseForm);
      setSnapshotFormData(baseForm);
      setRegionValues(INITIAL_REGION_VALUES);
      setSnapshotRegionValues(INITIAL_REGION_VALUES);
    }
  }, [isOpen, staff, doctor, profile]);

  // Compute whether user actually changed anything
  const hasChanges = useMemo(() => {
    const formKeys = Object.keys(formData) as (keyof StaffProfileFormData)[];
    const formChanged = formKeys.some((k) => formData[k] !== snapshotFormData[k]);

    const regionKeys = Object.keys(regionValues) as (keyof PatientRegionValues)[];
    const regionChanged = regionKeys.some((k) => regionValues[k] !== snapshotRegionValues[k]);

    return formChanged || regionChanged;
  }, [formData, snapshotFormData, regionValues, snapshotRegionValues]);

  const handleUnlockEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setFormData(snapshotFormData);
    setRegionValues(snapshotRegionValues);
    setIsEditing(false);
  }, [snapshotFormData, snapshotRegionValues]);

  const handleChange = useCallback((field: keyof StaffProfileFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRegionChange = useCallback((updates: Partial<PatientRegionValues>) => {
    setRegionValues((prev) => ({ ...prev, ...updates }));
  }, []);

  // Worker Category & Clinical Role derivation
  const effectiveStaffType = formData.staffType || profile?.staffType || doctor?.staffType;
  const isDoctor = effectiveStaffType === STAFF_TYPES.DOCTOR;
  const isBidan = effectiveStaffType === STAFF_TYPES.MIDWIFE;
  const isClinical = isDoctor || isBidan;

  const workerCategoryLabel = isBidan
    ? STAFF_TYPE_LABELS[STAFF_TYPES.MIDWIFE]
    : isDoctor
      ? STAFF_TYPE_LABELS[STAFF_TYPES.DOCTOR]
      : STAFF_TYPE_LABELS[STAFF_TYPES.WORKER];

  const subtitleDescription = isBidan
    ? 'Lihat dan kelola profil, identitas, domisili, kredensial, serta status operasional bidan.'
    : isDoctor
      ? 'Lihat dan kelola profil, identitas, domisili, kredensial, serta status operasional dokter.'
      : 'Lihat dan kelola profil, identitas, domisili, serta status operasional staf klinik.';

  const licenseNumberLabel = isBidan
    ? 'Nomor Izin Praktik Bidan (SIPB / STR)'
    : isDoctor
      ? 'Nomor Izin Praktik Dokter (SIP / STR)'
      : 'Nomor Izin Praktik / STR';

  const professionPlaceholder = isBidan
    ? 'Bidan Praktik Mandiri / KIA'
    : isDoctor
      ? 'dr. Budi Santoso, Sp.A / Dokter Umum'
      : 'Staf IT, Front Desk, CS, dll.';

  const leaveInfo =
    profile?.leaveInfo ||
    (doctor?.isOnLeave
      ? {
          isOnLeave: true,
          reason: doctor.leaveReason,
          substituteName: doctor.substituteDoctorName,
          startDate: doctor.leaveStart,
          endDate: doctor.leaveEnd,
          requestType: doctor.leaveType
        }
      : null);

  // Raw staff member object for export actions
  const rawStaffMember: StaffMember | null =
    profile ||
    (doctor
      ? ({
          id: doctor.id,
          userId: doctor.id,
          poliklinikId: formData.poliklinikId,
          fullName: formData.fullName,
          profession: formData.profession,
          staffType: (effectiveStaffType as StaffType) || 'doctor',
          staffCode: formData.staffCode,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          isActive: formData.isActive,
          createdAt: doctor.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as StaffMember)
      : null);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      if (!profileId) return;

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

        const payload: Partial<StaffMember> = {
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
          licenseNumber: isClinical ? formData.licenseNumber.trim() || undefined : undefined,
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
        };

        await staffManagementApi.updateStaff(profileId, payload);

        toast.success(
          `Data ${workerCategoryLabel.toLowerCase()} ${formData.fullName} berhasil diperbarui.`
        );
        syncAllStaffQueries(queryClient);
        await queryClient.invalidateQueries({ queryKey: ['staff-profile', profileId] });
        await queryClient.invalidateQueries({ queryKey: ['doctor-profile', profileId] });
        await queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
        await queryClient.invalidateQueries({ queryKey: staffManagementKeys.all });

        setIsEditing(false);
        onSuccess?.();
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memperbarui data profil.';
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      profileId,
      hasChanges,
      formData,
      regionValues,
      isClinical,
      workerCategoryLabel,
      onSuccess,
      onClose,
      queryClient
    ]
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
    isClinical,
    isDoctor,
    isBidan,
    workerCategoryLabel,
    subtitleDescription,
    licenseNumberLabel,
    professionPlaceholder,
    leaveInfo,
    rawStaffMember,
    handleChange,
    handleRegionChange,
    handleSubmit
  };
}
