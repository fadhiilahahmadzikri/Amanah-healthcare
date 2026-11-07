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
      maxWidth='max-w-[500px]'
      backdropClassName='overflow-hidden'
      className='flex flex-col h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[500px] my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        <div className='flex items-start gap-3'>
          <div
            className={`size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
              isDirect
                ? 'bg-destructive/10 border-destructive/20 text-destructive'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            <Icons.alertCircle className='size-5 stroke-[2]' />
          </div>
          <div>
            <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
              {isDirect
                ? isBulk
                  ? `Batalkan ${effectiveCount} Janji Temu (Langsung)`
                  : `Batalkan Janji Temu ${patientName ? `(${patientName})` : ''} (Langsung)`
                : isBulk
                  ? `Ajukan Pembatalan ${effectiveCount} Janji Temu`
                  : `Ajukan Pembatalan Janji Temu ${patientName ? `(${patientName})` : ''}`}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
              {isDirect
                ? `Tindakan ini akan membatalkan antrean ${bookingCode ? `kode ${bookingCode} ` : ''}dan melepaskan slot tiket pasien seketika tanpa pengajuan proposal.`
                : `Usulan pembatalan ${bookingCode ? `antrean ${bookingCode} ` : ''}akan dikirimkan kepada pasien via notifikasi. Janji temu akan dibatalkan resmi setelah disetujui pasien.`}
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

          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
              isDirect
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'bg-muted/60 text-muted-foreground'
            }`}
          >
            <Icons.info className='size-4 text-primary shrink-0' />
            <span>
              {isDirect
                ? 'Tindakan langsung (override) ini akan merilis tiket pasien seketika dan tidak dapat dibatalkan.'
                : 'Tindakan usulan ini memerlukan konfirmasi pasien demi menjaga kepastian dan rekam medis pelayanan klinik.'}
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
              {isSubmitting ? 'Memproses...' : isDirect ? 'Batalkan Sekarang' : 'Ajukan Pembatalan'}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
