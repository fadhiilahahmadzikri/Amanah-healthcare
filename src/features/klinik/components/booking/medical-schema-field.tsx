import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';

import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineSelect } from '@/features/data-pasien/components/registration/atoms/patient-line-select';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import {
  PatientRegionDropdown,
  type PatientRegionValues
} from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { cn } from '@/lib/utils';

import type { MedicalFormField } from '../../constants/medical-appointment-schemas';
import { useFormDataSourceRegistry } from '../../model/form-data-source-registry';
import {
  getMedicalFieldFormat,
  getMedicalFieldValidationSchema,
  normalizeMedicalFieldInput
} from '../../schemas/medical-appointment-validation';
import { MedicalFieldBuilderToolbar } from './medical-field-builder-toolbar';

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

export interface MedicalSchemaFieldProps {
  fieldApi: AnyFieldApi;
  schemaField: MedicalFormField;
  builderMode?: boolean;
  currentSectionId?: string;
  availableSections?: { id: string; title: string }[];
  onUpdateField?: (updated: Partial<MedicalFormField>) => void;
  onToggleActive?: () => void;
  onDeleteField?: () => void;
  onMoveToSection?: (targetSectionId: string) => void;
}

export function MedicalSchemaField({
  fieldApi,
  schemaField,
  builderMode = false,
  currentSectionId,
  availableSections,
  onUpdateField,
  onToggleActive,
  onDeleteField,
  onMoveToSection
}: MedicalSchemaFieldProps) {
  const rawError = getErrorMessage(fieldApi.state.meta.errors);
  const isInvalid = !builderMode && fieldApi.state.meta.isTouched && Boolean(rawError);
  const displayError = isInvalid && rawError && rawError !== 'Wajib diisi' ? rawError : undefined;
  const value = String(fieldApi.state.value ?? '');
  const placeholder = schemaField.placeholder || '';

  const isColSpanFull =
    schemaField.colSpan === 'full' ||
    schemaField.colSpan === 2 ||
    schemaField.type === 'PARAGRAPH' ||
    schemaField.type === 'DATE';
  const colSpanClass = isColSpanFull ? 'col-span-1 sm:col-span-2' : 'col-span-1';
  const innerColSpanClass = builderMode ? 'w-full' : colSpanClass;
  const animationClass = schemaField.visibleIf
    ? 'animate-in fade-in slide-in-from-top-2 duration-300'
    : '';

  const requiredAsterisk = schemaField.required ? (
    <span className='ml-1 font-bold text-red-500 dark:text-red-400' aria-hidden='true'>
      *
    </span>
  ) : null;

  const { resolveChoices } = useFormDataSourceRegistry();
  const effectiveChoices = React.useMemo(() => {
    return resolveChoices(schemaField.dataSource, schemaField.choices);
  }, [resolveChoices, schemaField.dataSource, schemaField.choices]);

  const renderFieldControl = () => {
    if (schemaField.type === 'MULTIPLE_CHOICE') {
      const choiceCount = effectiveChoices.length;
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
          className={cn('gap-3', innerColSpanClass)}
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
            {effectiveChoices.map((choice) => {
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
          options={effectiveChoices}
          placeholder={placeholder}
          error={displayError}
          invalid={isInvalid}
          disabled={schemaField.disabled}
          containerClassName={innerColSpanClass}
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
          containerClassName={cn(innerColSpanClass, animationClass)}
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
          className={innerColSpanClass}
        />
      );
    }

    if (schemaField.dataSource?.key === 'indonesian_regions' || schemaField.id === 'region') {
      let parsedRegion: PatientRegionValues = {
        provinceName: '',
        provinceCode: '',
        regencyName: '',
        regencyCode: '',
        districtName: '',
        districtCode: '',
        villageName: '',
        villageCode: '',
        line1: ''
      };
      try {
        if (value && typeof value === 'string' && value.startsWith('{')) {
          parsedRegion = { ...parsedRegion, ...JSON.parse(value) };
        }
      } catch {}

      const handleRegionChange = (updates: Partial<PatientRegionValues>) => {
        const next = { ...parsedRegion, ...updates };
        fieldApi.handleChange(JSON.stringify(next));
      };

      return (
        <div className={cn('col-span-1 sm:col-span-2 pt-1', innerColSpanClass)}>
          <PatientRegionDropdown values={parsedRegion} onChange={handleRegionChange} />
        </div>
      );
    }

    if (schemaField.type === 'CHECKBOX') {
      const isChecked = value === 'true' || value === 'Ya' || Boolean(fieldApi.state.value);
      return (
        <div className={cn('flex items-start gap-2.5 py-2', innerColSpanClass)}>
          <input
            type='checkbox'
            id={schemaField.id}
            checked={isChecked}
            onChange={(e) => {
              fieldApi.handleChange(e.target.checked ? 'true' : 'false');
              fieldApi.handleBlur();
            }}
            className='mt-1 size-4 rounded border-border text-primary focus:ring-primary'
          />
          <div className='flex flex-col gap-0.5'>
            <label
              htmlFor={schemaField.id}
              className='cursor-pointer text-xs font-semibold text-foreground'
            >
              {schemaField.title}
              {requiredAsterisk}
            </label>
            {schemaField.helpText && (
              <p className='text-[11px] text-muted-foreground'>{schemaField.helpText}</p>
            )}
          </div>
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
          containerClassName={innerColSpanClass}
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

    const format = getMedicalFieldFormat(schemaField);
    const isNik = format === 'nik';
    const formatProps = fieldFormatConfig[format];

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
        containerClassName={innerColSpanClass}
        isMonospace={isNik}
        inputMode={formatProps.inputMode}
        maxLength={formatProps.maxLength}
      />
    );
  };

  if (!builderMode) {
    return renderFieldControl();
  }

  const isInactive = schemaField.isActive === false;

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-transparent p-1.5 transition-all duration-200',
        colSpanClass,
        'hover:border-primary/40 hover:bg-muted/15',
        isInactive && 'opacity-60 border-dashed border-amber-500/40 bg-amber-500/5'
      )}
    >
      <MedicalFieldBuilderToolbar
        field={schemaField}
        currentSectionId={currentSectionId}
        availableSections={availableSections}
        onUpdateField={onUpdateField}
        onToggleActive={onToggleActive}
        onDeleteField={onDeleteField}
        onMoveToSection={onMoveToSection}
      />
      {isInactive && (
        <div className='mb-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400'>
          <span className='size-1.5 rounded-full bg-amber-500' />
          <span>Dinonaktifkan (Disembunyikan dari Pasien)</span>
        </div>
      )}
      {renderFieldControl()}
    </div>
  );
}

export function getFieldValidators(field: MedicalFormField, builderMode: boolean = false) {
  if (builderMode) {
    return {};
  }
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
