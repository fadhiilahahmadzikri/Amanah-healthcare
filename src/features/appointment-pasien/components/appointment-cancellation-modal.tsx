'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import {
  bulkProposeCancelAppointments,
  proposeCancellationAppointment,
  bulkCancelAppointments,
  cancelAppointmentAction
} from '../api/service';
import { appointmentKeys } from '../api/queries';

export interface AppointmentCancellationModalProps {
  isOpen: boolean;
  appointmentIds: string[];
  appointmentCount?: number;
  patientName?: string;
  bookingCode?: string | null;
  strategy?: 'proposal' | 'direct';
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentCancellationModal({
  isOpen,
  appointmentIds,
  appointmentCount,
  patientName,
  bookingCode,
  strategy = 'proposal',
  onClose,
  onSuccess
}: AppointmentCancellationModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const effectiveCount = appointmentCount || appointmentIds.length;
  const isBulk = effectiveCount > 1;
  const isDirect = strategy === 'direct';

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

      if (isDirect) {
        if (appointmentIds.length === 1) {
          await cancelAppointmentAction(appointmentIds[0], effectiveReason);
          toast.success('Janji temu berhasil dibatalkan.');
        } else {
          const res = await bulkCancelAppointments({
            appointmentIds,
            reason: effectiveReason
          });
          const succeededCount = res?.data?.succeededCount ?? effectiveCount;
          const failedCount = res?.data?.failedCount ?? 0;
          if (failedCount === 0) {
            toast.success(`Berhasil membatalkan ${succeededCount} antrean.`);
          } else {
            toast.warning(`Selesai: ${succeededCount} dibatalkan, ${failedCount} gagal.`);
          }
        }
      } else {
        // Mode Proposal (menunggu persetujuan pasien)
        if (appointmentIds.length === 1) {
          const res = await proposeCancellationAppointment(appointmentIds[0], effectiveReason);
          toast.success(
            res?.message ||
              'Usulan pembatalan janji temu berhasil diajukan ke pasien (menunggu persetujuan).'
          );
        } else {
          await bulkProposeCancelAppointments({
            appointmentIds,
            reason: effectiveReason
          });
          toast.success(
            `Usulan pembatalan berhasil diajukan ke ${effectiveCount} pasien (menunggu persetujuan).`
          );
        }
      }

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
      const msg =
        err instanceof Error
          ? err.message
          : isDirect
            ? 'Gagal membatalkan janji temu'
            : 'Gagal mengajukan usulan pembatalan';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[420px]'
      backdropClassName='overflow-hidden'
      className='flex flex-col h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[420px] my-auto shadow-xl'
    >
      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        <div className='space-y-1 text-left'>
          <h3 className='text-base font-semibold tracking-tight text-foreground'>
            {isDirect
              ? isBulk
                ? `Batalkan ${effectiveCount} Janji Temu`
                : 'Batalkan Janji Temu'
              : isBulk
                ? `Ajukan Pembatalan ${effectiveCount} Janji Temu`
                : 'Ajukan Pembatalan'}
          </h3>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            {isDirect
              ? `Batalkan antrean ${patientName ? `pasien ${patientName}` : isBulk ? `${effectiveCount} antrean` : ''} di sistem.`
              : `Kirim usulan pembatalan ${patientName ? `pasien ${patientName}` : isBulk ? `${effectiveCount} antrean` : ''} ke pasien.`}
          </p>
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
              placeholder='Tulis alasan pembatalan...'
              required
              className='w-full rounded-xl border border-input bg-background p-3 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground resize-none'
            />
          </div>

          <div className='flex items-center justify-end gap-2 shrink-0 pt-2 border-t border-border/40'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type='submit'
              variant='destructive'
              size='sm'
              disabled={isSubmitting || !reason.trim()}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : isDirect ? 'Batalkan Sekarang' : 'Kirim Usulan'}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
