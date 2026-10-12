'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BookingSessionStep } from '@/features/klinik/components/booking/booking-session-step';
import { rescheduleAppointmentAction } from '../api/service';
import { appointmentKeys } from '../api/queries';

export interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  appointmentId: string;
  patientName?: string;
  queueNumber?: string;
  serviceName?: string;
  poliklinikId?: string;
  currentDate?: string;
  currentSession?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_REASONS = [
  'Ada keperluan mendadak',
  'Ingin ganti sesi praktik',
  'Keluarga berhalangan hadir',
  'Permintaan pasien'
];

export function RescheduleAppointmentModal({
  isOpen,
  appointmentId,
  patientName = 'Pasien',
  queueNumber = '-',
  serviceName = 'Poliklinik',
  poliklinikId,
  currentDate,
  currentSession,
  onClose,
  onSuccess
}: RescheduleAppointmentModalProps) {
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(currentDate || todayStr);
  const [selectedSessionCode, setSelectedSessionCode] = useState<string>(currentSession || '');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetDate(currentDate || todayStr);
      setSelectedSessionCode(currentSession || '');
      setSelectedSessionId('');
      setReason('');
    }
  }, [isOpen, currentDate, currentSession, todayStr]);

  const mutation = useMutation({
    mutationFn: async () => {
      return await rescheduleAppointmentAction(appointmentId, {
        target_date: targetDate,
        target_session_id: selectedSessionId || selectedSessionCode || undefined,
        reason: reason.trim() || undefined
      });
    },
    onSuccess: (res) => {
      toast.success(res?.message || 'Janji temu berhasil dijadwalkan ulang');
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:appointment_updated'));
      }
      onSuccess?.();
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal menjadwalkan ulang: ${message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      toast.error('Silakan pilih tanggal jadwal baru');
      return;
    }
    mutation.mutate();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-xl sm:max-w-2xl'
      showCloseButton={false}
      dismissible={!mutation.isPending}
      className='flex flex-col max-h-[90vh] overflow-hidden'
    >
      <form onSubmit={handleSubmit} className='flex flex-col font-sans h-full min-h-0 select-none'>
        {/* Header */}
        <div className='flex items-center justify-between gap-3 pb-3.5 border-b border-border/40 shrink-0'>
          <div className='flex flex-col min-w-0 flex-1 space-y-0.5'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
              Jadwalkan Ulang (Reschedule)
            </h3>
            <p className='text-xs font-medium text-muted-foreground truncate'>
              Antrean {queueNumber} • {patientName} • {serviceName}
            </p>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClose}
            disabled={mutation.isPending}
            className='size-8 text-muted-foreground hover:text-foreground rounded-full'
          >
            <Icons.close className='size-4' />
            <span className='sr-only'>Tutup</span>
          </Button>
        </div>

        {/* Content Body */}
        <div className='flex-1 overflow-y-auto py-4 space-y-5 min-h-0 pr-1'>
          {/* Tanggal Tujuan */}
          <div className='space-y-1.5'>
            <Label htmlFor='target-date' className='text-xs font-semibold text-foreground'>
              Pilih Tanggal Baru
            </Label>
            <div className='relative'>
              <Input
                id='target-date'
                type='date'
                min={todayStr}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className='h-10 text-xs sm:text-sm font-medium pr-10'
                required
              />
              <Icons.calendar className='size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
            </div>
          </div>

          {/* Sesi Praktik via BookingSessionStep */}
          <div className='p-3.5 rounded-2xl bg-muted/30 border border-border/60'>
            <BookingSessionStep
              selectedService={null}
              poliklinikId={poliklinikId}
              dateStr={targetDate}
              session={selectedSessionCode}
              setSession={setSelectedSessionCode}
              onSelectSessionId={setSelectedSessionId}
            />
          </div>

          {/* Alasan Reschedule (Opsional) */}
          <div className='space-y-2 pt-1'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='reschedule-reason' className='text-xs font-semibold text-foreground'>
                Alasan Penjadwalan Ulang
              </Label>
              <span className='text-[11px] text-muted-foreground'>Opsional</span>
            </div>

            {/* Quick Reason Chips */}
            <div className='flex flex-wrap gap-1.5'>
              {COMMON_REASONS.map((chip) => (
                <button
                  key={chip}
                  type='button'
                  onClick={() => setReason(chip)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer',
                    reason === chip
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>

            <Input
              id='reschedule-reason'
              type='text'
              placeholder='Contoh: Ada keperluan keluarga mendadak...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='h-9 text-xs'
              maxLength={150}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-between gap-3 pt-3 border-t border-border/40 shrink-0'>
          <p className='text-[11px] text-muted-foreground'>
            Nomor antrean baru akan dialokasikan di posisi ekor sesi tujuan.
          </p>

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              shape='pill'
              size='default'
              onClick={onClose}
              disabled={mutation.isPending}
              className='text-xs font-semibold px-4'
            >
              Batal
            </Button>

            <Button
              type='submit'
              variant='default'
              shape='pill'
              size='default'
              disabled={mutation.isPending || !targetDate}
              className='text-xs font-semibold px-5'
            >
              {mutation.isPending ? (
                <>
                  <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Icons.check className='mr-1.5 size-3.5' />
                  <span>Konfirmasi Reschedule</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
