'use client';

import type { FormValidateFn, GlobalFormValidationError } from '@tanstack/form-core';
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
};

type RegistrationFieldErrors = Partial<
  Record<keyof PatientRegistrationFormValues, { message: string }[]>
>;

export function usePatientRegistrationForm({ initialName }: UsePatientRegistrationFormInput) {
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
      }
    }
  });

  return {
    form,
    ...stepper
  };
}

export type PatientRegistrationFormController = ReturnType<typeof usePatientRegistrationForm>;
