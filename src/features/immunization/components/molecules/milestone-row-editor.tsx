'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { cn } from '@/lib/utils';
import type {
  ImmunizationClinicalEntry,
  VaccineAdministrationStatus
} from '../../types/immunization.types';

export interface MilestoneRowEditorProps {
  entry: ImmunizationClinicalEntry;
  onChange: (updated: ImmunizationClinicalEntry) => void;
  disabled?: boolean;
  dateError?: string | null;
  rowErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

const STATUS_OPTIONS = [
  { label: 'Belum Diberikan', value: 'NOT_GIVEN' },
  { label: 'Sudah Diberikan', value: 'GIVEN' },
  { label: 'Ditunda', value: 'POSTPONED' },
  { label: 'Kontraindikasi', value: 'CONTRAINDICATED' }
];

const AGE_UNIT_OPTIONS = ['bln', 'thn', 'minggu', 'hari'];

function formatMetricValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'string' ? Number(val.replace(',', '.')) : Number(val);
  if (!Number.isFinite(num)) return String(val);
  return String(num);
}

function parseAgeDisplay(raw?: string | null): { val: string; unit: string } {
  if (!raw || !raw.trim()) return { val: '', unit: 'bln' };
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (match) {
    const val = match[1];
    let unit = match[2]?.trim().toLowerCase() || 'bln';
    if (!AGE_UNIT_OPTIONS.includes(unit)) {
      unit = 'bln';
    }
    return { val, unit };
  }
  return { val: '', unit: 'bln' };
}

