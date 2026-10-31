'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import type { FacilityUnit } from '../../types/clinic-essentials.types';

export interface CategoryIdentityStepProps {
  name: string;
  code: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange: (val: string) => void;
  onIconNameChange: (val: string) => void;
  disabled?: boolean;
}

export function CategoryIdentityStep({
  name,
  code,
  iconName,
  onNameChange,
  onCodeChange,
  onIconNameChange,
  disabled
}: CategoryIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Nama dan Ikon Kategori
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Kategori membantu mengelompokkan berbagai tindakan medis agar mudah dicari pasien.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='category-name' className='text-xs font-semibold'>
            Nama Kategori <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='category-name'
            placeholder='Contoh: Layanan Gigi & Mulut'
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            className='h-10 text-sm'
            required
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='category-code' className='text-xs font-semibold'>
              Kode Kategori <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='category-code'
              placeholder='dental_care'
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
            <Label className='text-xs font-semibold'>Ikon Kategori</Label>
            <div className='flex items-center gap-2 h-10'>
              <ShiftIconPickerPopover
                value={iconName || 'folder'}
                onChange={onIconNameChange}
                fallback='K'
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

export interface CategoryAffiliationStepProps {
  unitId: string;
  codePrefix: string;
  units: FacilityUnit[];
  onUnitIdChange: (val: string) => void;
  onCodePrefixChange: (val: string) => void;
  disabled?: boolean;
}

export function CategoryAffiliationStep({
  unitId,
  codePrefix,
  units,
  onUnitIdChange,
  onCodePrefixChange,
  disabled
}: CategoryAffiliationStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Unit Poliklinik & Awalan Kode
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih poliklinik tempat kategori ini digunakan, atau buat umum untuk semua unit.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='category-unit' className='text-xs font-semibold'>
            Poliklinik Terkait
          </Label>
          <Select value={unitId} onValueChange={onUnitIdChange} disabled={disabled}>
            <SelectTrigger id='category-unit' className='h-10 text-sm'>
              <SelectValue placeholder='Pilih unit (opsional)' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none' className='text-xs font-medium text-primary'>
                Umum (Bisa dipakai di semua unit)
              </SelectItem>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id} className='text-xs'>
                  {u.name} ({u.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='category-prefix' className='text-xs font-semibold'>
            Awalan Kode Tindakan (Opsional)
          </Label>
          <Input
            id='category-prefix'
            placeholder='Contoh: GIGI, POLI, LAB'
            maxLength={8}
            value={codePrefix}
            onChange={(e) => onCodePrefixChange(e.target.value.toUpperCase())}
            disabled={disabled}
            className='h-10 text-sm font-mono'
          />
          <p className='text-[11px] text-muted-foreground'>
            Kode singkat ini memudahkan penomoran layanan di bawah kategori ini.
          </p>
        </div>
      </div>
    </div>
  );
}

export interface CategoryDescriptionStepProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  disabled?: boolean;
}

export function CategoryDescriptionStep({
  description,
  onDescriptionChange,
  disabled
}: CategoryDescriptionStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Keterangan Kategori
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan penjelasan singkat mengenai jenis tindakan atau layanan dalam kategori ini.
        </p>
      </div>

      <div className='space-y-1.5 pt-1'>
        <Label htmlFor='category-desc' className='text-xs font-semibold'>
          Keterangan (Boleh Kosong)
        </Label>
        <Textarea
          id='category-desc'
          placeholder='Contoh: Melayani pemeriksaan gigi rutin, pembersihan karang gigi, penambalan, dan pencabutan.'
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
