import * as React from 'react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
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
import type {
  ImmunizationClinicalEntry,
  VaccineAdministrationStatus
} from '../../types/immunization.types';

export interface MilestoneRowEditorProps {
  entry: ImmunizationClinicalEntry;
  onChange: (updated: ImmunizationClinicalEntry) => void;
  disabled?: boolean;
  dateError?: string | null;
}

export function MilestoneRowEditor({
  entry,
  onChange,
  disabled = false,
  dateError
}: MilestoneRowEditorProps) {
  const handleFieldChange = <K extends keyof ImmunizationClinicalEntry>(
    field: K,
    value: ImmunizationClinicalEntry[K]
  ) => {
    let nextStatus = entry.status;
    if (field === 'injectionDate' && value && entry.status === 'NOT_GIVEN') {
      nextStatus = 'GIVEN';
    }
    onChange({
      ...entry,
      [field]: value,
      status: field === 'status' ? (value as VaccineAdministrationStatus) : nextStatus
    });
  };

  return (
    <div className='rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-xs'>
      <div className='flex items-center justify-between border-b border-border/50 pb-3'>
        <div className='flex items-center gap-2'>
          <span className='flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
            {entry.rowIndex + 1}
          </span>
          <h4 className='font-semibold text-sm text-foreground'>{entry.vaccineName}</h4>
        </div>

        <div className='w-44'>
          <Select
            disabled={disabled}
            value={entry.status}
            onValueChange={(val) =>
              handleFieldChange('status', val as VaccineAdministrationStatus)
            }
          >
            <SelectTrigger className='h-8 text-xs font-medium'>
              <SelectValue placeholder='Pilih status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='NOT_GIVEN'>Belum Diberikan</SelectItem>
              <SelectItem value='GIVEN'>Sudah Diberikan</SelectItem>
              <SelectItem value='POSTPONED'>Ditunda</SelectItem>
              <SelectItem value='CONTRAINDICATED'>Kontraindikasi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 1: Tanggal Suntik & Umur */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-1.5'>
          <Label className='text-xs font-medium text-muted-foreground'>Tanggal Suntik</Label>
          <CustomDatePicker
            value={entry.injectionDate || ''}
            onChange={(val) => handleFieldChange('injectionDate', val || null)}
            placeholder='Pilih tanggal suntik'
            disableFutureDates
            triggerClassName={disabled ? 'pointer-events-none opacity-50' : undefined}
            error={dateError || undefined}
            invalid={Boolean(dateError)}
          />
        </div>

        <div className='space-y-1.5'>
          <Label className='text-xs font-medium text-muted-foreground'>Umur Saat Suntik</Label>
          <Input
            value={entry.ageDisplay || ''}
            onChange={(e) => handleFieldChange('ageDisplay', e.target.value)}
            placeholder='cth: 1 bln / 2 bln'
            disabled={disabled}
            className='h-9 text-xs'
          />
        </div>
      </div>

      {/* Row 2: Subjektif (Demam, Batuk, Pilek) */}
      <div className='rounded-lg bg-muted/40 p-3 space-y-2 border border-border/40'>
        <span className='text-xs font-semibold text-foreground block'>
          Anamnesis Subjektif
        </span>
        <div className='grid grid-cols-3 gap-3'>
          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Demam</Label>
            <Select
              disabled={disabled}
              value={entry.fever || 'Tidak'}
              onValueChange={(val) => handleFieldChange('fever', val as 'Ya' | 'Tidak')}
            >
              <SelectTrigger className='h-7 text-xs bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Tidak'>Tidak</SelectItem>
                <SelectItem value='Ya'>Ya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Batuk</Label>
            <Select
              disabled={disabled}
              value={entry.cough || 'Tidak'}
              onValueChange={(val) => handleFieldChange('cough', val as 'Ya' | 'Tidak')}
            >
              <SelectTrigger className='h-7 text-xs bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Tidak'>Tidak</SelectItem>
                <SelectItem value='Ya'>Ya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Pilek</Label>
            <Select
              disabled={disabled}
              value={entry.runnyNose || 'Tidak'}
              onValueChange={(val) => handleFieldChange('runnyNose', val as 'Ya' | 'Tidak')}
            >
              <SelectTrigger className='h-7 text-xs bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Tidak'>Tidak</SelectItem>
                <SelectItem value='Ya'>Ya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Row 3: Pengukuran Objektif (BB, PB, LK, Suhu) */}
      <div className='rounded-lg bg-muted/40 p-3 space-y-2 border border-border/40'>
        <span className='text-xs font-semibold text-foreground block'>
          Pemeriksaan Fisik Objektif
        </span>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Berat Badan (kg)</Label>
            <Input
              type='number'
              step='0.01'
              value={entry.weightKg ?? ''}
              onChange={(e) =>
                handleFieldChange(
                  'weightKg',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              placeholder='cth: 4.2'
              disabled={disabled}
              className='h-8 text-xs bg-background'
            />
          </div>

          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Panjang Badan (cm)</Label>
            <Input
              type='number'
              step='0.1'
              value={entry.heightCm ?? ''}
              onChange={(e) =>
                handleFieldChange(
                  'heightCm',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              placeholder='cth: 53.5'
              disabled={disabled}
              className='h-8 text-xs bg-background'
            />
          </div>

          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Lingkar Kepala (cm)</Label>
            <Input
              type='number'
              step='0.1'
              value={entry.headCircumferenceCm ?? ''}
              onChange={(e) =>
                handleFieldChange(
                  'headCircumferenceCm',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              placeholder='cth: 36.0'
              disabled={disabled}
              className='h-8 text-xs bg-background'
            />
          </div>

          <div className='space-y-1'>
            <Label className='text-[11px] text-muted-foreground'>Suhu Tubuh (°C)</Label>
            <Input
              type='number'
              step='0.1'
              value={entry.temperatureCelsius ?? ''}
              onChange={(e) =>
                handleFieldChange(
                  'temperatureCelsius',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              placeholder='cth: 36.6'
              disabled={disabled}
              className='h-8 text-xs bg-background'
            />
          </div>
        </div>
      </div>

      {/* Row 4: Planning */}
      <div className='space-y-1.5'>
        <Label className='text-xs font-medium text-muted-foreground'>
          Planning / Jadwal Imunisasi Lanjutan
        </Label>
        <Textarea
          value={entry.planning || ''}
          onChange={(e) => handleFieldChange('planning', e.target.value)}
          placeholder='cth: Kontrol vaksin BCG usia 1 bulan, edukasi kompres hangat jika demam ringan'
          disabled={disabled}
          className='min-h-[50px] text-xs resize-none'
        />
      </div>
    </div>
  );
}
