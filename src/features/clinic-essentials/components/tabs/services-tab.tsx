'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { ClinicServiceCard } from '../cards/clinic-service-card';
import type {
  ClinicService,
  ClinicalIntakeForm,
  ServiceCategory,
} from '../../types/clinic-essentials.types';

export interface ServicesTabProps {
  services: ClinicService[];
  totalCount: number;
  categories: ServiceCategory[];
  forms: ClinicalIntakeForm[];
  isLoading: boolean;
  canManage: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleActive: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  onEdit: (item: ClinicService) => void;
  onDelete: (item: ClinicService) => void;
  onOpenCreate: () => void;
  onResetFilter: () => void;
  cardGridClassName: string;
}

export function ServicesTab({
  services,
  totalCount,
  categories,
  forms,
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
}: ServicesTabProps) {
  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        title='Belum ada service medis'
        description='Daftarkan service medis klinik, lalu hubungkan dengan formulir pengkajian yang sesuai.'
        action={
          canManage ? (
            <Button
              size='sm'
              onClick={onOpenCreate}
              disabled={categories.length === 0}
              className='text-xs gap-1.5 h-8'
            >
              <Plus className='size-3.5' /> Tambah Service Medis
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title='Tidak ada service medis yang cocok'
        description='Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data.'
        resetAction={{ label: 'Reset Filter', onReset: onResetFilter }}
      />
    );
  }

  return (
    <div className={cardGridClassName}>
      {services.map((s) => (
        <ClinicServiceCard
          key={s.id}
          service={s}
          categories={categories}
          forms={forms}
          canManage={canManage}
          selected={selectedIds.includes(s.id)}
          isBulkingActive={selectedIds.length > 0}
          onToggleSelect={() => onToggleSelect(s.id)}
          onToggleActive={(newActive) => onToggleActive(s.id, newActive)}
          isTogglingActive={isTogglingActiveId === s.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
