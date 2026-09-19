'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useOtpCountdown } from '../hooks/use-otp-countdown';
import { resendOtpAction } from '@/server/actions/auth.actions';
import { Icons } from '@/components/icons';

interface ResendOtpButtonProps {
  email: string;
  type: 'email-verification' | 'forgot-password';
  onSuccess?: (message: string) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  autoStartIfEmpty?: boolean;
}

export function ResendOtpButton({
  email,
  type,
  onSuccess,
  onError,
  className,
  variant = 'ghost',
  size = 'sm',
  autoStartIfEmpty = true
}: ResendOtpButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const normalizedEmail = email.toLowerCase().trim();
  const { secondsLeft, isCooldownActive, startCooldown } = useOtpCountdown({
    storageKey: `amanah_otp_cooldown_${type}_${normalizedEmail}`,
    defaultSeconds: 60,
    autoStart: autoStartIfEmpty && Boolean(normalizedEmail)
  });

  async function handleResend() {
    if (isCooldownActive || isLoading || !email) return;

    setIsLoading(true);
    try {
      const res = await resendOtpAction(email, type);

      if (res.success) {
        const cooldown = res.cooldownSeconds ?? 60;
        if (cooldown > 0) {
          startCooldown(cooldown);
        }
        toast.success(res.message);
        onSuccess?.(res.message);
      } else {
        if (res.retryAfter) {
          startCooldown(res.retryAfter);
          toast.warning(res.message);
        } else {
          toast.error(res.message);
        }
        onError?.(res.message);
      }
    } catch {
      const fallbackMsg = 'Gagal mengirim ulang kode. Coba beberapa saat lagi.';
      toast.error(fallbackMsg);
      onError?.(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type='button'
      variant={variant}
      size={size}
      onClick={handleResend}
      disabled={isCooldownActive || isLoading || !email}
      className={className}
    >
      {isLoading ? (
        <span className='inline-flex items-center gap-1.5'>
          <Icons.spinner className='size-3.5 animate-spin' />
          Mengirim...
        </span>
      ) : isCooldownActive ? (
        `Kirim ulang kode (${secondsLeft}s)`
      ) : (
        'Kirim ulang kode'
      )}
    </Button>
  );
}
