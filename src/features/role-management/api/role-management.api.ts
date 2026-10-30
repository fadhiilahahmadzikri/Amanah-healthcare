import { clientFetch } from '@/lib/client-fetch';
import type { CreateRolePayload, Permission, Role, UpdateRolePayload } from '../types/role.types';

export const roleManagementApi = {
  getAllRoles: (): Promise<Role[]> => clientFetch<Role[]>('/api/v1/admin/roles'),

  getRoleTree: (): Promise<Role[]> => clientFetch<Role[]>('/api/v1/admin/roles/tree'),

  getRoleById: (id: string): Promise<Role> => clientFetch<Role>(`/api/v1/admin/roles/${id}`),

  createRole: (payload: CreateRolePayload): Promise<Role> =>
    clientFetch<Role>('/api/v1/admin/roles', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateRole: (id: string, payload: UpdateRolePayload): Promise<Role> =>
    clientFetch<Role>(`/api/v1/admin/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteRole: (id: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/roles/${id}`, {
      method: 'DELETE'
    }),

  getGroupedPermissions: (): Promise<Record<string, Permission[]>> =>
    clientFetch<Record<string, Permission[]>>('/api/v1/admin/permissions/grouped'),

  assignPermissions: (roleId: string, permissionIds: string[]): Promise<Role> =>
    clientFetch<Role>(`/api/v1/admin/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionIds })
    }),

  addPermission: (roleId: string, permissionId: string): Promise<Role> =>
    clientFetch<Role>(`/api/v1/admin/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST'
    }),

  removePermission: (roleId: string, permissionId: string): Promise<Role> =>
    clientFetch<Role>(`/api/v1/admin/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE'
    })
};
