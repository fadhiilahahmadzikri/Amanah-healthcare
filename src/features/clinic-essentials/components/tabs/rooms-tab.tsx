'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { FacilityRoomCard } from '../cards/facility-room-card';
import type { FacilityRoom, FacilityUnit } from '../../types/clinic-essentials.types';

export interface RoomsTabProps {
  rooms: FacilityRoom[];
  totalCount: number;
  units: FacilityUnit[];
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onEdit: (item: FacilityRoom) => void;
  onDelete: (item: FacilityRoom) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function RoomsTab({
  rooms,
  totalCount,
  units,
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
}: RoomsTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada ruang periksa'
        description='Tambahkan ruangan periksa atau konsultasi dan hubungkan ke unit poliklinik induk.'
        action={
          canManage ? (
            <Button
              size='sm'
              onClick={onOpenCreate}
              disabled={units.length === 0}
              className='text-xs gap-1.5 h-8'
            >
              <Plus className='size-3.5' /> Tambah Ruang Periksa
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        title='Tidak ada ruang periksa yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {rooms.map((r) => (
        <FacilityRoomCard
          key={r.id}
          room={r}
          units={units}
          canManage={canManage}
          selected={selectedIds.includes(r.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(r.id)}
          onToggleActive={(newActive) => onToggleActive(r.id, newActive)}
          isTogglingActive={isTogglingActiveId === r.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
