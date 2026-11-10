'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import {
  PatientSearchableSelect,
  type PatientSearchableSelectOption
} from '@/features/data-pasien/components/registration/molecules/patient-searchable-select';
import { formatClinicDate } from '@/lib/date-format';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { clinicEssentialsApi } from '@/features/clinic-essentials/api/clinic-essentials.api';
import { ChangeDoctorModal } from '@/features/appointment-pasien/components/change-doctor-modal';
import { ChangeRoomModal } from '@/features/appointment-pasien/components/change-room-modal';
import { klinikKeys } from '../../../api/query-keys';
import type { Appointment } from '../../../api/types';
import type { FlowName } from '../../../constants/medical-appointment-types';
import type { EditableRegularData, UnifiedInspectorData } from '../types';

export interface RegularEncounterSectionProps {
  appointment: Appointment;
  data: UnifiedInspectorData;
  isEditing?: boolean;
  regularFormData?: EditableRegularData;
  onRegularFieldChange?: (field: keyof EditableRegularData, val: any) => void;
  validationErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export function RegularEncounterSection({
  appointment,
  data,
  isEditing = false,
  regularFormData,
  onRegularFieldChange,
  validationErrors,
  onClearError
}: RegularEncounterSectionProps) {
  const queryClient = useQueryClient();
  const { audience, can } = useAuthContext();
  const canManageAssignments = audience === 'internal' || can('appointments:manage');
  const canSelectService = isEditing && Boolean(onRegularFieldChange);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = React.useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = React.useState(false);

  const scheduledDateFormatted = formatClinicDate(
    data.scheduledDate || appointment.date,
    { style: 'human_medium' }
  );

  // Cascading queries directly driven by clinicEssentialsApi
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['clinic-essentials-active-units'],
    queryFn: () => clinicEssentialsApi.getUnits({ status: 'active' }),
    enabled: canSelectService,
    staleTime: 5 * 60_000
  });

  const activeUnitId = regularFormData?.unitId || '';
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['clinic-essentials-categories-by-unit', activeUnitId],
    queryFn: () => clinicEssentialsApi.getCategories(activeUnitId, { status: 'active' }),
    enabled: canSelectService && Boolean(activeUnitId),
    staleTime: 5 * 60_000
  });

  const activeCategoryId = regularFormData?.categoryId || '';
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['clinic-essentials-services-by-category', activeCategoryId, activeUnitId],
    queryFn: () =>
      clinicEssentialsApi.getServices(activeCategoryId, activeUnitId, { status: 'active' }),
    enabled: canSelectService && Boolean(activeCategoryId),
    staleTime: 5 * 60_000
  });

  const handleUnitSelect = (item: PatientSearchableSelectOption) => {
    if (!onRegularFieldChange) return;
    onRegularFieldChange('unitId', item.id);
    onRegularFieldChange('unitName', item.name);
    onRegularFieldChange('categoryId', '');
    onRegularFieldChange('categoryName', '');
    onRegularFieldChange('serviceId', '');
    onRegularFieldChange('serviceName', '');
  };

  const handleCategorySelect = (item: PatientSearchableSelectOption) => {
    if (!onRegularFieldChange) return;
    onRegularFieldChange('categoryId', item.id);
    onRegularFieldChange('categoryName', item.name);
    onRegularFieldChange('serviceId', '');
    onRegularFieldChange('serviceName', '');
  };

  const handleServiceSelect = (item: PatientSearchableSelectOption) => {
    if (!onRegularFieldChange) return;
    onRegularFieldChange('serviceId', item.id);
    onRegularFieldChange('serviceName', item.name);
    const selectedService = services.find((s) => s.id === item.id);
    onRegularFieldChange(
      'medicalFlow',
      (selectedService?.intakeFormCode as FlowName) || null
    );
  };

  const handleRefreshAssignments = () => {
    void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    void queryClient.invalidateQueries({ queryKey: klinikKeys.all });
    void queryClient.invalidateQueries({
      queryKey: klinikKeys.appointmentIntake(appointment.id)
    });
  };

  return (
    <div className='rounded-xl border border-border/60 p-4 bg-card shadow-2xs font-sans'>
      <span className='text-xs font-bold text-foreground block mb-3 pb-1 border-b border-border/40 uppercase tracking-wider'>
        Informasi Pendaftaran & Keluhan
      </span>

      {/* Grid Informasi Pendaftaran: Menggunakan PatientLineInput & PatientSearchableSelect in-place */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 select-text mb-3'>
        {/* Kode Booking */}
        <PatientLineInput
          id='enc-booking-code'
          label='Kode Booking'
          value={data.bookingCode || ''}
          readOnly
          isMonospace
          className='text-primary font-semibold'
        />

        {/* Waktu Konsultasi */}
        <PatientLineInput
          id='enc-time'
          label='Waktu Konsultasi'
          value={
            scheduledDateFormatted +
            (data.scheduledStartTime ? ` (${data.scheduledStartTime} WIB)` : '')
          }
          readOnly
        />

        {/* Poliklinik Tujuan */}
        {canSelectService ? (
          <PatientSearchableSelect
            id='enc-unit-select'
            label='Poliklinik Tujuan'
            value={regularFormData?.unitName ?? ''}
            placeholder='Pilih poliklinik tujuan...'
            options={units.map((u) => ({ id: u.id, name: u.name }))}
            isLoading={isLoadingUnits}
            onSelect={handleUnitSelect}
            searchPlaceholder='Cari poliklinik...'
            required
          />
        ) : (
          <PatientLineInput
            id='enc-unit-read'
            label='Poliklinik Tujuan'
            value={data.poliklinikName || ''}
            readOnly
          />
        )}

        {/* Kelompok Layanan */}
        {canSelectService ? (
          <PatientSearchableSelect
            id='enc-category-select'
            label='Kelompok Layanan'
            value={regularFormData?.categoryName ?? ''}
            placeholder={
              !activeUnitId
                ? 'Pilih poliklinik terlebih dahulu...'
                : isLoadingCategories
                ? 'Memuat kelompok layanan...'
                : 'Pilih kelompok layanan...'
            }
            options={categories.map((c) => ({ id: c.id, name: c.name }))}
            disabled={!activeUnitId || isLoadingCategories}
            isLoading={isLoadingCategories}
            parentLabel='Poliklinik'
            onSelect={handleCategorySelect}
            searchPlaceholder='Cari kelompok layanan...'
            required
          />
        ) : (
          <PatientLineInput
            id='enc-category-read'
            label='Kelompok Layanan'
            value={data.categoryName || ''}
            readOnly
          />
        )}

        {/* Layanan Medis */}
        {canSelectService ? (
          <PatientSearchableSelect
            id='enc-service-select'
            label='Layanan Medis'
            value={regularFormData?.serviceName ?? ''}
            placeholder={
              !activeCategoryId
                ? 'Pilih kelompok layanan terlebih dahulu...'
                : isLoadingServices
                ? 'Memuat layanan medis...'
                : 'Pilih layanan medis...'
            }
            options={services.map((s) => ({ id: s.id, name: s.name }))}
            disabled={!activeCategoryId || isLoadingServices}
            isLoading={isLoadingServices}
            parentLabel='Kelompok Layanan'
            onSelect={handleServiceSelect}
            searchPlaceholder='Cari layanan medis...'
            required
          />
        ) : (
          <PatientLineInput
            id='enc-service-read'
            label='Layanan Medis'
            value={data.serviceName || ''}
            readOnly
          />
        )}

        {/* Dokter Jaga / Pemeriksa */}
        <PatientLineInput
          id='enc-doctor'
          label='Dokter Jaga / Pemeriksa'
          value={appointment.doctor_name || ''}
          readOnly
          trailingIcon={
            canManageAssignments ? (
              <button
                type='button'
                className='p-1 rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer'
                onClick={() => setIsDoctorModalOpen(true)}
                title='Tugaskan / Ganti Dokter Jaga'
              >
                <Icons.edit className='h-3.5 w-3.5' />
              </button>
            ) : undefined
          }
        />

        {/* Ruang & Lokasi */}
        <PatientLineInput
          id='enc-room'
          label='Ruang & Lokasi'
          value={appointment.room_name || appointment.room_location || ''}
          readOnly
          trailingIcon={
            canManageAssignments ? (
              <button
                type='button'
                className='p-1 rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer'
                onClick={() => setIsRoomModalOpen(true)}
                title='Tugaskan / Ganti Ruang Periksa'
              >
                <Icons.edit className='h-3.5 w-3.5' />
              </button>
            ) : undefined
          }
        />

        {/* Keluhan Utama (Col-span 2) */}
        <div className='col-span-1 sm:col-span-2 pt-1'>
          {isEditing && regularFormData && onRegularFieldChange ? (
            <PatientLineInput
              id='reg-complaint-input'
              label='Keluhan Utama / Alasan Kunjungan *'
              value={regularFormData.complaint}
              onChange={(val) => {
                onRegularFieldChange('complaint', val);
                if (validationErrors?.complaint && val.trim().length > 0) {
                  onClearError?.('complaint');
                }
              }}
              error={validationErrors?.complaint}
              invalid={Boolean(validationErrors?.complaint)}
              placeholder='Keluhan utama saat konsultasi...'
              required
            />
          ) : (
            <PatientLineInput
              id='read-complaint'
              label='Keluhan Utama / Alasan Kunjungan'
              value={data.complaint || ''}
              readOnly
            />
          )}
        </div>
      </div>

      {/* Canonical Quick Reassignment Modals (Internal Staf Only) */}
      {canManageAssignments && (
        <>
          <ChangeDoctorModal
            isOpen={isDoctorModalOpen}
            appointmentId={appointment.id}
            patientName={appointment.patient_name || ''}
            patientId={appointment.patient_id}
            queueNumber={appointment.queue_number || ''}
            currentDoctorName={appointment.doctor_name || ''}
            appointmentDate={appointment.date}
            appointmentTime={appointment.scheduled_start_time || ''}
            onClose={() => setIsDoctorModalOpen(false)}
            onSuccess={(doc?: any) => {
              setIsDoctorModalOpen(false);
              if (doc?.name) {
                appointment.doctor_name = doc.name;
                appointment.doctor_id = doc.id;
              }
              handleRefreshAssignments();
            }}
          />

          <ChangeRoomModal
            isOpen={isRoomModalOpen}
            appointmentId={appointment.id}
            patientName={appointment.patient_name || ''}
            patientId={appointment.patient_id}
            queueNumber={appointment.queue_number || ''}
            currentRoomName={appointment.room_name || appointment.room_location || ''}
            appointmentDate={appointment.date}
            appointmentTime={appointment.scheduled_start_time || ''}
            onClose={() => setIsRoomModalOpen(false)}
            onSuccess={(room?: any) => {
              setIsRoomModalOpen(false);
              if (room?.name) {
                appointment.room_name = room.name;
                if (room.location) {
                  appointment.room_location = room.location;
                }
              }
              handleRefreshAssignments();
            }}
          />
        </>
      )}
    </div>
  );
}
