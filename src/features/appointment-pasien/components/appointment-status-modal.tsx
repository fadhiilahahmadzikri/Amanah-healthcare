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
  getAppointmentStatusConfig
} from '../constants/appointment-status.dictionary';
import { APPOINTMENT_STATUS } from '@/constants/appointment-status.constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminAppointment, AppointmentStatus } from '../api/types';

export interface AppointmentStatusModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
}

export function AppointmentStatusModal({
  isOpen,
  appointment,
  onClose
}: AppointmentStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(APPOINTMENT_STATUS.WAITING);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (appointment) {
      setSelectedStatus(appointment.status);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({
      id: appointment.id,
      status: selectedStatus
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[620px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Update Status Janji Temu
            </h3>
            <p className='text-xs text-muted-foreground'>
              Pilih progres status operasional antrean pasien saat ini.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Informasi Janji Temu Pasien
          </span>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs'>
            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Nama Pasien</span>
              <span className='font-semibold text-foreground truncate block'>
                {appointment.patientName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>ID Pasien</span>
              <span className='font-semibold text-foreground font-mono truncate block'>
                {appointment.patientId}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>No. Antrean</span>
              <span className='font-bold text-primary font-mono truncate block'>
                {appointment.queueNumber}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Dokter</span>
              <span className='font-semibold text-foreground truncate block'>
                {appointment.doctorName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Tanggal</span>
              <span className='font-medium text-muted-foreground truncate block'>
                {appointment.scheduledDate}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Jam / Slot</span>
              <span className='font-medium text-muted-foreground font-mono truncate block'>
                {appointment.scheduledStartTime}
              </span>
            </div>
          </div>
        </div>

        <div className='space-y-2 pt-0.5'>
          <span className='text-xs font-normal text-muted-foreground/80 block'>
            Pilih Status Operasional Terkini:
          </span>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {APPOINTMENT_STATUS_OPTIONS.map((st) => {
              const isSelected = selectedStatus === st.value;
              const config = getAppointmentStatusConfig(st.value);

              return (
                <button
                  key={st.value}
                  type='button'
                  aria-label={`Pilih status ${st.label}`}
                  onClick={() => setSelectedStatus(st.value)}
                  className={cn(
                    'w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer select-none',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                      : 'border-border/60 bg-card hover:border-border hover:bg-accent/40'
                  )}
                >
                  <div className='pt-0.5 shrink-0'>
                    <div
                      className={cn(
                        'size-4 rounded-full border flex items-center justify-center transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40 bg-background'
                      )}
                    >
                      {isSelected && <Icons.check className='size-2.5 stroke-[3]' />}
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
                      {st.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-6 font-medium'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={mutation.isPending}
            className='px-7 font-semibold'
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
