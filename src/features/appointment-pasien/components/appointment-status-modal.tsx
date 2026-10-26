'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminLiveStatus } from '../api/service';
import { appointmentKeys } from '../api/queries';
import {
  APPOINTMENT_STATUS_OPTIONS,
  getAppointmentStatusConfig,
  normalizeToAppointmentStatus
} from '../constants/appointment-status.dictionary';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { isAppointmentTerminal } from '../constants/options';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminAppointment, AppointmentCapabilities, AppointmentStatus } from '../api/types';

export interface AppointmentStatusModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
}

function getStatusDisabledReason(
  targetStatus: AppointmentStatus,
  currentStatus: AppointmentStatus,
  hasAssignments: boolean,
  hasCheckedIn: boolean,
  capabilities?: AppointmentCapabilities
): string | null {
  if (targetStatus === currentStatus) {
    return 'Status saat ini';
  }
  if (targetStatus === APPOINTMENT_STATUS.BOOKED) {
    return 'Tidak dapat mengembalikan status ke Terjadwal';
  }
  if (targetStatus === APPOINTMENT_STATUS.IN_SERVICE) {
    if (!hasAssignments) {
      return 'Dokter dan ruangan harus ditugaskan terlebih dahulu';
    }
    if (currentStatus === APPOINTMENT_STATUS.BOOKED || !hasCheckedIn) {
      return 'Pasien harus check-in terlebih dahulu';
    }
    if (currentStatus !== APPOINTMENT_STATUS.WAITING) {
      return 'Hanya antrean Menunggu yang dapat diperiksa';
    }
    if (capabilities && !capabilities.canStartService) {
      return 'Menunggu giliran (antrean sebelumnya belum selesai)';
    }
  }
  if (targetStatus === APPOINTMENT_STATUS.WAITING) {
    if (!hasAssignments) {
      return 'Dokter dan ruangan harus ditugaskan terlebih dahulu';
    }
    if (currentStatus !== APPOINTMENT_STATUS.BOOKED) {
      return 'Pasien sudah melewati status Menunggu';
    }
    if (capabilities && !capabilities.canCheckIn) {
      return 'Belum dapat masuk antrean';
    }
  }
  if (targetStatus === APPOINTMENT_STATUS.COMPLETED) {
    if (currentStatus !== APPOINTMENT_STATUS.IN_SERVICE) {
      return 'Hanya antrean Sedang Diperiksa yang dapat diselesaikan';
    }
    if (capabilities && !capabilities.canComplete) {
      return 'Hanya antrean Sedang Diperiksa yang dapat diselesaikan';
    }
  }
  if (targetStatus === APPOINTMENT_STATUS.CANCELLED) {
    if (isAppointmentTerminal(currentStatus)) {
      return 'Janji temu sudah selesai atau ditutup';
    }
    if (capabilities && !capabilities.canCancel) {
      return 'Tidak dapat membatalkan janji temu saat ini';
    }
  }
  if (targetStatus === APPOINTMENT_STATUS.LATE) {
    if (isAppointmentTerminal(currentStatus) || currentStatus === APPOINTMENT_STATUS.IN_SERVICE) {
      return 'Tidak dapat menandai terlambat';
    }
  }
  return null;
}

export function AppointmentStatusModal({
  isOpen,
  appointment,
  onClose
}: AppointmentStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(
    APPOINTMENT_STATUS.WAITING
  );
  const queryClient = useQueryClient();

  const currentStatus = normalizeToAppointmentStatus(appointment?.status);
  const hasAssignments = Boolean(appointment?.doctorName && appointment?.roomName);
  const isPostCheckInStatus =
    currentStatus === APPOINTMENT_STATUS.WAITING ||
    currentStatus === APPOINTMENT_STATUS.IN_SERVICE ||
    currentStatus === APPOINTMENT_STATUS.COMPLETED;
  const hasCheckedIn = Boolean(appointment?.checkedInAt) || isPostCheckInStatus;

  useEffect(() => {
    if (appointment) {
      setSelectedStatus(normalizeToAppointmentStatus(appointment.status));
    }
  }, [appointment]);

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: AppointmentStatus }) =>
      updateAdminLiveStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success('Status janji temu berhasil diperbarui');
      onClose();
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.error(error.message || 'Gagal memperbarui status janji temu');
    }
  });

  if (!appointment) return null;

  const selectedDisabledReason = getStatusDisabledReason(
    selectedStatus,
    currentStatus,
    hasAssignments,
    hasCheckedIn,
    appointment.capabilities
  );
  const canSubmit =
    !mutation.isPending && selectedStatus !== currentStatus && !selectedDisabledReason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await mutation.mutateAsync({
      id: appointment.id,
      status: selectedStatus
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[540px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Update Status Janji Temu
            </h3>
            <p className='text-xs text-muted-foreground truncate'>
              Antrean {appointment.queueNumber} • {appointment.patientName} (
              {appointment.poliklinikName})
            </p>
          </div>
        </div>

        {!hasAssignments && (
          <div className='p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300'>
            <Icons.alertCircle className='size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400' />
            <div className='space-y-0.5'>
              <p className='font-semibold'>Dokter dan Ruangan Belum Ditugaskan</p>
              <p className='text-[11px] text-amber-700/90 dark:text-amber-400/90'>
                Tugaskan dokter dan ruangan terlebih dahulu sebelum memperbarui status ke Menunggu
                atau Sedang Diperiksa.
              </p>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <span className='text-xs font-semibold text-foreground tracking-tight block'>
            Pilih Status Operasional Terkini:
          </span>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {APPOINTMENT_STATUS_OPTIONS.map((st) => {
              const isSelected = selectedStatus === st.value;
              const config = getAppointmentStatusConfig(st.value);
              const disabledReason = getStatusDisabledReason(
                st.value,
                currentStatus,
                hasAssignments,
                hasCheckedIn,
                appointment.capabilities
              );
              const isDisabled = Boolean(disabledReason);

              return (
                <button
                  key={st.value}
                  type='button'
                  disabled={isDisabled}
                  aria-label={`Pilih status ${st.label}`}
                  onClick={() => {
                    if (!isDisabled) setSelectedStatus(st.value);
                  }}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 select-none',
                    isDisabled
                      ? 'border-border/30 bg-muted/20 opacity-55 cursor-not-allowed'
                      : isSelected
                        ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30 cursor-pointer'
                        : 'border-border/60 bg-card hover:border-border hover:bg-accent/40 cursor-pointer'
                  )}
                >
                  <div className='pt-0.5 shrink-0'>
                    <div
                      className={cn(
                        'size-4 rounded-full border flex items-center justify-center transition-colors',
                        isSelected && !isDisabled
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40 bg-background'
                      )}
                    >
                      {isSelected && !isDisabled && <Icons.check className='size-2.5 stroke-[3]' />}
                    </div>
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <span
                        className={cn(
                          'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                          config.dotGradient
                        )}
                      />
                      <span className='text-xs font-bold text-foreground tracking-tight'>
                        {st.label}
                      </span>
                    </div>
                    <p className='text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-tight'>
                      {disabledReason ? (
                        <span className='text-amber-600 dark:text-amber-400 font-medium'>
                          {disabledReason}
                        </span>
                      ) : (
                        st.description
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-5 font-medium text-xs'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={!canSubmit}
            className='px-6 font-semibold text-xs'
          >
            {mutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Simpan Status
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
