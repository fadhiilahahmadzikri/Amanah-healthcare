'use client';

import * as React from 'react';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type { FacilityUnit } from '../../types/clinic-essentials.types';

export interface FacilityUnitCardProps {
  unit: FacilityUnit;
  canManage?: boolean;
  selected?: boolean;
  isBulkingActive?: boolean;
  onToggleSelect?: () => void;
  onToggleActive?: (newActive: boolean) => void;
  isTogglingActive?: boolean;
  onEdit?: (unit: FacilityUnit) => void;
  onDelete: (unit: FacilityUnit) => void;
  onCardClick?: (unit: FacilityUnit) => void;
  className?: string;
}

export function FacilityUnitCard({
  unit,
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
}: FacilityUnitCardProps) {
  const isActive = unit.isActive !== false;
  const unitTypeName =
    unit.unitTypeName || (typeof unit.unitType === 'string' ? unit.unitType : 'Poliklinik');
  const { wrapperRef, containerProps } = useCardBulkingSlide({ selected, isBulkingActive });

  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      onCardClick(unit);
    } else if (onEdit) {
      onEdit(unit);
    }
  }, [onCardClick, onEdit, unit]);

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
                aria-label={`Pilih ${unit.name}`}
              />
            </div>
          )}
          <div className='flex items-center gap-2.5 min-w-0'>
            <EssentialCardIcon iconName={unit.iconName} fallback='building-2' />
            <div className='min-w-0'>
              <h4
                className='truncate text-sm font-semibold text-foreground leading-tight'
                title={unit.name}
              >
                {unit.name}
              </h4>
              <p className='text-xs text-muted-foreground pt-0.5 truncate'>{unitTypeName}</p>
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
      <div className='relative z-1 w-full border-t border-border/40 pt-2 space-y-1.5 text-xs'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Klasifikasi:</span>
          <span className='font-medium text-foreground capitalize truncate max-w-[140px]'>
            {unitTypeName}
          </span>
        </div>

        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Awalan Tiket:</span>
          {unit.queuePrefix ? (
            <Badge variant='secondary' className='text-[10px] font-mono px-1.5 py-0'>
              {unit.queuePrefix}
            </Badge>
          ) : (
            <span className='text-muted-foreground/60'>-</span>
          )}
        </div>

        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Lokasi:</span>
          <span className='font-medium text-foreground truncate max-w-[140px]'>
            {unit.floor ? `Lt. ${unit.floor}` : ''} {unit.location ? `(${unit.location})` : ''}
            {!unit.floor && !unit.location && '-'}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className='relative z-1 flex items-center justify-between border-t border-border/40 pt-2 mt-auto w-full'>
        <div className='flex items-center gap-1 min-w-0 text-muted-foreground group-hover:text-primary transition-colors'>
          <span className='text-[11px] font-medium truncate'>
            Lihat Kategori ({unit.categoryCount ?? (unit.categoryIds?.length || 0)})
          </span>
          <ChevronRight className='size-3.5 group-hover:translate-x-0.5 transition-transform' />
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
                  aria-label={`Ubah status ${unit.name}`}
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
                  onEdit(unit);
                }}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Edit ${unit.name}`}
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
                onDelete(unit);
              }}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus permanen ${unit.name}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
