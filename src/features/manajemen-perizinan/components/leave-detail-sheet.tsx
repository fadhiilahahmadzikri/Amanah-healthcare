'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeaveStatusBadge } from './leave-status-badge';
import { useLeaveDetailSheet } from '../model/useLeaveDetailSheet';
import type { LeaveRequestItem } from '../api/types';

export interface LeaveDetailSheetProps {
  leave: LeaveRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const LEAVE_TYPE_MAP: Record<string, string> = {
  annual_leave: 'Cuti Tahunan',
  sick_leave: 'Izin Sakit',
  seminar_symposium: 'Seminar / Simposium',
  family_matter: 'Keperluan Keluarga',
  external_assignment: 'Tugas Luar',
  other: 'Izin / Cuti Lainnya'
};

export function LeaveDetailSheet({ leave, isOpen, onClose }: LeaveDetailSheetProps) {
  const {
    approvalNotes,
    setApprovalNotes,
    handleReview,
    handleClose,
    initials,
    isPending,
    isSubmitting
  } = useLeaveDetailSheet({ leave, onClose });

  if (!leave) return null;

  const staff = leave.staff;
  const staffTypeLabel =
    staff?.staffType === 'doctor'
      ? 'Dokter'
      : staff?.staffType === 'midwife'
        ? 'Bidan'
        : 'Staf Operasional';

  const leaveTypeLabel = LEAVE_TYPE_MAP[leave.type] || leave.type;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side='right'
        showCloseButton={false}
        className='w-full sm:max-w-[680px] lg:max-w-[760px] p-0 flex flex-col gap-0 overflow-hidden border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
      >
        {/* Profile Header Shell with Gradient Banner */}
        <div className='relative w-full shrink-0 border-b border-border/40 bg-card'>
          <div className='relative w-full h-24 sm:h-28 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary-bright,var(--primary))_28%,transparent)_0%,color-mix(in_oklab,var(--primary-bright,var(--primary))_10%,transparent)_60%,transparent_100%)] overflow-hidden'>
            <button
              type='button'
              onClick={handleClose}
              className='absolute top-3 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 hover:bg-background text-foreground/90 hover:text-foreground text-xs font-semibold backdrop-blur-md border border-border/50 shadow-2xs transition-all cursor-pointer select-none'
            >
              <Icons.chevronLeft className='size-3.5' />
              <span>Kembali</span>
            </button>
          </div>

          <SheetHeader className='px-6 pb-4 pt-0 space-y-0 text-left'>
            <div className='flex items-end gap-3.5 sm:gap-4 -mt-10 sm:-mt-11'>
              <div className='relative shrink-0 size-20 sm:size-22'>
                <Avatar className='size-20 sm:size-22 rounded-full ring-4 ring-card shadow-lg bg-card overflow-hidden shrink-0 aspect-square'>
                  <AvatarImage
                    src={staff?.avatarUrl || ''}
                    alt={staff?.fullName || 'Staf'}
                    referrerPolicy='no-referrer'
                    className='size-full object-cover object-top aspect-square'
                  />
                  <AvatarFallback className='bg-primary/10 text-primary font-bold text-xl'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='flex-1 min-w-0 pb-1 space-y-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <SheetTitle className='text-base sm:text-lg font-bold text-foreground truncate'>
                    {staff?.fullName || 'Staf Klinik'}
                  </SheetTitle>
                  <LeaveStatusBadge status={leave.status} />
                </div>
                <SheetDescription className='text-xs text-muted-foreground'>
                  {staffTypeLabel} {staff?.profession ? `• ${staff.profession}` : ''}
                  {staff?.idCardNumber ? ` • ID: ${staff.idCardNumber}` : ''}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable Content Body */}
        <ScrollArea className='flex-1 w-full'>
          <div className='p-6 flex flex-col gap-6 pb-20'>
            {/* Section 1: Jadwal & Lingkup Izin */}
            <div className='flex flex-col gap-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                Jadwal &amp; Lingkup Izin
              </h4>
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div className='bg-muted/30 border border-border/50 p-3.5 rounded-xl'>
                  <span className='text-muted-foreground block mb-1 text-[11px]'>
                    Tanggal Mulai:
                  </span>
                  <span className='font-semibold text-foreground text-sm'>{leave.startDate}</span>
                </div>
                <div className='bg-muted/30 border border-border/50 p-3.5 rounded-xl'>
                  <span className='text-muted-foreground block mb-1 text-[11px]'>
                    Tanggal Selesai:
                  </span>
                  <span className='font-semibold text-foreground text-sm'>{leave.endDate}</span>
                </div>
              </div>

