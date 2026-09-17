'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { AuthOtpField } from './auth-otp-field';
import { AuthPasswordField } from './auth-password-field';
import { AuthStatusAlert } from './auth-status-alert';
import { resetPasswordSchema } from '../schemas/auth-form-schemas';
import type { ResetPasswordValues } from '../schemas/auth-form-schemas';

interface ResetPasswordFormProps {
  email?: string;
  error?: string | null;
  info?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: ResetPasswordValues) => Promise<void>;
  onBack: () => void;
}

export function ResetPasswordForm({
  email,
  error,
  info,
  isSubmitting,
  onSubmit,
  onBack
}: ResetPasswordFormProps) {
  const [values, setValues] = useState<ResetPasswordValues>({
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordValues, string>>
  >({});

  function updateField<Key extends keyof ResetPasswordValues>(
    key: Key,
    value: ResetPasswordValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        code: errors.code?.[0],
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0]
      });
      return;
    }

    setFieldErrors({});
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
      <FieldGroup className='gap-4'>
        <AuthStatusAlert message={info} tone='info' />
        <AuthStatusAlert message={error} />
        <AuthOtpField
          value={values.code}
          onChange={(value) => updateField('code', value)}
          error={fieldErrors.code}
          disabled={isSubmitting}
        />
        <AuthPasswordField
          label='Password baru'
          name='password'
          autoComplete='new-password'
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={fieldErrors.password}
          disabled={isSubmitting}
        />
        <AuthPasswordField
          label='Konfirmasi password baru'
          name='confirmPassword'
          autoComplete='new-password'
          value={values.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />
      </FieldGroup>

      {email ? (
        <p className='text-muted-foreground text-center text-sm'>
          Reset password untuk <span className='text-foreground font-medium'>{email}</span>.
        </p>
      ) : null}

      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Simpan password baru'}
      </Button>
      <Button
        type='button'
        variant='ghost'
        className='w-full'
        onClick={onBack}
        disabled={isSubmitting}
      >
        Kembali ke sign in
      </Button>
    </form>
  );
}
