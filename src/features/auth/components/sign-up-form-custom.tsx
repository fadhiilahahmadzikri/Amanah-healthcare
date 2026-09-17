'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { AuthPasswordField } from './auth-password-field';
import { AuthStatusAlert } from './auth-status-alert';
import { AuthTextField } from './auth-text-field';
import { GoogleAuthButton } from './google-auth-button';
import { signUpSchema } from '../schemas/auth-form-schemas';
import type { SignUpValues } from '../schemas/auth-form-schemas';

interface SignUpFormProps {
  error?: string | null;
  isSubmitting: boolean;
  isOAuthSubmitting: boolean;
  defaultEmail?: string;
  onSignUp: (values: SignUpValues) => Promise<void>;
  onGoogleSignUp: () => Promise<void>;
  onSignIn?: () => void;
  onEmailChange?: (email: string) => void;
}

export function SignUpForm({
  error,
  isSubmitting,
  isOAuthSubmitting,
  defaultEmail = '',
  onSignUp,
  onGoogleSignUp,
  onSignIn,
  onEmailChange
}: SignUpFormProps) {
  const [values, setValues] = useState<SignUpValues>({
    name: '',
    email: defaultEmail,
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignUpValues, string>>>({});
  const disabled = isSubmitting || isOAuthSubmitting;

  function updateField<Key extends keyof SignUpValues>(key: Key, value: SignUpValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === 'email') {
      onEmailChange?.(value as string);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0]
      });
      return;
    }

    setFieldErrors({});
    await onSignUp(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
      <GoogleAuthButton onClick={onGoogleSignUp} disabled={disabled} />
      <FieldSeparator>atau daftar dengan email</FieldSeparator>

      <FieldGroup className='gap-4'>
        <AuthStatusAlert message={error} />
        <AuthTextField
          label='Nama lengkap'
          name='name'
          autoComplete='name'
          placeholder='Nama Anda'
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          error={fieldErrors.name}
          disabled={disabled}
        />
        <AuthTextField
          label='Email'
          name='email'
          type='email'
          autoComplete='email'
          inputMode='email'
          placeholder='nama@contoh.com'
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={fieldErrors.email}
          disabled={disabled}
        />
        <AuthPasswordField
          label='Password'
          name='password'
          autoComplete='new-password'
          placeholder='Minimal 8 karakter'
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={fieldErrors.password}
          description='Gunakan minimal 8 karakter.'
          disabled={disabled}
        />
        <AuthPasswordField
          label='Konfirmasi password'
          name='confirmPassword'
          autoComplete='new-password'
          placeholder='Ulangi password'
          value={values.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={disabled}
        />
      </FieldGroup>

      <Button type='submit' className='w-full' disabled={disabled}>
        {isSubmitting ? 'Membuat akun...' : 'Buat akun'}
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        Sudah punya akun?{' '}
        {onSignIn ? (
          <button
            type='button'
            onClick={onSignIn}
            className='text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer'
          >
            Masuk
          </button>
        ) : (
          <Link
            href='/auth/sign-in'
            className='text-foreground font-medium underline underline-offset-4'
          >
            Masuk
          </Link>
        )}
      </p>
    </form>
  );
}
