'use client';

import * as React from 'react';
import { Folder } from 'lucide-react';
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
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import type { ClinicalIntakeForm, ServiceCategory } from '../../types/clinic-essentials.types';

export interface ServiceCategoryStepProps {
  categoryId: string;
  intakeFormId: string;
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  onCategoryIdChange: (val: string) => void;
  onIntakeFormIdChange: (val: string) => void;
  disabled?: boolean;
}

export function ServiceCategoryStep({
  categoryId,
  intakeFormId,
  categories,
  forms,
  onCategoryIdChange,
  onIntakeFormIdChange,
  disabled
}: ServiceCategoryStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Kategori Layanan & Formulir Pasien
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih kelompok layanan dan tentukan formulir pertanyaan awal untuk pasien jika ada.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='service-cat' className='text-xs font-semibold'>
            Kategori Layanan <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={categoryId}
            onValueChange={onCategoryIdChange}
            disabled={disabled || categories.length === 0}
          >
            <SelectTrigger id='service-cat' className='h-11 text-sm'>
              <SelectValue placeholder='Pilih kategori layanan' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <ShiftIconDisplay icon={c.iconName || 'folder'} size='sm' />
                    <span className='font-medium'>{c.name}</span>
                    <span className='font-mono text-muted-foreground text-[11px]'>({c.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className='text-xs text-destructive flex items-center gap-1.5 pt-1'>
              <Folder className='size-3.5' />
              Belum ada kategori. Silakan buat kategori layanan terlebih dahulu.
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='service-form' className='text-xs font-semibold'>
            Formulir Pertanyaan Awal Pasien (Boleh Kosong)
          </Label>
          <Select value={intakeFormId} onValueChange={onIntakeFormIdChange} disabled={disabled}>
            <SelectTrigger id='service-form' className='h-11 text-sm'>
              <SelectValue placeholder='Pilih formulir klinis' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none' className='text-xs font-medium text-muted-foreground'>
                Formulir Standar Klinik
              </SelectItem>
              {forms.map((f) => (
                <SelectItem key={f.id} value={f.id} className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <ShiftIconDisplay icon={f.iconName || 'clipboard-list'} size='sm' />
                    <span className='font-medium'>{f.name}</span>
                    <span className='font-mono text-primary text-[11px]'>({f.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-[11px] text-muted-foreground'>
            Formulir ini membantu dokter mengetahui kondisi awal pasien sebelum masuk ruang periksa.
          </p>
        </div>
      </div>
    </div>
  );
}

export interface ServiceIdentityStepProps {
  name: string;
  code: string;
  codePrefix: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange: (val: string) => void;
  onCodePrefixChange: (val: string) => void;
  onIconNameChange: (val: string) => void;
  disabled?: boolean;
}

export function ServiceIdentityStep({
  name,
  code,
  codePrefix,
  iconName,
  onNameChange,
  onCodeChange,
  onCodePrefixChange,
  onIconNameChange,
  disabled
}: ServiceIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Nama dan Kode Layanan Medis
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama tindakan medis yang mudah dikenali pasien pada jadwal reservasi.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='service-name' className='text-xs font-semibold'>
            Nama Tindakan / Layanan <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='service-name'
            placeholder='Contoh: Pembersihan Karang Gigi (Scaling)'
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            className='h-10 text-sm'
            required
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='service-code' className='text-xs font-semibold'>
              Kode Layanan <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='service-code'
              placeholder='scaling_gigi'
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
            <Label htmlFor='service-prefix' className='text-xs font-semibold'>
              Awalan Kode
            </Label>
            <Input
              id='service-prefix'
              placeholder='SCL'
              maxLength={8}
              value={codePrefix}
              onChange={(e) => onCodePrefixChange(e.target.value.toUpperCase())}
              disabled={disabled}
              className='h-10 text-sm font-mono'
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs font-semibold'>Ikon Layanan</Label>
          <div className='flex items-center gap-2 h-10'>
            <ShiftIconPickerPopover
              value={iconName || 'stethoscope'}
              onChange={onIconNameChange}
              fallback='L'
              disabled={disabled}
            />
            <span className='text-xs text-muted-foreground truncate'>
              Pilih ikon atau emoji untuk layanan
            </span>
          </div>
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
  disabled?: boolean;
}

export function ServiceClinicalStep({
  complaintsRaw,
  description,
  onComplaintsRawChange,
  onDescriptionChange,
  disabled
}: ServiceClinicalStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Keluhan Pasien Terkait & Keterangan
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan kata-kata keluhan yang biasa dikeluhkan pasien untuk mempermudah pencarian.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='service-complaints' className='text-xs font-semibold'>
            Keluhan Terkait (Pisahkan dengan Koma)
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
            Pasien yang mencari keluhan di atas akan diarahkan ke layanan medis ini.
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='service-desc' className='text-xs font-semibold'>
            Keterangan Tindakan (Boleh Kosong)
          </Label>
          <Textarea
            id='service-desc'
            placeholder='Penjelasan singkat tentang prosedur tindakan medis atau persiapan pasien.'
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            className='text-sm resize-none'
          />
        </div>
      </div>
    </div>
  );
}
