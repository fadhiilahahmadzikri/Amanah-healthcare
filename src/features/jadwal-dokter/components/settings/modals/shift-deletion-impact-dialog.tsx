'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import type {
  SessionDefConfig,
  SessionDefImpactResult
} from '../../../api/admin-schedule-configuration.api';
import { cn } from '@/lib/utils';

export interface ShiftDeletionImpactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: SessionDefConfig | null;
  impact: SessionDefImpactResult | null;
  isDeleting?: boolean;
  onConfirmCascadeDelete: (confirmText: string) => Promise<void>;
  onSoftDeactivate?: (shiftId: string) => Promise<void>;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ShiftDeletionImpactDialog({
  isOpen,
  onClose,
  shift,
  impact,
  isDeleting = false,
  onConfirmCascadeDelete,
  onSoftDeactivate,
  portalContainerRef
}: ShiftDeletionImpactDialogProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const accordionRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isOpen) {
      setConfirmInput('');
      setIsExpanded(false);
      isInitialMount.current = true;
    }
  }, [isOpen]);

  // GSAP animation for accordion container
  useEffect(() => {
    const el = accordionRef.current;
    if (!el) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isExpanded) {
        gsap.set(el, { height: 'auto', opacity: 1, display: 'block' });
      } else {
        gsap.set(el, { height: 0, opacity: 0, display: 'none' });
      }
      return;
    }

    gsap.killTweensOf(el);

    if (isExpanded) {
      el.style.display = 'block';
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.24,
          ease: 'power2.out',
          clearProps: 'height'
        }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          if (el) el.style.display = 'none';
        }
      });
    }
  }, [isExpanded]);

  if (!shift || !impact) return null;

  const targetLabel = (shift.label || shift.code).trim();
  const isMatched = confirmInput.trim().toLowerCase() === targetLabel.toLowerCase();

  const handleCascadeDelete = async () => {
    if (!isMatched || isDeleting) return;
    await onConfirmCascadeDelete(confirmInput.trim());
  };

  const handleDeactivate = async () => {
    if (!onSoftDeactivate || isDeactivating) return;
    try {
      setIsDeactivating(true);
      await onSoftDeactivate(shift.id);
      onClose();
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={isExpanded ? 'w-full sm:max-w-[620px]' : 'w-full sm:max-w-[460px]'}
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
      className='h-auto max-h-[85vh] overflow-y-auto rounded-2xl border border-destructive/30 bg-card p-4.5 sm:p-5 shadow-2xl transition-[max-width,width] duration-250 ease-out'
    >
      <div className='relative font-sans space-y-3.5 text-left'>
        {/* Header - Clean, compact, zero decorative icons */}
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Konfirmasi Penghapusan Shift Berdampak Tinggi
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Shift <span className='font-semibold text-foreground'>&quot;{targetLabel}&quot;</span>{' '}
              sedang aktif ditugaskan pada{' '}
              <span className='font-semibold text-destructive'>
                {impact.affectedDoctorsCount} staf
              </span>
              . Menghapus shift ini akan melepaskan seluruh jadwal kerja staf dan template mingguan
              terkait.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup dialog'
            className='text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer shrink-0 pt-0.5'
          >
            Tutup
          </button>
        </div>

        {/* Affected Staff Accordion Trigger & Compact Grid */}
        <div className='space-y-2'>
          <button
            type='button'
            onClick={() => setIsExpanded((prev) => !prev)}
            className='w-full flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-left select-none'
          >
            <div className='flex items-center gap-2 min-w-0'>
              <span className='font-semibold text-xs text-foreground'>
                Staf Terdampak ({impact.affectedDoctors.length})
              </span>
              <span className='text-[11px] text-muted-foreground'>
                &bull; {impact.totalAssignmentsCount} Penugasan Aktif
              </span>
            </div>
            <Icons.chevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200 shrink-0',
                isExpanded && 'rotate-180'
              )}
            />
          </button>

          <div ref={accordionRef} className='overflow-hidden'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 max-h-56 overflow-y-auto pr-0.5'>
              {impact.affectedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className='p-2.5 rounded-xl border border-border/70 bg-background/80 shadow-2xs flex flex-col gap-1.5'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <h5 className='font-semibold text-xs text-foreground truncate'>
                      {doc.displayName}
                    </h5>
                    {doc.specialty && (
                      <span className='text-[10px] px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground font-medium shrink-0 border border-border/50'>
                        {doc.specialty}
                      </span>
                    )}
                  </div>

                  {doc.activeDays && doc.activeDays.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {doc.activeDays.map((d) => (
                        <span
                          key={d.dow}
                          className='text-[10px] px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 text-muted-foreground font-mono'
                        >
                          {d.dayName}
                          {d.roomName ? ` • ${d.roomName}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GitHub-Style Type-to-Confirm Input */}
        <div className='space-y-1 pt-1'>
          <Label
            htmlFor='confirm-deletion-input'
            className='text-xs font-medium text-foreground block'
          >
            Untuk mengonfirmasi, ketik{' '}
            <span className='font-mono font-semibold text-destructive bg-destructive/10 px-1 py-0.5 rounded'>
              {targetLabel}
            </span>{' '}
            di bawah:
          </Label>
          <Input
            id='confirm-deletion-input'
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={targetLabel}
            autoComplete='off'
            spellCheck={false}
            className={cn(
              'h-9 text-xs font-mono rounded-lg transition-colors',
              isMatched
                ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-emerald-500/5'
                : 'border-border/80 bg-background'
            )}
          />
        </div>

        {/* Action Buttons - Clean, compact */}
        <div className='flex items-center justify-between gap-2 pt-2.5 border-t border-border/70'>
          {onSoftDeactivate ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleDeactivate}
              disabled={isDeleting || isDeactivating}
              className='text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer'
              title='Hanya nonaktifkan shift tanpa melepaskan penugasan staf'
            >
              {isDeactivating ? (
                <>
                  <Icons.spinner className='size-3 animate-spin mr-1.5' />
                  Menonaktifkan...
                </>
              ) : (
                'Nonaktifkan Saja'
              )}
            </Button>
          ) : (
            <div />
          )}

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onClose}
              disabled={isDeleting || isDeactivating}
              className='text-xs h-8 px-3 text-muted-foreground hover:text-foreground cursor-pointer'
            >
              Batal
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleCascadeDelete}
              disabled={!isMatched || isDeleting || isDeactivating}
              className='text-xs h-8 px-3.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer font-medium disabled:opacity-50'
            >
              {isDeleting ? (
                <>
                  <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                  Menghapus...
                </>
              ) : (
                'Hapus Shift & Lepas Penugasan'
              )}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
