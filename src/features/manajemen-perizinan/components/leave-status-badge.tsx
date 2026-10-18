import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LeaveStatus } from '../api/types';

interface LeaveStatusBadgeProps {
  status: LeaveStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu Persetujuan',
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
  },
  approved: {
    label: 'Disetujui',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
  },
  rejected: {
    label: 'Ditolak',
    className:
      'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
  },
  cancelled: {
    label: 'Dibatalkan',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
  }
};

export function LeaveStatusBadge({ status, className }: LeaveStatusBadgeProps) {
  const normKey = (status || '').toLowerCase();
  const config = STATUS_CONFIG[normKey] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-border'
  };

  return (
    <Badge
      variant='outline'
      className={cn('font-medium text-xs px-2.5 py-0.5 rounded-full', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