              <div className='bg-muted/30 border border-border/50 p-3.5 rounded-xl text-xs flex flex-col gap-2.5'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Total Durasi:</span>
                  <span className='font-semibold text-foreground'>{leave.durationDays} Hari</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Jenis Permohonan:</span>
                  <span className='font-semibold text-primary'>{leaveTypeLabel}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Lingkup Izin:</span>
                  <span className='font-semibold text-foreground'>
                    {leave.scope === 'session' ? 'Per Sesi Tertentu' : '1 Hari Penuh'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Diajukan Pada:</span>
                  <span className='font-medium text-foreground'>
                    {leave.createdAt.split('T')[0]}
                  </span>
                </div>
              </div>

              {/* Sesi Dinas jika ada */}
              {leave.sessions && leave.sessions.length > 0 && (
                <div className='bg-muted/20 border border-border/40 p-3.5 rounded-xl flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-foreground'>Sesi Dinas Terkait:</span>
                  <div className='flex flex-wrap gap-1.5'>
                    {leave.sessions.map((s) => (
                      <span
                        key={s.id}
                        className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium'
                      >
                        <Icons.clock className='size-3 text-primary shrink-0' />
                        <span>
                          {s.sessionCode || s.sessionLabel || s.sessionId} ({s.workDate})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Alasan Permohonan */}
            <div className='flex flex-col gap-2'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                Alasan Pengajuan
              </h4>
              <div className='bg-muted/30 border border-border/50 p-4 rounded-xl text-xs text-foreground italic leading-relaxed'>
                &ldquo;{leave.reason}&rdquo;
              </div>
            </div>

            {/* Section 3: Riwayat Peninjauan jika ada */}
            {(leave.status === 'approved' || leave.status === 'rejected') && (
              <div className='flex flex-col gap-2'>
                <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Informasi Peninjauan
                </h4>
                <div className='bg-muted/30 border border-border/50 p-4 rounded-xl text-xs flex flex-col gap-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Status:</span>
                    <LeaveStatusBadge status={leave.status} />
                  </div>
                  {leave.approvalNotes && (
                    <div className='flex flex-col gap-1 pt-1 border-t border-border/40'>
                      <span className='text-muted-foreground text-[11px]'>Catatan Peninjau:</span>
                      <span className='text-foreground font-medium'>{leave.approvalNotes}</span>
                    </div>
                  )}
                  {leave.updatedAt && (
                    <div className='flex items-center justify-between text-muted-foreground text-[11px] pt-1'>
                      <span>Waktu Peninjauan:</span>
                      <span>{leave.updatedAt.replace('T', ' ').slice(0, 19)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Aksi Peninjauan Khusus Admin jika Pending */}
            {isPending && (
              <div className='flex flex-col gap-3 p-4 bg-muted/40 border border-border/60 rounded-2xl'>
                <div>
                  <h4 className='text-xs font-bold text-foreground'>
                    Tindakan Persetujuan Manajemen
                  </h4>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Tinjau permohonan ini. Menyetujui izin akan secara otomatis membuka slot dinas
                    pengganti bagi staf lain.
                  </p>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='approval-notes' className='text-xs font-medium text-foreground'>
                    Catatan Peninjauan (Opsional)
                  </label>
                  <Textarea
                    id='approval-notes'
                    placeholder='Tuliskan catatan persetujuan atau alasan penolakan...'
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={2}
                    className='text-xs'
                  />
                </div>

                <div className='flex items-center justify-end gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={isSubmitting}
                    onClick={() => handleReview('rejected')}
                    className='h-9 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive'
                  >
                    <Icons.close className='size-3.5' />
                    <span>Tolak Permohonan</span>
                  </Button>

                  <Button
                    size='sm'
                    disabled={isSubmitting}
                    onClick={() => handleReview('approved')}
                    className='h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
                  >
                    <Icons.check className='size-3.5' />
                    <span>Setujui Permohonan</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
