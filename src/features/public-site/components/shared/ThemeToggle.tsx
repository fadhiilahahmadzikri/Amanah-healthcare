'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/features/public-site/components/ui/button';
import { cn } from '@/features/public-site/lib/helpers';

const THEME_STORAGE_KEY = 'amanah-theme';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const legacyTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (legacyTheme && !window.localStorage.getItem('theme')) {
        setTheme(legacyTheme);
      }
    } catch {
      // Storage unavailable
    }
  }, [setTheme]);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const label = isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap';

  const handleThemeToggle = useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch {
        // Storage unavailable
      }

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      if (e) {
        const x =
          e.clientX !== 0 || e.clientY !== 0
            ? e.clientX
            : (e.currentTarget as HTMLElement).getBoundingClientRect().left +
              (e.currentTarget as HTMLElement).getBoundingClientRect().width / 2;
        const y =
          e.clientX !== 0 || e.clientY !== 0
            ? e.clientY
            : (e.currentTarget as HTMLElement).getBoundingClientRect().top +
              (e.currentTarget as HTMLElement).getBoundingClientRect().height / 2;

        root.style.setProperty('--x', `${x}px`);
        root.style.setProperty('--y', `${y}px`);
      }

      document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newMode);
        });
        root.classList.toggle('dark', newMode === 'dark');
      });
    },
    [resolvedTheme, setTheme]
  );

  return (
    <Button
      type='button'
      size='icon'
      variant='ghost'
      className={cn(
        `
        size-10 rounded-xl border border-line text-muted-foreground shadow-xs
        hover:bg-accent hover:text-foreground
      `,
        className
      )}
      aria-label={label}
      onClick={handleThemeToggle}
      suppressHydrationWarning
    >
      <SunIcon aria-hidden className='hidden dark:block' />
      <MoonIcon aria-hidden className='block dark:hidden' />
    </Button>
  );
}
