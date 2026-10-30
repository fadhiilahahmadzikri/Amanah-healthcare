'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleManagementApi } from '../api/role-management.api';
import { roleManagementKeys } from '../api/query-keys';
import type { Permission, Role } from '../types/role.types';

export interface UseRoleManagementViewResult {
  roles: Role[];
  filteredRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  isCreateOpen: boolean;
  editingRole: Role | null;
  deletingRole: Role | null;
  isDeleting: boolean;
  actions: {
    setSearchQuery: (query: string) => void;
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
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase().trim();
    return roles.filter((role) => {
      return (
        role.name.toLowerCase().includes(q) ||
        role.code.toLowerCase().includes(q) ||
        (role.description && role.description.toLowerCase().includes(q))
      );
    });
  }, [roles, searchQuery]);

  return {
    roles,
    filteredRoles,
    groupedPermissions,
    isLoading: isLoadingRoles,
    isRefetching,
    searchQuery,
    isCreateOpen,
    editingRole,
    deletingRole,
    isDeleting,
    actions: {
      setSearchQuery,
      setIsCreateOpen,
      setEditingRole,
      setDeletingRole,
      handleRefresh,
      handleDeleteRole
    }
  };
}
