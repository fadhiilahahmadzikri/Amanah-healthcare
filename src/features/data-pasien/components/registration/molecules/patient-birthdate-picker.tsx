'use client';

import * as React from 'react';
import { CustomDatePicker, type CustomDatePickerProps } from '@/components/ui/custom-date-picker';

export type PatientBirthdatePickerProps = CustomDatePickerProps;

export function PatientBirthdatePicker({
  id = 'tanggalLahirTrigger',
  label = 'tanggal lahir*',
  placeholder = 'pilih tanggal lahir...',
  ariaLabel = 'Tanggal lahir',
  minYear = 1930,
  maxYear,
  disableFutureDates = true,
  ...props
}: PatientBirthdatePickerProps) {
  const dynamicMaxYear = maxYear ?? new Date().getFullYear();

  return (
    <CustomDatePicker
      id={id}
      label={label}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      minYear={minYear}
      maxYear={dynamicMaxYear}
      disableFutureDates={disableFutureDates}
      {...props}
    />
  );
}
