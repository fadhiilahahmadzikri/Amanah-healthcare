'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { roleManagementApi } from '../api/role-management.api';
import type { Permission, Role, RoleAudience, RoleTier } from '../types/role.types';

export interface UseEditRoleModalProps {
  role: Role | null;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useEditRoleModal({
  role,
  existingRoles,
  groupedPermissions,
  onSuccess,
  onClose
}: UseEditRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [name, setName] = React.useState(role?.name || '');
  const [description, setDescription] = React.useState(role?.description || '');
  const [tier, setTier] = React.useState<RoleTier>(role?.tier || 'macro');
  const [audience, setAudience] = React.useState<RoleAudience>(role?.audience || 'internal');
  const [parentRoleId, setParentRoleId] = React.useState<string>(role?.parentRoleId || 'none');
  const [isClinical, setIsClinical] = React.useState(Boolean(role?.isClinical));
  const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<string[]>(() =>
    (role?.permissions || []).map((p) => p.id)
  );
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  const categories = React.useMemo(() => Object.keys(groupedPermissions), [groupedPermissions]);
  const activeCategory = selectedCategory || categories[0] || '';

  const handleTogglePermission = React.useCallback((id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAllCategory = React.useCallback(
    (cat: string) => {
      const catPermIds = (groupedPermissions[cat] || []).map((p) => p.id);
      const allSelected = catPermIds.every((id) => selectedPermissionIds.includes(id));
      if (allSelected) {
        setSelectedPermissionIds((prev) => prev.filter((id) => !catPermIds.includes(id)));
      } else {
        setSelectedPermissionIds((prev) => [...new Set([...prev, ...catPermIds])]);
      }
    },
    [groupedPermissions, selectedPermissionIds]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    if (!name.trim()) {
      toast.error('Nama peran wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Update basic role attributes
      await roleManagementApi.updateRole(role.id, {
        name: name.trim(),
        description: description.trim() || null,
        tier,
        audience,
        parentRoleId: parentRoleId !== 'none' ? parentRoleId : null,
        isClinical
      });

      // 2. Update permissions assignment
      await roleManagementApi.assignPermissions(role.id, selectedPermissionIds);

      toast.success(`Peran '${name}' dan matriks perizinan berhasil diperbarui!`);
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui peran';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const candidateParentRoles = React.useMemo(() => {
    if (!role) return [];
    return existingRoles.filter((r) => r.id !== role.id && r.tier === 'macro');
  }, [existingRoles, role]);

  return {
    state: {
      isSubmitting,
      name,
      description,
      tier,
      audience,
      parentRoleId,
      isClinical,
      selectedPermissionIds,
      activeCategory,
      categories,
      candidateParentRoles
    },
    actions: {
      setName,
      setDescription,
      setTier,
      setAudience,
      setParentRoleId,
      setIsClinical,
      setActiveCategory: setSelectedCategory,
      handleTogglePermission,
      handleSelectAllCategory,
      handleSubmit
    }
  };
}
