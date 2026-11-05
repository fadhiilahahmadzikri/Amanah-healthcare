'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { DemographicMasterCard } from '../cards/demographic-master-card';
import { clinicEssentialsApi } from '../../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../../api/query-keys';
import type { DemographicMasterItem } from '../../types/clinic-essentials.types';

export interface DemographicMasterTabProps {
  resourceType: 'blood-types' | 'education-levels' | 'religions' | 'occupations';
  resourceLabel: string;
  iconName?: string;
  canManage?: boolean;
  searchQuery?: string;
  statusFilter?: string;
  selectedIds?: string[];
  isBulkingActive?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: DemographicMasterItem) => void;
  onDelete?: (item: DemographicMasterItem) => void;
  onToggleActive?: (id: string, newActive: boolean) => void;
  isTogglingActiveId?: string | null;
  cardGridClassName?: string;
  items?: DemographicMasterItem[];
  isLoading?: boolean;
}

export function DemographicMasterTab({
  resourceType,
  resourceLabel,
  iconName = 'tag',
  canManage = true,
  searchQuery = '',
  statusFilter = 'all',
  selectedIds = [],
  isBulkingActive = false,
  onToggleSelect,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onToggleActive,
  isTogglingActiveId,
  cardGridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5',
  items: externalItems,
  isLoading: externalLoading,
}: DemographicMasterTabProps) {
  const queryClient = useQueryClient();
  const [localDeletingItem, setLocalDeletingItem] = React.useState<DemographicMasterItem | null>(null);

  const queryKey = React.useMemo(() => {
    const params = { search: searchQuery || undefined, status: statusFilter !== 'all' ? statusFilter : undefined };
    switch (resourceType) {
      case 'blood-types':
        return clinicEssentialsKeys.bloodTypes(params);
      case 'education-levels':
        return clinicEssentialsKeys.educationLevels(params);
      case 'religions':
        return clinicEssentialsKeys.religions(params);
      case 'occupations':
        return clinicEssentialsKeys.occupations(params);
    }
  }, [resourceType, searchQuery, statusFilter]);

  const { data: internalItems = [], isLoading: internalLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      switch (resourceType) {
        case 'blood-types':
          return clinicEssentialsApi.getBloodTypes(params);
        case 'education-levels':
          return clinicEssentialsApi.getEducationLevels(params);
        case 'religions':
          return clinicEssentialsApi.getReligions(params);
        case 'occupations':
          return clinicEssentialsApi.getOccupations(params);
      }
    },
    enabled: externalItems === undefined,
  });

  const items = externalItems ?? internalItems;
  const isLoading = externalLoading ?? internalLoading;

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      switch (resourceType) {
        case 'blood-types':
          return clinicEssentialsApi.updateBloodType(id, { isActive });
        case 'education-levels':
          return clinicEssentialsApi.updateEducationLevel(id, { isActive });
        case 'religions':
          return clinicEssentialsApi.updateReligion(id, { isActive });
        case 'occupations':
          return clinicEssentialsApi.updateOccupation(id, { isActive });
      }
    },
    onSuccess: (data) => {
      toast.success(`Status '${data.name}' diubah menjadi ${data.isActive ? 'Aktif' : 'Nonaktif'}.`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...clinicEssentialsKeys.all, resourceType] });
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      switch (resourceType) {
        case 'blood-types':
          return clinicEssentialsApi.deleteBloodType(id);
        case 'education-levels':
          return clinicEssentialsApi.deleteEducationLevel(id);
        case 'religions':
          return clinicEssentialsApi.deleteReligion(id);
        case 'occupations':
          return clinicEssentialsApi.deleteOccupation(id);
      }
    },
    onSuccess: () => {
      toast.success(`${resourceLabel} berhasil dihapus.`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [...clinicEssentialsKeys.all, resourceType] });
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : `Gagal menghapus ${resourceLabel}`;
      toast.error(msg);
    },
  });

  if (isLoading) {
    return <EntityCardGridSkeleton count={8} className={cardGridClassName} />;
  }

  if (items.length === 0) {
    if (searchQuery || statusFilter !== 'all') {
      return (
        <EmptyState
          title={`Tidak ada ${resourceLabel.toLowerCase()} yang cocok`}
          description='Coba sesuaikan kata kunci pencarian atau filter status Anda.'
        />
      );
    }
    return (
      <EmptyState
        title={`Belum ada data ${resourceLabel.toLowerCase()}`}
        description={`Mulai dengan menambahkan master ${resourceLabel.toLowerCase()} klinik.`}
        action={
          canManage ? (
            <Button size='sm' onClick={onOpenCreate} className='text-xs gap-1.5 h-8'>
              <Plus className='size-3.5' /> Tambah {resourceLabel}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <div className={cardGridClassName}>
        {items.map((item) => (
          <DemographicMasterCard
            key={item.id}
            item={item}
            resourceLabel={resourceLabel}
            iconName={iconName}
            canManage={canManage}
            selected={selectedIds.includes(item.id)}
            isBulkingActive={isBulkingActive}
            onToggleSelect={onToggleSelect ? () => onToggleSelect(item.id) : undefined}
            onToggleActive={(newActive) => {
              if (onToggleActive) {
                onToggleActive(item.id, newActive);
              } else {
                toggleMutation.mutate({ id: item.id, isActive: newActive });
              }
            }}
            isTogglingActive={isTogglingActiveId === item.id || toggleMutation.isPending}
            onEdit={() => onOpenEdit(item)}
            onDelete={() => {
              if (onDelete) {
                onDelete(item);
              } else {
                setLocalDeletingItem(item);
              }
            }}
          />
        ))}
      </div>

      {/* Fallback Standalone Minimalist Delete Alert Dialog */}
      {!onDelete && (
        <AlertDialog
          open={Boolean(localDeletingItem)}
          onOpenChange={(open) => !open && setLocalDeletingItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Permanen {localDeletingItem?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus {resourceLabel.toLowerCase()} tersebut secara fisik dan
                permanen dari basis data klinik. Data yang sudah dihapus tidak dapat dipulihkan kembali.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (localDeletingItem) {
                    deleteMutation.mutate(localDeletingItem.id, {
                      onSuccess: () => setLocalDeletingItem(null),
                    });
                  }
                }}
                disabled={deleteMutation.isPending}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
