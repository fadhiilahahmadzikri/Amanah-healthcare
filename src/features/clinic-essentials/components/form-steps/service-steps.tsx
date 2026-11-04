'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { ServiceImagePicker } from '../atoms/service-image-picker';
import {
  AccordionSelectionField,
  type AccordionSelectionOption
} from '../atoms/accordion-selection-field';
import { cn } from '@/lib/utils';
import type { ClinicalIntakeForm, ServiceCategory } from '../../types/clinic-essentials.types';

export interface ServiceCategoryStepProps {
  categoryId: string;
  categoryIds?: string[];
  intakeFormId: string;
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  onCategoryIdChange: (val: string) => void;
  onCategoryIdsChange?: (val: string[]) => void;
  onIntakeFormIdChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function ServiceCategoryStep({
  categoryId,
  categoryIds = [],
  intakeFormId,
  categories,
  forms,
  onCategoryIdChange,
  onCategoryIdsChange,
  onIntakeFormIdChange,
  error,
  disabled
}: ServiceCategoryStepProps) {
  const currentCategoryIds = React.useMemo(() => {
    if (categoryIds.length > 0) return categoryIds;
    return categoryId ? [categoryId] : [];
  }, [categoryIds, categoryId]);

  const handleToggleCategory = (catId: string) => {
    const isIncluded = currentCategoryIds.includes(catId);
    const next = isIncluded
      ? currentCategoryIds.filter((id) => id !== catId)
      : [...currentCategoryIds, catId];

    onCategoryIdsChange?.(next);
    if (!next.includes(categoryId)) {
      onCategoryIdChange(next[0] || '');
    }
  };

  const categoryOptions = React.useMemo<AccordionSelectionOption[]>(() => {
    return categories.map((c) => {
      const unitLabel =
        c.unitName || c.unit?.name
          ? `Poli: ${c.unitName || c.unit?.name}`
          : 'Umum (Semua Poliklinik)';
      const subtitle = c.description ? `${unitLabel} • ${c.description}` : unitLabel;
      return {
        id: c.id,
        name: c.name,
        subtitle,
        iconName: c.iconName || 'folder'
      };
    });
  }, [categories]);

  const formOptions = React.useMemo<AccordionSelectionOption[]>(() => {
    const list: AccordionSelectionOption[] = [
      {
        id: 'none',
        name: 'Formulir Standar Klinik (Umum)',
        subtitle: 'Pengkajian umum tanpa formulir pertanyaan khusus',
        iconName: 'clipboard-list'
      }
    ];

    forms.forEach((f) => {
      list.push({
        id: f.id,
        name: f.name,
        subtitle: f.description || undefined,
        iconName: f.iconName || 'clipboard-list'
      });
    });

    return list;
  }, [forms]);

  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Di kelompok layanan mana service ini berada?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih satu atau lebih kelompok layanan. Layanan pada kelompok berstatus Umum otomatis
          dapat digunakan di semua poliklinik.
        </p>
      </div>

      <div className='space-y-4 pt-1'>
        <AccordionSelectionField
          label='Kelompok Layanan Medis (Bisa Lebih Dari 1)'
          placeholder='Pilih kelompok layanan...'
          actionText='Pilih / Ganti Kelompok'
          multiSelect={true}
          selectedIds={currentCategoryIds}
          selectedId={categoryId}
          options={categoryOptions}
          onSelect={onCategoryIdChange}
          onToggleSelect={handleToggleCategory}
          disabled={disabled || categories.length === 0}
          emptyMessage='Belum ada kelompok layanan. Silakan buat kelompok layanan terlebih dahulu.'
          required
        />

        <AccordionSelectionField
          label='Formulir Pengkajian Pasien'
          placeholder='Pilih formulir klinis (atau Standar)...'
          actionText='Ganti Formulir'
          selectedId={intakeFormId}
          options={formOptions}
          onSelect={onIntakeFormIdChange}
          disabled={disabled}
        />

        {error && (
          <p className='text-[11px] font-medium text-destructive mt-1 animate-in fade-in duration-200'>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export interface ServiceIdentityStepProps {
  name: string;
  code?: string;
  codePrefix?: string;
  iconName: string;
  imageUrl?: string | null;
  onNameChange: (val: string) => void;
  onCodeChange?: (val: string) => void;
  onCodePrefixChange?: (val: string) => void;
  onIconNameChange: (val: string) => void;
  onImageUrlChange?: (val: string | null) => void;
  error?: string;
  disabled?: boolean;
}

export function ServiceIdentityStep({
  name,
  iconName,
  imageUrl,
  onNameChange,
  onIconNameChange,
  onImageUrlChange,
  error,
  disabled
}: ServiceIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apa nama service medis yang disediakan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama service resmi, pilih ikon visual penanda, serta thumbnail visual gambar
          katalog yang mudah dikenali staf dan pasien.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='flex items-start gap-3'>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <Label htmlFor='service-name' className='text-xs font-semibold'>
              Nama Service Medis <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='service-name'
              placeholder='Contoh: Pembersihan Karang Gigi (Scaling)'
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
            <Label className='text-xs font-semibold'>Ikon</Label>
            <div className='h-10 flex items-center'>
              <ShiftIconPickerPopover
                value={iconName}
                onChange={onIconNameChange}
                fallback={name.charAt(0) || 'L'}
                disabled={disabled}
              />
            </div>
          </div>

          {onImageUrlChange && (
            <div className='space-y-1.5 shrink-0'>
              <Label className='text-xs font-semibold'>Visual Gambar</Label>
              <div className='h-10 flex items-center'>
                <ServiceImagePicker
                  value={imageUrl}
                  onChange={onImageUrlChange}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ServiceClinicalStepProps {
  complaintsRaw: string;
  description: string;
  onComplaintsRawChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  isActive?: boolean;
  onIsActiveChange?: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function ServiceClinicalStep({
  complaintsRaw,
  description,
  onComplaintsRawChange,
  onDescriptionChange,
  isActive = true,
  onIsActiveChange,
  isEditing = false,
  disabled = false
}: ServiceClinicalStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Keluhan pasien apa saja yang berkaitan dengan service ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Daftar keluhan ini membantu petugas pendaftaran mencarikan service yang tepat saat pasien
          datang berkonsultasi.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='service-complaints' className='text-xs font-semibold'>
            Daftar Keluhan Awal (Pisahkan dengan koma)
          </Label>
          <Input
            id='service-complaints'
            placeholder='Gigi ngilu, karang gigi, gusi berdarah'
            value={complaintsRaw}
            onChange={(e) => onComplaintsRawChange(e.target.value)}
            disabled={disabled}
            className='h-10 text-sm'
          />
          <p className='text-[11px] text-muted-foreground'>
            Kata kunci keluhan ini akan mempermudah pencarian layanan saat pendaftaran pasien.
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='service-desc' className='text-xs font-semibold'>
            Keterangan Service (Boleh Kosong)
          </Label>
          <Textarea
            id='service-desc'
            placeholder='Penjelasan singkat tentang prosedur service atau instruksi persiapan...'
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
              <Label htmlFor='service-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika service ini sedang tidak tersedia untuk pasien.
              </p>
            </div>
            <Switch
              id='service-active'
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
