'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { ClinicFacilityCard } from '../cards/clinic-facility-card';
import type { ClinicFacilityItem } from '../../types/clinic-essentials.types';

export interface FacilitiesTabProps {
  facilities: ClinicFacilityItem[];
  totalCount: number;
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onCardClick?: (item: ClinicFacilityItem) => void;
  onEdit: (item: ClinicFacilityItem) => void;
  onDelete: (item: ClinicFacilityItem) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function FacilitiesTab({
  facilities,
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
  cardGridClassName
}: FacilitiesTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={6} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada fasilitas klinik'
        description='Tambahkan fasilitas unggulan seperti Ruang Bersalin, Apotek, Ruang Tunggu, atau Baby Care untuk ditampilkan di carousel landing page.'
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah Fasilitas
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (facilities.length === 0) {
    return (
      <EmptyState
        title='Tidak ada fasilitas klinik yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {facilities.map((f) => (
        <ClinicFacilityCard
          key={f.id}
          facility={f}
          canManage={canManage}
          selected={selectedIds.includes(f.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(f.id)}
          onToggleActive={(newActive) => onToggleActive(f.id, newActive)}
          isTogglingActive={isTogglingActiveId === f.id}
          onCardClick={onCardClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
