import { clientFetch } from '@/lib/client-fetch';

export interface LinkedProvidersResponse {
  linkedProviders: string[];
  hasPassword: boolean;
  hasGoogle: boolean;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface RequestEmailChangePayload {
  newEmail: string;
  currentPassword?: string;
}

export const accountSecurityApi = {
  getLinkedProviders(): Promise<LinkedProvidersResponse> {
    return clientFetch<LinkedProvidersResponse>('/api/v1/auth/me/linked-providers');
  },

  changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    return clientFetch<{ success: boolean; message: string }>('/api/v1/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  requestEmailChange(
    payload: RequestEmailChangePayload
  ): Promise<{ success: boolean; message: string }> {
    return clientFetch<{ success: boolean; message: string }>(
      '/api/v1/auth/me/request-email-change',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  unlinkCredential(): Promise<LinkedProvidersResponse> {
    return clientFetch<LinkedProvidersResponse>('/api/v1/auth/me/unlink-credential', {
      method: 'POST'
    });
  },

  unlinkGoogle(): Promise<LinkedProvidersResponse> {
    return clientFetch<LinkedProvidersResponse>('/api/v1/auth/me/unlink-google', {
      method: 'POST'
    });
  }
};
