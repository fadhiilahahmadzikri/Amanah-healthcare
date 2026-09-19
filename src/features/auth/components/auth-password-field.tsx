'use client';

import { useState } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { PasswordInput } from './password-input';
import { evaluatePasswordStrength, type PasswordStrengthResult } from '../utils/password-rules';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface AuthPasswordFieldProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label: string;
  error?: string;
  description?: string;
  showStrengthMeter?: boolean;
  showRulesObserver?: boolean;
}

export function AuthPasswordField({
  label,
  error,
  description,
  id,
  showStrengthMeter,
  showRulesObserver,
  onChange,
  value,
  defaultValue,
  ...props
}: AuthPasswordFieldProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  const [internalValue, setInternalValue] = useState<string>(String(defaultValue ?? ''));

  const currentValue = value !== undefined ? String(value) : internalValue;
  const isNewPassword = props.autoComplete === 'new-password';
  const shouldShowMeter = showStrengthMeter ?? isNewPassword;
  const shouldShowRules = showRulesObserver ?? isNewPassword;

  const strength: PasswordStrengthResult = evaluatePasswordStrength(currentValue);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInternalValue(event.target.value);
    onChange?.(event);
  }

  return (
    <Field data-invalid={Boolean(error)} className='gap-2'>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <PasswordInput
        id={fieldId}
        label={label}
        aria-invalid={Boolean(error)}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
      />

      {shouldShowMeter && currentValue ? (
        <div className='flex flex-col gap-1.5 pt-1'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>Kekuatan kata sandi</span>
            <span className={cn('font-medium transition-colors', strength.colorClass)}>
              {strength.label}
            </span>
          </div>

          <div className='grid grid-cols-5 gap-1.5 h-1.5 w-full'>
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  index < strength.score ? strength.barColorClass : 'bg-muted/80 dark:bg-muted/40'
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      {shouldShowRules && currentValue ? (
        <div className='rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1.5 mt-1 text-xs'>
          <p className='font-medium text-muted-foreground mb-1'>Aturan kata sandi:</p>
          <ul className='grid gap-1'>
            {strength.rules.map((rule) => (
              <li
                key={rule.id}
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  rule.passed ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {rule.passed ? (
                  <Icons.check className='size-3.5 text-emerald-500 shrink-0' />
                ) : (
                  <Icons.circle className='size-2.5 mx-0.5 text-muted-foreground/50 shrink-0' />
                )}
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {description && !currentValue ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
