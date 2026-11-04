'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { FacilityUnitCard } from '../cards/facility-unit-card';
import type { FacilityUnit } from '../../types/clinic-essentials.types';

export interface UnitsTabProps {
  units: FacilityUnit[];
  totalCount: number;
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onCardClick: (item: FacilityUnit) => void;
  onEdit: (item: FacilityUnit) => void;
  onDelete: (item: FacilityUnit) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function UnitsTab({
  units,
  totalCount,
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
}: UnitsTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada poliklinik atau departemen'
        description='Mulai dengan menambahkan unit poliklinik pertama untuk operasional pelayanan kesehatan.'
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah Poliklinik
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (units.length === 0) {
    return (
      <EmptyState
        title='Tidak ada poliklinik yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {units.map((u) => (
        <FacilityUnitCard
          key={u.id}
          unit={u}
          canManage={canManage}
          selected={selectedIds.includes(u.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(u.id)}
          onToggleActive={(newActive) => onToggleActive(u.id, newActive)}
          isTogglingActive={isTogglingActiveId === u.id}
          onCardClick={onCardClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
