'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  onViewDoctorSchedule?: (doctorId: string, targetSlotTime?: string) => void;
}

export function ChangeRoomModal({
  isOpen,
  appointmentId,
  patientName = '-',
  patientId = '-',
  queueNumber = '-',
  currentRoomName = '-',
  appointmentDate = '-',
  appointmentTime = '-',
  onClose,
  onSuccess,
  onViewAppointment,
  onViewDoctorSchedule
}: ChangeRoomModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const {
    data: rooms = [],
    isLoading,
    isError
  } = useQuery({
    ...roomCandidatesQueryOptions(appointmentId),
    enabled: isOpen && Boolean(appointmentId)
  });

  // Reset selected room when modal opens/closes
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
      maxWidth='max-w-[508px]'
      showCloseButton={false}
      dismissible={!mutation.isPending}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* 1. Header */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              Ganti Ruangan Janji Temu
            </h3>
            <div className='flex items-center gap-2 text-xs text-muted-foreground flex-wrap'>
              <span>
                Pasien: <strong className='text-foreground font-semibold'>{patientName}</strong>
              </span>
              {queueNumber && queueNumber !== '-' && (
                <span className='inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]'>
                  Antrean: {queueNumber}
                </span>
              )}
              {currentRoomName && currentRoomName !== '-' && (
                <span className='text-muted-foreground'>
                  • Ruang saat ini: <span className='text-foreground font-medium'>{currentRoomName}</span>
                </span>
              )}
              {onViewAppointment && (
                <button
                  type='button'
                  onClick={() => onViewAppointment(appointmentId)}
                  className='text-xs font-semibold text-primary hover:underline cursor-pointer transition-colors ml-1'
                >
                  Lihat Pasien
                </button>
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* 2. Pilihan Ruangan Klinik */}
        <div className='space-y-2.5 pt-0.5 min-h-[160px]'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-foreground block'>
              Pilih Ruangan Tujuan:
            </span>
            {selectedRoom && (
              <span className='text-[11px] text-primary font-medium truncate max-w-[200px]'>
                Terpilih: {selectedRoom.name}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className='py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Icons.spinner className='size-6 animate-spin text-primary' />
              <span className='text-xs'>Memeriksa ketersediaan ruangan...</span>
            </div>
          ) : isError ? (
            <div className='p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs space-y-1'>
              <p className='font-semibold'>Gagal memuat daftar ruangan</p>
              <p className='text-muted-foreground'>Silakan periksa koneksi atau coba beberapa saat lagi.</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className='py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl p-4'>
              Tidak ada ruangan aktif yang terdaftar.
            </div>
          ) : (
            <div className='space-y-2.5 max-h-[260px] overflow-y-auto pr-1'>
              {rooms.map((room: RoomCandidateItem) => {
                const isSelected = selectedRoomId === room.id;
                const isAvailable = room.isAvailable;
                const occupant = room.occupantDetails;

                if (!isAvailable) {
                  return (
                    <div
                      key={room.id}
                      className='group w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 opacity-75 hover:opacity-100 transition-all select-none'
                    >
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
                        <div className='size-9 rounded-full flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground/50'>
                          <Icons.location className='size-4' />
                        </div>

                        <div className='min-w-0 flex-1 space-y-0.5'>
                          <span className='text-xs sm:text-sm font-bold text-muted-foreground truncate block'>
                            {room.name}
                          </span>
                          <p className='text-xs text-muted-foreground truncate'>
                            {room.location || 'Gedung Utama'}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 shrink-0 pl-2'>
                        {onViewDoctorSchedule && occupant?.practitionerId && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onClose();
                              const targetSlotTime =
                                occupant.startTime ||
                                (appointmentTime ? appointmentTime.split(' ')[0] : undefined);
                              onViewDoctorSchedule(occupant.practitionerId!, targetSlotTime);
                            }}
                            className='opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-[11.5px] font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer inline-flex items-center gap-1 whitespace-nowrap'
                            aria-label={`Lihat dokter di ${room.name}`}
                          >
                            <span>Lihat dokter</span>
                            <Icons.arrowRight className='size-3 stroke-[2.5]' />
                          </button>
                        )}

                        <span
                          className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20 shrink-0'
                          title={occupant?.doctorName ? `Digunakan oleh ${occupant.doctorName}` : undefined}
                        >
                          Terisi{occupant?.doctorName ? `: ${occupant.doctorName}` : ''}
                        </span>

                        <div className='size-5 rounded-full border border-muted-foreground/15 bg-muted/30 flex items-center justify-center shrink-0' />
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
                      'w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20'
                    )}
                  >
                    <div className='flex items-center gap-3 min-w-0 flex-1'>
                      <div
                        className={cn(
                          'size-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icons.location className='size-4' />
                      </div>

                      <div className='min-w-0 flex-1 space-y-0.5'>
                        <span className='text-xs sm:text-sm font-bold text-foreground truncate block'>
                          {room.name}
                        </span>
                        <p className='text-xs text-muted-foreground truncate'>
                          {room.location || 'Gedung Utama'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 shrink-0 pl-2'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0'>
                        Tersedia
                      </span>

                      <div
                        className={cn(
                          'size-5 rounded-full border flex items-center justify-center transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 bg-transparent'
                        )}
                      >
                        {isSelected && <div className='size-2 rounded-full bg-white' />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Footer Actions */}
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
            Simpan Perubahan Ruangan
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
