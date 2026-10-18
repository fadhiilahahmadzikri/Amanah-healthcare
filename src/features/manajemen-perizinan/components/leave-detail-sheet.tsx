'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { LeaveStatusBadge } from './leave-status-badge';
import { useReviewLeaveMutation } from '../api/mutations';
import type { LeaveRequestItem } from '../api/types';

interface LeaveDetailSheetProps {
  leave: LeaveRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveDetailSheet({ leave, isOpen, onClose }: LeaveDetailSheetProps) {
  const [approvalNotes, setApprovalNotes] = useState('');
  const reviewMutation = useReviewLeaveMutation();

  if (!leave) return null;

  const staff = leave.staff;
  const staffTypeLabel =
    staff?.staffType === 'doctor'
      ? 'Dokter'
      : staff?.staffType === 'midwife'
        ? 'Bidan'
        : 'Staf Operasional';

  const typeLabelMap: Record<string, string> = {
    annual_leave: 'Cuti Tahunan',
    sick_leave: 'Izin Sakit',
    seminar_symposium: 'Seminar / Simposium',
    family_matter: 'Keperluan Keluarga',
    external_assignment: 'Tugas Luar',
    other: 'Izin / Cuti Lainnya'
  };
  const leaveTypeLabel = typeLabelMap[leave.type] || leave.type;

  const handleReview = async (status: 'approved' | 'rejected') => {
    try {
      await reviewMutation.mutateAsync({
        id: leave.id,
        status,
        approvalNotes: approvalNotes.trim() || undefined
      });
      setApprovalNotes('');
      onClose();
    } catch {
      // Error handled in mutation toast
    }
  };

  const isPending = leave.status === 'pending';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-md md:max-w-lg flex flex-col gap-0 p-0 overflow-hidden'
      >
        <SheetHeader className='p-6 border-b border-border/60'>
          <div className='flex items-center justify-between gap-3'>
            <SheetTitle className='text-lg font-bold'>Detail Permohonan Izin / Cuti</SheetTitle>
            <LeaveStatusBadge status={leave.status} />
          </div>
          <SheetDescription className='text-xs text-muted-foreground'>
            ID Permohonan: {leave.id}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-6'>
          {/* Section 1: Staff Info */}
          <div className='flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40'>
            <div className='size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0'>
              {staff?.fullName ? staff.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className='min-w-0'>
              <h4 className='font-semibold text-base text-foreground truncate'>
                {staff?.fullName || 'Staf Klinik'}
              </h4>
              <p className='text-xs text-muted-foreground'>
                {staffTypeLabel} {staff?.profession ? `• ${staff.profession}` : ''}
              </p>
              {staff?.idCardNumber && (
                <p className='text-xs text-muted-foreground/80 mt-0.5'>
                  ID Karyawan / SIP: {staff.idCardNumber}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Time & Schedule Scope */}
          <div className='flex flex-col gap-3'>
            <h5 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Jadwal & Lingkup Izin
            </h5>
            <div className='grid grid-cols-2 gap-3 text-xs'>
              <div className='bg-background border border-border/60 p-3 rounded-xl'>
                <span className='text-muted-foreground block mb-1'>Tanggal Mulai:</span>
                <span className='font-semibold text-foreground'>{leave.startDate}</span>
              </div>
              <div className='bg-background border border-border/60 p-3 rounded-xl'>
                <span className='text-muted-foreground block mb-1'>Tanggal Selesai:</span>
                <span className='font-semibold text-foreground'>{leave.endDate}</span>
              </div>
            </div>

            <div className='bg-background border border-border/60 p-3 rounded-xl text-xs flex flex-col gap-2'>
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
            </div>

            {/* If sessions exist */}
            {leave.sessions && leave.sessions.length > 0 && (
              <div className='bg-muted/20 border border-border/40 p-3 rounded-xl flex flex-col gap-1.5'>
                <span className='text-xs font-medium text-foreground'>Sesi Dinas Terkait:</span>
                <div className='flex flex-wrap gap-1.5 mt-1'>
                  {leave.sessions.map((s) => (
                    <span
                      key={s.id}
                      className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium'
                    >
                      <Icons.clock className='size-3' />
                      {s.sessionCode || s.sessionLabel || s.sessionId} ({s.workDate})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Reason */}
          <div className='flex flex-col gap-2'>
            <h5 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Alasan Pengajuan
            </h5>
            <div className='bg-muted/30 border border-border/40 p-4 rounded-xl text-xs text-foreground whitespace-pre-wrap leading-relaxed'>
              {leave.reason}
            </div>
          </div>

          {/* Section 4: Decision Source & Existing Review */}
          <div className='flex flex-col gap-2 text-xs'>
            <div className='flex items-center justify-between py-1 border-b border-border/40'>
              <span className='text-muted-foreground'>Mekanisme Keputusan:</span>
              <span className='font-medium text-foreground'>
                {leave.decisionSource === 'auto'
                  ? 'Otomatis oleh Kebijakan Sistem'
                  : 'Ditinjau oleh Admin / SDM'}
              </span>
            </div>
            {leave.approvalNotes && (
              <div className='mt-2 bg-muted/20 border border-border/40 p-3 rounded-xl'>
                <span className='text-muted-foreground block mb-1'>Catatan Peninjau:</span>
                <span className='text-foreground'>{leave.approvalNotes}</span>
              </div>
            )}
          </div>

          {/* Section 5: Review Action Inputs if Pending */}
          {isPending && (
            <div className='flex flex-col gap-3 pt-2 border-t border-border/60'>
              <Label htmlFor='review-notes' className='text-xs font-semibold'>
                Catatan Persetujuan / Penolakan (Opsional)
              </Label>
              <Textarea
                id='review-notes'
                placeholder='Tuliskan catatan atau alasan jika menolak permohonan ini...'
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className='text-xs min-h-[70px] resize-none'
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <SheetFooter className='p-4 border-t border-border/60 bg-muted/10 gap-2 sm:gap-0'>
          {isPending ? (
            <div className='grid grid-cols-2 gap-3 w-full'>
              <Button
                variant='outline'
                className='border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 text-xs h-9'
                onClick={() => handleReview('rejected')}
                disabled={reviewMutation.isPending}
              >
                <Icons.close className='size-3.5 mr-1.5' />
                Tolak Izin
              </Button>
              <Button
                className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9'
                onClick={() => handleReview('approved')}
                disabled={reviewMutation.isPending}
              >
                <Icons.check className='size-3.5 mr-1.5' />
                Setujui Izin
              </Button>
            </div>
          ) : (
            <Button variant='outline' className='w-full text-xs h-9' onClick={onClose}>
              Tutup
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
