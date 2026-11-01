'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { ClinicServiceCard } from '../cards/clinic-service-card';
import { LinkServicesDialog } from './link-services-dialog';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type {
  ClinicalIntakeForm,
  ClinicService,
  FacilityUnit,
  ServiceCategory
} from '../../types/clinic-essentials.types';

export interface CategoryServicesDialogProps {
  category: ServiceCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ClinicService[];
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  units: FacilityUnit[];
  canManage?: boolean;
  onAddServiceToCategory?: (category: ServiceCategory) => void;
  onEditService?: (service: ClinicService) => void;
  onDeleteService?: (service: ClinicService) => void;
  onToggleServiceActive?: (service: ClinicService, newActive: boolean) => void;
  isTogglingActive?: boolean;
}

export function CategoryServicesDialog({
  category,
  open,
  onOpenChange,
  services,
  categories,
  forms,
  units,
  canManage = true,
  onAddServiceToCategory: _onAddServiceToCategory,
  onEditService,
  onDeleteService,
  onToggleServiceActive,
  isTogglingActive = false
}: CategoryServicesDialogProps) {
  const queryClient = useQueryClient();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [optimisticUnlinkedIds, setOptimisticUnlinkedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (open) {
      setOptimisticUnlinkedIds(new Set());
    }
  }, [open, category?.id]);

  const categoryServices = React.useMemo(() => {
    if (!category) return [];
    return services.filter(
      (s) =>
        !optimisticUnlinkedIds.has(s.id) &&
        (s.serviceCategoryId === category.id || Boolean(s.categoryIds?.includes(category.id)))
    );
  }, [category, services, optimisticUnlinkedIds]);

  const currentLinkedIds = React.useMemo(() => {
    return categoryServices.map((s) => s.id);
  }, [categoryServices]);

  const unlinkMutation = useMutation({
    mutationFn: async (service: ClinicService) => {
      if (!category) return;
      setOptimisticUnlinkedIds((prev) => new Set(prev).add(service.id));
      return await clinicEssentialsApi.unlinkServiceFromCategory(category.id, service.id);
    },
    onSuccess: async (_, service) => {
      toast.success(`Service '${service.name}' berhasil dilepas dari kelompok.`);
      await queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      await queryClient.refetchQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown, service) => {
      setOptimisticUnlinkedIds((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
      const msg = err instanceof Error ? err.message : 'Gagal melepas service dari kelompok';
      toast.error(msg);
    }
  });

  if (!category) return null;

  const parentUnit = units.find((u) => u.id === category.unitId);
  const unitLabel = parentUnit?.name || 'Umum (Semua Poliklinik)';

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
              iconName={category.iconName}
              fallback='folder'
              className='size-8 text-primary shrink-0'
            />
            <div className='min-w-0 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground truncate'>
                {category.name}
              </h3>
              <p className='text-xs text-muted-foreground line-clamp-1'>
                Tersedia {categoryServices.length} layanan medis di {unitLabel}
                {category.description ? ` • ${category.description}` : ''}
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
              Tambah Service
            </Button>
          )}
        </div>

        {/* Body: Services Grid */}
        <div className='py-4 overflow-y-auto max-h-[62vh] pr-1'>
          {categoryServices.length === 0 ? (
            <EmptyState
              title='Belum Ada Service Medis'
              description={`Kelompok layanan "${category.name}" belum memiliki service medis yang terhubung.`}
              resetAction={
                canManage
                  ? {
                      label: 'Tautkan Service Sekarang',
                      onReset: () => setIsLinkDialogOpen(true)
                    }
                  : undefined
              }
              className='min-h-[220px] py-8 rounded-2xl border-dashed border-border/70 bg-muted/10'
            />
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1'>
              {categoryServices.map((service) => (
                <ClinicServiceCard
                  key={service.id}
                  service={service}
                  categories={categories}
                  forms={forms}
                  canManage={canManage}
                  onEdit={onEditService}
                  onUnlink={(srv) => unlinkMutation.mutate(srv)}
                  onDelete={onDeleteService || (() => {})}
                  onToggleActive={(newActive) => onToggleServiceActive?.(service, newActive)}
                  isTogglingActive={isTogglingActive || unlinkMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground'>
          <span>
            Klik tombol rantai untuk melepas service dari kelompok ini tanpa menghapus service.
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

      {/* Link Existing Services Dialog */}
      {isLinkDialogOpen && (
        <LinkServicesDialog
          category={category}
          open={isLinkDialogOpen}
          onOpenChange={setIsLinkDialogOpen}
          allServices={services}
          currentLinkedServiceIds={currentLinkedIds}
        />
      )}
    </>
  );
}
