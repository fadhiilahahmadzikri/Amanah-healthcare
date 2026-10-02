import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';

import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { cn } from '@/lib/utils';

import type { MedicalFormField } from '../../constants/medical-appointment-schemas';
import {
  getMedicalFieldValidationSchema,
  normalizeMedicalFieldInput
} from '../../schemas/medical-appointment-validation';

export const SPECIFIC_FIELD_PLACEHOLDERS: Record<string, string> = {
  motherName: 'Masukkan nama lengkap...',
  motherNik: '16 digit NIK sesuai KTP / KK',
  motherBirthDate: 'Pilih tanggal lahir...',
  motherAge: 'Contoh: 31 tahun',
  marriageOrder: 'Contoh: 1',
  marriageDate: 'Pilih tanggal menikah...',
  motherJob: 'Contoh: Karyawan swasta, Wiraswasta',
  motherEducation: 'Pilih pendidikan terakhir...',
  religion: 'Pilih agama...',
  phoneNumber: 'Contoh: 081234567890',
  domicileAddress: 'Tuliskan alamat domisili saat ini...',
  identityCardAddress: 'Tuliskan alamat sesuai KTP...',
  dasawisma: 'Nama kelompok Dasawisma...',
  posyandu: 'Nama Posyandu...',
  puskesmas: 'Nama Puskesmas...',
  partnerName: 'Masukkan nama lengkap suami/pasangan...',
  partnerNik: '16 digit NIK sesuai KTP / KK',
  partnerBirthDate: 'Pilih tanggal lahir suami/pasangan...',
  partnerAge: 'Contoh: 31 tahun',
  partnerJob: 'Contoh: Karyawan swasta, Wiraswasta',
  partnerEducation: 'Pilih pendidikan terakhir suami/pasangan...',
  heightCm: 'Contoh: 156 cm',
  prePregnancyWeightKg: 'Contoh: 52 kg',
  upperArmCircumferenceCm: 'Contoh: 23.5 cm',
  initialBmi: 'Contoh: 21.5',
  tetanusStatus: 'Pilih status imunisasi TT/Td...',
  motherBloodType: 'Pilih golongan darah...',
  partnerBloodType: 'Pilih golongan darah suami...',
  hpht: 'Pilih tanggal HPHT...',
  estimatedDueDate: 'Otomatis terhitung setelah HPHT dipilih',
  gestationalAge: 'Otomatis terhitung setelah HPHT dipilih',
  currentComplaints: 'Contoh: Mual, pusing, atau Tidak ada',
  contraception1Type: 'Pilih jenis KB...',
  contraception1StartDate: 'Pilih tanggal mulai...',
  contraception1StopDate: 'Pilih tanggal berhenti...',
  pregnancy1Outcome: 'Pilih hasil kehamilan...',
  pregnancy1BirthYear: 'Contoh: 2020',
  otherDiseaseHistoryNotes: 'Tuliskan riwayat penyakit lainnya...',
  childName: 'Masukkan nama lengkap anak...',
  childNik: '16 digit NIK sesuai KK / KIA',
  childBirthDate: 'Pilih tanggal lahir anak...',
  childSex: 'Pilih jenis kelamin anak...',
  parentPhone: 'Contoh: 081234567890',
  fatherName: 'Masukkan nama lengkap ayah...',
  childAddress: 'Tuliskan alamat domisili anak saat ini...',
  previousVaccineHistory: 'Contoh: HB 0, BCG, Polio 1 (sesuai buku KIA)',
  childAllergyHistory: 'Tuliskan jika ada alergi, atau Tidak ada',
  gravidaCount: 'Contoh: 1',
  parityCount: 'Contoh: 0',
  abortionCount: 'Contoh: 0',
  livingChildrenCount: 'Contoh: 1'
};

