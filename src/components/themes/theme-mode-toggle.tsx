'use client';

import { Icons } from '@/components/icons';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { flushSync } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';

export function ThemeModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const handleThemeToggle = React.useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='secondary'
          size='icon'
          className='group/toggle size-8'
          onClick={handleThemeToggle}
        >
          <Icons.brightness />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Toggle theme <Kbd>D D</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
