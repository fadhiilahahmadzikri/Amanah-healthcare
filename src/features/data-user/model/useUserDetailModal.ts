'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';
import type { RoleItem, UserItem } from '../api/types';
import { activeRolesQueryOptions } from '../api/queries';
import { useUpdateUserMutation } from '../api/mutations';
import { userUpdateSchema } from '../schemas/user-update.schema';

export interface UseUserDetailModalProps {
  user: UserItem | null;
  isOpen: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface UserDetailFormData {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  roleIds: string[];
}

export interface UseUserDetailModalResult {
  isEditing: boolean;
  hasChanges: boolean;
  formData: UserDetailFormData;
  errors: Record<string, string>;
  availableRoles: RoleItem[];
  isLoadingRoles: boolean;
  isSubmitting: boolean;
  handleUnlockEdit: () => void;
  handleCancelEdit: () => void;
  handleFieldChange: (field: string, value: unknown) => void;
  handleFieldBlur: (field: string) => void;
  handleRoleToggle: (roleId: string) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  formatDateTime: (dateStr?: string | null) => string;
}

const INITIAL_FORM_DATA: UserDetailFormData = {
  name: '',
  email: '',
  phone: '',
  status: 'active',
  roleIds: []
};

export function formatUserDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Belum tersedia';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function useUserDetailModal({
  user,
  isOpen,
  initialEditing = false,
  onClose,
  onSuccess
}: UseUserDetailModalProps): UseUserDetailModalResult {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserDetailFormData>(INITIAL_FORM_DATA);
  const [snapshotFormData, setSnapshotFormData] = useState<UserDetailFormData>(INITIAL_FORM_DATA);

  const { data: availableRoles = [], isLoading: isLoadingRoles } = useQuery(
    activeRolesQueryOptions()
  );

  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    if (user && isOpen) {
      const initial: UserDetailFormData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.staffProfile?.phone || user.patientProfile?.phone || '',
        status: user.status === 'active' ? 'active' : 'inactive',
        roleIds: user.roles.map((r) => r.id)
      };
      setFormData(initial);
      setSnapshotFormData(initial);
      setErrors({});
      setIsEditing(initialEditing);
    }
  }, [user, initialEditing, isOpen]);

  const hasChanges = useMemo(() => {
    if (formData.name !== snapshotFormData.name) return true;
    if (formData.phone !== snapshotFormData.phone) return true;
    if (formData.status !== snapshotFormData.status) return true;
    if (formData.roleIds.length !== snapshotFormData.roleIds.length) return true;
    return formData.roleIds.some((id) => !snapshotFormData.roleIds.includes(id));
  }, [formData, snapshotFormData]);

  const validateField = useCallback((field: string, value: unknown) => {
    const fieldSchema = (userUpdateSchema.shape as Record<string, z.ZodTypeAny>)[field];
    if (fieldSchema) {
      const res = fieldSchema.safeParse(value);
      setErrors((prev) => {
        if (!res.success) {
          const firstIssue = res.error.issues[0];
          return { ...prev, [field]: firstIssue ? firstIssue.message : 'Input tidak valid' };
        }
        if (prev[field]) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return prev;
      });
    }
  }, []);

  const handleUnlockEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setFormData(snapshotFormData);
    setErrors({});
    setIsEditing(false);
  }, [snapshotFormData]);

  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    [validateField]
  );

  const handleFieldBlur = useCallback(
    (field: string) => {
      validateField(field, formData[field as keyof UserDetailFormData]);
    },
    [validateField, formData]
  );

  const handleRoleToggle = useCallback((roleId: string) => {
    setFormData((prev) => {
      const exists = prev.roleIds.includes(roleId);
      if (exists) {
        return { ...prev, roleIds: prev.roleIds.filter((id) => id !== roleId) };
      }
      return { ...prev, roleIds: [...prev.roleIds, roleId] };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      if (!user) return;

      if (!hasChanges) {
        toast.info('Tidak ada perubahan data akun.');
        setIsEditing(false);
        return;
      }

      const result = userUpdateSchema.safeParse(formData);
      if (!result.success) {
        const issueMap: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0];
          if (typeof path === 'string' && !issueMap[path]) {
            issueMap[path] = issue.message;
          }
        }
        setErrors(issueMap);
        toast.error(result.error.issues[0]?.message || 'Periksa kembali isian formulir.');
        return;
      }

      try {
        await updateUserMutation.mutateAsync({
          id: user.id,
          payload: {
            name: formData.name.trim(),
            phone: formData.phone.trim() || null,
            status: formData.status,
            roleIds: formData.roleIds
          }
        });
        toast.success(`Akun ${formData.name} berhasil diperbarui.`);
        setIsEditing(false);
        onSuccess?.();
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memperbarui data akun.';
        toast.error(msg);
      }
    },
    [user, hasChanges, formData, updateUserMutation, onSuccess, onClose]
  );

  return {
    isEditing,
    hasChanges,
    formData,
    errors,
    availableRoles,
    isLoadingRoles,
    isSubmitting: updateUserMutation.isPending,
    handleUnlockEdit,
    handleCancelEdit,
    handleFieldChange,
    handleFieldBlur,
    handleRoleToggle,
    handleSubmit,
    formatDateTime: formatUserDateTime
  };
}
