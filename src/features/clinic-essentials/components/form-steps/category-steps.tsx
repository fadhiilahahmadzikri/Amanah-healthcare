'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import {
  AccordionSelectionField,
  type AccordionSelectionOption
} from '../atoms/accordion-selection-field';
import type { FacilityUnit } from '../../types/clinic-essentials.types';

export interface CategoryIdentityStepProps {
  name: string;
  code?: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange?: (val: string) => void;
  onIconNameChange: (val: string) => void;
  disabled?: boolean;
}

export function CategoryIdentityStep({
  name,
  iconName,
  onNameChange,
  onIconNameChange,
  disabled
}: CategoryIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Mau membuat kelompok layanan apa?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Kelompok layanan membantu mengelompokkan berbagai service medis agar rapi dan mudah dicari
          oleh dokter maupun staf.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='flex items-center gap-3'>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <Label htmlFor='category-name' className='text-xs font-semibold'>
              Nama Kelompok Layanan <span className='text-destructive'>*</span>
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

export interface CategoryAffiliationStepProps {
  unitId: string;
  codePrefix?: string;
  units: FacilityUnit[];
  onUnitIdChange: (val: string) => void;
  onCodePrefixChange?: (val: string) => void;
  disabled?: boolean;
}

export function CategoryAffiliationStep({
  unitId,
  units,
  onUnitIdChange,
  disabled
}: CategoryAffiliationStepProps) {
  const affiliationOptions = React.useMemo<AccordionSelectionOption[]>(() => {
    const list: AccordionSelectionOption[] = [
      {
        id: 'none',
        name: 'Umum (Bisa Digunakan di Semua Poliklinik)',
        subtitle: 'Layanan terbuka dan tidak dibatasi pada poliklinik tertentu',
        iconName: 'folder'
      }
    ];

    units.forEach((u) => {
      list.push({
        id: u.id,
        name: u.name,
        subtitle: u.location ? `Lokasi: ${u.location}` : undefined,
        iconName: u.iconName || 'building-2'
      });
    });

    return list;
  }, [units]);

  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Kelompok layanan ini mau dipakai di poliklinik mana?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih poliklinik tertentu jika layanan ini spesifik, atau buat Umum agar dapat dipilih di
          seluruh bagian klinik.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <AccordionSelectionField
          label='Poliklinik Terkait'
          placeholder='Pilih poliklinik penempatan...'
          actionText='Ganti Penempatan'
          selectedId={unitId}
          options={affiliationOptions}
          onSelect={onUnitIdChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export interface CategoryDescriptionStepProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  isActive?: boolean;
  onIsActiveChange?: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function CategoryDescriptionStep({
  description,
  onDescriptionChange,
  isActive = true,
  onIsActiveChange,
  isEditing = false,
  disabled = false
}: CategoryDescriptionStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Ada catatan atau penjelasan mengenai kelompok layanan ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan deskripsi ringkas mengenai cakupan pelayanan kelompok ini (boleh dikosongkan).
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='category-desc' className='text-xs font-semibold'>
            Keterangan Kelompok (Boleh Kosong)
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

        {isEditing && onIsActiveChange && (
          <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-0.5'>
              <Label htmlFor='category-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika kelompok layanan ini sedang tidak tersedia untuk pasien.
              </p>
            </div>
            <Switch
              id='category-active'
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
