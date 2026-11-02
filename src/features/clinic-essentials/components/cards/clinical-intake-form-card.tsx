'use client';

import * as React from 'react';
import { Pencil, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type { ClinicalIntakeForm } from '../../types/clinic-essentials.types';

export interface ClinicalIntakeFormCardProps {
  form: ClinicalIntakeForm;
  canManage?: boolean;
  selected?: boolean;
  isBulkingActive?: boolean;
  onToggleSelect?: () => void;
  onToggleActive?: (newActive: boolean) => void;
  isTogglingActive?: boolean;
  onOpenBuilder?: (form: ClinicalIntakeForm) => void;
  onEdit?: (form: ClinicalIntakeForm) => void;
  onDelete: (form: ClinicalIntakeForm) => void;
  onCardClick?: (form: ClinicalIntakeForm) => void;
  className?: string;
}

export function ClinicalIntakeFormCard({
  form,
  canManage = true,
  selected = false,
  isBulkingActive = false,
  onToggleSelect,
  onToggleActive,
  isTogglingActive = false,
  onOpenBuilder,
  onEdit,
  onDelete,
  onCardClick,
  className
}: ClinicalIntakeFormCardProps) {
  const isActive = form.isActive !== false;
  const { wrapperRef, containerProps } = useCardBulkingSlide({ selected, isBulkingActive });

  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      onCardClick(form);
    } else if (onEdit) {
      onEdit(form);
    }
  }, [onCardClick, onEdit, form]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  return (
    <div
      {...containerProps}
      role='button'
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative w-full bg-gradient-to-t from-primary/6 via-primary/[0.015] to-card dark:from-primary/12 dark:via-card dark:to-card text-card-foreground border border-border rounded-[20px] shadow-none hover:border-primary/60 hover:shadow-md overflow-hidden font-sans flex flex-col justify-between h-full p-3.5 sm:p-4 gap-2.5 select-none transition-all duration-200 cursor-pointer',
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
        <div className='flex items-center min-w-0'>
          {canManage && onToggleSelect && (
            <div
              ref={wrapperRef}
              className='overflow-hidden shrink-0 flex items-center justify-center opacity-0 -translate-x-3 w-0 mr-0'
            >
              <Checkbox
                checked={selected}
                onCheckedChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                className='data-[state=checked]:bg-primary shrink-0'
                aria-label={`Pilih ${form.name}`}
              />
            </div>
          )}
          <div className='flex items-center gap-2.5 min-w-0'>
            <EssentialCardIcon iconName={form.iconName} fallback='clipboard-list' />
            <div className='min-w-0'>
              <h4
                className='truncate text-sm font-semibold text-foreground leading-tight'
                title={form.name}
              >
                {form.name}
              </h4>
              <p className='text-xs text-muted-foreground pt-0.5 truncate'>
                {form.description || 'Formulir Pengkajian Pasien'}
              </p>
            </div>
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
          <span className='text-[11px] font-medium text-muted-foreground truncate'>
            Formulir Pengkajian
          </span>
        </div>

        {canManage && (
          <div className='flex items-center gap-2 shrink-0'>
            {onToggleActive && (
              <div
                className='flex items-center'
                title={
                  isActive
                    ? 'Status aktif (klik untuk nonaktifkan)'
                    : 'Status nonaktif (klik untuk aktifkan)'
                }
              >
                <Switch
                  checked={isActive}
                  onCheckedChange={onToggleActive}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isTogglingActive}
                  className='scale-80 origin-right'
                  aria-label={`Ubah status ${form.name}`}
                />
              </div>
            )}
            {onOpenBuilder && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBuilder(form);
                }}
                className='size-7 text-primary hover:text-primary hover:bg-primary/10 rounded-md cursor-pointer'
                title={`Buka Builder Formulir ${form.name}`}
              >
                <SlidersHorizontal className='size-3.5' />
              </Button>
            )}
            {onEdit && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(form);
                }}
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
              onClick={(e) => {
                e.stopPropagation();
                onDelete(form);
              }}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus permanen ${form.name}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
