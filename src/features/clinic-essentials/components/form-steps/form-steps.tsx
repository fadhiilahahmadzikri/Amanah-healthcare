'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';

export interface FormIdentityStepProps {
  name: string;
  code: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange: (val: string) => void;
  onIconNameChange: (val: string) => void;
  disabled?: boolean;
}

export function FormIdentityStep({
  name,
  code,
  iconName,
  onNameChange,
  onCodeChange,
  onIconNameChange,
  disabled
}: FormIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Nama dan Kode Formulir
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Daftarkan formulir pertanyaan awal untuk pasien sebelum konsultasi bersama dokter.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='form-name' className='text-xs font-semibold'>
            Nama Formulir <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='form-name'
            placeholder='Contoh: Formulir Pemeriksaan Ibu Hamil (ANC)'
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            className='h-10 text-sm'
            required
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='form-code' className='text-xs font-semibold'>
              Kode Singkat <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='form-code'
              placeholder='pregnancy_anc'
              value={code}
              onChange={(e) =>
                onCodeChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
              }
              disabled={disabled}
              className='h-10 text-sm font-mono'
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Ikon Formulir</Label>
            <div className='flex items-center gap-2 h-10'>
              <ShiftIconPickerPopover
                value={iconName || 'clipboard-list'}
                onChange={onIconNameChange}
                fallback='F'
                disabled={disabled}
              />
              <span className='text-xs text-muted-foreground truncate'>Pilih ikon atau emoji</span>
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
  disabled?: boolean;
}

export function FormDescriptionStep({
  description,
  onDescriptionChange,
  disabled
}: FormDescriptionStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Panduan Pengisian Formulir
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan petunjuk singkat agar perawat atau pasien memahami tujuan formulir ini.
        </p>
      </div>

      <div className='space-y-1.5 pt-1'>
        <Label htmlFor='form-desc' className='text-xs font-semibold'>
          Petunjuk Penggunaan (Boleh Kosong)
        </Label>
        <Textarea
          id='form-desc'
          placeholder='Contoh: Formulir ini diisi oleh ibu hamil untuk mencatat riwayat kehamilan dan keluhan terkini.'
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          className='text-sm resize-none'
        />
      </div>
    </div>
  );
}
