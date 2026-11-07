import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';

import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import { Icons } from '@/components/icons';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineCreatableSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-creatable-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import { cn } from '@/lib/utils';
import { GENDER_OPTIONS, getGenderLabel } from '@/constants/gender.constants';

import type { MedicalFormField } from '../../constants/medical-appointment-schemas';
import {
  getMedicalFieldFormat,
  getMedicalFieldValidationSchema,
  normalizeMedicalFieldInput
} from '../../schemas/medical-appointment-validation';

const fieldFormatConfig: Record<
  'nik' | 'phone' | 'count' | 'year' | 'text',
  { inputMode?: 'numeric' | 'tel'; maxLength?: number }
> = {
  nik: { inputMode: 'numeric', maxLength: 16 },
  phone: { inputMode: 'tel', maxLength: 15 },
  count: { inputMode: 'numeric', maxLength: 2 },
  year: { inputMode: 'numeric', maxLength: 4 },
  text: {}
};

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
  const placeholder = schemaField.placeholder || '';
  const [showNik, setShowNik] = React.useState(false);
  const [nikStatus, setNikStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  const format = getMedicalFieldFormat(schemaField);
  const isNik = format === 'nik';

  React.useEffect(() => {
    if (!isNik) return;

    const clean = value.replace(/\D/g, '');
    if (clean.length < 16) {
      setNikStatus('idle');
      return;
    }

    setNikStatus('checking');

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await patientAffiliationService.verifyNikAvailability(clean);
        if (abortController.signal.aborted) return;
        if (res.available) {
          setNikStatus('available');
        } else {
          setNikStatus('taken');
        }
      } catch {
        if (abortController.signal.aborted) return;
        setNikStatus('idle');
      }
    }, 400);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, [isNik, value]);

  const isColSpanFull =
    schemaField.colSpan === 'full' ||
    schemaField.colSpan === 2 ||
    schemaField.type === 'PARAGRAPH' ||
    schemaField.type === 'DATE';
  const colSpanClass = isColSpanFull ? 'col-span-1 sm:col-span-2' : 'col-span-1';
  const animationClass = schemaField.visibleIf
    ? 'animate-in fade-in slide-in-from-top-2 duration-300'
    : '';

  const requiredAsterisk = schemaField.required ? (
    <span className='ml-1 font-bold text-red-500 dark:text-red-400' aria-hidden='true'>
      *
    </span>
  ) : null;

  if (schemaField.type === 'MULTIPLE_CHOICE') {
    const choiceCount = schemaField.choices.length;
    const gridColsClass =
      choiceCount === 2
        ? 'grid grid-cols-2 gap-2.5'
        : choiceCount === 3
          ? 'grid grid-cols-3 gap-2.5'
          : choiceCount === 4
            ? 'grid grid-cols-2 sm:grid-cols-4 gap-2.5'
            : 'grid grid-cols-2 sm:grid-cols-3 gap-2.5';

    return (
      <FieldSet
        id={schemaField.id}
        data-field-id={schemaField.id}
        data-invalid={isInvalid}
        className={cn('gap-3', colSpanClass)}
      >
        {schemaField.title ? (
          <FieldLegend variant='label' className='mb-1.5 text-sm leading-snug font-medium'>
            <span>
              {schemaField.title}
              {requiredAsterisk}
            </span>
          </FieldLegend>
        ) : null}
        {schemaField.helpText ? (
          <FieldDescription className='text-xs text-muted-foreground'>
            {schemaField.helpText}
          </FieldDescription>
        ) : null}
        <div role='radiogroup' className={cn('mt-1 w-full', gridColsClass)}>
          {schemaField.choices.map((choice) => {
            const choiceValue = typeof choice === 'string' ? choice : (choice as any).value;
            const choiceLabel = typeof choice === 'string' ? choice : (choice as any).label;
            const isSelected = value === choiceValue;
            return (
              <button
                key={choiceValue}
                type='button'
                role='radio'
                aria-checked={isSelected}
                onClick={() => {
                  fieldApi.handleChange(choiceValue);
                  fieldApi.handleBlur();
                }}
                className={cn(
                  'h-auto min-h-10 w-full min-w-0 cursor-pointer rounded-lg border px-3 py-2 text-center text-xs leading-snug font-medium transition-all select-none',
                  isSelected
                    ? 'border-primary bg-primary/10 font-semibold text-primary shadow-xs'
                    : 'border-border bg-background text-foreground hover:bg-muted/50 hover:text-foreground',
                  isInvalid && !value && 'border-destructive/60'
                )}
              >
                {choiceLabel}
              </button>
            );
          })}
        </div>
        <FieldError errors={displayError ? [displayError] : []} />
      </FieldSet>
    );
  }

  if (schemaField.type === 'LIST') {
    if (schemaField.allowCustomInput) {
      return (
        <PatientLineCreatableSelect
          id={schemaField.id}
          label={
            <span>
              {schemaField.title}
              {requiredAsterisk}
            </span>
          }
          value={value}
          onChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
          options={schemaField.choices.map((c) => (typeof c === 'string' ? c : c.label))}
          placeholder={placeholder || 'Pilih atau ketik sendiri...'}
          error={displayError}
          invalid={isInvalid}
          disabled={schemaField.disabled}
          containerClassName={colSpanClass}
        />
      );
    }

    return (
      <PatientLineSelect
        id={schemaField.id}
        label={
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        }
        value={value}
        onChange={(nextValue) => {
          fieldApi.handleChange(nextValue);
          fieldApi.handleBlur();
        }}
        options={schemaField.choices as any}
        placeholder={placeholder}
        error={displayError}
        invalid={isInvalid}
        disabled={schemaField.disabled}
        containerClassName={colSpanClass}
      />
    );
  }

  if (schemaField.type === 'PARAGRAPH') {
    return (
      <PatientLineTextarea
        id={schemaField.id}
        label={
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        }
        value={value}
        onChange={(nextValue) => fieldApi.handleChange(nextValue)}
        onBlur={fieldApi.handleBlur}
        placeholder={placeholder}
        error={displayError}
        invalid={isInvalid}
        disabled={schemaField.disabled}
        containerClassName={cn(colSpanClass, animationClass)}
      />
    );
  }

  if (schemaField.type === 'DATE') {
    return (
      <PatientBirthdatePicker
        id={schemaField.id}
        value={value}
        onChange={(nextValue) => {
          fieldApi.handleChange(nextValue);
          fieldApi.handleBlur();
        }}
        onBlur={() => fieldApi.handleBlur()}
        variant='underline'
        label={
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        }
        placeholder={placeholder}
        ariaLabel={schemaField.title}
        error={displayError}
        invalid={isInvalid}
        className={colSpanClass}
      />
    );
  }

  if (
    schemaField.id === 'initialBmi' ||
    schemaField.id === 'motherAge' ||
    schemaField.id === 'partnerAge' ||
    schemaField.id === 'estimatedDueDate' ||
    schemaField.id === 'gestationalAge'
  ) {
    return (
      <PatientLineInput
        id={schemaField.id}
        label={
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        }
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

  const formatProps = fieldFormatConfig[format];

  const getFieldSuffix = (id: string): string | undefined => {
    if (
      id === 'heightCm' ||
      id === 'upperArmCircumferenceCm' ||
      id === 'birthLengthCm' ||
      id.endsWith('BirthLength')
    ) {
      return 'cm';
    }
    if (id === 'prePregnancyWeightKg' || id === 'weightKg') {
      return 'kg';
    }
    if (id === 'initialBmi') {
      return 'kg/m²';
    }
    if (id === 'birthWeightGrams' || id.endsWith('BirthWeight')) {
      return 'gr';
    }
    if (id.endsWith('GestationalAgeAtBirth')) {
      return 'mgg';
    }
    return undefined;
  };

  const suffix = getFieldSuffix(schemaField.id);
  const trailingIcon = isNik ? (
    <button
      type='button'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowNik((prev) => !prev);
      }}
      className='p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
      title={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
      aria-label={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
      tabIndex={-1}
    >
      {showNik ? (
        <Icons.eyeOff className='size-4 text-primary' />
      ) : (
        <Icons.eye className='size-4' />
      )}
    </button>
  ) : suffix ? (
    <span className='text-xs font-semibold text-muted-foreground select-none pointer-events-none'>
      {suffix}
    </span>
  ) : undefined;

  const isDecimal =
    [
      'heightCm',
      'prePregnancyWeightKg',
      'upperArmCircumferenceCm',
      'initialBmi',
      'birthLengthCm',
      'weightKg'
    ].includes(schemaField.id) || schemaField.id.endsWith('BirthLength');

  if (isNik) {
    return (
      <div className={cn('flex flex-col gap-1', colSpanClass)}>
        <PatientLineInput
          id={schemaField.id}
          type={showNik ? 'text' : 'password'}
          label={
            <span>
              {schemaField.title}
              {requiredAsterisk}
            </span>
          }
          value={value}
          onChange={(nextVal) =>
            fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, nextVal))
          }
          onBlur={fieldApi.handleBlur}
          error={displayError}
          invalid={isInvalid}
          placeholder={placeholder}
          disabled={schemaField.disabled}
          isMonospace={true}
          inputMode='numeric'
          maxLength={16}
          trailingIcon={trailingIcon}
        />
        {nikStatus === 'checking' && (
          <p className='text-xs text-muted-foreground animate-pulse flex items-center gap-1.5 pt-0.5'>
            <span className='inline-block size-1.5 rounded-full bg-primary/70 animate-ping' />
            Memeriksa ketersediaan NIK...
          </p>
        )}
        {nikStatus === 'available' && !displayError && (
          <p className='text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5'>
            ✓ NIK belum terdaftar di klinik
          </p>
        )}
        {nikStatus === 'taken' && !displayError && (
          <p className='text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pt-0.5'>
            <Icons.info className='size-3.5 shrink-0' />
            NIK sudah terdaftar di sistem klinik
          </p>
        )}
      </div>
    );
  }

  return (
    <PatientLineInput
      id={schemaField.id}
      type='text'
      label={
        <span>
          {schemaField.title}
          {requiredAsterisk}
        </span>
      }
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
      isMonospace={false}
      inputMode={isDecimal ? 'decimal' : formatProps.inputMode}
      maxLength={formatProps.maxLength}
      trailingIcon={trailingIcon}
    />
  );
}

export function getFieldValidators(
  field: MedicalFormField,
  birthYear?: number | null,
  allValues?: any
) {
  const schema = getMedicalFieldValidationSchema(field, birthYear, allValues);

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
