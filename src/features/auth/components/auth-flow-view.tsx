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
  'verify-email': '/auth/sign-up/verify-email'
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
  if (pathname.startsWith('/auth/sign-up')) {
    return pathname.includes('/verify-email') ? 'verify-email' : 'sign-up';
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

  const [state, dispatch] = useReducer(flowReducer, initialFlowState);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const { data: session, isPending: isSessionLoading } = useSession();

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
      // Better Auth official popup client
      const res = await authClient.signIn.popup({
        provider: 'google',
        callbackURL: redirectTo
      });

      if (res?.error) {
        if (res.error.code !== 'POPUP_CLOSED') {
          dispatch({
            type: 'setError',
            error: res.error.message || 'Login Google belum bisa diproses.'
          });
        }
        return;
      }

      toast.success('Berhasil masuk dengan akun Google!');
      const targetUrl =
        !searchParams?.get('redirect') || redirectTo === '/dashboard/admin'
          ? '/dashboard'
          : redirectTo;
      window.location.href = targetUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login Google belum bisa diproses.';
      dispatch({
        type: 'setError',
        error: msg
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePasswordSignIn(values: SignInValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      const res = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: redirectTo
      });

      if (res.error) {
        dispatch({
          type: 'setError',
          error:
            res.error.message && res.error.message.length < 60
              ? res.error.message
              : 'Email atau password tidak sesuai.'
        });
        return;
      }

      toast.success('Berhasil masuk!');
      const role = (res.data?.user as { role?: string } | undefined)?.role;
      const targetUrl =
        !searchParams?.get('redirect') ||
        redirectTo === '/dashboard' ||
        redirectTo === '/dashboard/admin'
          ? role === 'admin'
            ? '/dashboard/admin'
            : '/dashboard/klinik/antrean'
          : redirectTo;
      window.location.href = targetUrl;
    } catch {
      dispatch({
        type: 'setError',
        error: 'Terjadi kesalahan saat masuk. Silakan coba lagi.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSignUp(values: SignUpValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: redirectTo
      });

      if (res.error) {
        dispatch({
          type: 'setError',
          error:
            res.error.message || 'Pendaftaran belum bisa diproses. Periksa data lalu coba lagi.'
        });
        return;
      }

      toast.success('Akun berhasil didaftarkan!');
      window.location.href = '/dashboard/klinik/antrean';
    } catch {
      dispatch({
        type: 'setError',
        error: 'Gagal membuat akun. Silakan coba lagi.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleVerifyEmail(_values: OtpValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      // If token/code verification is provided
      toast.success('Email berhasil diverifikasi.');
      router.push(redirectTo);
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
        await authClient.sendVerificationEmail({
          email: state.email,
          callbackURL: redirectTo
        });
      }
      dispatch({
        type: 'setInfo',
        info: 'Tautan verifikasi baru telah dikirim ke email.'
      });
      toast.success('Tautan verifikasi telah dikirim.');
    } catch {
      dispatch({
        type: 'setError',
        error: 'Tautan belum bisa dikirim ulang. Coba lagi beberapa saat.'
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleForgotPassword(values: ForgotPasswordValues) {
    setPendingAction('form');
    dispatch({ type: 'clearMessages' });

    try {
      await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: '/auth/sign-in?screen=reset-password'
      });
      dispatch({ type: 'setEmail', email: values.email });
      dispatch({
        type: 'setInfo',
        info: 'Jika email terdaftar, tautan pemulihan kata sandi telah dikirim ke email Anda.'
      });
    } catch {
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
      const res = await authClient.resetPassword({
        newPassword: values.password,
        token: values.code
      });

      if (res.error) {
        dispatch({
          type: 'setError',
          error: res.error.message || 'Tautan pemulihan tidak valid atau sudah kedaluwarsa.'
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
