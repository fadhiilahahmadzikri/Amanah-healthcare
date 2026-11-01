'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { ServiceCategoryCard } from '../cards/service-category-card';
import { LinkCategoriesDialog } from './link-categories-dialog';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type { FacilityUnit, ServiceCategory } from '../../types/clinic-essentials.types';

export interface UnitCategoriesDialogProps {
  unit: FacilityUnit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  units: FacilityUnit[];
  canManage?: boolean;
  onEditCategory?: (category: ServiceCategory) => void;
  onDeleteCategory?: (category: ServiceCategory) => void;
  onToggleCategoryActive?: (category: ServiceCategory, newActive: boolean) => void;
  isTogglingActive?: boolean;
  onViewCategoryServices?: (category: ServiceCategory) => void;
}

export function UnitCategoriesDialog({
  unit,
  open,
  onOpenChange,
  categories,
  units,
  canManage = true,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryActive,
  isTogglingActive = false,
  onViewCategoryServices
}: UnitCategoriesDialogProps) {
  const queryClient = useQueryClient();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [optimisticUnlinkedIds, setOptimisticUnlinkedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (open) {
      setOptimisticUnlinkedIds(new Set());
    }
  }, [open, unit?.id]);

  const unitCategories = React.useMemo(() => {
    if (!unit) return [];
    return categories.filter((c) => {
      if (optimisticUnlinkedIds.has(c.id)) return false;
      const isLinkedViaUnit = Boolean(unit.categoryIds?.includes(c.id));
      const isLinkedViaCategory = Boolean(
        c.unitIds?.includes(unit.id) ||
        c.units?.some((u) => u.id === unit.id) ||
        c.unitId === unit.id
      );
      return isLinkedViaUnit || isLinkedViaCategory;
    });
  }, [unit, categories, optimisticUnlinkedIds]);

  const currentLinkedIds = React.useMemo(() => {
    return unitCategories.map((c) => c.id);
  }, [unitCategories]);

  const unlinkMutation = useMutation({
    mutationFn: async (category: ServiceCategory) => {
      if (!unit) return;
      setOptimisticUnlinkedIds((prev) => new Set(prev).add(category.id));
      return await clinicEssentialsApi.unlinkCategoryFromUnit(unit.id, category.id);
    },
    onSuccess: async (_, category) => {
      toast.success(
        `Kelompok layanan '${category.name}' berhasil dilepas dari unit '${unit?.name}'.`
      );
      await queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      await queryClient.refetchQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown, category) => {
      setOptimisticUnlinkedIds((prev) => {
        const next = new Set(prev);
        next.delete(category.id);
        return next;
      });
      const msg = err instanceof Error ? err.message : 'Gagal melepas kelompok layanan dari unit';
      toast.error(msg);
    }
  });

  if (!unit) return null;

  const unitClassification =
    unit.unitTypeName || (typeof unit.unitType === 'string' ? unit.unitType : 'Poliklinik');

  return (
    <>
      <ModalWrapper
        isOpen={open}
        onClose={() => onOpenChange(false)}
        maxWidth='max-w-4xl lg:max-w-5xl'
        className='relative flex flex-col h-auto max-h-[90dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-4xl lg:max-w-5xl my-auto shadow-2xl transition-[max-width] duration-300 ease-out font-sans'
      >
        {/* Header */}
        <div className='flex items-start justify-between gap-3 border-b border-border/60 pb-4'>
          <div className='flex items-center gap-3 min-w-0'>
            <EssentialCardIcon
              iconName={unit.iconName}
              fallback='building-2'
              className='size-8 text-primary shrink-0'
            />
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground truncate'>
                {unit.name}
              </h3>
              <p className='text-xs text-muted-foreground line-clamp-1'>
                Terhubung ke {unitCategories.length} kelompok layanan • {unitClassification}
                {unit.queuePrefix ? ` • Awalan Tiket: ${unit.queuePrefix}` : ''}
              </p>
            </div>
          </div>

          {canManage && (
            <Button
              type='button'
              size='sm'
              shape='pill'
              onClick={() => setIsLinkDialogOpen(true)}
              className='shrink-0 h-8 text-xs font-semibold'
            >
              <Plus className='size-3.5 mr-1' />
              Tautkan Kelompok
            </Button>
          )}
        </div>

        {/* Body: Categories Grid */}
        <div className='py-4 overflow-y-auto max-h-[62vh] pr-1'>
          {unitCategories.length === 0 ? (
            <EmptyState
              title='Belum Ada Kelompok Layanan'
              description={`Unit poliklinik "${unit.name}" belum memiliki kelompok layanan yang terhubung.`}
              resetAction={
                canManage
                  ? {
                      label: 'Tautkan Kelompok Sekarang',
                      onReset: () => setIsLinkDialogOpen(true)
                    }
                  : undefined
              }
              className='min-h-[220px] py-8 rounded-2xl border-dashed border-border/70 bg-muted/10'
            />
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1'>
              {unitCategories.map((category) => (
                <ServiceCategoryCard
                  key={category.id}
                  category={category}
                  units={units}
                  canManage={canManage}
                  onEdit={onEditCategory}
                  onUnlink={(cat) => unlinkMutation.mutate(cat)}
                  onDelete={onDeleteCategory || (() => {})}
                  onCardClick={onViewCategoryServices}
                  onToggleActive={(newActive) => onToggleCategoryActive?.(category, newActive)}
                  isTogglingActive={isTogglingActive || unlinkMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground'>
          <span>
            Klik tombol rantai untuk melepas kelompok layanan dari unit ini tanpa menghapusnya.
          </span>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='pill'
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </div>
      </ModalWrapper>

      {/* Link Existing Categories Dialog */}
      {isLinkDialogOpen && (
        <LinkCategoriesDialog
          unit={unit}
          open={isLinkDialogOpen}
          onOpenChange={setIsLinkDialogOpen}
          allCategories={categories}
          currentLinkedCategoryIds={currentLinkedIds}
        />
      )}
    </>
  );
}
