'use client';

import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { cn } from '@/lib/utils';
import type { ClinicalIntakeForm } from '../../types/clinic-essentials.types';

export interface ClinicalIntakeFormCardProps {
  form: ClinicalIntakeForm;
  canManage?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: (form: ClinicalIntakeForm) => void;
  onDelete: (form: ClinicalIntakeForm) => void;
  className?: string;
}

export function ClinicalIntakeFormCard({
  form,
  canManage = true,
  selected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  className
}: ClinicalIntakeFormCardProps) {
  const isActive = form.isActive !== false;

  return (
    <div
      className={cn(
        'group relative w-full bg-gradient-to-t from-primary/6 via-primary/[0.015] to-card dark:from-primary/12 dark:via-card dark:to-card text-card-foreground border border-border rounded-[20px] shadow-none hover:border-primary/60 hover:shadow-md overflow-hidden font-sans flex flex-col justify-between h-full p-3.5 sm:p-4 gap-2.5 select-none transition-all duration-200',
        !isActive && 'opacity-75 border-dashed bg-muted/10',
        selected && 'ring-2 ring-primary border-primary bg-primary/[0.03]',
        className
      )}
    >
      <div className='absolute bottom-0 left-0 right-0 h-[145px] pointer-events-none z-0 overflow-hidden'>
        <PixelTexture
          colorMode='theme'
          maskVariant='curved-convex'
          invertMask={true}
          opacity={0.24}
          density='medium'
          pixelSize={4.5}
          gap={1.5}
          height='100%'
        />
      </div>

      {/* Top Header */}
      <div className='relative z-1 flex items-start justify-between gap-2 w-full'>
        <div className='flex items-center gap-2.5 min-w-0'>
          {canManage && onToggleSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              className='data-[state=checked]:bg-primary shrink-0'
              aria-label={`Pilih ${form.name}`}
            />
          )}
          <div className='size-10 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center shrink-0'>
            <ShiftIconDisplay icon={form.iconName || 'clipboard-list'} size='md' />
          </div>
          <div className='min-w-0'>
            <h4
              className='truncate text-sm font-semibold text-foreground leading-tight'
              title={form.name}
            >
              {form.name}
            </h4>
            <p className='font-mono text-xs font-semibold text-primary pt-0.5 truncate'>
              {form.code}
            </p>
          </div>
        </div>

        <Badge
          variant='outline'
          className={cn(
            'shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium',
            isActive
              ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-destructive/40 text-destructive bg-destructive/10'
          )}
        >
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      </div>

      {/* Metadata Strip */}
      <div className='relative z-1 w-full border-t border-border/40 pt-2 text-xs'>
        <p className='line-clamp-2 text-muted-foreground min-h-[32px] leading-relaxed'>
          {form.description || 'Formulir intake anamnesis klinis standar.'}
        </p>
      </div>

      {/* Footer Actions */}
      <div className='relative z-1 flex items-center justify-between border-t border-border/40 pt-2 mt-auto w-full'>
        <div className='flex items-center gap-1.5 min-w-0'>
          <Badge variant='secondary' className='text-[10px] font-mono px-2 py-0.5 rounded-md'>
            {form.code}
          </Badge>
          <span className='text-[11px] text-muted-foreground truncate'>
            {form.iconName || 'clipboard-list'}
          </span>
        </div>

        {canManage && (
          <div className='flex items-center gap-1 shrink-0'>
            {onEdit && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => onEdit(form)}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Edit ${form.name}`}
              >
                <Pencil className='size-3.5' />
              </Button>
            )}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => onDelete(form)}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus / nonaktifkan ${form.name}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
