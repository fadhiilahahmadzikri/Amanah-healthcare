'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { AuthTextField } from './auth-text-field';
import { AuthPasswordField } from './auth-password-field';
import { GoogleAuthButton } from './google-auth-button';
import { AuthStatusAlert } from './auth-status-alert';
import { signInSchema } from '../schemas/auth-form-schemas';
import type { SignInValues } from '../schemas/auth-form-schemas';

interface SignInFormProps {
  error?: string | null;
  isSubmitting: boolean;
  isOAuthSubmitting: boolean;
  defaultEmail?: string;
  onPasswordSignIn: (values: SignInValues) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onForgotPassword: () => void;
  onSignUp?: () => void;
  onEmailChange?: (email: string) => void;
}

export function SignInForm({
  error,
  isSubmitting,
  isOAuthSubmitting,
  defaultEmail = '',
  onPasswordSignIn,
  onGoogleSignIn,
  onForgotPassword,
  onSignUp,
  onEmailChange
}: SignInFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignInValues, string>>>({});

  const disabled = isSubmitting || isOAuthSubmitting;

  function handleEmailUpdate(value: string) {
    setEmail(value);
    onEmailChange?.(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0]
      });
      return;
    }

    setFieldErrors({});
    await onPasswordSignIn(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
      <GoogleAuthButton onClick={onGoogleSignIn} disabled={disabled} />
      <FieldSeparator>atau masuk dengan email</FieldSeparator>

      <FieldGroup className='gap-4'>
        <AuthStatusAlert message={error} />
        <AuthTextField
          label='Email'
          name='email'
          type='email'
          autoComplete='email'
          inputMode='email'
          placeholder='nama@contoh.com'
          value={email}
          onChange={(event) => handleEmailUpdate(event.target.value)}
          error={fieldErrors.email}
          disabled={disabled}
        />
        <AuthPasswordField
          label='Password'
          name='password'
          autoComplete='current-password'
          placeholder='••••••••'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={disabled}
        />
        <div className='flex justify-end'>
          <Button
            type='button'
            variant='link'
            className='h-auto p-0 text-xs sm:text-sm text-muted-foreground hover:text-foreground'
            onClick={onForgotPassword}
            disabled={disabled}
          >
            Lupa password?
          </Button>
        </div>
      </FieldGroup>

      <Button type='submit' className='w-full' disabled={disabled}>
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        Belum punya akun?{' '}
        {onSignUp ? (
          <button
            type='button'
            onClick={onSignUp}
            className='text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer'
          >
            Buat akun
          </button>
        ) : (
          <Link
            href='/auth/sign-up'
            className='text-foreground font-medium underline underline-offset-4'
          >
            Buat akun
          </Link>
        )}
      </p>
    </form>
  );
}
