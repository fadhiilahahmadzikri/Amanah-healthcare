'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function SectionTitle({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-0.5 pb-2 border-b border-border/40', className)}>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function FormSubheading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'text-xs font-semibold text-muted-foreground block uppercase tracking-wider',
        className,
      )}
    >
      {children}
    </span>
  );
}
