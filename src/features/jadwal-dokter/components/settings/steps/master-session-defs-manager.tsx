'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import {
  getSessionDefImpact,
  type DeleteSessionDefOptions,
  type SessionDefConfig,
  type SessionDefImpactResult
} from '../../../api/admin-schedule-configuration.api';
import {
  calculateShiftDurationHours,
  getAdjacentShiftGapMinutes,
  formatTimeToHHmm,
  sortSessionsChronologically,
  parseTimeToMinutes,
  parseTimeEndToMinutes
} from '../../../utils/shift-time-validator';
import { ShiftTimeSelect } from '../atoms/shift-time-select';
import { ShiftIconDisplay } from '../atoms/shift-icon-display';
import { SessionDefFormDialog } from '../modals/session-def-form-dialog';
import { ShiftDeletionImpactDialog } from '../modals/shift-deletion-impact-dialog';
import { cn } from '@/lib/utils';

export interface MasterSessionDefsManagerProps {
  sessionDefs: SessionDefConfig[];
  conflictingDefIds?: string[];
  onToggleActive: (id: string) => void;
  onUpdateTime?: (
    id: string,
    field: 'defaultStartsAt' | 'defaultEndsAt',
    value: string,
    shouldAutoAdjust?: boolean
  ) => void;
  onAddSessionDef?: (payload: {
    label: string;
    codePrefix?: string;
    icon?: string;
    defaultStartsAt: string;
    defaultEndsAt: string;
  }) => Promise<void>;
  onEditSessionDef?: (
    id: string,
    payload: {
      label?: string;
      codePrefix?: string;
      icon?: string;
      defaultStartsAt?: string;
      defaultEndsAt?: string;
    }
  ) => Promise<void>;
  onDeleteSessionDef?: (id: string, options?: DeleteSessionDefOptions) => Promise<void>;
  isAddDialogOpen?: boolean;
  onOpenAddDialog?: () => void;
  onCloseAddDialog?: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  showSubheader?: boolean;
}

