'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
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
  const searchParams = useSearchParams();
  const urlHash = searchParams?.get('hash') || '';
  const emailFromQuery = searchParams?.get('email') || '';
  const effectiveEmail = email || emailFromQuery;

  const [values, setValues] = useState<ResetPasswordValues>({
    code: urlHash,
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordValues, string>>
  >({});

  useEffect(() => {
    if (urlHash) {
      setValues((current) => ({ ...current, code: urlHash }));
    }
  }, [urlHash]);

  const hasTokenInUrl = Boolean(urlHash);

  function updateField<Key extends keyof ResetPasswordValues>(
    key: Key,
    value: ResetPasswordValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasTokenInUrl) {
      return;
    }

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

        {!hasTokenInUrl ? (
          <AuthStatusAlert message='Token reset kata sandi tidak ditemukan di URL. Silakan kirim ulang tautan pemulihan dari halaman Lupa Password.' />
        ) : (
          <p className='text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/60 leading-relaxed'>
            Tautan reset terverifikasi dari email. Silakan tentukan kata sandi baru untuk akun Anda.
          </p>
        )}

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
          showStrengthMeter={false}
          showRulesObserver={false}
          value={values.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />
      </FieldGroup>

      {effectiveEmail ? (
        <p className='text-muted-foreground text-center text-sm'>
          Reset password untuk <span className='text-foreground font-medium'>{effectiveEmail}</span>
          .
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
