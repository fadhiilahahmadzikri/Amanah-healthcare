'use client';

import * as React from 'react';
import { HelpCircle, Layers, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type { SupportFaqItem } from '../../types/clinic-essentials.types';

export interface SupportFaqCardProps {
  faq: SupportFaqItem;
  canManage?: boolean;
  selected?: boolean;
  isBulkingActive?: boolean;
  onToggleSelect?: () => void;
  onToggleActive?: (newActive: boolean) => void;
  isTogglingActive?: boolean;
  onEdit?: (faq: SupportFaqItem) => void;
  onDelete: (faq: SupportFaqItem) => void;
  onCardClick?: (faq: SupportFaqItem) => void;
  className?: string;
}

export function SupportFaqCard({
  faq,
  canManage = true,
  selected = false,
  isBulkingActive = false,
  onToggleSelect,
  onToggleActive,
  isTogglingActive = false,
  onEdit,
  onDelete,
  onCardClick,
  className
}: SupportFaqCardProps) {
  const isPublished = faq.isPublished !== false;
  const { wrapperRef, containerProps } = useCardBulkingSlide({ selected, isBulkingActive });

  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      onCardClick(faq);
    } else if (onEdit) {
      onEdit(faq);
    }
  }, [onCardClick, onEdit, faq]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  const answerPreview = Array.isArray(faq.solutionSteps)
    ? faq.solutionSteps.join(' ')
    : String(faq.solutionSteps || '');

  return (
    <div
      {...containerProps}
      role='button'
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative w-full bg-gradient-to-t from-primary/6 via-primary/[0.015] to-card dark:from-primary/12 dark:via-card dark:to-card text-card-foreground border border-border rounded-[20px] shadow-none hover:border-primary/60 hover:shadow-md overflow-hidden font-sans flex flex-col justify-between h-full p-3.5 sm:p-4 gap-2.5 select-none transition-all duration-200 cursor-pointer',
        !isPublished && 'opacity-75 border-dashed bg-muted/10',
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
                aria-label={`Pilih ${faq.title}`}
              />
            </div>
          )}
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-2xs'>
              <HelpCircle className='size-5' />
            </div>
            <div className='min-w-0'>
              <h4
                className='truncate text-sm font-semibold text-foreground leading-tight'
                title={faq.title}
              >
                {faq.title}
              </h4>
              <p
                className='text-xs text-muted-foreground pt-0.5 truncate'
                title={`Kategori: ${faq.category}`}
              >
                Kategori: {faq.category}
              </p>
            </div>
          </div>
        </div>

        <Badge
          variant='outline'
          className={cn(
            'shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium',
            isPublished
              ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-destructive/40 text-destructive bg-destructive/10'
          )}
        >
          {isPublished ? 'Aktif' : 'Nonaktif'}
        </Badge>
      </div>

      {/* Metadata Strip */}
      <div className='relative z-1 w-full border-t border-border/40 pt-2 space-y-1.5 text-xs'>
        {answerPreview && (
          <div className='text-muted-foreground line-clamp-2 leading-relaxed text-[11px]'>
            {answerPreview}
          </div>
        )}

        <div className='flex items-center justify-between text-muted-foreground pt-0.5'>
          <span>Rute Halaman:</span>
          <div className='flex flex-wrap items-center gap-1 justify-end max-w-[170px]'>
            {faq.paths && faq.paths.length > 0 ? (
              faq.paths.slice(0, 2).map((p) => (
                <Badge
                  key={p}
                  variant='outline'
                  className='text-[9px] font-mono px-1.5 py-0 bg-muted/30'
                >
                  <MapPin className='size-2.5 mr-0.5' />
                  {p}
                </Badge>
              ))
            ) : (
              <span className='text-[10px] text-muted-foreground/60 italic'>Semua</span>
            )}
            {faq.paths && faq.paths.length > 2 && (
              <span className='text-[10px] text-muted-foreground'>+{faq.paths.length - 2}</span>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Relasi:</span>
          {faq.serviceName ? (
            <Badge
              variant='outline'
              className='gap-1 text-[10px] font-normal truncate max-w-[150px] text-primary border-primary/30 bg-primary/5'
            >
              <Layers className='size-2.5' />
              {faq.serviceName}
            </Badge>
          ) : faq.categoryName ? (
            <Badge variant='outline' className='text-[10px] font-normal truncate max-w-[150px]'>
              {faq.categoryName}
            </Badge>
          ) : (
            <span className='text-[11px] text-muted-foreground/60 italic'>Umum</span>
          )}
        </div>

        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Urutan Tampil:</span>
          <Badge variant='outline' className='text-[10px] font-mono px-1.5 py-0'>
            #{faq.displayOrder}
          </Badge>
        </div>
      </div>

      {/* Footer Actions */}
      <div className='relative z-1 flex items-center justify-between border-t border-border/40 pt-2 mt-auto w-full'>
        <div className='flex items-center gap-1 min-w-0 text-muted-foreground group-hover:text-primary transition-colors'>
          <span className='text-[11px] font-medium truncate'>
            {faq.paths?.length ?? 1} Rute Landing Page
          </span>
        </div>

        {canManage && (
          <div className='flex items-center gap-2 shrink-0'>
            {onToggleActive && (
              <div
                className='flex items-center'
                title={
                  isPublished
                    ? 'Status aktif (klik untuk nonaktifkan)'
                    : 'Status nonaktif (klik untuk aktifkan)'
                }
              >
                <Switch
                  checked={isPublished}
                  onCheckedChange={onToggleActive}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isTogglingActive}
                  className='scale-80 origin-right'
                  aria-label={`Ubah status ${faq.title}`}
                />
              </div>
            )}
            {onEdit && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(faq);
                }}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Edit ${faq.title}`}
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
                onDelete(faq);
              }}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus permanen ${faq.title}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
