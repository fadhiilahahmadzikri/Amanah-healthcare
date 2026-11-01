'use client';

import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type { FacilityUnit, ServiceCategory } from '../../types/clinic-essentials.types';

export interface ServiceCategoryCardProps {
  category: ServiceCategory;
  units: FacilityUnit[];
  canManage?: boolean;
  selected?: boolean;
  isBulkingActive?: boolean;
  onToggleSelect?: () => void;
  onToggleActive?: (newActive: boolean) => void;
  isTogglingActive?: boolean;
  onEdit?: (category: ServiceCategory) => void;
  onDelete: (category: ServiceCategory) => void;
  onCardClick?: (category: ServiceCategory) => void;
  className?: string;
}

export function ServiceCategoryCard({
  category,
  units,
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
}: ServiceCategoryCardProps) {
  const isActive = category.isActive !== false;
  const parentUnit = units.find((u) => u.id === category.unitId);
  const { wrapperRef, containerProps } = useCardBulkingSlide({ selected, isBulkingActive });

  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      onCardClick(category);
    } else if (onEdit) {
      onEdit(category);
    }
  }, [onCardClick, onEdit, category]);

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
                aria-label={`Pilih ${category.name}`}
              />
            </div>
          )}
          <div className='flex items-center gap-2.5 min-w-0'>
            <EssentialCardIcon iconName={category.iconName} fallback='folder' />
            <div className='min-w-0'>
              <h4
                className='truncate text-sm font-semibold text-foreground leading-tight'
                title={category.name}
              >
                {category.name}
              </h4>
              <p className='text-xs text-muted-foreground pt-0.5 truncate'>
                {parentUnit?.name || 'Kelompok Layanan'}
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
      <div className='relative z-1 w-full border-t border-border/40 pt-2 space-y-1.5 text-xs'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Unit Terafiliasi:</span>
          <Badge variant='outline' className='text-[10px] font-normal truncate max-w-[140px]'>
            {parentUnit?.name || 'Umum (Semua Unit)'}
          </Badge>
        </div>

        {category.description && (
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>Keterangan:</span>
            <span className='font-medium text-foreground truncate max-w-[140px]'>
              {category.description}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className='relative z-1 flex items-center justify-between border-t border-border/40 pt-2 mt-auto w-full'>
        <div className='flex items-center gap-1.5 min-w-0'>
          <span className='text-[11px] font-medium text-muted-foreground truncate'>
            Kelompok Layanan
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
                  aria-label={`Ubah status ${category.name}`}
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
                  onEdit(category);
                }}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Edit ${category.name}`}
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
                onDelete(category);
              }}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus permanen ${category.name}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
