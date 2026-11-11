'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import { promotionsApi } from '@/features/promotions';
import type { FacilityResource } from '../types/clinic-essentials.types';

export interface DeletingState {
  type: FacilityResource;
  id: string;
  name: string;
}

export function useClinicEssentialsMutations() {
  const queryClient = useQueryClient();
  const [deletingItem, setDeletingItem] = React.useState<DeletingState | null>(null);

  // Single Item Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (item: DeletingState) => {
      switch (item.type) {
        case 'unit-types':
          await clinicEssentialsApi.deleteUnitType(item.id);
          break;
        case 'units':
          await clinicEssentialsApi.deleteUnit(item.id);
          break;
        case 'rooms':
          await clinicEssentialsApi.deleteRoom(item.id);
          break;
        case 'categories':
          await clinicEssentialsApi.deleteCategory(item.id);
          break;
        case 'services':
          await clinicEssentialsApi.deleteService(item.id);
          break;
        case 'relationships':
          await clinicEssentialsApi.deleteRelationship(item.id);
          break;
        case 'blood-types':
          await clinicEssentialsApi.deleteBloodType(item.id);
          break;
        case 'education-levels':
          await clinicEssentialsApi.deleteEducationLevel(item.id);
          break;
        case 'religions':
          await clinicEssentialsApi.deleteReligion(item.id);
          break;
        case 'occupations':
          await clinicEssentialsApi.deleteOccupation(item.id);
          break;
        case 'facilities':
          await clinicEssentialsApi.deleteFacility(item.id);
          break;
        case 'faqs':
          await clinicEssentialsApi.deleteFaq(item.id);
          break;
        case 'promotions':
          await promotionsApi.deletePromotion(item.id);
          break;
      }
    },
    onSuccess: (_, item) => {
      toast.success(`${item.name} berhasil dihapus permanen.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.promotions() });
      setDeletingItem(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus item';
      toast.error(msg);
    },
  });

  // Single Item Toggle Active Status Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      resource,
      id,
      isActive,
    }: {
      resource: FacilityResource;
      id: string;
      isActive: boolean;
    }) => {
      switch (resource) {
        case 'unit-types':
          return clinicEssentialsApi.updateUnitType(id, { isActive });
        case 'units':
          return clinicEssentialsApi.updateUnit(id, { isActive });
        case 'rooms':
          return clinicEssentialsApi.updateRoom(id, { isActive });
        case 'categories':
          return clinicEssentialsApi.updateCategory(id, { isActive });
        case 'services':
          return clinicEssentialsApi.updateService(id, { isActive });
        case 'relationships':
          return clinicEssentialsApi.updateRelationship(id, { isActive });
        case 'blood-types':
          return clinicEssentialsApi.updateBloodType(id, { isActive });
        case 'education-levels':
          return clinicEssentialsApi.updateEducationLevel(id, { isActive });
        case 'religions':
          return clinicEssentialsApi.updateReligion(id, { isActive });
        case 'occupations':
          return clinicEssentialsApi.updateOccupation(id, { isActive });
        case 'facilities':
          return clinicEssentialsApi.updateFacility(id, { isPublished: isActive });
        case 'faqs':
          return clinicEssentialsApi.updateFaq(id, { isPublished: isActive });
        case 'promotions':
          return promotionsApi.updatePromotion(id, { isPublished: isActive });
      }
    },
    onSuccess: (_, vars) => {
      toast.success(`Status berhasil diubah menjadi ${vars.isActive ? 'Aktif' : 'Nonaktif'}.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.promotions() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status item';
      toast.error(msg);
    },
  });

  // Set Default / System Relationship Mutation
  const setDefaultRelationshipMutation = useMutation({
    mutationFn: (id: string) => clinicEssentialsApi.setDefaultRelationship(id),
    onSuccess: (data) => {
      toast.success(`'${data.name}' berhasil ditetapkan sebagai Relasi Akun Utama / Sistem.`);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menetapkan relasi default';
      toast.error(msg);
    },
  });

  return {
    deletingItem,
    setDeletingItem,
    deleteMutation,
    toggleActiveMutation,
    setDefaultRelationshipMutation,
    isMutating:
      deleteMutation.isPending ||
      toggleActiveMutation.isPending ||
      setDefaultRelationshipMutation.isPending,
  };
}
