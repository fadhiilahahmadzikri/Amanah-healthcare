'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MaternityStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function MaternityStatusBadge({
  status,
  className,
}: MaternityStatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toLowerCase();
  let colorClass =
    'border-sky-500/40 text-sky-700 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-300';

  if (normalized.includes('selesai') || normalized.includes('completed')) {
    colorClass =
      'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300';
  } else if (normalized.includes('batal') || normalized.includes('cancel')) {
    colorClass =
      'border-destructive/40 text-destructive bg-destructive/10 dark:text-destructive';
  } else if (normalized.includes('antre') || normalized.includes('menunggu')) {
    colorClass =
      'border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300';
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] px-2 py-0.5 rounded-full font-medium capitalize',
        colorClass,
        className,
      )}
    >
      {status}
    </Badge>
  );
}
