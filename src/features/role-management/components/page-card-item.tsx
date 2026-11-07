'use client';

import * as React from 'react';
import { Unlink, GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { useCardBulkingSlide } from '@/hooks/use-card-bulking-slide';
import { cn } from '@/lib/utils';
import type { ApplicationPage } from '../types/role.types';

export interface PageCardItemProps {
  page: ApplicationPage;
  selected?: boolean;
  isBulkingActive?: boolean;
  canManage?: boolean;
  onToggleSelect?: (pageId: string) => void;
  onEdit?: (page: ApplicationPage) => void;
  onSelfDetach?: (page: ApplicationPage) => void;
  onToggleEnabled?: (pageId: string, isEnabled: boolean) => void;
  onDragStart?: (page: ApplicationPage) => void;
  onDragEnd?: () => void;
  onDropOnCard?: (draggedPageId: string, targetCardPage: ApplicationPage) => void;
  className?: string;
}

export function PageCardItem({
  page,
  selected = false,
  isBulkingActive = false,
  canManage = true,
  onToggleSelect,
  onEdit,
  onSelfDetach,
  onToggleEnabled,
  onDragStart,
  onDragEnd,
  onDropOnCard,
  className
}: PageCardItemProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isOverItem, setIsOverItem] = React.useState(false);
  const { wrapperRef, containerProps } = useCardBulkingSlide({
    selected,
    isBulkingActive
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canManage) return;
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', page.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(page);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsOverItem(false);
    onDragEnd?.();
  };

  const handleDragOverCard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOverItem) setIsOverItem(true);
  };

  const handleDragLeaveCard = () => {
    setIsOverItem(false);
  };

  const handleDropOnCard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverItem(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== page.id && onDropOnCard) {
      onDropOnCard(draggedId, page);
    }
  };

  const isChild = Boolean(page.parentPageId);

  return (
    <div
      {...containerProps}
      draggable={canManage}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOverCard}
      onDragLeave={handleDragLeaveCard}
      onDrop={handleDropOnCard}
      className={cn(
        'group relative flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors select-none gap-2 bg-muted/10',
        isOverItem && 'border-primary ring-2 ring-primary/40 bg-primary/[0.04]',
        selected
          ? 'border-primary ring-1 ring-primary bg-primary/[0.03]'
          : 'border-border/70 hover:bg-muted/20 hover:border-border',
        (!page.isEnabled || isDragging) && 'opacity-60',
        canManage && 'cursor-grab active:cursor-grabbing',
        className
      )}
    >
      <div className='flex items-center min-w-0 flex-1 gap-2'>
        {/* Bulking Selection Checkbox - Smooth GSAP Slide on Hover */}
        {canManage && onToggleSelect && (
          <div
            ref={wrapperRef}
            className='overflow-hidden shrink-0 flex items-center justify-center opacity-0 -translate-x-3 w-0 mr-0'
          >
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(page.id)}
              onClick={(e) => e.stopPropagation()}
              className='data-[state=checked]:bg-primary shrink-0 cursor-pointer'
              aria-label={`Pilih ${page.name}`}
            />
          </div>
        )}

        {/* Drag handle affordance indicator */}
        {canManage && (
          <GripVertical className='size-3 text-muted-foreground/30 group-hover:text-muted-foreground/70 shrink-0 transition-colors' />
        )}

        {/* Visual Emoji / Icon */}
        <ShiftIconDisplay
          icon={page.icon}
          fallback={page.name.charAt(0)}
          size='sm'
          bare
          className='shrink-0 text-muted-foreground'
        />

        {/* Page Name and Route / Alias */}
        <div className='min-w-0 flex-1 space-y-0.5'>
          <div
            className='text-xs font-semibold text-foreground truncate leading-tight'
            title={page.name}
          >
            {page.name}
          </div>
          <div className='font-mono text-[10px] text-muted-foreground truncate'>
            {page.customAlias ? (
              <span className='text-primary font-medium'>{page.customAlias}</span>
            ) : (
              page.routePath
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canManage && (
        <div className='shrink-0 flex items-center gap-0.5'>
          {/* Individual Unlink (Mengeluarkan Diri Sendiri dari Kategori) */}
          {isChild && onSelfDetach && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                onSelfDetach(page);
              }}
              title={`Keluarkan ${page.name} dari kategori (jadikan halaman mandiri)`}
            >
              <Unlink className='size-3' />
            </Button>
          )}

          {/* Edit Page Modal Trigger */}
          {onEdit && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full text-muted-foreground hover:text-foreground cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                onEdit(page);
              }}
              title={`Edit Halaman: ${page.name}`}
            >
              <Icons.edit className='size-3' />
            </Button>
          )}

          {/* CMS Availability Switch */}
          {onToggleEnabled && (
            <Switch
              className='scale-75'
              checked={page.isEnabled}
              onCheckedChange={(val) => onToggleEnabled(page.id, val)}
              aria-label={`Toggle CMS ${page.name}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
