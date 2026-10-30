'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { roleManagementApi } from '../api/role-management.api';
import type { Permission, Role, RoleAudience, RoleTier } from '../types/role.types';

export interface UseCreateRoleModalProps {
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useCreateRoleModal({
  existingRoles,
  groupedPermissions,
  onSuccess,
  onClose
}: UseCreateRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tier, setTier] = React.useState<RoleTier>('macro');
  const [audience, setAudience] = React.useState<RoleAudience>('internal');
  const [parentRoleId, setParentRoleId] = React.useState<string>('none');
  const [isClinical, setIsClinical] = React.useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  const categories = React.useMemo(() => Object.keys(groupedPermissions), [groupedPermissions]);
  const activeCategory = selectedCategory || categories[0] || '';

  const resetForm = React.useCallback(() => {
    setCode('');
    setName('');
    setDescription('');
    setTier('macro');
    setAudience('internal');
    setParentRoleId('none');
    setIsClinical(false);
    setSelectedPermissionIds([]);
  }, []);

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
    if (!code.trim()) {
      toast.error('Kode peran wajib diisi');
      return;
    }
    if (!name.trim()) {
      toast.error('Nama peran wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      await roleManagementApi.createRole({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        description: description.trim() || null,
        tier,
        audience,
        parentRoleId: parentRoleId !== 'none' ? parentRoleId : null,
        isClinical,
        permissionIds: selectedPermissionIds
      });

      toast.success(`Peran '${name}' berhasil dibuat!`);
      resetForm();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat peran';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const macroRoles = React.useMemo(
    () => existingRoles.filter((r) => r.tier === 'macro'),
    [existingRoles]
  );

  return {
    state: {
      isSubmitting,
      code,
      name,
      description,
      tier,
      audience,
      parentRoleId,
      isClinical,
      selectedPermissionIds,
      activeCategory,
      categories,
      macroRoles
    },
    actions: {
      setCode,
      setName,
      setDescription,
      setTier,
      setAudience,
      setParentRoleId,
      setIsClinical,
      setActiveCategory: setSelectedCategory,
      handleTogglePermission,
      handleSelectAllCategory,
      handleSubmit,
      resetForm
    }
  };
}
