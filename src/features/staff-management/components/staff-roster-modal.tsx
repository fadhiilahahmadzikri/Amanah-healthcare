'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import type { StaffMember } from '../api/staff-management.api';
import { useStaffRosterModal } from '../model/useStaffRosterModal';

export interface StaffRosterModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StaffRosterModal(props: StaffRosterModalProps) {
  const { staff, isOpen, onClose } = props;
  const roster = useStaffRosterModal(props);

  if (!staff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl transition-all duration-200 font-sans',
          'max-w-[96vw] sm:max-w-6xl xl:max-w-7xl'
        )}
      >
        <DialogHeader className='p-6 pb-4 border-b border-border/60 bg-muted/20'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <DialogTitle className='text-xl font-bold tracking-tight text-foreground'>
                Pengaturan Jadwal Shift Kerja Staf
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground mt-1'>
                {staff.fullName} &bull; {staff.profession || 'Staf Operasional'}
              </DialogDescription>
            </div>

            <Badge
              variant={roster.isOverride ? 'default' : 'outline'}
              className='text-[11px] shrink-0'
            >
              {roster.isOverride ? 'Override Khusus' : 'Template Master Klinik'}
            </Badge>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {roster.loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
              {[
                'sk-rost-1',
                'sk-rost-2',
                'sk-rost-3',
                'sk-rost-4',
                'sk-rost-5',
                'sk-rost-6',
                'sk-rost-7'
              ].map((skKey) => (
                <div
                  key={skKey}
                  className='p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-3'
                >
                  <div className='flex items-center justify-between pb-2 border-b border-border/40'>
                    <Skeleton className='h-4 w-16 rounded-md' />
                    <Skeleton className='h-5 w-9 rounded-full' />
                  </div>
                  <div className='space-y-1.5'>
                    <Skeleton className='h-9 w-full rounded-lg' />
                    <Skeleton className='h-9 w-full rounded-lg' />
                    <Skeleton className='h-9 w-full rounded-lg' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
              {roster.days.map((day) => {
                const isStaffAssignedOnDay = roster.sessionDefs.some((s) =>
                  Boolean(roster.selectedAssignments[`${day.dow}_${s.id}`])
                );

                const hasDayDiffFromTemplate = roster.sessionDefs.some(
                  (s) =>
                    Boolean(roster.selectedAssignments[`${day.dow}_${s.id}`]) !==
                    Boolean(roster.templateAssignments[`${day.dow}_${s.id}`])
                );

                return (
                  <div
                    key={day.dow}
                    className={cn(
                      'p-3.5 rounded-xl border transition-colors flex flex-col justify-between min-w-0',
                      isStaffAssignedOnDay
                        ? 'bg-card border-border/80 shadow-2xs'
                        : !day.isActive
                          ? 'bg-muted/20 border-dashed border-border/40 opacity-75'
                          : 'bg-muted/30 border-border/60'
                    )}
                  >
                    <div className='flex items-center justify-between pb-2 mb-2.5 border-b border-border/40 gap-1.5'>
                      <div className='flex items-center gap-1.5 min-w-0'>
                        <span className='font-bold text-sm text-foreground whitespace-nowrap'>
                          {day.label}
                        </span>
                        {!day.isActive && (
                          <span className='text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0'>
                            Klinik Tutup
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        {hasDayDiffFromTemplate && (
                          <button
                            type='button'
                            onClick={() => roster.resetDayToTemplate(day.dow)}
                            title={`Sesuaikan jadwal hari ${day.label} ke template mingguan`}
                            className='size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer'
                          >
                            <Icons.refresh className='size-3' />
                          </button>
                        )}
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            isStaffAssignedOnDay ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {isStaffAssignedOnDay ? 'Aktif' : 'Libur'}
                        </span>
                        <Switch
                          checked={isStaffAssignedOnDay}
                          onCheckedChange={() => roster.toggleDay(day.dow)}
                          aria-label={`Aktifkan jadwal staf hari ${day.label}`}
                        />
                      </div>
                    </div>

                    <div className='space-y-1.5'>
                      {roster.sessionDefs.map((s) => {
                        const key = `${day.dow}_${s.id}`;
                        const isChecked = Boolean(roster.selectedAssignments[key]);

                        return (
                          <label
                            key={s.id}
                            htmlFor={`staff-session-${key}`}
                            className={cn(
                              'flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                              isChecked
                                ? 'bg-primary/5 border-primary/40 text-foreground font-semibold'
                                : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40'
                            )}
                          >
                            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                              <input
                                id={`staff-session-${key}`}
                                type='checkbox'
                                aria-label={`${day.label} ${s.label}`}
                                checked={isChecked}
                                onChange={() => roster.toggleSession(day.dow, s.id)}
                                className='size-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer shrink-0'
                              />
                              <div className='min-w-0 flex-1 flex flex-col'>
                                <span className='font-semibold text-xs whitespace-nowrap text-foreground'>
                                  {formatFriendlySessionName(s.label) || s.label}
                                </span>
                                {s.timeRange && (
                                  <span className='text-[10.5px] text-muted-foreground font-mono whitespace-nowrap'>
                                    {s.timeRange}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className='p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2'>
          <div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={roster.loading || roster.saving || !roster.isOverride}
              onClick={roster.openResetConfirm}
              title={
                roster.isOverride
                  ? 'Kembalikan seluruh jadwal staf ke template mingguan klinik'
                  : 'Jadwal staf sudah mengikuti template mingguan klinik'
              }
              className='text-xs font-semibold text-muted-foreground hover:text-foreground h-9 px-3 cursor-pointer'
            >
              <Icons.refresh className='size-3.5 mr-1.5' />
              Reset ke Template
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            <Button type='button' variant='outline' onClick={onClose} disabled={roster.saving}>
              Tutup
            </Button>
            <Button
              type='button'
              variant='default'
              disabled={roster.loading || roster.saving}
              onClick={roster.handleSave}
              className='font-bold min-w-[120px]'
            >
              {roster.saving ? (
                <>
                  <Icons.spinner className='size-4 animate-spin mr-2' />
                  Menyimpan...
                </>
              ) : (
                'Simpan Jadwal'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={roster.isResetConfirmOpen} onOpenChange={roster.closeResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Jadwal Shift ke Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh penyesuaian jadwal roster khusus untuk{' '}
              <span className='font-semibold text-foreground'>{staff.fullName}</span> akan dihapus
              dan dikembalikan mengikuti konfigurasi template master mingguan klinik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={roster.closeResetConfirm}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={roster.handleConfirmResetToTemplate}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Ya, Reset ke Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