export function getFieldPlaceholder(schemaField: MedicalFormField): string {
  if (schemaField.placeholder) {
    return schemaField.placeholder;
  }
  if (SPECIFIC_FIELD_PLACEHOLDERS[schemaField.id]) {
    return SPECIFIC_FIELD_PLACEHOLDERS[schemaField.id];
  }

  const id = schemaField.id.toLowerCase();
  if (id.includes('count') || id.includes('jumlah')) {
    return 'Contoh: 1';
  }
  if (id.includes('name') || id.includes('nama')) {
    return 'Masukkan nama lengkap...';
  }
  if (id.includes('phone') || id.includes('telepon') || id.includes('hp') || id.includes('wa')) {
    return 'Contoh: 081234567890';
  }
  if (id.includes('job') || id.includes('pekerjaan')) {
    return 'Contoh: Karyawan swasta, Wiraswasta';
  }
  if (id.includes('address') || id.includes('alamat') || id.includes('domisili')) {
    return 'Tuliskan alamat lengkap...';
  }
  if (id.includes('nik')) {
    return '16 digit NIK sesuai KTP / KK';
  }
  if (id.includes('age') || id.includes('umur') || id.includes('usia')) {
    return 'Contoh: 31 tahun';
  }
  if (id.includes('weight') || id.includes('berat')) {
    return 'Contoh: 50 kg';
  }
  if (id.includes('height') || id.includes('tinggi')) {
    return 'Contoh: 155 cm';
  }
  if (schemaField.type === 'DATE') {
    return 'Pilih tanggal...';
  }
  if (schemaField.type === 'LIST') {
    return 'Pilih opsi...';
  }
  if (schemaField.type === 'PARAGRAPH') {
    return 'Tuliskan keterangan jika ada...';
  }

  return 'Contoh: 1';
}

