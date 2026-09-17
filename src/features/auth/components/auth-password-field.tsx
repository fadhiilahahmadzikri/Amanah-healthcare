'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { PasswordInput } from './password-input';

interface AuthPasswordFieldProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label: string;
  error?: string;
  description?: string;
}

export function AuthPasswordField({
  label,
  error,
  description,
  id,
  ...props
}: AuthPasswordFieldProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <PasswordInput id={fieldId} label={label} aria-invalid={Boolean(error)} {...props} />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
