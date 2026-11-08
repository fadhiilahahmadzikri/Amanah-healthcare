'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import type { SessionDefConfig } from '../../../api/admin-schedule-configuration.api';
import {
  parseTimeToMinutes,
  parseTimeEndToMinutes,
  minutesToTimeString,
  formatTimeToHHmm,
  getEffectiveTimeOptions
} from '../../../utils/shift-time-validator';
import { ShiftTimeSelect } from '../atoms/shift-time-select';
import { ShiftIconPickerPopover } from '../atoms/shift-icon-picker-popover';

export interface SessionDefFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SessionDefConfig | null;
  existingDefs?: SessionDefConfig[];
  onSubmit: (data: {
    label: string;
    codePrefix?: string;
    icon?: string;
    defaultStartsAt: string;
    defaultEndsAt: string;
  }) => Promise<void>;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

export function SessionDefFormDialog({
  isOpen,
  onClose,
  initialData,
  existingDefs,
  onSubmit,
  portalContainerRef
}: SessionDefFormDialogProps) {
  const [label, setLabel] = useState('');
  const [codePrefix, setCodePrefix] = useState('');
  const [isPrefixManual, setIsPrefixManual] = useState(false);
  const [icon, setIcon] = useState('');
  const [startsAt, setStartsAt] = useState('08:00');
  const [endsAt, setEndsAt] = useState('12:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '');
      setCodePrefix(initialData.codePrefix || '');
      setIsPrefixManual(true);
      setIcon(initialData.icon || '');
      setStartsAt(formatTimeToHHmm(initialData.defaultStartsAt, '08:00'));
      setEndsAt(formatTimeToHHmm(initialData.defaultEndsAt, '12:00'));
    } else {
      setLabel('');
      setCodePrefix('');
      setIsPrefixManual(false);
      setIcon('');

      if (existingDefs && existingDefs.length > 0) {
        const sorted = [...existingDefs].toSorted(
          (a, b) =>
            parseTimeEndToMinutes(b.defaultEndsAt, parseTimeToMinutes(b.defaultStartsAt)) -
            parseTimeEndToMinutes(a.defaultEndsAt, parseTimeToMinutes(a.defaultStartsAt))
        );
        const latestEndStr = formatTimeToHHmm(sorted[0].defaultEndsAt, '08:00');
        const startMin = parseTimeToMinutes(latestEndStr);
        const endMin = Math.min(1440, startMin + 120);

        setStartsAt(latestEndStr);
        setEndsAt(minutesToTimeString(endMin > startMin ? endMin : Math.min(1440, startMin + 30)));
      } else {
        setStartsAt('08:00');
        setEndsAt('12:00');
      }
    }
  }, [initialData, existingDefs, isOpen]);

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    if (!initialData && !isPrefixManual) {
      const suggested = newLabel.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
      setCodePrefix(suggested);
    }
  };

  const handleCodePrefixChange = (val: string) => {
    setIsPrefixManual(true);
    const cleaned = val.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
    setCodePrefix(cleaned);
  };

  const handleStartsAtChange = (newStart: string) => {
    setStartsAt(newStart);
    const newStartMin = parseTimeToMinutes(newStart);
    const currentEndMin = parseTimeEndToMinutes(endsAt, newStartMin);
    if (currentEndMin <= newStartMin) {
      const validOptions = getEffectiveTimeOptions(null, 30, newStart);
      if (validOptions.length > 0) {
        setEndsAt(validOptions[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = label.trim();
    if (!cleanLabel) {
      toast.error('Nama shift wajib diisi');
      return;
    }
    const cleanPrefix = codePrefix.trim().toUpperCase();
    if (!cleanPrefix) {
      toast.error('Kode prefix shift wajib diisi (1-4 karakter alfanumerik)');
      return;
    }
    if (!/^[A-Z0-9]{1,4}$/.test(cleanPrefix)) {
      toast.error('Kode prefix harus 1-4 karakter alfanumerik (contoh: PAGI, TST, S1)');
      return;
    }
    const startMin = parseTimeToMinutes(startsAt);
    const endMin = parseTimeEndToMinutes(endsAt, startMin);
    if (endMin <= startMin) {
      toast.error('Jam selesai harus lebih lambat dari jam mulai (maksimal 24:00)');
      return;
    }

    try {
      setIsSubmitting(true);
      const canonicalEndsAt = endMin === 1440 && endsAt === '00:00' ? '24:00' : endsAt;
      await onSubmit({
        label: cleanLabel,
        codePrefix: cleanPrefix,
        icon: icon ? icon.trim() : undefined,
        defaultStartsAt: `${startsAt}:00`,
        defaultEndsAt: `${canonicalEndsAt}:00`
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan shift';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[420px]'
      portalContainerRef={portalContainerRef}
      showCloseButton={false}
      className='h-auto rounded-2xl border border-border bg-card p-4.5 sm:p-5 shadow-2xl'
    >
      <div className='relative font-sans space-y-4 text-left'>
        {/* Header matching modal config signature */}
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {initialData ? 'Edit Shift Operasional' : 'Tambah Shift Baru'}
            </h3>
            <p className='text-xs text-muted-foreground leading-normal'>
              {initialData
                ? 'Perbarui konfigurasi jam dan label shift operasional.'
                : 'Definisikan master shift baru yang berlaku di klinik.'}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup dialog'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-3.5 pt-1'>
          <div className='flex items-center gap-2.5'>
            <div className='space-y-1.5 flex-1 min-w-0'>
              <Label htmlFor='shift-label' className='text-xs font-semibold text-foreground'>
                Nama Shift <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='shift-label'
                placeholder='Contoh: Sesi Pagi, Testing'
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className='h-9 text-xs rounded-lg border-border/80 bg-background'
              />
            </div>

            <div className='space-y-1.5 w-24 shrink-0'>
              <Label htmlFor='shift-code-prefix' className='text-xs font-semibold text-foreground'>
                Kode (Prefix) <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='shift-code-prefix'
                placeholder='PAGI'
                maxLength={4}
                value={codePrefix}
                onChange={(e) => handleCodePrefixChange(e.target.value)}
                className='h-9 text-xs font-mono font-bold uppercase rounded-lg border-border/80 bg-background text-center tracking-wider'
              />
            </div>

            <div className='space-y-1.5 shrink-0'>
              <Label className='text-xs font-semibold text-foreground'>Visual</Label>
              <ShiftIconPickerPopover
                value={icon}
                onChange={setIcon}
                fallback={codePrefix || label.charAt(0) || 'S'}
                portalContainerRef={portalContainerRef}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-foreground'>Jam Mulai</Label>
              <ShiftTimeSelect
                value={startsAt}
                onChange={handleStartsAtChange}
                portalContainerRef={portalContainerRef}
                ariaLabel='Pilih atau ketik jam mulai shift'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-foreground'>Jam Selesai</Label>
              <ShiftTimeSelect
                value={endsAt}
                onChange={setEndsAt}
                minTime={startsAt}
                portalContainerRef={portalContainerRef}
                ariaLabel='Pilih atau ketik jam selesai shift'
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-2 pt-3 mt-1 border-t border-border/70'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onClose}
              disabled={isSubmitting}
              className='text-xs h-8 px-3 font-semibold text-muted-foreground hover:text-foreground cursor-pointer'
            >
              Batal
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={isSubmitting}
              className='text-xs h-8 px-3.5 font-medium cursor-pointer'
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                  Menyimpan...
                </>
              ) : initialData ? (
                'Perbarui Shift'
              ) : (
                'Tambahkan Shift'
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}
