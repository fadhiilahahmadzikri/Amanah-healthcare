'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { StaffAttendance } from '../api/types';
import { useReconcileOvertimeMutation } from '../api/mutations';
import { formatPresenceTimestamp } from '../utils/duration-format';
import {
  RECONCILE_DECISION,
  type ReconcileDecision
} from '../constants/attendance-status.constants';

interface AttendanceReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: StaffAttendance | null;
}

export function AttendanceReconciliationModal({
  isOpen,
  onClose,
  attendance
}: AttendanceReconciliationModalProps) {
  const [decision, setDecision] = useState<ReconcileDecision>(
    RECONCILE_DECISION.APPROVED_OVERTIME
  );
  const [overtimeHours, setOvertimeHours] = useState<string>('1.0');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const reconcileMutation = useReconcileOvertimeMutation();

  // Reset state when a new attendance record is selected
  useEffect(() => {
    if (attendance) {
      setDecision(RECONCILE_DECISION.APPROVED_OVERTIME);
      setAdminNotes('');
      if (attendance.overdueMinutes && attendance.overdueMinutes > 0) {
        const rawHours = attendance.overdueMinutes / 60;
        setOvertimeHours(rawHours >= 1 ? rawHours.toFixed(1) : '0.5');
      } else {
        setOvertimeHours('1.0');
      }
    }
  }, [attendance]);

  if (!attendance) return null;

  const overdueMins = attendance.overdueMinutes || 0;
  const overdueHoursInt = Math.floor(overdueMins / 60);
  const overdueMinsRemainder = overdueMins % 60;
  const overdueDisplay =
    overdueHoursInt > 0
      ? `${overdueHoursInt} jam ${overdueMinsRemainder > 0 ? `${overdueMinsRemainder} menit` : ''}`
      : `${overdueMins} menit`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendance) return;

    const parsedHours =
      decision === RECONCILE_DECISION.APPROVED_OVERTIME
        ? Math.max(0, parseFloat(overtimeHours) || 0)
        : 0;

    await reconcileMutation.mutateAsync({
      attendanceId: attendance.id,
      decision,
      overtimeHours: parsedHours,
      adminNotes: adminNotes.trim() || undefined
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[520px] p-0 overflow-hidden border-border/60 shadow-xl'>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className='p-6 pb-4 bg-muted/30 border-b border-border/50'>
            <DialogHeader className='text-left'>
              <div className='flex items-center gap-3 mb-1.5'>
                <div className='p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'>
                  <Icons.clock className='size-5' />
                </div>
                <div>
                  <DialogTitle className='text-lg font-bold text-foreground'>
                    Rekonsiliasi Lembur Presensi
                  </DialogTitle>
                  <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                    Tentukan apakah kelebihan jam dinas diakui sebagai lembur atau penyesuaian jam normal.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Context Information Card */}
            <div className='mt-4 p-3.5 rounded-xl bg-card border border-border/60 shadow-2xs space-y-2 text-xs'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold text-foreground text-sm'>
                  {attendance.nama_staf}
                </span>
                <span className='font-mono font-medium text-muted-foreground'>
                  {attendance.id_staf}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-muted-foreground'>
                <div>
                  <span className='text-[11px] block text-muted-foreground/80'>Shift Dinas</span>
                  <span className='font-medium text-foreground'>
                    {attendance.shiftLabel || attendance.shift || '-'}
                  </span>
                </div>
                <div>
                  <span className='text-[11px] block text-muted-foreground/80'>Jam Masuk</span>
                  <span className='font-medium font-mono text-foreground'>
                    {attendance.checkInAt
                      ? formatPresenceTimestamp(attendance.checkInAt, false)
                      : attendance.waktu_presensi}
                  </span>
                </div>
                <div>
                  <span className='text-[11px] block text-muted-foreground/80'>Akhir Terjadwal</span>
                  <span className='font-medium font-mono text-foreground'>
                    {attendance.scheduledEndsAt || '-'}
                  </span>
                </div>
                <div>
                  <span className='text-[11px] block text-muted-foreground/80'>Kelebihan Jam</span>
                  <span className='font-bold text-amber-600 dark:text-amber-400'>
                    +{overdueDisplay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className='p-6 space-y-5'>
            {/* Decision Segmented Radio Cards */}
            <div className='space-y-2.5'>
              <span className='text-xs font-semibold text-foreground block'>
                Status Rekonsiliasi <span className='text-destructive'>*</span>
              </span>

              <div className='grid grid-cols-1 gap-2.5'>
                {/* Option A: Ya (Lembur) */}
                <button
                  type='button'
                  onClick={() => setDecision(RECONCILE_DECISION.APPROVED_OVERTIME)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3',
                    decision === RECONCILE_DECISION.APPROVED_OVERTIME
                      ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <div
                    className={cn(
                      'size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5',
                      decision === RECONCILE_DECISION.APPROVED_OVERTIME
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-muted-foreground/40'
                    )}
                  >
                    {decision === RECONCILE_DECISION.APPROVED_OVERTIME && (
                      <div className='size-1.5 rounded-full bg-white' />
                    )}
                  </div>
                  <div className='space-y-0.5'>
                    <div className='text-xs font-bold text-foreground flex items-center gap-2'>
                      <span>Ya, Dihitung Lembur (Overtime)</span>
                      <span className='px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'>
                        + Kompensasi Payroll
                      </span>
                    </div>
                    <p className='text-[11px] text-muted-foreground leading-relaxed'>
                      Kelebihan jam dinas disetujui sebagai jam lembur resmi dan ditambahkan ke rekapitulasi gaji bulan berjalan.
                    </p>
                  </div>
                </button>

                {/* Option B: Tidak (Lupa Checkout) */}
                <button
                  type='button'
                  onClick={() => setDecision(RECONCILE_DECISION.REJECTED_OVERTIME)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3',
                    decision === RECONCILE_DECISION.REJECTED_OVERTIME
                      ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <div
                    className={cn(
                      'size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5',
                      decision === RECONCILE_DECISION.REJECTED_OVERTIME
                        ? 'border-amber-600 bg-amber-600'
                        : 'border-muted-foreground/40'
                    )}
                  >
                    {decision === RECONCILE_DECISION.REJECTED_OVERTIME && (
                      <div className='size-1.5 rounded-full bg-white' />
                    )}
                  </div>
                  <div className='space-y-0.5'>
                    <div className='text-xs font-bold text-foreground flex items-center gap-2'>
                      <span>Tidak, Lupa Check-out (Human Error)</span>
                      <span className='px-1.5 py-0.2 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50'>
                        Jam Normal Standar
                      </span>
                    </div>
                    <p className='text-[11px] text-muted-foreground leading-relaxed'>
                      Presensi dinas disesuaikan ke jam akhir shift standar. Tidak ada tambahan honor lembur pada rekap payroll.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Overtime Hours Input (Only active when decision is approved) */}
            {decision === RECONCILE_DECISION.APPROVED_OVERTIME && (
              <div className='space-y-1.5 pt-1'>
                <label
                  htmlFor='overtimeHours'
                  className='text-xs font-semibold text-foreground flex items-center justify-between'
                >
                  <span>Durasi Jam Lembur Disetujui</span>
                  <span className='text-[11px] text-muted-foreground font-normal'>
                    Satuan Jam (Desimal diizinkan)
                  </span>
                </label>
                <div className='relative'>
                  <Input
                    id='overtimeHours'
                    type='number'
                    step='0.25'
                    min='0.25'
                    max='24'
                    required
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    className='h-9 text-xs font-mono font-medium pr-12'
                  />
                  <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs text-muted-foreground font-medium'>
                    Jam
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes Textarea */}
            <div className='space-y-1.5'>
              <label
                htmlFor='adminNotes'
                className='text-xs font-semibold text-foreground block'
              >
                Catatan Rekonsiliasi Admin <span className='text-muted-foreground font-normal'>(Opsional)</span>
              </label>
              <Textarea
                id='adminNotes'
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  decision === RECONCILE_DECISION.APPROVED_OVERTIME
                    ? 'Contoh: Penanganan tindakan bedah darurat poli selesai jam 15:30.'
                    : 'Contoh: Staf konfirmasi langsung lupa tap pulang di terminal klinik.'
                }
                className='text-xs resize-none'
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className='p-4 pt-3 bg-muted/20 border-t border-border/50 sm:justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={reconcileMutation.isPending}
              className='text-xs'
            >
              Batal
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={reconcileMutation.isPending}
              className='text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90'
            >
              {reconcileMutation.isPending ? (
                <>
                  <Icons.spinner className='size-3.5 animate-spin' />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Icons.check className='size-3.5' />
                  <span>Simpan Rekonsiliasi</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
