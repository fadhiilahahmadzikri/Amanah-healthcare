'use client';

import { useEffect, useReducer, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AuthFormShell } from './auth-form-shell';
import { AuthLegalCopy } from './auth-legal-copy';
import { AuthSplitLayout } from './auth-split-layout';
import { ForgotPasswordForm } from './forgot-password-form';
import { OtpVerificationForm } from './otp-verification-form';
import { ResetPasswordForm } from './reset-password-form';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form-custom';
import { safeRedirect } from '@/lib/safe-redirect';
import { authClient, useSession } from '@/lib/auth-client';
import {
  loginAction,
  forgotPasswordAction,
  resetPasswordAction
} from '@/server/actions/auth.actions';
import type {
  ForgotPasswordValues,
  OtpValues,
  ResetPasswordValues,
  SignInValues,
  SignUpValues
} from '../schemas/auth-form-schemas';

type AuthScreen = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password' | 'verify-email';

type PendingAction = 'form' | 'oauth' | null;

interface FlowState {
  email: string;
  info: string | null;
  error: string | null;
}

type FlowAction =
  | { type: 'setEmail'; email: string }
  | { type: 'setInfo'; info: string | null }
  | { type: 'setError'; error: string | null }
  | { type: 'clearMessages' };

const AUTH_REDIRECT_FALLBACK = '/dashboard';

const SCREEN_PATHS: Record<AuthScreen, string> = {
  'sign-in': '/auth/sign-in',
  'sign-up': '/auth/sign-up',
  'forgot-password': '/auth/sign-in/forgot-password',
  'reset-password': '/auth/sign-in/reset-password',
  'verify-email': '/verify-otp'
};

const SCREEN_COPY: Record<
  AuthScreen,
  {
    title: string;
    description: string;
    footer: React.ReactNode;
  }
> = {
  'sign-in': {
    title: 'Masuk ke Amanah',
    description: 'Masukkan email dan password atau akun Google Anda untuk melanjutkan.',
    footer: <AuthLegalCopy />
  },
  'sign-up': {
    title: 'Buat akun baru',
    description: 'Daftar untuk mengakses layanan kesehatan dan dashboard klinik.',
    footer: <AuthLegalCopy />
  },
  'forgot-password': {
    title: 'Lupa password?',
    description: 'Masukkan email akun Anda untuk menerima tautan pemulihan kata sandi.',
    footer: 'Tautan pemulihan berlaku sementara demi keamanan akun.'
  },
  'reset-password': {
    title: 'Atur ulang password',
    description: 'Masukkan password baru untuk akun Anda.',
    footer: 'Setelah password diubah, silakan masuk kembali dengan password baru.'
  },
  'verify-email': {
    title: 'Verifikasi email',
    description: 'Periksa kotak masuk email Anda untuk menyelesaikan verifikasi akun.',
    footer: 'Tautan verifikasi berlaku selama 24 jam demi keamanan akun.'
  }
};

const initialFlowState: FlowState = {
  email: '',
  info: null,
  error: null
};

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'setEmail':
      return { ...state, email: action.email };
    case 'setInfo':
      return { ...state, info: action.info, error: null };
    case 'setError':
      return { ...state, error: action.error };
    case 'clearMessages':
      return { ...state, info: null, error: null };
  }
}

function getScreenFromPath(pathname: string): AuthScreen {
  if (pathname.includes('/verify-otp') || pathname.includes('/verify-email')) {
    return 'verify-email';
  }
  if (pathname.startsWith('/auth/sign-up')) {
    return 'sign-up';
  }

  if (pathname.includes('/forgot-password')) return 'forgot-password';
  if (pathname.includes('/reset-password')) return 'reset-password';

  return 'sign-in';
}

