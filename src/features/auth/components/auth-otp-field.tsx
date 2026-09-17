'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface AuthOtpFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function AuthOtpField({ value, onChange, error, disabled }: AuthOtpFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor='otp-code'>Kode OTP</FieldLabel>
      <InputOTP
        id='otp-code'
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        containerClassName='justify-center'
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className='size-10 text-base' />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldDescription>Masukkan 6 digit kode yang dikirim ke email.</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