export function MasterSessionDefsManager({
  sessionDefs,
  conflictingDefIds = [],
  onToggleActive,
  onUpdateTime,
  onAddSessionDef,
  onEditSessionDef,
  onDeleteSessionDef,
  isAddDialogOpen,
  onOpenAddDialog,
  onCloseAddDialog,
  portalContainerRef,
  className,
  showSubheader: _showSubheader = true
}: MasterSessionDefsManagerProps) {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [editingDef, setEditingDef] = useState<SessionDefConfig | null>(null);
  const [defToDelete, setDefToDelete] = useState<SessionDefConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [impactShift, setImpactShift] = useState<SessionDefConfig | null>(null);
  const [impactData, setImpactData] = useState<SessionDefImpactResult | null>(null);
  const [loadingImpactId, setLoadingImpactId] = useState<string | null>(null);
  const [isCascadeDeleting, setIsCascadeDeleting] = useState(false);
  const [pendingAdjustment, setPendingAdjustment] = useState<{
    id: string;
    field: 'defaultStartsAt' | 'defaultEndsAt';
    value: string;
    currentShiftLabel: string;
    adjacentShiftLabel: string;
  } | null>(null);

  const handleTimeChange = (
    id: string,
    field: 'defaultStartsAt' | 'defaultEndsAt',
    value: string
  ) => {
    if (!onUpdateTime) return;

    // Check if this time change causes a collision with adjacent active shift
    const sorted = sortSessionsChronologically(sessionDefs);
    const targetIndex = sorted.findIndex((d) => d.id === id);
    const currentShift = sorted[targetIndex];

    if (targetIndex !== -1 && currentShift) {
      if (field === 'defaultEndsAt') {
        const endMin = parseTimeEndToMinutes(value);
        const nextActive = sorted.slice(targetIndex + 1).find((d) => d.isActive);
        if (nextActive) {
          const nextStartMin = parseTimeToMinutes(nextActive.defaultStartsAt);
          if (endMin > nextStartMin) {
            // Collision detected with next shift! Open AlertDialog on-demand
            setPendingAdjustment({
              id,
              field,
              value,
              currentShiftLabel: currentShift.label,
              adjacentShiftLabel: nextActive.label
            });
            return;
          }
        }
      } else if (field === 'defaultStartsAt') {
        const startMin = parseTimeToMinutes(value);
        const prevActive = sorted
          .slice(0, targetIndex)
          .toReversed()
          .find((d) => d.isActive);
        if (prevActive) {
          const prevEndMin = parseTimeEndToMinutes(prevActive.defaultEndsAt);
          if (startMin < prevEndMin) {
            // Collision detected with previous shift! Open AlertDialog on-demand
            setPendingAdjustment({
              id,
              field,
              value,
              currentShiftLabel: currentShift.label,
              adjacentShiftLabel: prevActive.label
            });
            return;
          }
        }
      }
    }

    // No collision: update normally without any popup
    onUpdateTime(id, field, value, false);
  };

  const isFormOpen =
    isAddDialogOpen !== undefined ? isAddDialogOpen || Boolean(editingDef) : internalDialogOpen;

  const handleOpenAdd = () => {
    setEditingDef(null);
    if (onOpenAddDialog) {
      onOpenAddDialog();
    } else {
      setInternalDialogOpen(true);
    }
  };

  const handleOpenEdit = (def: SessionDefConfig) => {
    setEditingDef(def);
    if (!onOpenAddDialog) {
      setInternalDialogOpen(true);
    }
  };

  const handleCloseForm = () => {
    setEditingDef(null);
    if (onCloseAddDialog) {
      onCloseAddDialog();
    }
    setInternalDialogOpen(false);
  };

  const handleFormSubmit = async (formData: {
    label: string;
    codePrefix?: string;
    icon?: string;
    defaultStartsAt: string;
    defaultEndsAt: string;
  }) => {
    if (editingDef && onEditSessionDef) {
      await onEditSessionDef(editingDef.id, formData);
    } else if (onAddSessionDef) {
      await onAddSessionDef(formData);
    }
  };

  const handleInitiateDelete = async (def: SessionDefConfig) => {
    try {
      setLoadingImpactId(def.id);
      const impact = await getSessionDefImpact(def.id);
      if (impact.affectedDoctorsCount > 0) {
        setImpactShift(def);
        setImpactData(impact);
      } else {
        setDefToDelete(def);
      }
    } catch {
      // Jika terjadi gangguan jaringan saat cek impact, fallback ke konfirmasi biasa
      setDefToDelete(def);
    } finally {
      setLoadingImpactId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!defToDelete || !onDeleteSessionDef) return;
    try {
      setIsDeleting(true);
      await onDeleteSessionDef(defToDelete.id);
      setDefToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmCascadeDelete = async (confirmText: string) => {
    if (!impactShift || !onDeleteSessionDef) return;
    try {
      setIsCascadeDeleting(true);
      await onDeleteSessionDef(impactShift.id, {
        cascade: true,
        confirmText
      });
      setImpactShift(null);
      setImpactData(null);
    } finally {
      setIsCascadeDeleting(false);
    }
  };

  const handleSoftDeactivate = async (shiftId: string) => {
    onToggleActive(shiftId);
    setImpactShift(null);
    setImpactData(null);
  };

  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      {/* Empty State using existing EmptyState with 3D EmptyBoxAnimation */}
      {sessionDefs.length === 0 && (
        <EmptyState
          icon={Icons.clock}
          title='Belum Ada Shift Operasional'
          description='Klinik belum memiliki master shift yang terdaftar. Gunakan tombol tambah di atas untuk membuat shift baru.'
          action={
            onAddSessionDef ? (
              <Button
                type='button'
                size='sm'
                onClick={handleOpenAdd}
                className='h-8 text-xs gap-1.5 cursor-pointer'
              >
                <Icons.add className='size-3.5' />
                Tambah Shift Pertama
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Grid of Dynamic Shift Cards */}
      {sessionDefs.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {sessionDefs.map((def) => {
            const startsAt = formatTimeToHHmm(def.defaultStartsAt, '00:00');
            const endsAt = formatTimeToHHmm(def.defaultEndsAt, '24:00');
            const isConflicted = conflictingDefIds.includes(def.id);
            const durationHours = calculateShiftDurationHours(startsAt, endsAt);
            const gapInfo = getAdjacentShiftGapMinutes(def, sessionDefs);
            const displayLabel = def.label;

            return (
              <div
                key={def.id}
                className={cn(
                  'flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-150',
                  isConflicted
                    ? 'border-destructive/80 bg-destructive/5 shadow-xs'
                    : def.isActive
                      ? 'border-border/90 bg-card shadow-xs'
                      : 'border-border/40 bg-muted/15 opacity-75'
                )}
              >
                <div className='flex items-center justify-between pb-2 gap-2'>
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <ShiftIconDisplay
                      icon={def.icon}
                      fallback={def.codePrefix}
                      size='md'
                      className={cn(
                        isConflicted &&
                          'bg-destructive/15 text-destructive border border-destructive/30',
                        !def.isActive && 'bg-muted text-muted-foreground opacity-60'
                      )}
                    />
                    <div className='flex flex-col min-w-0'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-semibold text-sm text-foreground whitespace-nowrap truncate'>
                          {displayLabel}
                        </span>
                        {isConflicted && (
                          <span className='inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/25'>
                            <Icons.warning className='size-2.5 shrink-0' />
                            Tabrakan
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <span>{durationHours} Jam</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Morevert Context Menu + Switch */}
                  <div className='flex items-center gap-1.5 shrink-0 ml-2'>
                    {(onEditSessionDef || onDeleteSessionDef) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer rounded-lg'
                            aria-label={`Menu Opsi Shift ${displayLabel}`}
                          >
                            <Icons.ellipsis className='size-3.5' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-36 font-sans'>
                          {onEditSessionDef && (
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(def)}
                              className='text-xs cursor-pointer gap-2'
                            >
                              <Icons.edit className='size-3.5 text-muted-foreground' />
                              <span>Edit Shift</span>
                            </DropdownMenuItem>
                          )}
                          {onDeleteSessionDef && (
                            <DropdownMenuItem
                              onClick={() => handleInitiateDelete(def)}
                              disabled={loadingImpactId === def.id}
                              className='text-xs cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10'
                            >
                              {loadingImpactId === def.id ? (
                                <Icons.spinner className='size-3.5 animate-spin' />
                              ) : (
                                <Icons.trash className='size-3.5' />
                              )}
                              <span>Hapus Shift</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Switch
                      checked={def.isActive}
                      onCheckedChange={() => onToggleActive(def.id)}
                      aria-label={`Aktifkan shift ${displayLabel}`}
                    />
                  </div>
                </div>

                {def.isActive && onUpdateTime && (
                  <div className='mt-2 pt-2 border-t border-border/40 flex flex-col gap-2'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <div className='flex flex-col gap-1'>
                        <span className='text-[10px] font-medium text-muted-foreground'>
                          Jam Mulai
                        </span>
                        <ShiftTimeSelect
                          value={startsAt}
                          onChange={(val) =>
                            handleTimeChange(def.id, 'defaultStartsAt', `${val}:00`)
                          }
                          portalContainerRef={portalContainerRef}
                          className='h-8 text-xs'
                          ariaLabel={`Jam mulai shift ${displayLabel}`}
                        />
                      </div>

                      <div className='flex flex-col gap-1'>
                        <span className='text-[10px] font-medium text-muted-foreground'>
                          Jam Selesai
                        </span>
                        <ShiftTimeSelect
                          value={endsAt}
                          onChange={(val) => handleTimeChange(def.id, 'defaultEndsAt', `${val}:00`)}
                          portalContainerRef={portalContainerRef}
                          className='h-8 text-xs'
                          ariaLabel={`Jam selesai shift ${displayLabel}`}
                        />
                      </div>
                    </div>

                    {/* Indikator jeda operasional sah ke shift berikutnya */}
                    {gapInfo && (
                      <div className='flex items-center gap-1.5 px-2 py-1 rounded bg-muted/40 border border-border/40 text-[11px] text-muted-foreground'>
                        <Icons.clock className='size-3 text-muted-foreground/70 shrink-0' />
                        <span>
                          Jeda operasional klinik:{' '}
                          {gapInfo.gapMinutes >= 60
                            ? `${(gapInfo.gapMinutes / 60).toFixed(1)} Jam`
                            : `${gapInfo.gapMinutes} Menit`}{' '}
                          sebelum {gapInfo.nextDefLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* On-Demand Family-Friendly Auto-Adjustment Alert Dialog */}
      <AlertDialog
        open={Boolean(pendingAdjustment)}
        onOpenChange={(open) => !open && setPendingAdjustment(null)}
      >
        <AlertDialogContent className='rounded-2xl max-w-sm sm:max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-base font-bold'>
              Sesuaikan Jam Shift Otomatis?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-xs leading-relaxed'>
              Perubahan jam pada shift{' '}
              <strong className='text-foreground'>{pendingAdjustment?.currentShiftLabel}</strong>{' '}
              bertabrakan dengan shift{' '}
              <strong className='text-foreground'>{pendingAdjustment?.adjacentShiftLabel}</strong>.
              <br />
              <br />
              Apakah Anda ingin menyesuaikan batas jam shift{' '}
              <strong className='text-foreground'>
                {pendingAdjustment?.adjacentShiftLabel}
              </strong>{' '}
              secara otomatis agar tidak tumpang tindih?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0 pt-2'>
            <AlertDialogCancel
              onClick={() => {
                if (pendingAdjustment && onUpdateTime) {
                  onUpdateTime(
                    pendingAdjustment.id,
                    pendingAdjustment.field,
                    pendingAdjustment.value,
                    false
                  );
                }
                setPendingAdjustment(null);
              }}
              className='cursor-pointer text-xs h-8'
            >
              Tidak, Biarkan Saja
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAdjustment && onUpdateTime) {
                  onUpdateTime(
                    pendingAdjustment.id,
                    pendingAdjustment.field,
                    pendingAdjustment.value,
                    true
                  );
                }
                setPendingAdjustment(null);
              }}
              className='cursor-pointer text-xs font-semibold h-8'
            >
              Ya, Sesuaikan Otomatis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Radix Alert Dialog for Delete Confirmation (Clean shift, 0 doctors) */}
      <AlertDialog
        open={Boolean(defToDelete)}
        onOpenChange={(open) => !open && setDefToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Shift Operasional?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus shift &quot;{defToDelete?.label}&quot;? Shift ini
              akan dihapus dari template mingguan dan jadwal klinik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer'
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Shift'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* GitHub-Style High-Impact Deletion Dialog (Shift in use by doctors) */}
      <ShiftDeletionImpactDialog
        isOpen={Boolean(impactShift && impactData)}
        onClose={() => {
          setImpactShift(null);
          setImpactData(null);
        }}
        shift={impactShift}
        impact={impactData}
        isDeleting={isCascadeDeleting}
        onConfirmCascadeDelete={handleConfirmCascadeDelete}
        onSoftDeactivate={handleSoftDeactivate}
        portalContainerRef={portalContainerRef}
      />

      {/* Dialog Form for Create / Edit */}
      <SessionDefFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialData={editingDef}
        existingDefs={sessionDefs}
        onSubmit={handleFormSubmit}
        portalContainerRef={portalContainerRef}
      />
    </div>
  );
}
