import { clientFetch } from '@/lib/client-fetch';
import type {
  DriverMetadata,
  RestoreExecuteResponse,
  RestorePreviewResponse,
  RoleItem,
  UpdateUserPayload,
  UserFilters,
  UserItem,
  UserListResponse
} from './types';

export const userService = {
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.roleId && filters.roleId !== 'all') params.set('roleId', filters.roleId);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.audience && filters.audience !== 'all') params.set('audience', filters.audience);
    if (filters.sort) params.set('sort', filters.sort);

    const qs = params.toString();
    const url = `/api/v1/admin/users${qs ? `?${qs}` : ''}`;
    return clientFetch<UserListResponse>(url);
  },

  async getUserById(id: string): Promise<UserItem> {
    return clientFetch<UserItem>(`/api/v1/admin/users/${id}`);
  },

  async getActiveRoles(): Promise<RoleItem[]> {
    return clientFetch<RoleItem[]>('/api/v1/admin/users/roles');
  },

  async updateUser(
    id: string,
    payload: UpdateUserPayload
  ): Promise<{ success: boolean; message: string; user: UserItem }> {
    return clientFetch<{ success: boolean; message: string; user: UserItem }>(
      `/api/v1/admin/users/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  },

  async updateUserStatus(
    id: string,
    status: string
  ): Promise<{ success: boolean; message: string }> {
    return clientFetch<{ success: boolean; message: string }>(`/api/v1/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async bulkUpdateUserStatus(
    userIds: string[],
    status: string
  ): Promise<{ affectedCount: number; skippedCount: number; skippedReasons: string[] }> {
    return clientFetch<{
      affectedCount: number;
      skippedCount: number;
      skippedReasons: string[];
    }>('/api/v1/admin/users/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ userIds, status })
    });
  },

  async purgeUser(id: string): Promise<{ success: boolean; message: string; details?: any }> {
    return clientFetch<{ success: boolean; message: string; details?: any }>(
      `/api/v1/admin/users/${id}`,
      {
        method: 'DELETE'
      }
    );
  },

  async bulkPurgeUsers(
    userIds: string[]
  ): Promise<{ successCount: number; failureCount: number; details: any[] }> {
    return clientFetch<{
      successCount: number;
      failureCount: number;
      details: any[];
    }>('/api/v1/admin/users/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ userIds })
    });
  },

  async getBackupDrivers(): Promise<DriverMetadata[]> {
    return clientFetch<DriverMetadata[]>('/api/v1/admin/users/backup-drivers');
  },

  async exportUsers(format: string = 'json'): Promise<Blob> {
    const res = await fetch(`/api/v1/admin/users/export?format=${encodeURIComponent(format)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/octet-stream, application/json, text/csv, application/sql'
      }
    });

    if (!res.ok) {
      throw new Error(`Ekspor gagal dengan kode ${res.status}: ${res.statusText}`);
    }

    return res.blob();
  },

  async previewRestore(format: string, fileContent: string): Promise<RestorePreviewResponse> {
    return clientFetch<RestorePreviewResponse>('/api/v1/admin/users/restore/preview', {
      method: 'POST',
      body: JSON.stringify({ format, fileContent })
    });
  },

  async executeRestore(
    format: string,
    fileContent: string,
    duplicateStrategy: 'skip' | 'update' = 'skip'
  ): Promise<RestoreExecuteResponse> {
    return clientFetch<RestoreExecuteResponse>('/api/v1/admin/users/restore/execute', {
      method: 'POST',
      body: JSON.stringify({ format, fileContent, duplicateStrategy })
    });
  }
};
