'use client';

import * as React from 'react';
import { RoleFormDialog } from './role-form-dialog';
import type { Permission, Role } from '../types/role.types';

export interface EditRolePermissionsDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
}

export function EditRolePermissionsDialog({
  role,
  open,
  onOpenChange,
  existingRoles,
  groupedPermissions,
  onSuccess
}: EditRolePermissionsDialogProps) {
  return (
    <RoleFormDialog
      open={open && Boolean(role)}
      onOpenChange={onOpenChange}
      mode='edit'
      role={role}
      existingRoles={existingRoles}
      groupedPermissions={groupedPermissions}
      onSuccess={onSuccess}
    />
  );
}
