'use client';

import * as React from 'react';
import { Search, Link2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { EssentialCardIcon } from '../../utils/essential-icon-resolver';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type { ClinicService, ServiceCategory } from '../../types/clinic-essentials.types';

export interface LinkServicesDialogProps {
  category: ServiceCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allServices: ClinicService[];
  currentLinkedServiceIds: string[];
  onSuccess?: () => void;
}

export function LinkServicesDialog({
  category,
  open,
  onOpenChange,
  allServices,
  currentLinkedServiceIds,
  onSuccess
}: LinkServicesDialogProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Filter available services that are NOT yet linked to this category
  const availableServices = React.useMemo(() => {
    const linkedSet = new Set(currentLinkedServiceIds);
    return allServices.filter((s) => !linkedSet.has(s.id));
  }, [allServices, currentLinkedServiceIds]);

  const filteredServices = React.useMemo(() => {
    if (!search.trim()) return availableServices;
    const q = search.toLowerCase().trim();
    return availableServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.shortName && s.shortName.toLowerCase().includes(q)) ||
        (s.codePrefix && s.codePrefix.toLowerCase().includes(q))
    );
  }, [availableServices, search]);

  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [open]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredServices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredServices.map((s) => s.id)));
    }
  };

  const linkMutation = useMutation({
    mutationFn: async () => {
      const serviceIds = Array.from(selectedIds);
      return await clinicEssentialsApi.linkServicesToCategory(category.id, serviceIds);
    },
    onSuccess: async (data) => {
      toast.success(
        `Berhasil menautkan ${data.linked || selectedIds.size} service medis ke kelompok '${category.name}'.`
      );
      await queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      await queryClient.refetchQueries({ queryKey: clinicEssentialsKeys.all });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menautkan service ke kelompok';
      toast.error(msg);
    }
  });

  return (
    <ModalWrapper
      isOpen={open}
      onClose={() => onOpenChange(false)}
      maxWidth='max-w-xl'
      className='relative flex flex-col h-auto max-h-[85dvh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-xl my-auto shadow-2xl font-sans'
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-3 border-b border-border/60 pb-3.5'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Tautkan Service ke Kelompok
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Hubungkan service medis yang sudah ada ke kelompok{' '}
            <span className='font-semibold text-foreground'>{category.name}</span>.
          </p>
        </div>
      </div>

      {/* Search & Bulk Select Toolbar */}
      <div className='pt-3 pb-2 space-y-2'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Cari nama service medis...'
            className='pl-9 h-9 text-xs'
          />
        </div>

        {filteredServices.length > 0 && (
          <div className='flex items-center justify-between text-xs px-1 text-muted-foreground'>
            <span>Menampilkan {filteredServices.length} service yang belum terhubung</span>
            <button
              type='button'
              onClick={toggleSelectAll}
              className='text-primary hover:underline font-medium'
            >
              {selectedIds.size === filteredServices.length ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>
          </div>
        )}
      </div>

      {/* Service List */}
      <div className='overflow-y-auto max-h-[46vh] py-1 space-y-1.5 pr-1'>
        {filteredServices.length === 0 ? (
          <EmptyState
            title='Tidak Ada Service Tersedia'
            description={
              search.trim()
                ? 'Tidak ditemukan service yang cocok dengan pencarian Anda.'
                : 'Seluruh service medis yang terdaftar sudah terhubung ke kelompok ini.'
            }
            className='min-h-[180px] py-6 rounded-xl border-dashed border-border/70 bg-muted/10'
          />
        ) : (
          filteredServices.map((service) => {
            const isSelected = selectedIds.has(service.id);
            return (
              <div
                key={service.id}
                role='button'
                tabIndex={0}
                onClick={() => toggleSelect(service.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelect(service.id);
                  }
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs'
                    : 'border-border/60 hover:border-border hover:bg-muted/30'
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(service.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <EssentialCardIcon
                  iconName={service.iconName}
                  fallback='stethoscope'
                  className='size-4 text-muted-foreground shrink-0'
                />
                <div className='min-w-0 flex-1'>
                  <span className='text-xs font-semibold text-foreground truncate block'>
                    {service.name}
                  </span>
                  {service.description && (
                    <p className='text-[11px] text-muted-foreground truncate'>
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between border-t border-border/60 pt-3.5 mt-2'>
        <span className='text-xs text-muted-foreground font-medium'>
          {selectedIds.size} service dipilih
        </span>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='pill'
            onClick={() => onOpenChange(false)}
            disabled={linkMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type='button'
            size='sm'
            shape='pill'
            disabled={selectedIds.size === 0 || linkMutation.isPending}
            onClick={() => linkMutation.mutate()}
            className='h-8 text-xs font-semibold'
          >
            <Link2 className='size-3.5 mr-1.5' />
            {linkMutation.isPending ? 'Menautkan...' : `Tautkan (${selectedIds.size}) Service`}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
