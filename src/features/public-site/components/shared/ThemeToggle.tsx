'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/features/public-site/components/ui/button';
import { cn } from '@/features/public-site/lib/helpers';

const THEME_STORAGE_KEY = 'amanah-theme';

type ThemePreference = 'light' | 'dark';

type ThemeToggleProps = {
  className?: string;
};

function getSystemTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'light';
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function getInitialTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'light';
  }

  let savedTheme: string | null = null;

  try {
    savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    savedTheme = null;
  }

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return getSystemTheme();
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') {
    return;
  }

  const publicSiteRoot = document.querySelector<HTMLElement>('.public-site-scope');
  publicSiteRoot?.classList.toggle('dark', theme === 'dark');

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still applies for the current session when storage is unavailable.
  }
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemePreference>(getInitialTheme);
  const label = theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

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
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      <SunIcon aria-hidden className='hidden dark:block' />
      <MoonIcon aria-hidden className='block dark:hidden' />
    </Button>
  );
}