export function MilestoneRowEditor({
  entry,
  onChange,
  disabled = false,
  dateError,
  rowErrors,
  onClearError
}: MilestoneRowEditorProps) {
  const { val: initialAgeVal, unit: initialAgeUnit } = React.useMemo(
    () => parseAgeDisplay(entry.ageDisplay),
    [entry.ageDisplay]
  );
  const [ageVal, setAgeVal] = React.useState(initialAgeVal);
  const [ageUnit, setAgeUnit] = React.useState(initialAgeUnit || 'bln');
  const [isAgeFocused, setIsAgeFocused] = React.useState(false);
  const [isUnitOpen, setIsUnitOpen] = React.useState(false);

  React.useEffect(() => {
    const parsed = parseAgeDisplay(entry.ageDisplay);
    setAgeVal(parsed.val);
    setAgeUnit(parsed.unit || 'bln');
  }, [entry.ageDisplay]);

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

  const updateCombinedAge = (nextVal: string, nextUnit: string) => {
    setAgeVal(nextVal);
    setAgeUnit(nextUnit);
    const combined = nextVal.trim() ? `${nextVal.trim()} ${nextUnit.trim()}`.trim() : '';
    handleFieldChange('ageDisplay', combined || null);
  };

  const isAgeFloating =
    isAgeFocused || Boolean(ageVal && String(ageVal).trim().length > 0) || isUnitOpen;

  return (
    <div className='w-full space-y-4 pt-1 font-sans'>
      {/* Baris 1: Tanggal Suntik (DD/MM/YYYY), Umur Saat Suntik (Single Grouped), dan Status Vaksin */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        <div>
          <CustomDatePicker
            id={`edit-injection-date-${entry.rowIndex}`}
            label='Tanggal Suntik'
            value={entry.injectionDate || ''}
            onChange={(val) => handleFieldChange('injectionDate', val || null)}
            placeholder='DD/MM/YYYY'
            disableFutureDates
            variant='underline'
            error={rowErrors?.injectionDate || dateError || undefined}
            invalid={Boolean(rowErrors?.injectionDate || dateError)}
            triggerClassName={disabled ? 'pointer-events-none opacity-60' : undefined}
          />
        </div>

        {/* Umur Saat Suntik - Satu Kesatuan & Satu Label */}
        <div className='relative pt-3'>
          <div
            className={cn(
              'relative flex items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200',
              rowErrors?.ageDisplay
                ? 'border-destructive'
                : isAgeFocused || isUnitOpen
                  ? 'border-primary'
                  : 'focus-within:border-primary',
              disabled && 'opacity-60 pointer-events-none'
            )}
          >
            <input
              id={`edit-age-val-${entry.rowIndex}`}
              type='number'
              step='0.1'
              placeholder={isAgeFloating ? 'cth: 1' : ''}
              value={ageVal}
              onChange={(e) => updateCombinedAge(e.target.value, ageUnit)}
              onFocus={() => setIsAgeFocused(true)}
              onBlur={() => {
                setIsAgeFocused(false);
                updateCombinedAge(ageVal, ageUnit);
              }}
              disabled={disabled}
              className='w-full min-w-0 border-0 bg-transparent px-0 py-1 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/50'
            />

            <label
              htmlFor={`edit-age-val-${entry.rowIndex}`}
              className={cn(
                'absolute left-0 pointer-events-none origin-left select-none transition-all duration-200 ease-out',
                isAgeFloating
                  ? '-top-3 text-[11px] font-semibold text-primary'
                  : 'top-1 text-sm font-normal text-muted-foreground/70',
                isAgeFloating && !isAgeFocused && !isUnitOpen && 'text-muted-foreground',
                rowErrors?.ageDisplay && 'text-destructive font-semibold'
              )}
            >
              Umur Saat Suntik
            </label>

            {/* Selector Satuan di dalam satu kesatuan baris */}
            <div className='shrink-0 ml-2'>
              <Popover open={isUnitOpen} onOpenChange={setIsUnitOpen}>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    disabled={disabled}
                    className='flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer select-none border border-border/40'
                    title='Pilih satuan umur'
                  >
                    <span>{ageUnit || 'bln'}</span>
                    <ChevronDown className='size-3 text-muted-foreground' />
                  </button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-36 p-1.5 text-xs'>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-semibold text-muted-foreground block px-1'>
                      Pilih Satuan
                    </span>
                    <div className='grid grid-cols-2 gap-1'>
                      {AGE_UNIT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type='button'
                          onClick={() => {
                            updateCombinedAge(ageVal, opt);
                            setIsUnitOpen(false);
                          }}
                          className={cn(
                            'px-2 py-1 rounded text-center transition-colors font-medium text-xs',
                            ageUnit === opt
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'hover:bg-muted text-foreground'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {rowErrors?.ageDisplay && (
            <span className='text-[10px] text-destructive block mt-1 leading-tight'>
              {rowErrors.ageDisplay}
            </span>
          )}
        </div>

        <div>
          <PatientLineSelect
            id={`edit-status-${entry.rowIndex}`}
            label='Status Pemberian Vaksin'
            value={entry.status}
            onChange={(val) => handleFieldChange('status', val as VaccineAdministrationStatus)}
            options={STATUS_OPTIONS}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Baris 2: Pemeriksaan Fisik Objektif (4 Kolom Standard Maternity) */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <PatientLineInput
          id={`edit-weight-${entry.rowIndex}`}
          label='Berat Badan'
          type='number'
          step='0.01'
          placeholder='4.2'
          value={formatMetricValue(entry.weightKg)}
          onChange={(val) => handleFieldChange('weightKg', val === '' ? null : Number(val))}
          error={rowErrors?.weightKg}
          invalid={Boolean(rowErrors?.weightKg)}
          disabled={disabled}
          trailingIcon={
            <span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>
              kg
            </span>
          }
        />

        <PatientLineInput
          id={`edit-height-${entry.rowIndex}`}
          label='Panjang / Tinggi'
          type='number'
          step='0.1'
          placeholder='53.5'
          value={formatMetricValue(entry.heightCm)}
          onChange={(val) => handleFieldChange('heightCm', val === '' ? null : Number(val))}
          error={rowErrors?.heightCm}
          invalid={Boolean(rowErrors?.heightCm)}
          disabled={disabled}
          trailingIcon={
            <span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>
              cm
            </span>
          }
        />

        <PatientLineInput
          id={`edit-head-${entry.rowIndex}`}
          label='Lingkar Kepala'
          type='number'
          step='0.1'
          placeholder='36.0'
          value={formatMetricValue(entry.headCircumferenceCm)}
          onChange={(val) =>
            handleFieldChange('headCircumferenceCm', val === '' ? null : Number(val))
          }
          error={rowErrors?.headCircumferenceCm}
          invalid={Boolean(rowErrors?.headCircumferenceCm)}
          disabled={disabled}
          trailingIcon={
            <span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>
              cm
            </span>
          }
        />

        <PatientLineInput
          id={`edit-temp-${entry.rowIndex}`}
          label='Suhu Tubuh'
          type='number'
          step='0.1'
          placeholder='36.6'
          value={formatMetricValue(entry.temperatureCelsius)}
          onChange={(val) =>
            handleFieldChange('temperatureCelsius', val === '' ? null : Number(val))
          }
          error={rowErrors?.temperatureCelsius}
          invalid={Boolean(rowErrors?.temperatureCelsius)}
          disabled={disabled}
          trailingIcon={
            <span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>
              °C
            </span>
          }
        />
      </div>

      {/* Baris 3 (Urutan bawah ke-2 paling akhir): Anamnesis Subjektif (Compact Checkboxes) */}
      <div className='flex items-center gap-6 pt-2 pb-1 border-y border-border/30'>
        <span className='text-xs font-semibold text-muted-foreground select-none'>
          Anamnesis Subjektif:
        </span>
        <label
          htmlFor={`edit-fever-${entry.rowIndex}`}
          className='flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none'
        >
          <Checkbox
            id={`edit-fever-${entry.rowIndex}`}
            checked={entry.fever === 'Ya'}
            onCheckedChange={(c) => handleFieldChange('fever', c ? 'Ya' : 'Tidak')}
            disabled={disabled}
          />
          <span>Demam</span>
        </label>
        <label
          htmlFor={`edit-cough-${entry.rowIndex}`}
          className='flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none'
        >
          <Checkbox
            id={`edit-cough-${entry.rowIndex}`}
            checked={entry.cough === 'Ya'}
            onCheckedChange={(c) => handleFieldChange('cough', c ? 'Ya' : 'Tidak')}
            disabled={disabled}
          />
          <span>Batuk</span>
        </label>
        <label
          htmlFor={`edit-runny-nose-${entry.rowIndex}`}
          className='flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none'
        >
          <Checkbox
            id={`edit-runny-nose-${entry.rowIndex}`}
            checked={entry.runnyNose === 'Ya'}
            onCheckedChange={(c) => handleFieldChange('runnyNose', c ? 'Ya' : 'Tidak')}
            disabled={disabled}
          />
          <span>Pilek</span>
        </label>
      </div>

      {/* Baris 4 (Paling akhir): Planning / Catatan Lanjutan */}
      <div>
        <PatientLineTextarea
          id={`edit-planning-${entry.rowIndex}`}
          label='Planning / Catatan Lanjutan'
          placeholder='cth: Kontrol vaksin BCG usia 1 bulan, edukasi kompres hangat jika demam ringan...'
          value={entry.planning || ''}
          onChange={(val) => handleFieldChange('planning', val || null)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
