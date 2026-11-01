'use client';

import { useRoleFormModal } from './useRoleFormModal';
import type { Permission, Role } from '../types/role.types';

export interface UseEditRoleModalProps {
  role: Role | null;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useEditRoleModal(props: UseEditRoleModalProps) {
  return useRoleFormModal({ ...props, mode: 'edit' });
}
