'use client';

import * as React from 'react';

import { useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FieldGroup } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  PATIENT_REGISTRATION_BLOOD_TYPE_OPTIONS,
  PATIENT_REGISTRATION_GENDER_OPTIONS,
  PATIENT_REGISTRATION_REGIONS,
  type RegistrationOption
} from '../../constants/registration-options';
import type { PatientRegistrationFormValues } from '../../schemas/patient-registration-schema';
import type { PatientRegistrationFormController } from './use-patient-registration-form';
import { PatientRegistrationSummary } from './patient-registration-summary';

type PatientRegistrationStepFieldsProps = {
  controller: PatientRegistrationFormController;
};

export function PatientRegistrationStepFields({ controller }: PatientRegistrationStepFieldsProps) {
  const { FormTextField } = useFormFields<PatientRegistrationFormValues>();

  if (controller.currentStep === 1) {
    return (
      <FieldGroup>
        <FormTextField
          name='name'
          label='Nama lengkap'
          required
          placeholder='Contoh: Budi Santoso'
        />
      </FieldGroup>
    );
  }

  if (controller.currentStep === 2) {
    return (
      <FieldGroup>
        <FormTextField
          name='nik'
          label='NIK KTP'
          required
          inputMode='numeric'
          maxLength={16}
          placeholder='3271012345670001'
        />
      </FieldGroup>
    );
  }

  if (controller.currentStep === 3) {
    return (
      <FieldGroup>
        <FormTextField
          name='nama_ibu_kandung'
          label='Nama ibu kandung'
          required
          placeholder='Contoh: Siti Aminah'
        />
      </FieldGroup>
    );
  }

  if (controller.currentStep === 4) {
    return (
      <FieldGroup>
        <FormTextField
          name='tempat_lahir'
          label='Tempat lahir'
          required
          placeholder='Contoh: Jakarta'
        />
        <PatientRegistrationDateField controller={controller} />
      </FieldGroup>
    );
  }

  if (controller.currentStep === 5) {
    return (
      <PatientRegistrationToggleField
        controller={controller}
        name='gender'
        label='Jenis kelamin'
        options={PATIENT_REGISTRATION_GENDER_OPTIONS}
        columns='grid-cols-2'
      />
    );
  }

  if (controller.currentStep === 6) {
    return (
      <PatientRegistrationToggleField
        controller={controller}
        name='blood_type'
        label='Golongan darah'
        options={PATIENT_REGISTRATION_BLOOD_TYPE_OPTIONS}
        columns='grid-cols-2 sm:grid-cols-5'
      />
    );
  }

  if (controller.currentStep === 7) {
    return <PatientRegistrationRegionFields controller={controller} />;
  }

  if (controller.currentStep === 8) {
    return (
      <FieldGroup>
        <FormTextField
          name='pekerjaan'
          label='Pekerjaan'
          required
          placeholder='Contoh: Wiraswasta'
        />
      </FieldGroup>
    );
  }

  return (
    <controller.form.Subscribe selector={(state) => state.values}>
      {(values) => <PatientRegistrationSummary values={values as PatientRegistrationFormValues} />}
    </controller.form.Subscribe>
  );
}

function PatientRegistrationDateField({ controller }: PatientRegistrationStepFieldsProps) {
  const { form } = controller;

  return (
    <form.AppField name='birth_date'>
      {(field) => {
        const selectedDate = field.state.value ? parseLocalDate(field.state.value) : undefined;

        return (
          <field.FieldSet>
            <field.Field>
              <field.FieldLabel>Tanggal lahir *</field.FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className={cn(
                      'w-full justify-start font-normal',
                      !field.state.value && 'text-muted-foreground'
                    )}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  >
                    <Icons.calendar data-icon='inline-start' />
                    {field.state.value
                      ? formatBirthDateLabel(field.state.value)
                      : 'Pilih tanggal lahir'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) {
                        return;
                      }

                      field.handleChange(formatLocalDate(date));
                      field.handleBlur();
                    }}
                    captionLayout='dropdown'
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  />
                </PopoverContent>
              </Popover>
            </field.Field>
            <field.FieldError />
          </field.FieldSet>
        );
      }}
    </form.AppField>
  );
}

