import { clientFetch } from '@/lib/client-fetch';
import type {
  ApplicationPage,
  CreateRolePayload,
  Permission,
  Role,
  UpdateRolePayload
} from '../types/role.types';

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
    }),

  getPageTree: (audience?: string): Promise<ApplicationPage[]> =>
    clientFetch<ApplicationPage[]>(
      `/api/v1/admin/pages/tree${audience ? `?audience=${audience}` : ''}`
    ),

  getRolePages: (roleId: string): Promise<string[]> =>
    clientFetch<string[]>(`/api/v1/admin/roles/${roleId}/pages`),

  assignPages: (roleId: string, pageIds: string[]): Promise<string[]> =>
    clientFetch<string[]>(`/api/v1/admin/roles/${roleId}/pages`, {
      method: 'PUT',
      body: JSON.stringify({ pageIds })
    }),

  togglePage: (pageId: string, isEnabled: boolean): Promise<ApplicationPage> =>
    clientFetch<ApplicationPage>(`/api/v1/admin/pages/${pageId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled })
    }),

  createPage: (data: {
    slug: string;
    name: string;
    description?: string | null;
    routePath?: string;
    customAlias?: string | null;
    parentPageId?: string | null;
    audience?: string;
    icon?: string;
    displayOrder?: number;
  }): Promise<ApplicationPage> =>
    clientFetch<ApplicationPage>('/api/v1/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updatePage: (
    pageId: string,
    data: {
      name?: string;
      description?: string | null;
      icon?: string | null;
      displayOrder?: number;
      parentPageId?: string | null;
      routePath?: string;
      customAlias?: string | null;
      isEnabled?: boolean;
    }
  ): Promise<ApplicationPage> =>
    clientFetch<ApplicationPage>(`/api/v1/admin/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deletePage: (pageId: string): Promise<void> =>
    clientFetch<void>(`/api/v1/admin/pages/${pageId}`, {
      method: 'DELETE'
    }),

  detachChildren: (pageId: string): Promise<{ success: boolean; detachedCount: number }> =>
    clientFetch<{ success: boolean; detachedCount: number }>(
      `/api/v1/admin/pages/${pageId}/detach-children`,
      {
        method: 'POST'
      }
    ),

  bulkPageAction: (data: {
    action: 'move' | 'detach' | 'toggle_status' | 'restore' | 'reorder' | 'delete';
    pageIds: string[];
    targetParentId?: string | null;
    isEnabled?: boolean;
    restoreStates?: Array<{
      id: string;
      parentPageId?: string | null;
      displayOrder?: number;
      isEnabled?: boolean;
    }>;
  }): Promise<{
    success: boolean;
    updatedCount: number;
    affectedPageIds: string[];
    previousStates: Array<{
      id: string;
      name: string;
      parentPageId: string | null;
      displayOrder: number;
      isEnabled: boolean;
    }>;
  }> =>
    clientFetch('/api/v1/admin/pages/bulk', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getRouteAliases: (): Promise<Record<string, string>> =>
    clientFetch<Record<string, string>>('/api/v1/admin/pages/routes/aliases')
};
