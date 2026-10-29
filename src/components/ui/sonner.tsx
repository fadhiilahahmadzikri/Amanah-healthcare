'use client';

import type { CSSProperties } from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const { toastOptions, ...toasterProps } = props;

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'color-mix(in oklab, var(--primary) 12%, var(--popover))',
          '--success-text': 'var(--popover-foreground)',
          '--success-border': 'color-mix(in oklab, var(--primary) 30%, var(--border))',
          '--info-bg': 'var(--popover)',
          '--info-text': 'var(--popover-foreground)',
          '--info-border': 'var(--border)',
          '--warning-bg': 'color-mix(in oklab, var(--chart-4) 14%, var(--popover))',
          '--warning-text': 'var(--popover-foreground)',
          '--warning-border': 'color-mix(in oklab, var(--chart-4) 35%, var(--border))',
          '--error-bg': 'color-mix(in oklab, var(--destructive) 14%, var(--popover))',
          '--error-text': 'var(--popover-foreground)',
          '--error-border': 'color-mix(in oklab, var(--destructive) 35%, var(--border))'
        } as CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        actionButtonStyle: {
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          ...toastOptions?.actionButtonStyle
        },
        cancelButtonStyle: {
          background: 'var(--muted)',
          color: 'var(--foreground)',
          ...toastOptions?.cancelButtonStyle
        },
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[custom=true]:bg-transparent data-[custom=true]:border-none data-[custom=true]:p-0 data-[custom=true]:shadow-none',
          title: 'group-[.toast]:text-foreground group-[.toast]:font-medium',
          description: 'group-[.toast]:text-muted-foreground whitespace-pre-line',
          icon: 'group-[.toast]:size-auto group-[.toast]:self-center group-[.toast]:mr-3.5',
          content:
            'group-[.toast]:flex group-[.toast]:flex-col group-[.toast]:gap-0.5 group-[.toast]:flex-1',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 text-xs font-medium px-2.5 py-1.5 rounded-md group-[.toast]:self-center',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:hover:bg-muted/80',
          ...toastOptions?.classNames
        }
      }}
      position='top-center'
      {...toasterProps}
    />
  );
};

export { Toaster };
