'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import type { SessionDefConfig } from '../../../api/admin-schedule-configuration.api';
import {
  parseTimeToMinutes,
  parseTimeEndToMinutes,
  minutesToTimeString
} from '../../../utils/shift-time-validator';

export interface SessionDefFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SessionDefConfig | null;
  existingDefs?: SessionDefConfig[];
  onSubmit: (data: {
    label: string;
    codePrefix?: string;
    defaultStartsAt: string;
    defaultEndsAt: string;
  }) => Promise<void>;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

const TIME_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  }),
  '24:00'
];

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
  const [startsAt, setStartsAt] = useState('08:00');
  const [endsAt, setEndsAt] = useState('12:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '');
      setCodePrefix(initialData.codePrefix || '');
      setStartsAt(initialData.defaultStartsAt?.slice(0, 5) || '08:00');
      setEndsAt(initialData.defaultEndsAt?.slice(0, 5) || '12:00');
    } else {
      setLabel('');
      setCodePrefix('');

      if (existingDefs && existingDefs.length > 0) {
        const sorted = [...existingDefs].sort(
          (a, b) => parseTimeEndToMinutes(b.defaultEndsAt) - parseTimeEndToMinutes(a.defaultEndsAt)
        );
        const latestEndStr = sorted[0].defaultEndsAt?.slice(0, 5) || '08:00';
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

  const handleStartsAtChange = (newStart: string) => {
    setStartsAt(newStart);
    const startMin = parseTimeToMinutes(newStart);
    const endMin = parseTimeEndToMinutes(endsAt, startMin);
    if (endMin <= startMin) {
      const nextEnd = Math.min(1440, startMin + 120);
      setEndsAt(minutesToTimeString(nextEnd > startMin ? nextEnd : Math.min(1440, startMin + 30)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = label.trim();
    if (!cleanLabel) {
      toast.error('Nama shift wajib diisi');
      return;
    }
    if (startsAt >= endsAt) {
      toast.error('Jam selesai harus lebih besar dari jam mulai');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        label: cleanLabel,
        codePrefix: codePrefix.trim().toUpperCase() || cleanLabel.charAt(0).toUpperCase(),
        defaultStartsAt: `${startsAt}:00`,
        defaultEndsAt: `${endsAt}:00`
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
          <div className='space-y-1.5'>
            <Label htmlFor='shift-label' className='text-xs font-semibold text-foreground'>
              Nama Shift <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='shift-label'
              placeholder='Contoh: Sesi Pagi, Layanan Senja'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className='h-9 text-xs rounded-lg border-border/80 bg-background'
              autoFocus
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='shift-prefix' className='text-xs font-semibold text-foreground'>
              Singkatan / Kode Huruf
            </Label>
            <Input
              id='shift-prefix'
              placeholder='Contoh: P, S, M, PB (Maks 3 huruf)'
              maxLength={3}
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
              className='h-9 text-xs font-mono uppercase rounded-lg border-border/80 bg-background'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-foreground'>Jam Mulai</Label>
              <Select value={startsAt} onValueChange={handleStartsAtChange}>
                <SelectTrigger className='h-9 text-xs font-mono rounded-lg border-border/80 bg-background'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-48'>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className='text-xs font-mono'>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-foreground'>Jam Selesai</Label>
              <Select value={endsAt} onValueChange={setEndsAt}>
                <SelectTrigger className='h-9 text-xs font-mono rounded-lg border-border/80 bg-background'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-48'>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className='text-xs font-mono'>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
