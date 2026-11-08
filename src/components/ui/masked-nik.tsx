'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { clientFetch } from '@/lib/client-fetch';

export interface MaskedNikProps {
  /** The full NIK if available in memory */
  nik?: string | null;
  /** The pre-masked NIK from backend */
  maskedNik?: string | null;
  /** Patient ID used for lazy unmasking via authenticated API */
  patientId?: string | null;
  /** Whether the eye toggle button is enabled */
  allowUnmask?: boolean;
  /** Number of seconds before automatic re-masking (default: 15, 0 to disable) */
  autoMaskSeconds?: number;
  /** Custom class name */
  className?: string;
  /** Display size */
  size?: 'sm' | 'default';
  /** Show copy icon */
  showCopy?: boolean;
}

export function formatMaskedNik(raw?: string | null): string {
  if (!raw || !raw.trim()) return '-';
  return '••••••••••••••••';
}

export const MaskedNik: React.FC<MaskedNikProps> = ({
  nik,
  maskedNik,
  patientId,
  allowUnmask = true,
  autoMaskSeconds = 15,
  className,
  size = 'default',
  showCopy = true
}) => {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [unmaskedValue, setUnmaskedValue] = React.useState<string | null>(nik || null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync prop changes
  React.useEffect(() => {
    if (nik) {
      setUnmaskedValue(nik);
    }
  }, [nik]);

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  const handleToggleReveal = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isRevealed) {
      clearTimers();
      setIsRevealed(false);
      return;
    }

    // Need to fetch unmasked value lazily if missing
    if (!unmaskedValue && patientId) {
      try {
        setIsLoading(true);
        const res = await clientFetch<{
          success?: boolean;
          data?: { nik?: string | null };
        }>(`/api/v1/patients/affiliations/${patientId}/unmask-nik`);

        const fetchedNik = res?.data?.nik || null;
        if (fetchedNik) {
          setUnmaskedValue(fetchedNik);
        }
      } catch (err) {
        console.error('Gagal mengambil NIK asli:', err);
      } finally {
        setIsLoading(false);
      }
    }

    setIsRevealed(true);

    if (autoMaskSeconds > 0) {
      setCountdown(autoMaskSeconds);

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        setIsRevealed(false);
        clearTimers();
      }, autoMaskSeconds * 1000);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const valueToCopy =
      isRevealed && unmaskedValue ? unmaskedValue : unmaskedValue || maskedNik || '';
    if (!valueToCopy) return;

    navigator.clipboard.writeText(valueToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = React.useMemo(() => {
    if (isRevealed) {
      return unmaskedValue || nik || maskedNik || '-';
    }
    return formatMaskedNik(nik || maskedNik);
  }, [isRevealed, unmaskedValue, maskedNik, nik]);

  const isSmall = size === 'sm';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-mono select-all transition-colors',
        isSmall ? 'text-[11px]' : 'text-xs',
        isRevealed ? 'text-primary font-semibold' : 'text-foreground',
        className
      )}
    >
      <span className='tracking-wider'>{displayText}</span>

      {countdown !== null && (
        <span
          className='text-[9px] font-sans px-1 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium'
          title={`NIK akan tertutup otomatis dalam ${countdown} detik`}
        >
          {countdown}s
        </span>
      )}

      {allowUnmask && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className={cn(
            'p-0 h-5 w-5 text-muted-foreground hover:text-foreground shrink-0 rounded transition-transform active:scale-95',
            isSmall && 'h-4 w-4'
          )}
          onClick={handleToggleReveal}
          disabled={isLoading}
          title={isRevealed ? 'Sembunyikan NIK' : 'Tampilkan NIK (Otomatis tertutup 15s)'}
          aria-label={isRevealed ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
        >
          {isLoading ? (
            <Icons.spinner className='h-3 w-3 animate-spin' />
          ) : isRevealed ? (
            <Icons.eyeOff className='h-3.5 w-3.5 text-primary' />
          ) : (
            <Icons.eye className='h-3.5 w-3.5' />
          )}
        </Button>
      )}

      {showCopy && isRevealed && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className={cn(
            'p-0 h-5 w-5 text-muted-foreground hover:text-foreground shrink-0 rounded',
            isSmall && 'h-4 w-4'
          )}
          onClick={handleCopy}
          title={copied ? 'Tersalin!' : 'Salin NIK'}
          aria-label='Salin NIK'
        >
          {copied ? (
            <Icons.check className='h-3 w-3 text-emerald-500' />
          ) : (
            <Icons.copy className='h-3 w-3' />
          )}
        </Button>
      )}
    </div>
  );
};
