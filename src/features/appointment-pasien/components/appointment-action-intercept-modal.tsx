'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { PERMISSIONS } from '@/core/auth/permissions.constants';

export type AppointmentActionStrategy = 'proposal' | 'direct';

export interface AppointmentActionInterceptModalProps {
  isOpen: boolean;
  actionType: 'reschedule' | 'cancel';
  appointmentCount?: number;
  patientName?: string;
  onSelectStrategy: (strategy: AppointmentActionStrategy) => void;
  onClose: () => void;
}

export function AppointmentActionInterceptModal({
  isOpen,
  actionType,
  appointmentCount = 1,
  patientName,
  onSelectStrategy,
  onClose
}: AppointmentActionInterceptModalProps) {
  const { can } = useAuthContext();
  const canDirect = can(PERMISSIONS.APPOINTMENTS.MANAGE);

  if (!isOpen) return null;

  const isReschedule = actionType === 'reschedule';
  const isBulk = appointmentCount > 1;

  const targetLabel = isBulk
    ? `${appointmentCount} antrean janji temu`
    : patientName
      ? `janji temu ${patientName}`
      : '1 janji temu';

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
              isReschedule
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isReschedule ? (
              <Icons.calendar className='size-5 stroke-[2]' />
            ) : (
              <Icons.alertCircle className='size-5 stroke-[2]' />
            )}
          </div>
          <div>
            <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
              {isReschedule ? 'Pilih Metode Penjadwalan Ulang' : 'Pilih Metode Pembatalan'}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
              Tentukan bagaimana perubahan jadwal untuk{' '}
              <span className='font-semibold text-foreground'>{targetLabel}</span> akan diproses.
            </p>
          </div>
        </div>

        {/* Strategy Options */}
        <div className='space-y-3 pt-1'>
          {/* OPTION 1: AJUKAN PROPOSAL (RECOMMENDED) */}
          <div
            role='button'
            tabIndex={0}
            onClick={() => {
              onSelectStrategy('proposal');
              onClose();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStrategy('proposal');
                onClose();
              }
            }}
            className='group relative flex flex-col p-3.5 sm:p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.1] transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/40'
          >
            <div className='flex items-center justify-between gap-2 mb-1.5'>
              <div className='flex items-center gap-2'>
                <div className='size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0'>
                  <Icons.check className='size-4 stroke-[2.5]' />
                </div>
                <span className='text-xs font-bold text-foreground'>
                  {isReschedule ? 'Ajukan Usulan (Proposal)' : 'Ajukan Usulan Pembatalan'}
                </span>
              </div>
              <span className='px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'>
                Rekomendasi Etika
              </span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed pl-9'>
              {isReschedule
                ? 'Usulan jadwal baru akan dikirimkan kepada pasien via notifikasi. Jadwal baru akan resmi berlaku setelah disetujui pasien.'
                : 'Permohonan pembatalan diajukan kepada pasien via notifikasi. Janji temu resmi dibatalkan setelah disetujui pasien demi rekam medis yang tertib.'}
            </p>
          </div>

          {/* OPTION 2: TERAPKAN LANGSUNG (DIRECT OVERRIDE) */}
          <div
            role='button'
            tabIndex={canDirect ? 0 : -1}
            aria-disabled={!canDirect}
            onClick={() => {
              if (!canDirect) return;
              onSelectStrategy('direct');
              onClose();
            }}
            onKeyDown={(e) => {
              if (!canDirect) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStrategy('direct');
                onClose();
              }
            }}
            className={`group relative flex flex-col p-3.5 sm:p-4 rounded-xl border transition-all text-left ${
              canDirect
                ? 'border-border/70 bg-card hover:bg-accent/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring'
                : 'border-border/40 bg-muted/30 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className='flex items-center justify-between gap-2 mb-1.5'>
              <div className='flex items-center gap-2'>
                <div
                  className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                    canDirect
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icons.arrowRight className='size-4 stroke-[2.5]' />
                </div>
                <span className='text-xs font-bold text-foreground'>
                  {isReschedule
                    ? 'Terapkan Langsung (Bypass Proposal)'
                    : 'Batalkan Langsung (Bypass Proposal)'}
                </span>
              </div>
              <span className='px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-muted text-muted-foreground border border-border/50'>
                {canDirect ? 'Direct Override' : 'Terkunci (RBAC)'}
              </span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed pl-9'>
              {canDirect
                ? isReschedule
                  ? 'Jadwal langsung diubah seketika di sistem tanpa menunggu respon/persetujuan pasien.'
                  : 'Antrean langsung dibatalkan seketika dan slot tiket dilepaskan tanpa menunggu persetujuan pasien.'
                : 'Memerlukan hak akses appointments:manage untuk melakukan tindakan langsung bypass proposal.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-2 shrink-0 pt-2 border-t border-border/40 mt-1'>
          <Button type='button' variant='ghost' size='sm' shape='pill' onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
