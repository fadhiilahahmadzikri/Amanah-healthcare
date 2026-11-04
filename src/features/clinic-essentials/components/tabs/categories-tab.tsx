'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { ServiceCategoryCard } from '../cards/service-category-card';
import type { FacilityUnit, ServiceCategory } from '../../types/clinic-essentials.types';

export interface CategoriesTabProps {
  categories: ServiceCategory[];
  totalCount: number;
  units: FacilityUnit[];
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onCardClick: (item: ServiceCategory) => void;
  onEdit: (item: ServiceCategory) => void;
  onDelete: (item: ServiceCategory) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function CategoriesTab({
  categories,
  totalCount,
  units,
  isLoading,
  canManage,
  selectedIds,
  onToggleSelect,
  onToggleActive,
  isTogglingActiveId,
  onCardClick,
  onEdit,
  onDelete,
  onOpenCreate,
  onResetFilter,
  cardGridClassName,
}: CategoriesTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada kelompok layanan'
        description='Tambahkan kelompok kategori pelayanan medis untuk mempermudah pendaftaran dan penjadwalan dokter.'
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah Kelompok
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title='Tidak ada kelompok layanan yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {categories.map((c) => (
        <ServiceCategoryCard
          key={c.id}
          category={c}
          units={units}
          canManage={canManage}
          selected={selectedIds.includes(c.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(c.id)}
          onToggleActive={(newActive) => onToggleActive(c.id, newActive)}
          isTogglingActive={isTogglingActiveId === c.id}
          onCardClick={onCardClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
