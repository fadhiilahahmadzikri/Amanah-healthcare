import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password terlalu panjang');

export const signInSchema = z.object({
  email: z.string().email('Masukkan email yang valid'),
  password: z.string().min(1, 'Password wajib diisi')
});

export const signInOtpSchema = z.object({
  email: z.string().email('Masukkan email yang valid')
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
    email: z.string().email('Masukkan email yang valid'),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword']
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Masukkan email yang valid')
});

export const otpSchema = z.object({
  code: z.string().length(6, 'Kode OTP harus 6 digit')
});

export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Kode OTP harus 6 digit'),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword']
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignInOtpValues = z.infer<typeof signInOtpSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
