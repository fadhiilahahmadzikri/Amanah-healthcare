'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { useQuery, useMutation } from '@tanstack/react-query';
import { roomCandidatesQueryOptions, appointmentKeys } from '../api/queries';
import { changeAppointmentRoom } from '../api/service';
import { getQueryClient } from '@/lib/query-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RoomCandidateItem, ChangeRoomPayload } from '../api/types';

export interface ChangeRoomModalProps {
  isOpen: boolean;
  appointmentId: string;
  patientName?: string;
  patientId?: string;
  queueNumber?: string;
  currentRoomName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onViewAppointment?: (appointmentId: string) => void;
  onViewDoctorSchedule?: (doctorId: string, targetSessionTime?: string) => void;
}

export function ChangeRoomModal({
  isOpen,
  appointmentId,
  patientName = '-',
  patientId: _patientId = '-',
  queueNumber = '-',
  currentRoomName = '-',
  appointmentDate: _appointmentDate = '-',
  appointmentTime = '-',
  onClose,
  onSuccess,
  onViewAppointment,
  onViewDoctorSchedule
}: ChangeRoomModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const isAssignMode =
    !currentRoomName || currentRoomName === '-' || currentRoomName === 'Belum di-assign';

  const {
    data: rooms = [],
    isLoading,
    isError
  } = useQuery({
    ...roomCandidatesQueryOptions(appointmentId),
    enabled: isOpen && Boolean(appointmentId)
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedRoomId(null);
    }
  }, [isOpen]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const mutation = useMutation({
    mutationFn: (payload: ChangeRoomPayload) =>
      changeAppointmentRoom(payload.appointmentId, payload.roomId),
    onSuccess: (res) => {
      const qc = getQueryClient();
      void qc.invalidateQueries({ queryKey: appointmentKeys.all });
      void qc.invalidateQueries({ queryKey: ['doctor-schedules'] });

      if (res?.success === false) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        description: `Janji temu dialihkan ke ${selectedRoom?.name || 'Ruangan baru'}.`,
        action: onViewAppointment
          ? {
              label: 'Lihat Janji Temu',
              onClick: () => onViewAppointment(appointmentId)
            }
          : undefined
      });
      onSuccess?.();
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal mengubah ruangan');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.warning('Silakan pilih salah satu ruangan');
      return;
    }

    await mutation.mutateAsync({
      appointmentId,
      roomId: selectedRoomId
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[540px]'
      showCloseButton={false}
      dismissible={!mutation.isPending}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        <div className='flex items-start justify-between gap-3 pb-3 border-b border-border/40'>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {isAssignMode ? 'Tugaskan Ruangan Pemeriksaan' : 'Ganti Ruangan Pemeriksaan'}
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Janji temu untuk <span className='font-semibold text-foreground'>{patientName}</span>
              {queueNumber && queueNumber !== '-' ? ` dengan nomor antrean ${queueNumber}` : ''}
              {!isAssignMode && currentRoomName && currentRoomName !== '-'
                ? `, saat ini ditempatkan di ${currentRoomName}`
                : ''}
              .
              {onViewAppointment && (
                <button
                  type='button'
                  onClick={() => onViewAppointment(appointmentId)}
                  className='text-xs font-semibold text-primary hover:underline cursor-pointer ml-1.5 inline-block'
                >
                  Lihat Pasien
                </button>
              )}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        <div className='space-y-2.5 pt-0.5'>
          {isLoading ? (
            <div className='py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Icons.spinner className='size-6 animate-spin text-primary' />
              <span className='text-xs'>Memeriksa ketersediaan ruangan...</span>
            </div>
          ) : isError ? (
            <div className='p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs space-y-1'>
              <p className='font-semibold'>Gagal memuat daftar ruangan</p>
              <p className='text-muted-foreground'>
                Silakan periksa koneksi atau coba beberapa saat lagi.
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div className='py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl p-4'>
              Tidak ada ruangan aktif yang terdaftar.
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1'>
              {rooms.map((room: RoomCandidateItem) => {
                const isSelected = selectedRoomId === room.id;
                const isAvailable = room.isAvailable;
                const occupant = room.occupantDetails;

                if (!isAvailable) {
                  return (
                    <div
                      key={room.id}
                      className='group w-full text-left relative flex flex-col justify-between p-3 rounded-xl border border-border/40 bg-muted/20 opacity-75 hover:opacity-100 transition-all select-none'
                    >
                      <div className='flex items-start justify-between gap-2 w-full'>
                        <div className='flex items-center gap-2.5 min-w-0'>
                          <div className='size-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground/50'>
                            <Icons.location className='size-4' />
                          </div>
                          <div className='min-w-0'>
                            <h4 className='text-xs font-bold text-muted-foreground truncate'>
                              {room.name}
                            </h4>
                            <p className='text-[11px] text-muted-foreground truncate'>
                              {room.location || 'Gedung Utama'}
                            </p>
                          </div>
                        </div>
                        <div className='size-4.5 rounded-full border border-muted-foreground/20 bg-muted/40 shrink-0 mt-0.5' />
                      </div>

                      <div className='pt-2.5 flex items-center justify-between gap-1'>
                        <span
                          className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 truncate max-w-[170px]'
                          title={
                            occupant?.doctorName
                              ? `Digunakan oleh ${occupant.doctorName}`
                              : undefined
                          }
                        >
                          Sedang Digunakan{occupant?.doctorName ? `: ${occupant.doctorName}` : ''}
                        </span>

                        {onViewDoctorSchedule && occupant?.practitionerId && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              const targetSessionTime =
                                occupant.startTime ||
                                (appointmentTime ? appointmentTime.split(' ')[0] : undefined);
                              onViewDoctorSchedule(occupant.practitionerId!, targetSessionTime);
                            }}
                            className='text-[10.5px] font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-0.5 whitespace-nowrap'
                          >
                            <span>Lihat dokter</span>
                            <Icons.arrowRight className='size-2.5 stroke-[2.5]' />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={room.id}
                    type='button'
                    aria-label={`Pilih Ruang ${room.name}`}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={cn(
                      'w-full text-left relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20'
                    )}
                  >
                    <div className='flex items-start justify-between gap-2 w-full'>
                      <div className='flex items-center gap-2.5 min-w-0'>
                        <div
                          className={cn(
                            'size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          <Icons.location className='size-4' />
                        </div>
                        <div className='min-w-0'>
                          <h4 className='text-xs font-bold text-foreground truncate'>
                            {room.name}
                          </h4>
                          <p className='text-[11px] text-muted-foreground truncate'>
                            {room.location || 'Gedung Utama'}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'size-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors mt-0.5',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 bg-background'
                        )}
                      >
                        {isSelected && <Icons.check className='size-2.5 stroke-[2.5]' />}
                      </div>
                    </div>

                    <div className='pt-2.5 flex items-center justify-between'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                        Tersedia
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            disabled={mutation.isPending}
            className='px-6 font-medium'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={mutation.isPending || !selectedRoomId}
            className='px-7 font-semibold'
          >
            {mutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            {isAssignMode ? 'Tugaskan Ruangan' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
