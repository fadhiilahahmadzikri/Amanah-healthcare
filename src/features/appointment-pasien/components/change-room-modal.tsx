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
  onViewAppointment
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
      maxWidth='max-w-[580px]'
      showCloseButton={false}
      dismissible={!mutation.isPending}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-3.5'>
        {/* 1. Header */}
        <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <Icons.mapPin className='size-5 text-primary shrink-0' />
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
                Ganti Ruangan Janji Temu
              </h3>
            </div>
            <p className='text-xs text-muted-foreground'>
              Pindahkan lokasi ruangan pemeriksaan janji temu pasien.
            </p>
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

        {/* 2. Informasi Janji Temu Saat Ini */}
        <div className='pb-3 border-b border-border/40'>
          <span className='text-xs font-normal text-muted-foreground/80 block mb-2'>
            Informasi Janji Temu Saat Ini
          </span>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs'>
            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Nama Pasien</span>
              <span className='font-semibold text-foreground truncate block' title={patientName}>
                {patientName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>ID Pasien</span>
              <span className='font-semibold text-foreground font-mono truncate block' title={patientId}>
                {patientId}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>No. Antrean</span>
              <span className='font-bold text-primary font-mono truncate block'>
                {queueNumber}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Ruang Saat Ini</span>
              <span className='font-semibold text-foreground truncate block' title={currentRoomName}>
                {currentRoomName}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Tanggal</span>
              <span className='font-medium text-muted-foreground truncate block'>
                {appointmentDate}
              </span>
            </div>

            <div className='border-b border-border/40 pb-1.5'>
              <span className='text-muted-foreground/70 block text-[11px] mb-0.5'>Jam / Slot</span>
              <span className='font-medium text-muted-foreground font-mono truncate block'>
                {appointmentTime}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Pilihan Ruangan Klinik */}
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
            <div className='space-y-2 max-h-[240px] overflow-y-auto pr-1'>
              {rooms.map((room: RoomCandidateItem) => {
                const isSelected = selectedRoomId === room.id;
                const isAvailable = room.isAvailable;
                const occupant = room.occupantDetails;

                return (
                  <button
                    key={room.id}
                    type='button'
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) setSelectedRoomId(room.id);
                    }}
                    className={cn(
                      'w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 select-none',
                      !isAvailable
                        ? 'opacity-60 cursor-not-allowed bg-muted/40 border-border/40'
                        : isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs cursor-pointer'
                          : 'border-border/60 bg-card hover:border-border hover:bg-accent/40 cursor-pointer'
                    )}
                  >
                    <div className='flex items-center gap-3 min-w-0 flex-1'>
                      <div
                        className={cn(
                          'size-10 min-w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                          isAvailable
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted text-muted-foreground border-border/40'
                        )}
                      >
                        <Icons.mapPin className='size-5' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='text-xs font-bold text-foreground truncate'>
                            {room.name}
                          </h4>
                          {room.code && (
                            <span className='px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground'>
                              {room.code}
                            </span>
                          )}
                        </div>
                        <p className='text-[11px] text-muted-foreground truncate'>
                          {room.location || 'Gedung Utama'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 shrink-0'>
                      {isAvailable ? (
                        <Badge
                          variant='outline'
                          className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold py-0.5'
                        >
                          Tersedia
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold py-0.5'
                          title={occupant?.doctorName ? `Digunakan oleh ${occupant.doctorName}` : undefined}
                        >
                          Terisi{occupant?.doctorName ? `: ${occupant.doctorName}` : ''}
                        </Badge>
                      )}

                      {isAvailable && (
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
                      )}
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
