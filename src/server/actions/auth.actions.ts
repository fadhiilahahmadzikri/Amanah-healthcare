'use server';

import { redirect } from 'next/navigation';
import {
  authEmailLoginRequestSchema,
  authForgotPasswordRequestSchema,
  authRegisterRequestSchema,
  authResetPasswordRequestSchema
} from '../contracts/auth/auth.request';
import { loginCommand } from '../services/auth/login.command';
import { registerCommand } from '../services/auth/register.command';
import { forgotPasswordCommand } from '../services/auth/forgot-password.command';
import { resetPasswordCommand } from '../services/auth/reset-password.command';
import { logoutCommand } from '../services/auth/logout.command';
import { invalidateTag } from '../cache/revalidate';
import { AUTH_ERROR_MESSAGES } from '@/constants/auth-errors';
import type { User } from '../domain/auth/auth.model';

export type ActionState<T = unknown> = {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly fieldErrors?: Record<string, string[]>;
  readonly errorCode?: string;
};

export async function loginAction(
  _prevState: ActionState<User> | null,
  input: FormData | { email?: unknown; password?: unknown }
): Promise<ActionState<User>> {
  const rawEmail = input instanceof FormData ? input.get('email') : input?.email;
  const rawPassword = input instanceof FormData ? input.get('password') : input?.password;

  const parsed = authEmailLoginRequestSchema.safeParse({
    email: rawEmail,
    password: rawPassword
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Mohon periksa data masukan Anda.'
    };
  }

  const result = await loginCommand(parsed.data);

  if (!result.ok) {
    const error = result.error;
    const genericAuthMessage = 'Email atau kata sandi yang Anda masukkan salah.';
    let userMessage = genericAuthMessage;

    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      userMessage = AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    } else if (error.code === 'SCHEMA_PARSE_ERROR' || error.code === 'INTERNAL_SERVER_ERROR') {
      userMessage = 'Terjadi kendala saat memproses login. Silakan coba lagi beberapa saat.';
    } else {
      // All credential failures return identical generic message to prevent account enumeration
      userMessage = genericAuthMessage;
    }

    return {
      success: false,
      message: userMessage,
      errorCode: error.code
    };
  }

  invalidateTag('auth:me');
  return {
    success: true,
    data: result.value
  };
}

export async function registerAction(
  _prevState: ActionState | null,
  input:
    | FormData
    | {
        email?: unknown;
        password?: unknown;
        firstName?: unknown;
        lastName?: unknown;
      }
): Promise<ActionState> {
  const rawEmail = input instanceof FormData ? input.get('email') : input?.email;
  const rawPassword = input instanceof FormData ? input.get('password') : input?.password;
  const rawFirstName = input instanceof FormData ? input.get('firstName') : input?.firstName;
  const rawLastName = input instanceof FormData ? input.get('lastName') : input?.lastName;

  const parsed = authRegisterRequestSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    firstName: rawFirstName,
    lastName: rawLastName
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Mohon lengkapi formulir pendaftaran dengan benar.'
    };
  }

  const result = await registerCommand(parsed.data);

  if (!result.ok) {
    const error = result.error;
    let userMessage = error.message;

    if (error.invalidParams && error.invalidParams.length > 0) {
      const firstParam = error.invalidParams[0];
      if (firstParam && AUTH_ERROR_MESSAGES[firstParam.reason]) {
        userMessage = AUTH_ERROR_MESSAGES[firstParam.reason];
      }
    } else if (AUTH_ERROR_MESSAGES[error.code]) {
      userMessage = AUTH_ERROR_MESSAGES[error.code];
    }

    return {
      success: false,
      message: userMessage,
      errorCode: error.code
    };
  }

  return {
    success: true,
    message: 'Pendaftaran berhasil. Silakan masuk dengan akun baru Anda.'
  };
}

export async function forgotPasswordAction(
  _prevState: ActionState | null,
  input: FormData | { email?: unknown }
): Promise<ActionState> {
  const rawEmail = input instanceof FormData ? input.get('email') : input?.email;
  const parsed = authForgotPasswordRequestSchema.safeParse({
    email: rawEmail
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Format alamat email tidak valid.'
    };
  }

  const result = await forgotPasswordCommand(parsed.data);

  if (!result.ok) {
    const error = result.error;
    let userMessage = error.message;

    if (error.invalidParams && error.invalidParams.length > 0) {
      const firstParam = error.invalidParams[0];
      if (firstParam && AUTH_ERROR_MESSAGES[firstParam.reason]) {
        userMessage = AUTH_ERROR_MESSAGES[firstParam.reason];
      }
    }

    return {
      success: false,
      message: userMessage,
      errorCode: error.code
    };
  }

  return {
    success: true,
    message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda.'
  };
}

export async function resetPasswordAction(
  _prevState: ActionState | null,
  input: FormData | { hash?: unknown; password?: unknown }
): Promise<ActionState> {
  const rawHash = input instanceof FormData ? input.get('hash') : input?.hash;
  const rawPassword = input instanceof FormData ? input.get('password') : input?.password;

  const parsed = authResetPasswordRequestSchema.safeParse({
    hash: rawHash,
    password: rawPassword
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Data reset kata sandi tidak valid.'
    };
  }

  const result = await resetPasswordCommand(parsed.data);

  if (!result.ok) {
    const error = result.error;
    let userMessage = error.message;

    if (error.invalidParams && error.invalidParams.length > 0) {
      const firstParam = error.invalidParams[0];
      if (firstParam && AUTH_ERROR_MESSAGES[firstParam.reason]) {
        userMessage = AUTH_ERROR_MESSAGES[firstParam.reason];
      }
    } else if (AUTH_ERROR_MESSAGES[error.code]) {
      userMessage = AUTH_ERROR_MESSAGES[error.code];
    }

    return {
      success: false,
      message: userMessage,
      errorCode: error.code
    };
  }

  return {
    success: true,
    message: 'Kata sandi berhasil diperbarui. Silakan masuk kembali.'
  };
}

export async function logoutAction(): Promise<void> {
  await logoutCommand();
  invalidateTag('auth:me');
  redirect('/auth/sign-in');
}
