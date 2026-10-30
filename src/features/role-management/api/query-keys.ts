export const roleManagementKeys = {
  all: ['role-management'] as const,
  roles: () => [...roleManagementKeys.all, 'roles'] as const,
  roleTree: () => [...roleManagementKeys.all, 'role-tree'] as const,
  roleDetail: (id: string) => [...roleManagementKeys.all, 'role', id] as const,
  permissionsGrouped: () => [...roleManagementKeys.all, 'permissions-grouped'] as const
};
