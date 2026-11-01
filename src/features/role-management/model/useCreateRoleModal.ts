'use client';

import { useRoleFormModal } from './useRoleFormModal';
import type { Permission, Role } from '../types/role.types';

export type RoleCreateStage = 1 | 2 | 3 | 4 | 5;

export interface UseCreateRoleModalProps {
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useCreateRoleModal(props: UseCreateRoleModalProps) {
  return useRoleFormModal({ ...props, mode: 'create' });
}