export function MedicalSchemaField({
  fieldApi,
  schemaField
}: {
  fieldApi: AnyFieldApi;
  schemaField: MedicalFormField;
}) {
  const rawError = getErrorMessage(fieldApi.state.meta.errors);
  const isInvalid = fieldApi.state.meta.isTouched && Boolean(rawError);
  const displayError = isInvalid && rawError && rawError !== 'Wajib diisi' ? rawError : undefined;
  const value = String(fieldApi.state.value ?? '');

  const isColSpanFull =
    schemaField.colSpan === 'full' ||
    schemaField.colSpan === 2 ||
    schemaField.type === 'PARAGRAPH' ||
    schemaField.type === 'DATE';
  const colSpanClass = isColSpanFull ? 'col-span-1 sm:col-span-2' : 'col-span-1';

  const requiredAsterisk = schemaField.required ? (
    <span className='ml-1 font-bold text-red-500 dark:text-red-400' aria-hidden='true'>
      *
    </span>
  ) : null;

  if (schemaField.type === 'MULTIPLE_CHOICE' || schemaField.choices.length === 2) {
    const isSmoked = schemaField.id === 'smokedBeforePregnancy';
    const isTwoChoices = schemaField.choices.length === 2;

    return (
      <FieldSet data-invalid={isInvalid} className={cn('gap-3', colSpanClass)}>
        <FieldLegend variant='label' className='mb-1.5 text-sm leading-snug font-medium'>
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        </FieldLegend>
        {schemaField.helpText ? (
          <FieldDescription className='text-xs text-muted-foreground'>
            {schemaField.helpText}
          </FieldDescription>
        ) : null}
        <ToggleGroup
          type='single'
          value={value}
          onValueChange={(nextValue: string) => {
            if (!nextValue) {
              return;
            }

            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
          className={cn('mt-1 w-fit gap-2.5', isTwoChoices ? 'grid grid-cols-2' : 'flex flex-wrap')}
        >
          {schemaField.choices.map((choice) => (
            <ToggleGroupItem
              key={choice}
              value={choice}
              aria-invalid={isInvalid}
              className={cn(
                'h-auto min-h-10 cursor-pointer justify-center whitespace-normal rounded-md border border-border px-4 py-2 text-center text-xs leading-snug font-medium transition-all first:rounded-md last:rounded-md data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:font-semibold data-[state=on]:text-primary',
                isTwoChoices ? 'w-full min-w-[130px] sm:min-w-[140px]' : 'w-fit',
                isSmoked && 'justify-center text-center font-medium'
              )}
            >
              {choice}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldError errors={displayError ? [displayError] : []} />
      </FieldSet>
    );
  }

  if (schemaField.type === 'LIST') {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <div className={cn('relative pt-2', colSpanClass)}>
        <label
          htmlFor={schemaField.id}
          className={cn(
            'block text-[11px] font-semibold transition-colors duration-200 select-none',
            value ? 'text-primary' : 'text-muted-foreground/80',
            isInvalid && '!text-destructive'
          )}
        >
          {schemaField.title}
          {requiredAsterisk}
        </label>
        <Select
          value={value}
          disabled={schemaField.disabled}
          onValueChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
        >
          <SelectTrigger
            id={schemaField.id}
            aria-invalid={isInvalid}
            className={cn(
              'w-full cursor-pointer rounded-none border-0 border-b-[1.5px] border-border bg-transparent px-0 py-1.5 text-sm font-medium shadow-none transition-colors duration-200 focus:border-primary focus:ring-0 focus-visible:ring-0 select-none',
              isInvalid && '!border-destructive'
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {schemaField.choices.map((choice) => (
                <SelectItem key={choice} value={choice} className='cursor-pointer'>
                  {choice}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {displayError ? (
          <p className='pt-0.5 text-[11px] font-normal text-destructive'>{displayError}</p>
        ) : null}
      </div>
    );
  }

  if (schemaField.type === 'PARAGRAPH') {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <div className={cn('relative pt-2', colSpanClass)}>
        <label
          htmlFor={schemaField.id}
          className={cn(
            'block text-[11px] font-semibold transition-colors duration-200 select-none',
            value ? 'text-primary' : 'text-muted-foreground/80',
            isInvalid && '!text-destructive'
          )}
        >
          {schemaField.title}
          {requiredAsterisk}
        </label>
        <div
          className={cn(
            'border-b-[1.5px] border-border transition-colors duration-200 focus-within:border-primary',
            isInvalid && '!border-destructive'
          )}
        >
          <Textarea
            id={schemaField.id}
            value={value}
            placeholder={placeholder}
            disabled={schemaField.disabled}
            onBlur={fieldApi.handleBlur}
            onChange={(event) => fieldApi.handleChange(event.target.value)}
            aria-invalid={isInvalid}
            rows={2}
            className='w-full resize-none rounded-none border-0 bg-transparent px-0 py-1 text-sm font-medium shadow-none outline-none focus-visible:ring-0'
          />
        </div>
        {displayError ? (
          <p className='pt-0.5 text-[11px] font-normal text-destructive'>{displayError}</p>
        ) : null}
      </div>
    );
  }

  if (schemaField.type === 'DATE') {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <div className={cn('relative pt-2', colSpanClass)}>
        <PatientBirthdatePicker
          id={schemaField.id}
          value={value}
          onChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
          variant='underline'
          label={schemaField.title + (schemaField.required ? ' *' : '')}
          labelClassName='text-[11px] font-semibold text-primary'
          placeholder={placeholder}
          ariaLabel={schemaField.title}
          error={displayError}
          invalid={isInvalid}
          className='w-full space-y-1'
        />
      </div>
    );
  }

  if (
    schemaField.id === 'initialBmi' ||
    schemaField.id === 'motherAge' ||
    schemaField.id === 'partnerAge' ||
    schemaField.id === 'estimatedDueDate' ||
    schemaField.id === 'gestationalAge'
  ) {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <PatientLineInput
        id={schemaField.id}
        label={schemaField.title + (schemaField.required ? ' *' : '')}
        value={value}
        onChange={(nextVal) =>
          fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, nextVal))
        }
        onBlur={fieldApi.handleBlur}
        error={displayError}
        invalid={isInvalid}
        placeholder={placeholder}
        disabled={true}
        readOnly={true}
        containerClassName={colSpanClass}
        trailingIcon={
          value ? (
            <span className='rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary select-none'>
              Otomatis
            </span>
          ) : null
        }
      />
    );
  }

  const placeholder = getFieldPlaceholder(schemaField);
  const isNik = schemaField.id.toLowerCase().includes('nik');
  const isPhone =
    schemaField.id.toLowerCase().includes('phone') ||
    schemaField.id.toLowerCase().includes('telepon');
  const isCount =
    schemaField.id.toLowerCase().includes('count') ||
    schemaField.id.toLowerCase().includes('order') ||
    schemaField.id === 'marriageOrder';
  const isYear = schemaField.id.endsWith('Year');

  const inputMode = isNik || isCount || isYear ? 'numeric' : isPhone ? 'tel' : undefined;
  const maxLength = isNik ? 16 : isPhone ? 15 : isYear ? 4 : isCount ? 2 : undefined;

  return (
    <PatientLineInput
      id={schemaField.id}
      label={schemaField.title + (schemaField.required ? ' *' : '')}
      value={value}
      onChange={(nextVal) =>
        fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, nextVal))
      }
      onBlur={fieldApi.handleBlur}
      error={displayError}
      invalid={isInvalid}
      placeholder={placeholder}
      disabled={schemaField.disabled}
      containerClassName={colSpanClass}
      isMonospace={isNik}
      inputMode={inputMode}
      maxLength={maxLength}
    />
  );
}

export function getFieldValidators(field: MedicalFormField) {
  const schema = getMedicalFieldValidationSchema(field);

  return {
    onChange: schema,
    onBlur: schema
  };
}

export function getErrorMessage(errors: unknown[]): string | undefined {
  const [firstError] = errors;

  if (!firstError) {
    return undefined;
  }

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (typeof firstError === 'object' && 'message' in firstError) {
    return String((firstError as { message: unknown }).message);
  }

  return String(firstError);
}
