'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { bulkProposeCancelAppointments } from '../api/service';
import { appointmentKeys } from '../api/queries';

export interface AppointmentCancellationModalProps {
  isOpen: boolean;
  appointmentIds: string[];
  appointmentCount?: number;
  patientName?: string;
  bookingCode?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentCancellationModal({
  isOpen,
  appointmentIds,
  appointmentCount,
  patientName,
  bookingCode,
  onClose,
  onSuccess
}: AppointmentCancellationModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const effectiveCount = appointmentCount || appointmentIds.length;
  const isBulk = effectiveCount > 1;

  React.useEffect(() => {
    if (!isOpen) {
      setReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (appointmentIds.length === 0) return;

    try {
      setIsSubmitting(true);
      const effectiveReason = reason.trim() || 'Kendala operasional / jadwal klinik';

      await bulkProposeCancelAppointments({
        appointmentIds,
        reason: effectiveReason
      });

      toast.success(
        isBulk
          ? `Usulan pembatalan berhasil diajukan ke ${effectiveCount} pasien (menunggu persetujuan).`
          : 'Usulan pembatalan janji temu berhasil diajukan ke pasien (menunggu persetujuan).'
      );

      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('clinic:appointment_updated'));
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengajukan usulan pembatalan';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[500px]'
      backdropClassName='overflow-hidden'
      className='flex flex-col h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[500px] my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        <div className='flex items-start gap-3'>
          <div className='size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5'>
            <Icons.alertCircle className='size-5 stroke-[2]' />
          </div>
          <div>
            <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
              {isBulk
                ? `Ajukan Pembatalan ${effectiveCount} Janji Temu`
                : 'Ajukan Pembatalan Janji Temu'}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
              Usulan pembatalan akan dikirimkan kepada pasien via notifikasi. Janji temu akan
              dibatalkan resmi setelah disetujui pasien.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4 pt-1'>
          <div className='space-y-1.5'>
            <label
              htmlFor='cancellation-reason'
              className='text-xs font-semibold text-foreground block'
            >
              Alasan Pembatalan <span className='text-destructive'>*</span>
            </label>
            <textarea
              id='cancellation-reason'
              aria-label='Alasan Pembatalan'
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Tuliskan alasan pembatalan (misal: Dokter berhalangan hadir atau kendala operasional klinik)...'
              required
              className='w-full rounded-xl border border-input bg-background p-3 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground resize-none'
            />
          </div>

          <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
            <Icons.info className='size-4 text-primary shrink-0' />
            <span>
              Tindakan ini memerlukan konfirmasi pasien demi menjaga kepastian dan rekam medis
              pelayanan klinik.
            </span>
          </div>

          <div className='flex items-center justify-end gap-2 shrink-0 pt-2 border-t border-border/40'>
            <Button
              type='button'
              variant='ghost'
              size='md'
              shape='pill'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              type='submit'
              variant='destructive'
              size='md'
              shape='pill'
              disabled={isSubmitting || !reason.trim()}
              isLoading={isSubmitting}
              className='min-w-[140px]'
            >
              {isSubmitting ? 'Mengajukan...' : 'Ajukan Pembatalan'}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
