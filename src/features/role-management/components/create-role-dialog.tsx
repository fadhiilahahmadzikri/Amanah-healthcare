'use client';

import * as React from 'react';
import { RoleFormDialog } from './role-form-dialog';
import type { Permission, Role } from '../types/role.types';

export interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRoles: Role[];
  groupedPermissions: Record<string, Permission[]>;
  onSuccess: () => void;
}

export function CreateRoleDialog(props: CreateRoleDialogProps) {
  return <RoleFormDialog {...props} mode='create' />;
}