function PatientRegistrationToggleField({
  controller,
  name,
  label,
  options,
  columns
}: PatientRegistrationStepFieldsProps & {
  name: 'gender' | 'blood_type';
  label: string;
  options: RegistrationOption[];
  columns: string;
}) {
  const { form } = controller;

  return (
    <form.AppField name={name}>
      {(field) => {
        const labelId = `${field.name}-label`;

        return (
          <field.FieldSet>
            <field.Field>
              <field.FieldLabel id={labelId}>{label} *</field.FieldLabel>
              <ToggleGroup
                type='single'
                value={field.state.value}
                onValueChange={(value) => {
                  if (value) {
                    field.handleChange(value as PatientRegistrationFormValues[typeof name]);
                    field.handleBlur();
                  }
                }}
                aria-labelledby={labelId}
                variant='outline'
                className={cn('grid w-full', columns)}
              >
                {options.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className='text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </field.Field>
            <field.FieldError />
          </field.FieldSet>
        );
      }}
    </form.AppField>
  );
}

function PatientRegistrationRegionFields({ controller }: PatientRegistrationStepFieldsProps) {
  const { form } = controller;

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        const selectedProvince = PATIENT_REGISTRATION_REGIONS.find(
          (province) => province.value === values.provinsi_id
        );
        const selectedRegency = selectedProvince?.regencies.find(
          (regency) => regency.value === values.kabupaten_id
        );
        const selectedDistrict = selectedRegency?.districts.find(
          (district) => district.value === values.kecamatan_id
        );

        return (
          <FieldGroup>
            <PatientRegistrationSelectField
              controller={controller}
              name='provinsi_id'
              label='Provinsi'
              options={PATIENT_REGISTRATION_REGIONS}
              placeholder='Pilih provinsi'
              onValueChange={(option) => {
                form.setFieldValue('provinsi', option.label);
                form.setFieldValue('kabupaten', '');
                form.setFieldValue('kabupaten_id', '');
                form.setFieldValue('kecamatan', '');
                form.setFieldValue('kecamatan_id', '');
                form.setFieldValue('kelurahan', '');
                form.setFieldValue('kelurahan_id', '');
              }}
            />
            <PatientRegistrationSelectField
              controller={controller}
              name='kabupaten_id'
              label='Kota atau kabupaten'
              options={selectedProvince?.regencies ?? []}
              placeholder={selectedProvince ? 'Pilih kota atau kabupaten' : 'Pilih provinsi dahulu'}
              disabled={!selectedProvince}
              onValueChange={(option) => {
                form.setFieldValue('kabupaten', option.label);
                form.setFieldValue('kecamatan', '');
                form.setFieldValue('kecamatan_id', '');
                form.setFieldValue('kelurahan', '');
                form.setFieldValue('kelurahan_id', '');
              }}
            />
            <PatientRegistrationSelectField
              controller={controller}
              name='kecamatan_id'
              label='Kecamatan'
              options={selectedRegency?.districts ?? []}
              placeholder={selectedRegency ? 'Pilih kecamatan' : 'Pilih kota dahulu'}
              disabled={!selectedRegency}
              onValueChange={(option) => {
                form.setFieldValue('kecamatan', option.label);
                form.setFieldValue('kelurahan', '');
                form.setFieldValue('kelurahan_id', '');
              }}
            />
            <PatientRegistrationSelectField
              controller={controller}
              name='kelurahan_id'
              label='Kelurahan atau desa'
              options={selectedDistrict?.villages ?? []}
              placeholder={
                selectedDistrict ? 'Pilih kelurahan atau desa' : 'Pilih kecamatan dahulu'
              }
              disabled={!selectedDistrict}
              onValueChange={(option) => form.setFieldValue('kelurahan', option.label)}
            />
            <form.AppField name='alamat_detail'>
              {(field) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel>Alamat detail *</field.FieldLabel>
                    <Textarea
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Nama jalan, nomor rumah, RT/RW, atau patokan'
                      rows={3}
                      aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    />
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </FieldGroup>
        );
      }}
    </form.Subscribe>
  );
}

function PatientRegistrationSelectField({
  controller,
  name,
  label,
  options,
  placeholder,
  disabled,
  onValueChange
}: PatientRegistrationStepFieldsProps & {
  name: 'provinsi_id' | 'kabupaten_id' | 'kecamatan_id' | 'kelurahan_id';
  label: string;
  options: RegistrationOption[];
  placeholder: string;
  disabled?: boolean;
  onValueChange: (option: RegistrationOption) => void;
}) {
  const { form } = controller;

  return (
    <form.AppField name={name}>
      {(field) => (
        <field.FieldSet>
          <field.Field data-disabled={disabled}>
            <field.FieldLabel>{label} *</field.FieldLabel>
            <Select
              value={field.state.value}
              disabled={disabled}
              onValueChange={(value) => {
                const option = options.find((item) => item.value === value);

                if (!option) {
                  return;
                }

                field.handleChange(value);
                field.handleBlur();
                onValueChange(option);
              }}
            >
              <SelectTrigger
                aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                className='w-full'
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </field.Field>
          <field.FieldError />
        </field.FieldSet>
      )}
    </form.AppField>
  );
}

function parseLocalDate(value: string): Date {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatBirthDateLabel(value: string): string {
  return parseLocalDate(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
