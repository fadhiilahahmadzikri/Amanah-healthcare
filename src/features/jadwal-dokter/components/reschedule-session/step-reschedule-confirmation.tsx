'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';

export interface StepRescheduleConfirmationProps {
  formattedDisplayDate: string;
  targetRoomName: string;
  targetStartTime: string;
  targetEndTime: string;
  targetEndTimeCalculated: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  hasActiveAppointments: boolean;
  rescheduleActiveAppointments: boolean;
  onRescheduleActiveAppointmentsChange: (val: boolean) => void;
  unscheduleSourceSlot: boolean;
  onUnscheduleSourceSlotChange: (val: boolean) => void;
  initialStartTime?: string;
  sessionStartTime?: string;
  isError: boolean;
  errorMessage?: string;
}

export function StepRescheduleConfirmation({
  formattedDisplayDate,
  targetRoomName,
  targetStartTime,
  targetEndTime,
  targetEndTimeCalculated,
  notes,
  onNotesChange,
  hasActiveAppointments,
  rescheduleActiveAppointments,
  onRescheduleActiveAppointmentsChange,
  unscheduleSourceSlot,
  onUnscheduleSourceSlotChange,
  initialStartTime,
  sessionStartTime,
  isError,
  errorMessage
}: StepRescheduleConfirmationProps) {
  return (
    <div className='space-y-3.5'>
      <div className='p-3 rounded-xl bg-muted/20 border border-border/50 text-xs space-y-2'>
        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div>
            <span className='text-[11px] text-muted-foreground block'>Tanggal Baru</span>
            <span className='font-semibold text-foreground truncate block'>
              {formattedDisplayDate}
            </span>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground block'>Ruangan Baru</span>
            <span className='font-semibold text-foreground truncate block'>{targetRoomName}</span>
          </div>
        </div>

        <div className='pt-1.5 border-t border-border/30 flex items-center justify-between text-xs'>
          <span className='text-muted-foreground'>Jam Praktik Baru</span>
          <span className='font-mono font-bold text-primary'>
            {targetStartTime} - {targetEndTime || targetEndTimeCalculated || '--:--'}
          </span>
        </div>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='reschedule-notes' className='text-xs font-semibold text-foreground'>
          Catatan Pemindahan <span className='text-muted-foreground font-normal'>(Opsional)</span>
        </Label>
        <Textarea
          id='reschedule-notes'
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder='Contoh: Penyesuaian shift operasional dokter'
          rows={2}
          className='text-xs min-h-[64px]'
        />
      </div>

      {hasActiveAppointments && (
        <div className='flex items-start gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/20'>
          <Checkbox
            id='reschedule-active'
            checked={rescheduleActiveAppointments}
            onCheckedChange={(checked) => onRescheduleActiveAppointmentsChange(Boolean(checked))}
            className='mt-0.5'
          />
          <div className='space-y-0.5'>
            <Label
              htmlFor='reschedule-active'
              className='text-xs font-bold text-foreground cursor-pointer'
            >
              Alihkan antrean pasien terdaftar secara otomatis
            </Label>
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              Seluruh janji temu pasien yang sudah booking pada jam ini akan otomatis dialihkan ke
              jadwal baru.
            </p>
          </div>
        </div>
      )}

      <div className='flex items-start gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/20'>
        <Checkbox
          id='unschedule-source-slot'
          checked={unscheduleSourceSlot}
          onCheckedChange={(checked) => onUnscheduleSourceSlotChange(Boolean(checked))}
          className='mt-0.5'
        />
        <div className='space-y-0.5'>
          <Label
            htmlFor='unschedule-source-slot'
            className='text-xs font-bold text-foreground cursor-pointer'
          >
            Ubah slot asal ({initialStartTime || sessionStartTime || 'jam asal'}) menjadi Belum
            Terjadwal
          </Label>
          <p className='text-[11px] text-muted-foreground leading-relaxed'>
            Tutup slot waktu asal agar tidak dapat dipesan lagi. Jika tidak dicentang, slot waktu
            asal akan tetap tersedia (Available) untuk pasien lain.
          </p>
        </div>
      </div>

      {isError && (
        <div className='p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1'>
          <div className='flex items-center gap-1.5 font-bold'>
            <Icons.warning className='size-3.5 shrink-0' />
            <span>Gagal Reschedule</span>
          </div>
          <p className='text-[11px]'>
            {errorMessage ||
              'Terjadi bentrok jadwal atau ruangan sudah terpakai pada jam tersebut.'}
          </p>
        </div>
      )}
    </div>
  );
}
