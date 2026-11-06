'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { roleManagementApi } from '../api/role-management.api';
import {
  AUDIENCE,
  type Permission,
  type Role,
  type RoleAudience
} from '../types/role.types';
import type { RoleCreateStage } from './useCreateRoleModal';

export interface UseRoleFormModalProps {
  mode?: 'create' | 'edit';
  role?: Role | null;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useRoleFormModal({
  mode,
  role,
  existingRoles,
  groupedPermissions,
  onSuccess,
  onClose
}: UseRoleFormModalProps) {
  const isEditMode = mode === 'edit' || Boolean(role);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStage, setCurrentStage] = React.useState<RoleCreateStage>(1);
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');

  const [code, setCode] = React.useState(role?.code || '');
  const [name, setName] = React.useState(role?.name || '');
  const [description, setDescription] = React.useState(role?.description || '');
  const [audience, setAudience] = React.useState<RoleAudience>(role?.audience || AUDIENCE.INTERNAL);
  const [isClinical, setIsClinical] = React.useState(Boolean(role?.isClinical));
  const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<string[]>(() =>
    (role?.permissions || []).map((p) => p.id)
  );
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [permissionSearch, setPermissionSearch] = React.useState<string>('');

  // Sync state when role changes or modal re-opens
  React.useEffect(() => {
    setCurrentStage(1);
    setDirection('forward');
    setPermissionSearch('');
    if (role) {
      setCode(role.code);
      setName(role.name);
      setDescription(role.description || '');
      setAudience(role.audience);
      setIsClinical(Boolean(role.isClinical));
      setSelectedPermissionIds((role.permissions || []).map((p) => p.id));
    } else {
      setCode('');
      setName('');
      setDescription('');
      setAudience(AUDIENCE.INTERNAL);
      setIsClinical(false);
      setSelectedPermissionIds([]);
    }
  }, [role]);

  const categories = React.useMemo(() => Object.keys(groupedPermissions), [groupedPermissions]);
  const activeCategory = selectedCategory || categories[0] || '';

  const resetForm = React.useCallback(() => {
    setCurrentStage(1);
    setDirection('forward');
    setPermissionSearch('');
    if (role) {
      setCode(role.code);
      setName(role.name);
      setDescription(role.description || '');
      setAudience(role.audience);
      setIsClinical(Boolean(role.isClinical));
      setSelectedPermissionIds((role.permissions || []).map((p) => p.id));
    } else {
      setCode('');
      setName('');
      setDescription('');
      setAudience(AUDIENCE.INTERNAL);
      setIsClinical(false);
      setSelectedPermissionIds([]);
    }
  }, [role]);

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

  const handleSetModulePermissions = React.useCallback(
    (toAdd: string[], toRemove: string[]) => {
      setSelectedPermissionIds((prev) => {
        const withoutRemoved = prev.filter((id) => !toRemove.includes(id));
        return Array.from(new Set([...withoutRemoved, ...toAdd]));
      });
    },
    []
  );

  const handleBatchSelectPermissions = React.useCallback((ids: string[]) => {
    setSelectedPermissionIds(ids);
  }, []);

  const handleCopyFromRole = React.useCallback(
    (sourceRoleId: string) => {
      const source = existingRoles.find((r) => r.id === sourceRoleId);
      if (source && source.permissions) {
        setSelectedPermissionIds(source.permissions.map((p) => p.id));
      }
    },
    [existingRoles]
  );

  const isStage1Valid = React.useMemo(() => {
    return name.trim().length >= 2;
  }, [name]);

  const isCurrentStageValid = React.useMemo(() => {
    switch (currentStage) {
      case 1:
        return isStage1Valid;
      case 2:
      case 3:
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStage, isStage1Valid]);

  const handleNextStage = React.useCallback(() => {
    if (currentStage >= 5) return;
    setDirection('forward');
    setCurrentStage((prev) => (prev + 1) as RoleCreateStage);
  }, [currentStage]);

  const handlePrevStage = React.useCallback(() => {
    if (currentStage <= 1) return;
    setDirection('backward');
    setCurrentStage((prev) => (prev - 1) as RoleCreateStage);
  }, [currentStage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!name.trim()) {
      toast.error('Nama peran wajib diisi');
      setCurrentStage(1);
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && role) {
        // 1. Update basic role info
        await roleManagementApi.updateRole(role.id, {
          name: name.trim(),
          description: description.trim() || null,
          audience,
          isClinical
        });

        // 2. Assign permissions
        await roleManagementApi.assignPermissions(role.id, selectedPermissionIds);

        toast.success(`Peran '${name}' dan matriks perizinan berhasil diperbarui`);
      } else {
        // Create role - backend CanonicalSlugHelper generates safe snake_case slug automatically
        await roleManagementApi.createRole({
          code: undefined,
          name: name.trim(),
          description: description.trim() || null,
          audience,
          isClinical,
          permissionIds: selectedPermissionIds
        });

        toast.success(`Peran '${name}' berhasil dibuat`);
      }

      resetForm();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEditMode
            ? 'Gagal memperbarui peran'
            : 'Gagal membuat peran';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      isEditMode,
      isSystemRole: Boolean(role?.isSystem),
      isSubmitting,
      currentStage,
      direction,
      code,
      name,
      description,
      audience,
      isClinical,
      selectedPermissionIds,
      effectivePermissionCodes: role?.effectivePermissionCodes || [],
      activeCategory,
      categories,
      permissionSearch,
      isStage1Valid,
      isCurrentStageValid
    },
    actions: {
      setCurrentStage,
      handleNextStage,
      handlePrevStage,
      setCode,
      setName,
      setDescription,
      setAudience,
      setIsClinical,
      setActiveCategory: setSelectedCategory,
      setPermissionSearch,
      handleTogglePermission,
      handleSelectAllCategory,
      handleSetModulePermissions,
      handleBatchSelectPermissions,
      handleCopyFromRole,
      handleSubmit,
      resetForm
    }
  };
}
