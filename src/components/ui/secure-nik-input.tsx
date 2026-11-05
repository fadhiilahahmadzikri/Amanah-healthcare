'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SecureNikInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  autoMaskSeconds?: number;
}

export const SecureNikInput = React.forwardRef<HTMLInputElement, SecureNikInputProps>(
  (
    {
      className,
      value,
      onChange,
      disabled,
      error,
      autoMaskSeconds = 15,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [countdown, setCountdown] = React.useState<number | null>(null);

    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

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

    React.useEffect(() => {
      return () => clearTimers();
    }, [clearTimers]);

    const handleToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isVisible) {
        setIsVisible(false);
        clearTimers();
      } else {
        setIsVisible(true);
        if (autoMaskSeconds > 0) {
          clearTimers();
          setCountdown(autoMaskSeconds);

          intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev === null || prev <= 1) {
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          timerRef.current = setTimeout(() => {
            setIsVisible(false);
            clearTimers();
          }, autoMaskSeconds * 1000);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow digits and max 16 chars
      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = raw;
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className='relative flex items-center w-full'>
        <Input
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          inputMode='numeric'
          autoComplete='off'
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'font-mono tracking-wider',
            isVisible && countdown !== null ? 'pr-16' : 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          maxLength={16}
          {...props}
        />
        <div className='absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 shrink-0'>
          {isVisible && countdown !== null && countdown > 0 && (
            <span
              className='text-[10px] font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium select-none pointer-events-none'
              title={`NIK akan otomatis disensor dalam ${countdown} detik`}
            >
              {countdown}s
            </span>
          )}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            disabled={disabled}
            onClick={handleToggle}
            className='h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 rounded'
            tabIndex={-1}
            title={isVisible ? 'Sembunyikan NIK' : 'Tampilkan NIK (Otomatis disensor setelah 15s)'}
            aria-label={isVisible ? 'Sembunyikan NIK' : 'Tampilkan NIK (Otomatis disensor setelah 15s)'}
          >
            {isVisible ? (
              <Icons.eyeOff className='h-4 w-4 text-primary' />
            ) : (
              <Icons.eye className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    );
  }
);

SecureNikInput.displayName = 'SecureNikInput';
