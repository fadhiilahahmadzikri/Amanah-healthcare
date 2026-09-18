import 'server-only';
import { z } from 'zod';

export const authEmailLoginRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid.')
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Kata sandi wajib diisi.')
});

export const authForgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid.')
    .transform((val) => val.toLowerCase().trim())
});

export const authRegisterRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid.')
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
  firstName: z.string().min(1, 'Nama depan wajib diisi.'),
  lastName: z.string().default('')
});

export const authResetPasswordRequestSchema = z.object({
  hash: z.string().min(1, 'Token reset kata sandi tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.')
});

export type AuthEmailLoginRequest = z.infer<typeof authEmailLoginRequestSchema>;
export type AuthForgotPasswordRequest = z.infer<typeof authForgotPasswordRequestSchema>;
export type AuthRegisterRequest = z.infer<typeof authRegisterRequestSchema>;
export type AuthResetPasswordRequest = z.infer<typeof authResetPasswordRequestSchema>;
