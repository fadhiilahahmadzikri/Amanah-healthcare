'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { FacilityUnitTypeCard } from '../cards/facility-unit-type-card';
import type { FacilityUnitType } from '../../types/clinic-essentials.types';

export interface UnitTypesTabProps {
  unitTypes: FacilityUnitType[];
  totalCount: number;
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onEdit: (item: FacilityUnitType) => void;
  onDelete: (item: FacilityUnitType) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function UnitTypesTab({
  unitTypes,
  totalCount,
  isLoading,
  canManage,
  selectedIds,
  onToggleSelect,
  onToggleActive,
  isTogglingActiveId,
  onEdit,
  onDelete,
  onOpenCreate,
  onResetFilter,
  cardGridClassName,
}: UnitTypesTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada klasifikasi fasilitas terdaftar'
        description='Mulai dengan menambahkan klasifikasi tipe fasilitas (misal: Poliklinik Rawat Jalan, Ruang Rawat Inap, Departemen Medis).'
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah Klasifikasi
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (unitTypes.length === 0) {
    return (
      <EmptyState
        title='Tidak ada klasifikasi yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {unitTypes.map((ut) => (
        <FacilityUnitTypeCard
          key={ut.id}
          unitType={ut}
          canManage={canManage}
          selected={selectedIds.includes(ut.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(ut.id)}
          onToggleActive={(newActive) => onToggleActive(ut.id, newActive)}
          isTogglingActive={isTogglingActiveId === ut.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
