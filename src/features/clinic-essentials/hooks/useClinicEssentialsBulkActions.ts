'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clinicEssentialsApi } from '../api/clinic-essentials.api';
import { clinicEssentialsKeys } from '../api/query-keys';
import type { BulkFacilityActionPayload, FacilityResource } from '../types/clinic-essentials.types';

export function useClinicEssentialsBulkActions(
  activeTab: FacilityResource,
  currentTabItems: Array<{ id: string }>
) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  const bulkMutation = useMutation({
    mutationFn: (payload: BulkFacilityActionPayload) => clinicEssentialsApi.bulkAction(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Operasi massal berhasil dijalankan.');
      setSelectedIds([]);
      setIsBulkDeleteConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: clinicEssentialsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menjalankan operasi massal';
      toast.error(msg);
    },
  });

  const isAllSelected =
    currentTabItems.length > 0 && currentTabItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentTabItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return {
    selectedIds,
    setSelectedIds,
    isBulkDeleteConfirmOpen,
    setIsBulkDeleteConfirmOpen,
    bulkMutation,
    isAllSelected,
    handleSelectAll,
    handleToggleSelect,
  };
}