export function AuthFlowView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [screen, setScreen] = useState<AuthScreen>(() => getScreenFromPath(pathname));

  const redirectParam = searchParams.get('redirect_url') || searchParams.get('redirect');
  const redirectTo = safeRedirect(redirectParam, AUTH_REDIRECT_FALLBACK);

  const emailParam = searchParams.get('email');
  const [state, dispatch] = useReducer(flowReducer, {
    ...initialFlowState,
    email: emailParam || ''
  });
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const { data: session, isPending: isSessionLoading } = useSession();

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail && qEmail !== state.email) {
      dispatch({ type: 'setEmail', email: qEmail });
    }
  }, [searchParams, state.email]);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!isSessionLoading && session?.user) {
      router.replace(redirectTo);
    }
  }, [isSessionLoading, session, redirectTo, router]);

  // Synchronize screen state if browser navigation occurs
  useEffect(() => {
    const matched = getScreenFromPath(pathname);
    setScreen(matched);
  }, [pathname]);

  useEffect(() => {
    function handlePopState() {
      setScreen(getScreenFromPath(window.location.pathname));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function buildPath(target: AuthScreen) {
    const params = new URLSearchParams();
    if (redirectParam) params.set('redirect', redirectTo);
    const query = params.toString();
    return `${SCREEN_PATHS[target]}${query ? `?${query}` : ''}`;
  }

  function navigate(target: AuthScreen) {
    dispatch({ type: 'clearMessages' });
    setScreen(target);
    const newPath = buildPath(target);
    if (typeof window !== 'undefined' && window.location.pathname !== SCREEN_PATHS[target]) {
      window.history.pushState(null, '', newPath);
    }
  }

  const screenCopy = SCREEN_COPY[screen];

  async function handleGoogleAuth() {
    setPendingAction('oauth');
    dispatch({ type: 'clearMessages' });

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectTo || '/dashboard'
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login Google belum bisa diproses.';
      dispatch({
        type: 'setError',
        error: msg
      });
      setPendingAction(null);
    }
  }

  async function handlePasswordSignIn(values: SignInValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      // 1. Primary Authentication: Backend NestJS Kanonikal API via BFF
      const res = await loginAction(null, {
        email: values.email,
        password: values.password
      });

      if (res.success) {
        toast.success('Berhasil masuk!');
        const user = res.data;
        const targetUrl =
          !searchParams?.get('redirect') ||
          redirectTo === '/dashboard' ||
          redirectTo === '/dashboard/admin'
            ? user?.systemRole === 'ADMIN'
              ? '/dashboard/admin'
              : '/dashboard/klinik/antrean'
            : redirectTo;
        window.location.href = targetUrl;
        return;
      }

      // 2. Secondary/Fallback: Better Auth Engine (Local/OAuth Session)
      const betterAuthRes = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: redirectTo
      });

      if (!betterAuthRes.error) {
        toast.success('Berhasil masuk!');
        const role = (betterAuthRes.data?.user as { role?: string } | undefined)?.role;
        const targetUrl =
          !searchParams?.get('redirect') ||
          redirectTo === '/dashboard' ||
          redirectTo === '/dashboard/admin'
            ? role === 'admin'
              ? '/dashboard/admin'
              : '/dashboard/klinik/antrean'
            : redirectTo;
        window.location.href = targetUrl;
        return;
      }

      dispatch({
        type: 'setError',
        error: res.message || 'Email atau kata sandi yang Anda masukkan salah.'
      });
    } catch {
      dispatch({
        type: 'setError',
        error: 'Email atau kata sandi yang Anda masukkan salah.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSignUp(values: SignUpValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      // Pendaftaran manual via Better Auth dengan plugin emailOTP
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name
      });

      if (error) {
        dispatch({
          type: 'setError',
          error: error.message || 'Pendaftaran belum bisa diproses. Periksa data lalu coba lagi.'
        });
        return;
      }

      toast.success('Pendaftaran berhasil! Kode verifikasi OTP telah dikirim ke email Anda.');
      dispatch({ type: 'setEmail', email: values.email });
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch {
      dispatch({
        type: 'setError',
        error: 'Gagal membuat akun. Silakan coba lagi.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleVerifyEmail(values: OtpValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: state.email,
        otp: values.code
      });

      if (error) {
        dispatch({
          type: 'setError',
          error: 'Kode OTP salah atau telah kedaluwarsa.'
        });
        return;
      }

      toast.success('Email berhasil diverifikasi! Mengalihkan ke dashboard...');
      window.location.href = '/dashboard';
    } catch {
      dispatch({
        type: 'setError',
        error: 'Kode verifikasi tidak valid atau sudah kedaluwarsa.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleResendSignUpCode() {
    setPendingAction('form');

    try {
      if (state.email) {
        await authClient.emailOtp.sendVerificationOtp({
          email: state.email,
          type: 'email-verification'
        });
      }
      dispatch({
        type: 'setInfo',
        info: 'Kode OTP baru telah dikirim ke email Anda.'
      });
      toast.success('Kode OTP baru telah dikirim ke email Anda.');
    } catch {
      dispatch({
        type: 'setError',
        error: 'Kode OTP belum bisa dikirim ulang. Coba lagi beberapa saat.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleForgotPassword(values: ForgotPasswordValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      // 1. Primary: NestJS backend forgot password
      const res = await forgotPasswordAction(null, { email: values.email });
      dispatch({ type: 'setEmail', email: values.email });
      dispatch({
        type: 'setInfo',
        info:
          res.message ||
          'Jika email terdaftar, tautan pemulihan kata sandi telah dikirim ke email Anda.'
      });
    } catch {
      try {
        await authClient.requestPasswordReset({
          email: values.email,
          redirectTo: '/auth/sign-in?screen=reset-password'
        });
      } catch {
        // silent fallback
      }
      dispatch({ type: 'setEmail', email: values.email });
      dispatch({
        type: 'setInfo',
        info: 'Jika email terdaftar, tautan pemulihan kata sandi telah dikirim ke email Anda.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleResetPassword(values: ResetPasswordValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      // 1. Primary: Kanonikal Backend Reset Password
      const res = await resetPasswordAction(null, {
        hash: values.code,
        password: values.password
      });

      if (res.success) {
        toast.success('Password berhasil diperbarui. Silakan masuk.');
        navigate('sign-in');
        return;
      }

      // 2. Secondary fallback to Better Auth
      const betterAuthRes = await authClient.resetPassword({
        newPassword: values.password,
        token: values.code
      });

      if (betterAuthRes.error) {
        dispatch({
          type: 'setError',
          error:
            res.message ||
            betterAuthRes.error.message ||
            'Tautan pemulihan tidak valid atau sudah kedaluwarsa.'
        });
        return;
      }

      toast.success('Password berhasil diperbarui. Silakan masuk.');
      navigate('sign-in');
    } catch {
      dispatch({
        type: 'setError',
        error: 'Password belum bisa diperbarui. Coba lagi.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  function renderScreen() {
    const isSubmitting = pendingAction === 'form';
    const isOAuthSubmitting = pendingAction === 'oauth';

    switch (screen) {
      case 'sign-up':
        return (
          <SignUpForm
            error={state.error}
            defaultEmail={state.email}
            isSubmitting={isSubmitting}
            isOAuthSubmitting={isOAuthSubmitting}
            onSignUp={handleSignUp}
            onGoogleSignUp={handleGoogleAuth}
            onSignIn={() => navigate('sign-in')}
            onEmailChange={(email) => dispatch({ type: 'setEmail', email })}
          />
        );
      case 'verify-email':
        return (
          <OtpVerificationForm
            email={state.email}
            error={state.error}
            info={state.info}
            isSubmitting={isSubmitting}
            submitLabel='Verifikasi dan Aktifkan Akun'
            onSubmit={handleVerifyEmail}
            onResend={handleResendSignUpCode}
            onBack={() => navigate('sign-up')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            error={state.error}
            defaultEmail={state.email}
            isSubmitting={isSubmitting}
            onSubmit={handleForgotPassword}
            onBack={() => navigate('sign-in')}
            onEmailChange={(email) => dispatch({ type: 'setEmail', email })}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            email={state.email}
            error={state.error}
            info={state.info}
            isSubmitting={isSubmitting}
            onSubmit={handleResetPassword}
            onBack={() => navigate('sign-in')}
          />
        );
      case 'sign-in':
      default:
        return (
          <SignInForm
            error={state.error}
            defaultEmail={state.email}
            isSubmitting={isSubmitting}
            isOAuthSubmitting={isOAuthSubmitting}
            onPasswordSignIn={handlePasswordSignIn}
            onGoogleSignIn={handleGoogleAuth}
            onForgotPassword={() => navigate('forgot-password')}
            onSignUp={() => navigate('sign-up')}
            onEmailChange={(email) => dispatch({ type: 'setEmail', email })}
          />
        );
    }
  }

  return (
    <AuthSplitLayout>
      <AuthFormShell
        title={screenCopy.title}
        description={screenCopy.description}
        footer={screenCopy.footer}
      >
        {renderScreen()}
      </AuthFormShell>
    </AuthSplitLayout>
  );
}
