'use client';

import type { FormValidateFn, GlobalFormValidationError } from '@tanstack/form-core';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { scrollToFirstError, useAppForm } from '@/components/ui/tanstack-form';
import { useFormStepper } from '@/hooks/use-stepper';
import { completePatientRegistrationAction } from '../../api/patient-registration-actions';
import {
  patientRegistrationStepSchemas,
  type PatientRegistrationFormValues
} from '../../schemas/patient-registration-schema';
import { PATIENT_REGISTRATION_DEFAULT_VALUES } from '../../constants/registration-options';

type UsePatientRegistrationFormInput = {
  initialName?: string;
  onSuccess?: () => void;
};

type RegistrationFieldErrors = Partial<
  Record<keyof PatientRegistrationFormValues, { message: string }[]>
>;

export function usePatientRegistrationForm({
  initialName,
  onSuccess
}: UsePatientRegistrationFormInput) {
  const stepper = useFormStepper(patientRegistrationStepSchemas);
  const currentStepValidator: FormValidateFn<PatientRegistrationFormValues> = ({ value }) => {
    const result = stepper.currentValidator.safeParse(value);

    if (result.success) {
      return undefined;
    }

    const fields: RegistrationFieldErrors = {};

    for (const issue of result.error.issues) {
      const [path] = issue.path;

      if (typeof path === 'string' && path in value) {
        const fieldName = path as keyof PatientRegistrationFormValues;
        fields[fieldName] = [...(fields[fieldName] ?? []), { message: issue.message }];
      }
    }

    return { fields } as GlobalFormValidationError<PatientRegistrationFormValues>;
  };
  const form = useAppForm({
    defaultValues: {
      ...PATIENT_REGISTRATION_DEFAULT_VALUES,
      name: initialName || ''
    } as PatientRegistrationFormValues,
    validators: {
      onSubmit: currentStepValidator
    },
    onSubmitInvalid: () => scrollToFirstError(),
    onSubmit: async ({ value }) => {
      const result = await completePatientRegistrationAction(value);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      onSuccess?.();
    }
  });
  const isCurrentStepValid = useCallback(
    (values: PatientRegistrationFormValues) => stepper.currentValidator.safeParse(values).success,
    [stepper.currentValidator]
  );

  useEffect(() => {
    const handleAutofill = (e: Event) => {
      const d = (
        e as CustomEvent<{
          flow: string;
          values: Record<string, string>;
          step?: number;
        }>
      ).detail;
      if (!d || (d.flow !== 'regular-patient' && d.flow !== 'patient-registration')) return;

      const v = d.values;
      if (!v) return;

      if (v.name || v.fullName) form.setFieldValue('name', v.name || v.fullName);
      if (v.nik) form.setFieldValue('nik', v.nik);
      if (v.nama_ibu_kandung || v.motherName)
        form.setFieldValue('nama_ibu_kandung', v.nama_ibu_kandung || v.motherName);
      if (v.tempat_lahir || v.placeOfBirth)
        form.setFieldValue('tempat_lahir', v.tempat_lahir || v.placeOfBirth);
      if (v.birth_date || v.dateOfBirth)
        form.setFieldValue('birth_date', v.birth_date || v.dateOfBirth);
      if (v.gender)
        form.setFieldValue('gender', v.gender as PatientRegistrationFormValues['gender']);
      if (v.blood_type || v.bloodType)
        form.setFieldValue('blood_type', v.blood_type || v.bloodType);
      if (v.provinsi || v.provinceName) form.setFieldValue('provinsi', v.provinsi || v.provinceName);
      if (v.provinsi_id || v.provinceCode)
        form.setFieldValue('provinsi_id', v.provinsi_id || v.provinceCode);
      if (v.kabupaten || v.regencyName) form.setFieldValue('kabupaten', v.kabupaten || v.regencyName);
      if (v.kabupaten_id || v.regencyCode)
        form.setFieldValue('kabupaten_id', v.kabupaten_id || v.regencyCode);
      if (v.kecamatan || v.districtName)
        form.setFieldValue('kecamatan', v.kecamatan || v.districtName);
      if (v.kecamatan_id || v.districtCode)
        form.setFieldValue('kecamatan_id', v.kecamatan_id || v.districtCode);
      if (v.kelurahan || v.villageName) form.setFieldValue('kelurahan', v.kelurahan || v.villageName);
      if (v.kelurahan_id || v.villageCode)
        form.setFieldValue('kelurahan_id', v.kelurahan_id || v.villageCode);
      if (v.alamat_detail || v.line1)
        form.setFieldValue('alamat_detail', v.alamat_detail || v.line1);
      if (v.pekerjaan || v.occupationName)
        form.setFieldValue('pekerjaan', v.pekerjaan || v.occupationName);

      if (typeof d.step === 'number') {
        stepper.step.goToStep(Math.min(d.step, stepper.step.count));
      }
    };

    window.addEventListener('devtool:autofill', handleAutofill);
    return () => window.removeEventListener('devtool:autofill', handleAutofill);
  }, [form, stepper.step]);

  return {
    form,
    isCurrentStepValid,
    ...stepper
  };
}

export type PatientRegistrationFormController = ReturnType<typeof usePatientRegistrationForm>;
