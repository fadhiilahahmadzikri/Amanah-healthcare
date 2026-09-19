'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Icons } from '@/components/icons';
import { AuthStatusAlert } from './auth-status-alert';
import { AuthTextField } from './auth-text-field';
import { useOtpCountdown } from '../hooks/use-otp-countdown';
import { forgotPasswordSchema } from '../schemas/auth-form-schemas';
import type { ForgotPasswordValues } from '../schemas/auth-form-schemas';

interface ForgotPasswordFormProps {
  error?: string | null;
  info?: string | null;
  isSubmitting: boolean;
  defaultEmail?: string;
  onSubmit: (values: ForgotPasswordValues) => Promise<void>;
  onBack: () => void;
  onEmailChange?: (email: string) => void;
}

export function ForgotPasswordForm({
  error,
  info,
  isSubmitting,
  defaultEmail = '',
  onSubmit,
  onBack,
  onEmailChange
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState<string | undefined>();

  const normalizedEmail = email.toLowerCase().trim();
  const { secondsLeft, isCooldownActive, startCooldown } = useOtpCountdown({
    storageKey: normalizedEmail
      ? `amanah_otp_cooldown_forgot-password_${normalizedEmail}`
      : 'amanah_otp_cooldown_forgot-password',
    defaultSeconds: 60,
    autoStart: Boolean(info && normalizedEmail)
  });

  function handleEmailChange(value: string) {
    setEmail(value);
    onEmailChange?.(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCooldownActive) return;

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    setEmailError(undefined);
    try {
      await onSubmit(parsed.data);
      startCooldown(60);
    } catch {
      // Error ditangani di parent flow
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
      <FieldGroup className='gap-4'>
        <AuthStatusAlert message={info} tone='info' />
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
          disabled={isSubmitting || isCooldownActive}
        />
      </FieldGroup>

      <Button type='submit' className='w-full' disabled={isSubmitting || isCooldownActive}>
        {isSubmitting ? (
          <span className='inline-flex items-center gap-1.5'>
            <Icons.spinner className='size-3.5 animate-spin' />
            Mengirim tautan...
          </span>
        ) : isCooldownActive ? (
          `Kirim ulang tautan (${secondsLeft}s)`
        ) : info ? (
          'Kirim ulang tautan'
        ) : (
          'Kirim tautan pemulihan'
        )}
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
