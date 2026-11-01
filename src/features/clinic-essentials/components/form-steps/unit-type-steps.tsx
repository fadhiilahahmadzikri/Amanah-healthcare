'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { cn } from '@/lib/utils';

export interface UnitTypeIdentityStepProps {
  name: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onIconNameChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UnitTypeIdentityStep({
  name,
  iconName,
  onNameChange,
  onIconNameChange,
  error,
  disabled = false
}: UnitTypeIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apa nama klasifikasi fasilitas yang ingin didaftarkan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama kategori kelompok fasilitas (misal: Poliklinik Rawat Jalan, Ruang Rawat
          Inap, Laboratorium & Diagnostik).
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='flex items-start gap-3'>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <Label htmlFor='unit-type-name' className='text-xs font-semibold'>
              Nama Klasifikasi <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='unit-type-name'
              placeholder='Contoh: Poliklinik Rawat Jalan'
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={disabled}
              className={cn(
                'h-10 text-sm transition-colors',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              required
            />
            {error && (
              <p className='text-[11px] font-medium text-destructive mt-1 animate-in fade-in duration-200'>
                {error}
              </p>
            )}
          </div>

          <div className='space-y-1.5 shrink-0'>
            <Label className='text-xs font-semibold'>Visual</Label>
            <div className='h-10 flex items-center'>
              <ShiftIconPickerPopover
                value={iconName}
                onChange={onIconNameChange}
                fallback={name.charAt(0) || 'K'}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface UnitTypeDetailsStepProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  isActive: boolean;
  onIsActiveChange: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function UnitTypeDetailsStep({
  description,
  onDescriptionChange,
  isActive,
  onIsActiveChange,
  isEditing = false,
  disabled = false
}: UnitTypeDetailsStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Keterangan dan status operasional
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Beri penjelasan singkat mengenai cakupan klasifikasi ini agar dokter dan manajemen mudah
          memahaminya.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='unit-type-desc' className='text-xs font-semibold'>
            Keterangan Tambahan (Boleh Kosong)
          </Label>
          <Textarea
            id='unit-type-desc'
            placeholder='Penjelasan singkat tentang peruntukan tipe unit fasilitas ini...'
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            className='text-sm resize-none'
          />
        </div>

        {isEditing && (
          <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-0.5'>
              <Label htmlFor='unit-type-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika klasifikasi ini sedang tidak digunakan untuk unit mana pun.
              </p>
            </div>
            <Switch
              id='unit-type-active'
              checked={isActive}
              onCheckedChange={onIsActiveChange}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
