'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleManagementApi } from '../api/role-management.api';
import { roleManagementKeys } from '../api/query-keys';
import type { Permission, Role } from '../types/role.types';
import type { AudienceType, RoleTierType } from '@/core/auth/permissions.constants';

export interface UseRoleManagementViewResult {
  roles: Role[];
  filteredRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  tierFilter: 'all' | RoleTierType;
  audienceFilter: 'all' | AudienceType;
  clinicalFilter: 'all' | 'clinical' | 'operational';
  isCreateOpen: boolean;
  editingRole: Role | null;
  deletingRole: Role | null;
  isDeleting: boolean;
  actions: {
    setSearchQuery: (query: string) => void;
    setTierFilter: (filter: 'all' | RoleTierType) => void;
    setAudienceFilter: (filter: 'all' | AudienceType) => void;
    setClinicalFilter: (filter: 'all' | 'clinical' | 'operational') => void;
    setIsCreateOpen: (open: boolean) => void;
    setEditingRole: (role: Role | null) => void;
    setDeletingRole: (role: Role | null) => void;
    handleRefresh: () => void;
    handleDeleteRole: () => Promise<void>;
  };
}

export function useRoleManagementView(): UseRoleManagementViewResult {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tierFilter, setTierFilter] = React.useState<'all' | RoleTierType>('all');
  const [audienceFilter, setAudienceFilter] = React.useState<'all' | AudienceType>('all');
  const [clinicalFilter, setClinicalFilter] = React.useState<'all' | 'clinical' | 'operational'>(
    'all'
  );
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = React.useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    isRefetching
  } = useQuery({
    queryKey: roleManagementKeys.roles(),
    queryFn: () => roleManagementApi.getAllRoles()
  });

  const { data: groupedPermissions = {} } = useQuery({
    queryKey: roleManagementKeys.permissionsGrouped(),
    queryFn: () => roleManagementApi.getGroupedPermissions()
  });

  const handleRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
    queryClient.invalidateQueries({ queryKey: roleManagementKeys.permissionsGrouped() });
    toast.info('Memperbarui daftar peran...');
  }, [queryClient]);

  const handleDeleteRole = React.useCallback(async () => {
    if (!deletingRole) return;
    try {
      setIsDeleting(true);
      await roleManagementApi.deleteRole(deletingRole.id);
      toast.success(`Peran '${deletingRole.name}' berhasil dihapus.`);
      setDeletingRole(null);
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.roles() });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus peran';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingRole, queryClient]);

  const filteredRoles = React.useMemo(() => {
    return roles.filter((role) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          role.name.toLowerCase().includes(q) ||
          role.code.toLowerCase().includes(q) ||
          (role.description && role.description.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Tier Filter
      if (tierFilter !== 'all' && role.tier !== tierFilter) {
        return false;
      }

      // 3. Audience Filter
      if (audienceFilter !== 'all' && role.audience !== audienceFilter) {
        return false;
      }

      // 4. Clinical Filter
      if (clinicalFilter === 'clinical' && !role.isClinical) {
        return false;
      }
      if (clinicalFilter === 'operational' && role.isClinical) {
        return false;
      }

      return true;
    });
  }, [roles, searchQuery, tierFilter, audienceFilter, clinicalFilter]);

  return {
    roles,
    filteredRoles,
    groupedPermissions,
    isLoading: isLoadingRoles,
    isRefetching,
    searchQuery,
    tierFilter,
    audienceFilter,
    clinicalFilter,
    isCreateOpen,
    editingRole,
    deletingRole,
    isDeleting,
    actions: {
      setSearchQuery,
      setTierFilter,
      setAudienceFilter,
      setClinicalFilter,
      setIsCreateOpen,
      setEditingRole,
      setDeletingRole,
      handleRefresh,
      handleDeleteRole
    }
  };
}
