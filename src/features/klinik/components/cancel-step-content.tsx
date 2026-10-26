'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { formatClinicDate } from '@/lib/date-format';
import type { Appointment } from '../api/types';

export interface CancelStepProps {
  appointment: Appointment;
  patientName: string;
  doctorName: string;
  queueNumber: string;
  appointmentDate: string;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  isCancelling: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function CancelStepContent({
  appointment,
  patientName,
  doctorName,
  queueNumber,
  appointmentDate,
  cancelReason,
  setCancelReason,
  isCancelling,
  onBack,
  onConfirm
}: CancelStepProps) {
  const formattedDate =
    appointmentDate && appointmentDate !== '-' ? formatClinicDate(appointmentDate) : '-';
  const friendlySession = appointment.session_name || '';
  const sessionLabel =
    [friendlySession, appointment.eta_range].filter(Boolean).join(' • ') || appointment.time || '-';

  return (
    <div className='animate-in fade-in-50 slide-in-from-right-4 duration-200'>
      {/* Destructive Header — red accent, focused */}
      <div className='flex items-center gap-3 pb-4 border-b border-destructive/20'>
        <div className='flex items-center justify-center size-10 rounded-full bg-destructive/10 shrink-0'>
          <Icons.warning className='size-5 text-destructive' />
        </div>
        <div className='min-w-0 flex-1'>
          <h3 className='text-base sm:text-lg font-bold text-destructive tracking-tight'>
            Konfirmasi Pembatalan
          </h3>
          <p className='text-xs font-medium text-muted-foreground'>
            Tindakan ini tidak dapat dibatalkan
          </p>
        </div>
      </div>

      {/* Summary of what will be cancelled */}
      <div className='mt-4 rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2.5'>
        <div className='grid grid-cols-2 gap-3 text-xs'>
          <div>
            <span className='text-muted-foreground block mb-0.5'>Pasien</span>
            <span className='font-semibold text-foreground'>{patientName}</span>
          </div>
          <div>
            <span className='text-muted-foreground block mb-0.5'>No. Antrean</span>
            <span className='font-bold font-mono text-primary'>{queueNumber}</span>
          </div>
          <div>
            <span className='text-muted-foreground block mb-0.5'>Dokter</span>
            <span className='font-semibold text-foreground'>{doctorName}</span>
          </div>
          <div>
            <span className='text-muted-foreground block mb-0.5'>Tanggal</span>
            <span className='font-semibold text-foreground'>{formattedDate}</span>
          </div>
          <div className='col-span-2'>
            <span className='text-muted-foreground block mb-0.5'>Sesi / Waktu</span>
            <span className='font-semibold text-foreground'>{sessionLabel}</span>
          </div>
        </div>
      </div>

      {/* Info text */}
      <p className='mt-3.5 text-xs text-muted-foreground leading-relaxed'>
        Apakah Anda yakin ingin membatalkan janji temu ini? 1 kuota sesi praktik dokter akan
        dikembalikan secara otomatis.
      </p>

      {/* Reason input */}
      <div className='mt-3 space-y-1.5'>
        <label
          htmlFor='cancel-reason-input'
          className='text-xs font-semibold text-foreground block'
        >
          Alasan Pembatalan (Opsional)
        </label>
        <textarea
          id='cancel-reason-input'
          aria-label='Alasan Pembatalan'
          rows={2}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder='Masukkan alasan pembatalan (misal: Berhalangan hadir karena ada keperluan mendesak)...'
          className='w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-destructive resize-none'
          disabled={isCancelling}
        />
      </div>

      {/* Footer actions */}
      <div className='flex items-center justify-between gap-3 pt-4 mt-1'>
        <Button
          type='button'
          variant='outline'
          shape='pill'
          size='default'
          onClick={onBack}
          disabled={isCancelling}
          className='px-6 font-semibold'
        >
          Kembali
        </Button>
        <Button
          type='button'
          variant='destructive'
          shape='pill'
          size='default'
          onClick={onConfirm}
          disabled={isCancelling}
          className='px-5 font-bold'
        >
          {isCancelling ? (
            <span className='inline-flex items-center gap-2'>
              <Icons.spinner className='size-3.5 animate-spin' />
              Membatalkan...
            </span>
          ) : (
            'Ya, Batalkan Janji Temu'
          )}
        </Button>
      </div>
    </div>
  );
}
