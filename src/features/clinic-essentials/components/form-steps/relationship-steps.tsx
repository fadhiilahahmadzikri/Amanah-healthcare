'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import { cn } from '@/lib/utils';

export interface RelationshipIdentityStepProps {
  name: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onIconNameChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RelationshipIdentityStep({
  name,
  iconName,
  onNameChange,
  onIconNameChange,
  error,
  disabled = false
}: RelationshipIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apa nama relasi pasien yang ingin didaftarkan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama hubungan atau relasi pasien (misal: Pasangan, Anak Kandung, Orang Tua,
          Saudara).
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='flex items-start gap-3'>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <Label htmlFor='relationship-name' className='text-xs font-semibold'>
              Nama Relasi Pasien <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='relationship-name'
              placeholder='Contoh: Pasangan, Anak Kandung, Orang Tua'
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
                fallback={name.charAt(0) || 'U'}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface RelationshipDetailsStepProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  displayOrder: number;
  onDisplayOrderChange: (val: number) => void;
  isActive: boolean;
  onIsActiveChange: (val: boolean) => void;
  isSystem: boolean;
  onIsSystemChange: (val: boolean) => void;
  allowsMultiple: boolean;
  onAllowsMultipleChange: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function RelationshipDetailsStep({
  description,
  onDescriptionChange,
  displayOrder,
  onDisplayOrderChange,
  isActive,
  onIsActiveChange,
  isSystem,
  onIsSystemChange,
  allowsMultiple,
  onAllowsMultipleChange,
  isEditing = false,
  disabled = false
}: RelationshipDetailsStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Detail dan status relasi pasien
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan keterangan singkat, status akun utama/sistem, dan urutan kemunculan relasi saat
          pasien memilih anggota keluarga.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='relationship-desc' className='text-xs font-semibold'>
            Keterangan Tambahan (Boleh Kosong)
          </Label>
          <Textarea
            id='relationship-desc'
            placeholder='Penjelasan singkat tentang relasi keluarga ini...'
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            className='text-sm resize-none'
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='relationship-order' className='text-xs font-semibold'>
            Urutan Tampilan
          </Label>
          <Input
            id='relationship-order'
            type='number'
            min={0}
            value={displayOrder}
            onChange={(e) => onDisplayOrderChange(parseInt(e.target.value, 10) || 0)}
            disabled={disabled}
            className='h-10 text-sm max-w-[120px]'
          />
          <p className='text-[11px] text-muted-foreground'>
            Menentukan posisi kartu pada menu dan modal janji temu.
          </p>
        </div>

        <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
          <div className='space-y-0.5 pr-2'>
            <Label htmlFor='relationship-system' className='text-xs font-semibold cursor-pointer'>
              Relasi Akun Utama / Sistem (Default)
            </Label>
            <p className='text-[11px] text-muted-foreground'>
              Tandai relasi ini sebagai identitas pemilik akun utama pasien saat registrasi. Sistem
              akan mengalihkan status utama ke relasi ini secara otomatis.
            </p>
          </div>
          <Switch
            id='relationship-system'
            checked={isSystem}
            onCheckedChange={(checked) => {
              onIsSystemChange(checked);
              if (checked) {
                onAllowsMultipleChange(false);
              }
            }}
            disabled={disabled}
          />
        </div>

        <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
          <div className='space-y-0.5 pr-2'>
            <Label htmlFor='relationship-allows-multiple' className='text-xs font-semibold cursor-pointer'>
              Izinkan Banyak Profil (Multi-Profil)
            </Label>
            <p className='text-[11px] text-muted-foreground'>
              Aktifkan jika satu akun pasien boleh mendaftarkan lebih dari satu profil untuk relasi ini (misal: beberapa anak atau kerabat). Nonaktifkan untuk membatasi hanya 1 profil per akun (misal: diri sendiri).
            </p>
          </div>
          <Switch
            id='relationship-allows-multiple'
            checked={allowsMultiple}
            onCheckedChange={onAllowsMultipleChange}
            disabled={disabled || isSystem}
          />
        </div>

        {isEditing && (
          <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-0.5'>
              <Label htmlFor='relationship-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika relasi ini sedang tidak ingin ditampilkan ke pasien.
              </p>
            </div>
            <Switch
              id='relationship-active'
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
