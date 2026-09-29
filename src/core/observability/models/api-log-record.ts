import type { ClientMetadata, ClientIpInfo } from './client-metadata.types';

export type ApiLogType = 'request' | 'response' | 'error';

export interface ApiLogTransaction {
  id: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  durationMs?: number;
  request: {
    method: string;
    url: string;
    path: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response?: {
    statusCode: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  error?: {
    name: string;
    message: string;
    statusCode?: number;
    stack?: string;
    payload?: unknown;
  };
  client?: ClientMetadata;
  ip?: ClientIpInfo;
}
