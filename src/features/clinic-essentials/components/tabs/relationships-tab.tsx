'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { PatientRelationshipTypeCard } from '../cards/patient-relationship-type-card';
import type { PatientRelationshipTypeItem } from '../../types/clinic-essentials.types';

export interface RelationshipsTabProps {
  relationships: PatientRelationshipTypeItem[];
  totalCount: number;
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onSetDefault: (item: PatientRelationshipTypeItem) => void;
  isSettingDefaultId?: string | null;
  onEdit: (item: PatientRelationshipTypeItem) => void;
  onDelete: (item: PatientRelationshipTypeItem) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function RelationshipsTab({
  relationships,
  totalCount,
  isLoading,
  canManage,
  selectedIds,
  onToggleSelect,
  onToggleActive,
  isTogglingActiveId,
  onSetDefault,
  isSettingDefaultId,
  onEdit,
  onDelete,
  onOpenCreate,
  onResetFilter,
  cardGridClassName,
}: RelationshipsTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada tipe relasi pasien terdaftar'
        description='Daftarkan opsi relasi profil atau keluarga agar dapat dipilih saat pendaftaran/booking berobat.'
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah Relasi
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (relationships.length === 0) {
    return (
      <EmptyState
        title='Tidak ada tipe relasi yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {relationships.map((r) => (
        <PatientRelationshipTypeCard
          key={r.id}
          relationship={r}
          canManage={canManage}
          selected={selectedIds.includes(r.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(r.id)}
          onToggleActive={(newActive) => onToggleActive(r.id, newActive)}
          isTogglingActive={isTogglingActiveId === r.id}
          onSetDefault={onSetDefault}
          isSettingDefault={isSettingDefaultId === r.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
