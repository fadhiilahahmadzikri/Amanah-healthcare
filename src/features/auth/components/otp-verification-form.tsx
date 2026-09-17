'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { AuthOtpField } from './auth-otp-field';
import { AuthStatusAlert } from './auth-status-alert';
import { otpSchema } from '../schemas/auth-form-schemas';
import type { OtpValues } from '../schemas/auth-form-schemas';

interface OtpVerificationFormProps {
  email?: string;
  error?: string | null;
  info?: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: OtpValues) => Promise<void>;
  onResend?: () => Promise<void>;
  onBack: () => void;
}

export function OtpVerificationForm({
  email,
  error,
  info,
  isSubmitting,
  submitLabel,
  onSubmit,
  onResend,
  onBack
}: OtpVerificationFormProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setCodeError(parsed.error.flatten().fieldErrors.code?.[0]);
      return;
    }

    setCodeError(undefined);
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
      <FieldGroup className='gap-4'>
        <AuthStatusAlert message={info} tone='info' />
        <AuthStatusAlert message={error} />
        <AuthOtpField value={code} onChange={setCode} error={codeError} disabled={isSubmitting} />
      </FieldGroup>

      {email ? (
        <p className='text-muted-foreground text-center text-sm'>
          Kode dikirim ke <span className='text-foreground font-medium'>{email}</span>.
        </p>
      ) : null}

      <Button type='submit' className='w-full' disabled={isSubmitting}>
        {isSubmitting ? 'Memverifikasi...' : submitLabel}
      </Button>
      {onResend ? (
        <Button
          type='button'
          variant='ghost'
          className='w-full'
          onClick={onResend}
          disabled={isSubmitting}
        >
          Kirim ulang kode
        </Button>
      ) : null}
      <Button
        type='button'
        variant='ghost'
        className='w-full'
        onClick={onBack}
        disabled={isSubmitting}
      >
        Kembali
      </Button>
    </form>
  );
}
