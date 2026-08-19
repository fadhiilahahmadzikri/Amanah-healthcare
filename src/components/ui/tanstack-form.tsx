import { createFormHook } from '@tanstack/react-form';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Button, type buttonVariants } from '@/components/ui/button';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldTitle
} from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  TextField,
  TextareaField,
  SelectField,
  CheckboxField,
  SwitchField,
  RadioGroupField,
  SliderField,
  FileUploadField,
  FormTextField,
  FormTextareaField,
  FormSelectField,
  FormCheckboxField,
  FormSwitchField,
  FormRadioGroupField,
  FormSliderField,
  FormFileUploadField
} from '@/components/forms/fields';
import { cn } from '@/lib/utils';
import {
  fieldContext,
  formContext,
  useFormContext,
  FormFieldSet,
  FormField,
  FormFieldError
} from './form-context';

function Form({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'noValidate'> & {
  children?: React.ReactNode;
}) {
  const form = useFormContext();
  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );
  return (
    <form
      onSubmit={handleSubmit}
      className={cn('mx-auto flex w-full flex-col gap-2 p-2 md:p-5', props.className)}
      noValidate
      {...props}
    >
      {children}
    </form>
  );
}

function SubmitButton({
  children,
  className,
  size,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button
          className={className}
          size={size}
          type='submit'
          disabled={!canSubmit}
          isLoading={isSubmitting}
          {...props}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}

function StepButton({
  label,
  handleMovement,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    label: React.ReactNode | string;
    handleMovement: () => void;
  }) {
  return (
    <Button size='sm' variant='ghost' type='button' onClick={handleMovement} {...props}>
      {label}
    </Button>
  );
}

const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Field: FormField,
    FieldError: FormFieldError,
    FieldSet: FormFieldSet,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldTitle,
    InputGroup,
    InputGroupAddon,
    InputGroupInput,

    TextField,
    TextareaField,
    SelectField,
    CheckboxField,
    SwitchField,
    RadioGroupField,
    SliderField,
    FileUploadField
  },
  formComponents: {
    Form,
    SubmitButton,
    StepButton,
    FieldLegend,
    FieldDescription,
    FieldSeparator,

    TextField: FormTextField,
    TextareaField: FormTextareaField,
    SelectField: FormSelectField,
    CheckboxField: FormCheckboxField,
    SwitchField: FormSwitchField,
    RadioGroupField: FormRadioGroupField,
    SliderField: FormSliderField,
    FileUploadField: FormFileUploadField
  }
});

import type { WithTypedName } from './form-context';

function useFormFields<TValues extends Record<string, unknown>>() {
  type Typed<C> = WithTypedName<C, TValues>;
  return {
    FormTextField: FormTextField as unknown as Typed<typeof FormTextField>,
    FormTextareaField: FormTextareaField as unknown as Typed<typeof FormTextareaField>,
    FormSelectField: FormSelectField as unknown as Typed<typeof FormSelectField>,
    FormCheckboxField: FormCheckboxField as unknown as Typed<typeof FormCheckboxField>,
    FormSwitchField: FormSwitchField as unknown as Typed<typeof FormSwitchField>,
    FormRadioGroupField: FormRadioGroupField as unknown as Typed<typeof FormRadioGroupField>,
    FormSliderField: FormSliderField as unknown as Typed<typeof FormSliderField>,
    FormFileUploadField: FormFileUploadField as unknown as Typed<typeof FormFileUploadField>
  };
}

export { useAppForm, withForm, withFieldGroup, useFormFields };

export type {
  FieldConfig,
  FieldValidatorConfig,
  FieldListenerConfig,
  WithTypedName
} from './form-context';

export {
  createFormField,
  typedField,
  revalidateLogic,
  scrollToFirstError,
  useFieldContext,
  useFormContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  FormErrors
} from './form-context';
