'use client';

import * as React from 'react';
import Image from 'next/image';
import { Pencil, Trash2, Unlink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type {
  ClinicalIntakeForm,
  ClinicService,
  ServiceCategory
} from '../../types/clinic-essentials.types';

export interface ClinicServiceCardProps {
  service: ClinicService;
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  canManage?: boolean;
  selected?: boolean;
  isBulkingActive?: boolean;
  onToggleSelect?: () => void;
  onToggleActive?: (newActive: boolean) => void;
  isTogglingActive?: boolean;
  onEdit?: (service: ClinicService) => void;
  onUnlink?: (service: ClinicService) => void;
  onDelete: (service: ClinicService) => void;
  onCardClick?: (service: ClinicService) => void;
  className?: string;
}

export function ClinicServiceCard({
  service,
  categories,
  forms,
  canManage = true,
  selected = false,
  isBulkingActive = false,
  onToggleSelect,
  onToggleActive,
  isTogglingActive = false,
  onEdit,
  onUnlink,
  onDelete,
  onCardClick,
  className
}: ClinicServiceCardProps) {
  const isActive = service.isActive !== false;
  const linkedCategories = React.useMemo(() => {
    const ids =
      service.categoryIds && service.categoryIds.length > 0
        ? service.categoryIds
        : service.serviceCategoryId
          ? [service.serviceCategoryId]
          : [];
    return categories.filter((c) => ids.includes(c.id));
  }, [categories, service.categoryIds, service.serviceCategoryId]);
  const categoriesLabel =
    linkedCategories.length > 0 ? linkedCategories.map((c) => c.name).join(', ') : 'Service Medis';
  const linkedForm = forms.find((f) => f.id === service.intakeFormId);
  const { wrapperRef, containerProps } = useCardBulkingSlide({ selected, isBulkingActive });

  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      onCardClick(service);
    } else if (onEdit) {
      onEdit(service);
    }
  }, [onCardClick, onEdit, service]);

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
                aria-label={`Pilih ${service.name}`}
              />
            </div>
          )}
          <div className='flex items-center gap-2.5 min-w-0'>
            {service.imageUrl ? (
              <div className='relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/20 shadow-2xs'>
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  sizes='36px'
                  className='object-cover'
                />
              </div>
            ) : (
              <EssentialCardIcon iconName={service.iconName} fallback='stethoscope' />
            )}
            <div className='min-w-0'>
              <h4
                className='truncate text-sm font-semibold text-foreground leading-tight'
                title={service.name}
              >
                {service.name}
              </h4>
              <p
                className='text-xs text-muted-foreground pt-0.5 truncate'
                title={service.shortName || service.description || service.name}
              >
                {service.shortName ||
                  service.description ||
                  (service.codePrefix ? `Prefix: ${service.codePrefix}` : '')}
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
          <span>Kelompok:</span>
          {linkedCategories.length > 0 ? (
            linkedCategories.length === 1 ? (
              <Badge variant='outline' className='text-[10px] font-normal truncate max-w-[150px]'>
                {linkedCategories[0].name}
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='text-[10px] font-normal truncate max-w-[160px] text-primary border-primary/30 bg-primary/5'
                title={categoriesLabel}
              >
                {linkedCategories[0].name} +{linkedCategories.length - 1} Lainnya
              </Badge>
            )
          ) : (
            <span className='text-[11px] text-muted-foreground/60 italic'>Belum terhubung</span>
          )}
        </div>

        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Formulir Pengkajian:</span>
          {linkedForm ? (
            <Badge className='text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-1.5 py-0 truncate max-w-[140px]'>
              {linkedForm.name}
            </Badge>
          ) : (
            <span className='text-[11px] text-muted-foreground/60 italic'>Standar / Umum</span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className='relative z-1 flex items-center justify-between border-t border-border/40 pt-2 mt-auto w-full'>
        <div className='flex items-center gap-1.5 min-w-0'>
          {service.codePrefix && (
            <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground border border-border/40'>
              {service.codePrefix}
            </span>
          )}
          {service.complaints && service.complaints.length > 0 && (
            <span className='text-[11px] text-muted-foreground truncate'>
              {service.complaints.length} keluhan
            </span>
          )}
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
                  aria-label={`Ubah status ${service.name}`}
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
                  onEdit(service);
                }}
                className='size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer'
                title={`Edit ${service.name}`}
              >
                <Pencil className='size-3.5' />
              </Button>
            )}
            {onUnlink && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlink(service);
                }}
                className='size-7 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-md cursor-pointer'
                title={`Lepas ${service.name} dari kelompok ini`}
              >
                <Unlink className='size-3.5' />
              </Button>
            )}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation();
                onDelete(service);
              }}
              className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer'
              title={`Hapus permanen ${service.name}`}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
