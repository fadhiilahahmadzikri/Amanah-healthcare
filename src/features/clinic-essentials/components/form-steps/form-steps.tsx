'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { cn } from '@/lib/utils';

export interface FormIdentityStepProps {
  name: string;
  code?: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange?: (val: string) => void;
  onIconNameChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function FormIdentityStep({
  name,
  iconName,
  onNameChange,
  onIconNameChange,
  error,
  disabled
}: FormIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Formulir pengkajian klinis apa yang ingin didaftarkan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Daftarkan lembar pengkajian klinis awal untuk pasien sebelum konsultasi bersama dokter.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='flex items-start gap-3'>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <Label htmlFor='form-name' className='text-xs font-semibold'>
              Nama Formulir Pengkajian <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='form-name'
              placeholder='Contoh: Formulir Pemeriksaan Ibu Hamil (ANC)'
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
                fallback={name.charAt(0) || 'F'}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface FormDescriptionStepProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  isActive?: boolean;
  onIsActiveChange?: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function FormDescriptionStep({
  description,
  onDescriptionChange,
  isActive = true,
  onIsActiveChange,
  isEditing = false,
  disabled = false
}: FormDescriptionStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Bagaimana panduan pengisian formulir ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan petunjuk singkat agar perawat atau dokter memahami tujuan pengumpulan data
          formulir ini.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='form-desc' className='text-xs font-semibold'>
            Petunjuk Penggunaan (Boleh Kosong)
          </Label>
          <Textarea
            id='form-desc'
            placeholder='Contoh: Formulir ini diisi saat anamnesis awal untuk mencatat riwayat kehamilan dan keluhan terkini.'
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            className='text-sm resize-none'
          />
        </div>

        {isEditing && onIsActiveChange && (
          <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-0.5'>
              <Label htmlFor='form-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika formulir ini sedang tidak digunakan untuk pengkajian pasien.
              </p>
            </div>
            <Switch
              id='form-active'
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
