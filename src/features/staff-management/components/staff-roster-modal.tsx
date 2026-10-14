'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import { StaffMember, staffManagementApi } from '../api/staff-management.api';

export interface StaffRosterModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StaffRosterModal({ staff, isOpen, onClose, onSuccess }: StaffRosterModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOverride, setIsOverride] = useState(false);
  const [days, setDays] = useState<Array<{ dow: number; label: string; isActive: boolean }>>([]);
  const [sessionDefs, setSessionDefs] = useState<
    Array<{ id: string; code: string; label: string; timeRange?: string; isActive: boolean }>
  >([]);
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, boolean>>({});
  const [templateAssignments, setTemplateAssignments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !staff) return;
    let cancelled = false;

    setLoading(true);

    Promise.all([
      staffManagementApi.getScheduleSessions(),
      staffManagementApi.getStaffRoster(staff.id)
    ])
      .then(([config, currentRosters]) => {
        if (cancelled) return;

        const activeSessions = (config.sessionDefs || []).filter((s) => s.isActive);
        setSessionDefs(activeSessions);

        const configDays =
          config.days && config.days.length > 0
            ? config.days
            : [
                { dow: 1, label: 'Senin', isActive: true },
                { dow: 2, label: 'Selasa', isActive: true },
                { dow: 3, label: 'Rabu', isActive: true },
                { dow: 4, label: 'Kamis', isActive: true },
                { dow: 5, label: 'Jumat', isActive: true },
                { dow: 6, label: 'Sabtu', isActive: true },
                { dow: 0, label: 'Minggu', isActive: false }
              ];
        setDays(configDays);

        // Compute template assignments from weeklyTemplates
        const tplMap: Record<string, boolean> = {};
        if (config.weeklyTemplates) {
          for (const t of config.weeklyTemplates) {
            if (t.isActive) {
              tplMap[`${t.dow}_${t.sessionId}`] = true;
            }
          }
        }
        setTemplateAssignments(tplMap);

        const hasOverride = currentRosters.some((r) => r.isOverride === true);
        setIsOverride(hasOverride);

        const currentMap: Record<string, boolean> = {};
        for (const r of currentRosters) {
          if (r.isActive !== false) {
            currentMap[`${r.dow}_${r.sessionId}`] = true;
          }
        }
        setSelectedAssignments(currentMap);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'Gagal memuat konfigurasi jadwal shift staf.';
          toast.error(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, staff]);

  const toggleSession = useCallback((dow: number, sessionId: string) => {
    const key = `${dow}_${sessionId}`;
    setSelectedAssignments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const toggleDay = useCallback(
    (dow: number) => {
      const isCurrentlyActiveOnDay = sessionDefs.some((s) =>
        Boolean(selectedAssignments[`${dow}_${s.id}`])
      );

      setSelectedAssignments((prev) => {
        const next = { ...prev };
        for (const s of sessionDefs) {
          const key = `${dow}_${s.id}`;
          next[key] = !isCurrentlyActiveOnDay;
        }
        return next;
      });
    },
    [sessionDefs, selectedAssignments]
  );

  const resetDayToTemplate = useCallback(
    (dow: number) => {
      setSelectedAssignments((prev) => {
        const next = { ...prev };
        for (const s of sessionDefs) {
          const key = `${dow}_${s.id}`;
          next[key] = Boolean(templateAssignments[key]);
        }
        return next;
      });
      const dayObj = days.find((d) => d.dow === dow);
      toast.info(`Jadwal hari ${dayObj?.label || dow} disesuaikan ke template mingguan klinik`);
    },
    [days, sessionDefs, templateAssignments]
  );

  const handleResetToTemplate = async () => {
    if (!staff) return;
    if (
      !confirm(
        `Reset jadwal shift roster ${staff.fullName} ke template mingguan klinik? Seluruh override khusus akan dihapus.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await staffManagementApi.resetStaffRoster(staff.id);
      setIsOverride(false);
      setSelectedAssignments({ ...templateAssignments });
      toast.success(
        `Roster ${staff.fullName} berhasil dikembalikan ke template master mingguan klinik.`
      );
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mereset roster staf.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!staff) return;

    try {
      setSaving(true);
      const activeRosters: Array<{ sessionId: string; dow: number }> = [];

      for (const day of days) {
        for (const s of sessionDefs) {
          const key = `${day.dow}_${s.id}`;
          if (selectedAssignments[key]) {
            activeRosters.push({
              dow: day.dow,
              sessionId: s.id
            });
          }
        }
      }

      await staffManagementApi.updateStaffRoster(staff.id, {
        rosters: activeRosters
      });

      setIsOverride(true);
      toast.success(`Jadwal shift roster untuk ${staff.fullName} berhasil disimpan!`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan roster staf.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

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

            <Badge variant={isOverride ? 'default' : 'outline'} className='text-[11px] shrink-0'>
              {isOverride ? 'Override Khusus' : 'Template Master Klinik'}
            </Badge>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
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
              {days.map((day) => {
                const isStaffAssignedOnDay = sessionDefs.some((s) =>
                  Boolean(selectedAssignments[`${day.dow}_${s.id}`])
                );

                const hasDayDiffFromTemplate = sessionDefs.some(
                  (s) =>
                    Boolean(selectedAssignments[`${day.dow}_${s.id}`]) !==
                    Boolean(templateAssignments[`${day.dow}_${s.id}`])
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
                            onClick={() => resetDayToTemplate(day.dow)}
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
                          onCheckedChange={() => toggleDay(day.dow)}
                          aria-label={`Aktifkan jadwal staf hari ${day.label}`}
                        />
                      </div>
                    </div>

                    <div className='space-y-1.5'>
                      {sessionDefs.map((s) => {
                        const key = `${day.dow}_${s.id}`;
                        const isChecked = Boolean(selectedAssignments[key]);

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
                                onChange={() => toggleSession(day.dow, s.id)}
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
              disabled={loading || saving || !isOverride}
              onClick={handleResetToTemplate}
              title={
                isOverride
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
            <Button type='button' variant='outline' onClick={onClose} disabled={saving}>
              Tutup
            </Button>
            <Button
              type='button'
              variant='default'
              disabled={loading || saving}
              onClick={handleSave}
              className='font-bold min-w-[120px]'
            >
              {saving ? (
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
    </Dialog>
  );
}
