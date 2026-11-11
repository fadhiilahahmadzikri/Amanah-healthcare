'use client';

import * as React from 'react';
import { Calendar, Copy, ExternalLink, Pencil, Radio, Sparkles, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type { AdminPromotion } from '../types/promotions.types';
import { PromoImage } from './PromoImage';
import { formatWibPeriod } from '../lib/schedule';

export interface AdminPromotionCardProps {
  promo: AdminPromotion;
  canManage?: boolean;
  selected?: boolean;
  isBulkingActive?: boolean;
  onToggleSelect?: () => void;
  onToggleActive?: (newActive: boolean) => void;
  isTogglingActive?: boolean;
  onEdit?: (promo: AdminPromotion) => void;
  onDuplicate?: (promo: AdminPromotion) => void;
  onDelete: (promo: AdminPromotion) => void;
  onCardClick?: (promo: AdminPromotion) => void;
  className?: string;
}

export function AdminPromotionCard({
  promo,
  canManage = true,
  selected = false,
  isBulkingActive = false,
  onToggleSelect,
  onToggleActive,
  isTogglingActive = false,
  onEdit,
  onDuplicate,
  onDelete,
  onCardClick,
  className
}: AdminPromotionCardProps) {
  const isPublished = promo.isPublished !== false;
  const { wrapperRef, containerProps } = useCardBulkingSlide({ selected, isBulkingActive });
  const scheduleText = formatWibPeriod(promo.startsAt, promo.endsAt);

  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      onCardClick(promo);
    } else if (onEdit) {
      onEdit(promo);
    }
  }, [onCardClick, onEdit, promo]);

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
                aria-label={`Pilih ${promo.title}`}
              />
            </div>
          )}
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='relative size-11 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/20 shadow-2xs'>
              {promo.imageValue ? (
                <PromoImage
                  src={promo.imageValue}
                  alt={promo.imageAlt || promo.title}
                  fallbackTitle={promo.title}
                  fallbackSummary={promo.summary}
                  aspectRatio='square'
                  className='size-full object-cover'
                />
              ) : (
                <div className='flex size-full items-center justify-center bg-primary/10 text-primary'>
                  <Tag className='size-5' />
                </div>
              )}
            </div>
            <div className='min-w-0'>
              <h4
                className='truncate text-sm font-semibold text-foreground leading-tight'
                title={promo.title}
              >
                {promo.title}
              </h4>
              <div className='flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground truncate'>
                <span>P:{promo.priority}</span>
                {promo.serviceName ? (
                  <>
                    <span>•</span>
                    <span className='truncate text-primary font-medium flex items-center gap-1'>
                      <Sparkles className='size-2.5 shrink-0' />
                      {promo.serviceName}
                    </span>
                  </>
                ) : (
                  <>
                    <span>•</span>
                    <span>Umum</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Badge
          variant='outline'
          className={cn(
            'shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium',
            promo.status === 'live' &&
              'border-primary/40 text-primary bg-primary/10',
            promo.status === 'scheduled' &&
              'border-blue-500/40 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300',
            promo.status === 'draft' &&
              'border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300',
            promo.status === 'expired' &&
              'border-slate-500/40 text-slate-600 bg-slate-50 dark:bg-slate-900/40 dark:text-slate-400',
            promo.status === 'archived' &&
              'border-rose-500/40 text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-300'
          )}
        >
          {promo.status === 'live' && 'Tayang'}
          {promo.status === 'scheduled' && 'Terjadwal'}
          {promo.status === 'draft' && 'Draf'}
          {promo.status === 'expired' && 'Berakhir'}
          {promo.status === 'archived' && 'Arsip'}
        </Badge>
      </div>

      {/* Metadata Strip */}
      <div className='relative z-1 w-full border-t border-border/40 pt-2 space-y-1.5 text-xs'>
        {promo.summary && (
          <p className='text-muted-foreground line-clamp-2 leading-relaxed text-[11px]'>
            {promo.summary}
          </p>
        )}

        {/* Placements */}
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tampil di:</span>
          <div className='flex flex-wrap items-center gap-1 justify-end max-w-[170px]'>
            {promo.showBanner && (
              <Badge variant='outline' className='text-[9px] px-1.5 py-0 bg-muted/30'>
                Banner
              </Badge>
            )}
            {promo.showModal && (
              <Badge variant='outline' className='text-[9px] px-1.5 py-0 bg-muted/30'>
                Modal ({promo.modalFrequency})
              </Badge>
            )}
            {promo.showSection && (
              <Badge variant='outline' className='text-[9px] px-1.5 py-0 bg-muted/30'>
                Section
              </Badge>
            )}
            {!promo.showBanner && !promo.showModal && !promo.showSection && (
              <span className='text-[10px] text-muted-foreground/60 italic'>Nonaktif</span>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Periode:</span>
          <div className='flex items-center gap-1 text-[10px] font-medium text-foreground truncate max-w-[160px]'>
            <Calendar className='size-2.5 text-primary shrink-0' />
            <span className='truncate'>{scheduleText}</span>
          </div>
        </div>

        {/* Broadcast Indicator */}
        {promo.broadcastToUsers && (
          <div className='flex items-center justify-between text-primary'>
            <span>Broadcast:</span>
            <div className='flex items-center gap-1 text-[10px] font-medium'>
              <Radio className='size-2.5 shrink-0' />
              <span>
                {promo.broadcastAt
                  ? new Date(promo.broadcastAt).toLocaleDateString('id-ID')
                  : 'Antrean'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className='relative z-1 flex items-center justify-between border-t border-border/40 pt-2 mt-auto w-full'>
        <div className='flex items-center gap-1 min-w-0 text-muted-foreground group-hover:text-primary transition-colors'>
          {promo.ctaUrl ? (
            <>
              <ExternalLink className='size-3 shrink-0' />
              <span className='text-[11px] font-medium truncate max-w-[130px]' title={promo.ctaUrl}>
                {promo.ctaLabel || promo.ctaUrl}
              </span>
            </>
          ) : (
            <span className='text-[11px] text-muted-foreground/60 italic'>Tanpa Link CTA</span>
          )}
        </div>

        {canManage && (
          <div className='flex items-center gap-2 shrink-0'>
            {onToggleActive && (
              <div
                className='flex items-center'
                title={
                  isPublished
                    ? 'Status terbit (klik untuk nonaktifkan)'
                    : 'Status draf (klik untuk aktifkan)'
                }
              >
                <Switch
                  checked={isPublished}
                  onCheckedChange={onToggleActive}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isTogglingActive}
                  className='scale-80 origin-right'
                  aria-label={`Ubah status ${promo.title}`}
                />
              </div>
            )}
            {onDuplicate && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(promo);
                }}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Duplikasi ${promo.title}`}
              >
                <Copy className='size-3.5' />
              </Button>
            )}
            {onEdit && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(promo);
                }}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Edit ${promo.title}`}
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
                onDelete(promo);
              }}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus promosi ${promo.title}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
