'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { AuthStatusAlert } from './auth-status-alert';
import { AuthTextField } from './auth-text-field';
import { forgotPasswordSchema } from '../schemas/auth-form-schemas';
import type { ForgotPasswordValues } from '../schemas/auth-form-schemas';

interface ForgotPasswordFormProps {
  error?: string | null;
  isSubmitting: boolean;
  defaultEmail?: string;
  onSubmit: (values: ForgotPasswordValues) => Promise<void>;
  onBack: () => void;
  onEmailChange?: (email: string) => void;
}

export function ForgotPasswordForm({
  error,
  isSubmitting,
  defaultEmail = '',
  onSubmit,
  onBack,
  onEmailChange
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState<string | undefined>();

  function handleEmailChange(value: string) {
    setEmail(value);
    onEmailChange?.(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    setEmailError(undefined);
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
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
          onChange={(event) => handleEmailChange(event.target.value)}
          error={emailError}
          disabled={isSubmitting}
          description='Kami akan mengirim kode OTP untuk membuat password baru.'
        />
      </FieldGroup>

      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting ? 'Mengirim kode...' : 'Kirim kode reset'}
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
