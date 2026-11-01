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
import type { FacilityUnit, ServiceCategory } from '../../types/clinic-essentials.types';

export interface LinkCategoriesDialogProps {
  unit: FacilityUnit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allCategories: ServiceCategory[];
  currentLinkedCategoryIds: string[];
  onSuccess?: () => void;
}

export function LinkCategoriesDialog({
  unit,
  open,
  onOpenChange,
  allCategories,
  currentLinkedCategoryIds,
  onSuccess
}: LinkCategoriesDialogProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Filter available categories that are NOT yet linked to this poliklinik unit
  const availableCategories = React.useMemo(() => {
    const linkedSet = new Set(currentLinkedCategoryIds);
    return allCategories.filter((c) => !linkedSet.has(c.id));
  }, [allCategories, currentLinkedCategoryIds]);

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return availableCategories;
    const q = search.toLowerCase().trim();
    return availableCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || (c.codePrefix && c.codePrefix.toLowerCase().includes(q))
    );
  }, [availableCategories, search]);

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
    if (selectedIds.size === filteredCategories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCategories.map((c) => c.id)));
    }
  };

  const linkMutation = useMutation({
    mutationFn: async () => {
      const categoryIds = Array.from(selectedIds);
      return await clinicEssentialsApi.linkCategoriesToUnit(unit.id, categoryIds);
    },
    onSuccess: async (data) => {
      toast.success(
        `Berhasil menautkan ${data.linked || selectedIds.size} kelompok layanan ke unit '${unit.name}'.`
      );
      await queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      await queryClient.refetchQueries({ queryKey: clinicEssentialsKeys.all });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menautkan kelompok layanan ke unit';
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
            Tautkan Kelompok Layanan ke Unit
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Hubungkan kelompok layanan (bucket) yang sudah ada ke unit{' '}
            <span className='font-semibold text-foreground'>{unit.name}</span>.
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
            placeholder='Cari nama kelompok layanan...'
            className='pl-9 h-9 text-xs'
          />
        </div>

        {filteredCategories.length > 0 && (
          <div className='flex items-center justify-between text-xs px-1 text-muted-foreground'>
            <span>Menampilkan {filteredCategories.length} kelompok yang belum terhubung</span>
            <button
              type='button'
              onClick={toggleSelectAll}
              className='text-primary hover:underline font-medium'
            >
              {selectedIds.size === filteredCategories.length ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>
          </div>
        )}
      </div>

      {/* Category List */}
      <div className='overflow-y-auto max-h-[46vh] py-1 space-y-1.5 pr-1'>
        {filteredCategories.length === 0 ? (
          <EmptyState
            title='Tidak Ada Kelompok Tersedia'
            description={
              search.trim()
                ? 'Tidak ditemukan kelompok layanan yang cocok dengan pencarian Anda.'
                : 'Seluruh kelompok layanan yang terdaftar sudah terhubung ke unit ini.'
            }
            className='min-h-[180px] py-6 rounded-xl border-dashed border-border/70 bg-muted/10'
          />
        ) : (
          filteredCategories.map((category) => {
            const isSelected = selectedIds.has(category.id);
            return (
              <div
                key={category.id}
                role='button'
                tabIndex={0}
                onClick={() => toggleSelect(category.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelect(category.id);
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
                  onCheckedChange={() => toggleSelect(category.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <EssentialCardIcon
                  iconName={category.iconName}
                  fallback='folder'
                  className='size-4 text-muted-foreground shrink-0'
                />
                <div className='min-w-0 flex-1'>
                  <span className='text-xs font-semibold text-foreground truncate block'>
                    {category.name}
                  </span>
                  {category.description && (
                    <p className='text-[11px] text-muted-foreground truncate'>
                      {category.description}
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
          {selectedIds.size} kelompok dipilih
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
            {linkMutation.isPending ? 'Menautkan...' : `Tautkan (${selectedIds.size}) Kelompok`}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
