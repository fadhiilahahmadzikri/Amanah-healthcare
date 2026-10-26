import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';

import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { cn } from '@/lib/utils';

import type { MedicalFormField } from '../../constants/medical-appointment-schemas';
import {
  getMedicalFieldValidationSchema,
  normalizeMedicalFieldInput
} from '../../schemas/medical-appointment-validation';

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
            const isSelected = value === choice;
            return (
              <button
                key={choice}
                type='button'
                role='radio'
                aria-checked={isSelected}
                onClick={() => {
                  fieldApi.handleChange(choice);
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
                {choice}
              </button>
            );
          })}
        </div>
        <FieldError errors={displayError ? [displayError] : []} />
      </FieldSet>
    );
  }

  if (schemaField.type === 'LIST') {
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
        options={schemaField.choices}
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
