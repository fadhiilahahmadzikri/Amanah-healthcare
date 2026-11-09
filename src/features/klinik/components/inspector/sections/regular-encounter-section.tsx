'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { formatClinicDate } from '@/lib/date-format';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { ClinicServiceCascader } from '@/features/clinic-essentials';
import { ChangeDoctorModal } from '@/features/appointment-pasien/components/change-doctor-modal';
import { ChangeRoomModal } from '@/features/appointment-pasien/components/change-room-modal';
import { klinikKeys } from '../../../api/query-keys';
import type { Appointment } from '../../../api/types';
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

  const [isDoctorModalOpen, setIsDoctorModalOpen] = React.useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = React.useState(false);

  const scheduledDateFormatted = formatClinicDate(
    data.scheduledDate || appointment.date,
    { style: 'human_medium' }
  );

  const handleRefreshAssignments = () => {
    void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    void queryClient.invalidateQueries({
      queryKey: klinikKeys.appointmentIntake(appointment.id)
    });
  };

  return (
    <div className='rounded-xl border border-border/60 p-4 bg-card shadow-2xs font-sans'>
      <span className='text-xs font-bold text-foreground block mb-3 pb-1 border-b border-border/40 uppercase tracking-wider'>
        Informasi Pendaftaran & Keluhan
      </span>

      {/* Grid Informasi Pendaftaran */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-5 select-text mb-3'>
        {/* Kode Booking */}
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Kode Booking
          </span>
          <span className='text-sm font-semibold font-mono text-primary block truncate'>
            {data.bookingCode || appointment.booking_code || '-'}
          </span>
        </div>

        {/* Poliklinik Tujuan */}
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Poliklinik Tujuan
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {data.poliklinikName || appointment.poliklinik_name || '-'}
          </span>
        </div>

        {/* Kelompok Layanan */}
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Kelompok Layanan
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {data.categoryName || appointment.category_name || '-'}
          </span>
        </div>

        {/* Layanan Medis */}
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Layanan Medis
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {data.serviceName || appointment.service || '-'}
          </span>
        </div>

        {/* Dokter Jaga / Pemeriksa */}
        <div className='border-b border-border/40 pb-2 flex items-center justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Dokter Jaga / Pemeriksa
            </span>
            <span className='text-sm font-semibold text-foreground block truncate'>
              {appointment.doctor_name || '-'}
            </span>
          </div>
          {canManageAssignments && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-primary transition-colors shrink-0'
              onClick={() => setIsDoctorModalOpen(true)}
              title='Tugaskan / Ganti Dokter Jaga'
            >
              <Icons.edit className='h-3.5 w-3.5' />
            </Button>
          )}
        </div>

        {/* Waktu Konsultasi */}
        <div className='border-b border-border/40 pb-2'>
          <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
            Waktu Konsultasi
          </span>
          <span className='text-sm font-semibold text-foreground block truncate'>
            {scheduledDateFormatted}
            {data.scheduledStartTime || appointment.scheduled_start_time
              ? ` (${data.scheduledStartTime || appointment.scheduled_start_time} WIB)`
              : ''}
          </span>
        </div>

        {/* Ruang & Lokasi */}
        <div className='border-b border-border/40 pb-2 flex items-center justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-normal text-muted-foreground block mb-0.5'>
              Ruang & Lokasi
            </span>
            <span className='text-sm font-semibold text-foreground block truncate'>
              {appointment.room_name || appointment.room_location || '-'}
            </span>
          </div>
          {canManageAssignments && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-primary transition-colors shrink-0'
              onClick={() => setIsRoomModalOpen(true)}
              title='Tugaskan / Ganti Ruang Periksa'
            >
              <Icons.edit className='h-3.5 w-3.5' />
            </Button>
          )}
        </div>
      </div>

      {/* Mode Edit: Master Cascader Layanan Medis (Khusus Staf / Admin) */}
      {isEditing && regularFormData && onRegularFieldChange && canManageAssignments && (
        <div className='mb-4 p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-2'>
          <span className='text-xs font-bold text-foreground block uppercase tracking-wider'>
            Ubah Poliklinik & Layanan Medis
          </span>
          <ClinicServiceCascader
            initialUnitId={regularFormData.unitId}
            initialCategoryId={regularFormData.categoryId}
            initialServiceId={regularFormData.serviceId}
            onChange={(selection) => {
              onRegularFieldChange('unitId', selection.unitId);
              onRegularFieldChange('unitName', selection.unitName);
              onRegularFieldChange('categoryId', selection.categoryId);
              onRegularFieldChange('categoryName', selection.categoryName);
              onRegularFieldChange('serviceId', selection.serviceId);
              onRegularFieldChange('serviceName', selection.serviceName);
            }}
          />
        </div>
      )}

      {/* Keluhan Utama */}
      <div className='pt-1'>
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
            value={
              regularFormData?.complaint ||
              data.complaint ||
              appointment.complaint ||
              ''
            }
            readOnly
          />
        )}
      </div>

      {/* Canonical Quick Reassignment Modals */}
      {canManageAssignments && (
        <>
          <ChangeDoctorModal
            isOpen={isDoctorModalOpen}
            appointmentId={appointment.id}
            patientName={appointment.patient_name || '-'}
            patientId={appointment.patient_id}
            queueNumber={appointment.queue_number || '-'}
            currentDoctorName={appointment.doctor_name || '-'}
            appointmentDate={appointment.date}
            appointmentTime={appointment.scheduled_start_time || '-'}
            onClose={() => setIsDoctorModalOpen(false)}
            onSuccess={() => {
              setIsDoctorModalOpen(false);
              handleRefreshAssignments();
            }}
          />

          <ChangeRoomModal
            isOpen={isRoomModalOpen}
            appointmentId={appointment.id}
            patientName={appointment.patient_name || '-'}
            patientId={appointment.patient_id}
            queueNumber={appointment.queue_number || '-'}
            currentRoomName={appointment.room_name || appointment.room_location || '-'}
            appointmentDate={appointment.date}
            appointmentTime={appointment.scheduled_start_time || '-'}
            onClose={() => setIsRoomModalOpen(false)}
            onSuccess={() => {
              setIsRoomModalOpen(false);
              handleRefreshAssignments();
            }}
          />
        </>
      )}
    </div>
  );
}
