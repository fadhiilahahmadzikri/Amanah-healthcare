import type { ClientMetadata, ClientIpInfo } from './client-metadata.types';

export interface HttpContext {
  readonly method: string;
  readonly path: string;
  readonly route?: string;
  readonly params?: Record<string, string | string[]>;
  readonly query?: Record<string, unknown>;
  readonly protocol?: string;
  readonly hostname?: string;
  readonly statusCode?: number;
  readonly durationMs?: number;
}

export interface AuthContext {
  readonly authenticated: boolean;
  readonly userId?: string;
  readonly role?: string;
  readonly staffId?: string;
  readonly doctorId?: string;
}

export interface HttpRequestEvent {
  readonly event: 'http.request';
  readonly requestId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly http: HttpContext;
  readonly client: ClientMetadata;
  readonly ip: ClientIpInfo;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly auth?: AuthContext;
}

export interface HttpResponseEvent {
  readonly event: 'http.response';
  readonly requestId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly http: HttpContext;
  readonly client: ClientMetadata;
  readonly ip: ClientIpInfo;
  readonly headers?: Record<string, string>;
  readonly response?: unknown;
  readonly auth?: AuthContext;
}

export interface HttpErrorDetails {
  readonly name: string;
  readonly message: string;
  readonly code?: string;
  readonly statusCode: number;
  readonly stack?: string;
  readonly payload?: unknown;
}

export interface HttpErrorEvent {
  readonly event: 'http.error';
  readonly requestId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly http: HttpContext;
  readonly client: ClientMetadata;
  readonly ip: ClientIpInfo;
  readonly error: HttpErrorDetails;
  readonly auth?: AuthContext;
}

export interface ObservableRequest {
  readonly method: string;
  readonly url: string;
  readonly nextUrl?: {
    pathname: string;
    searchParams: URLSearchParams;
  };
  readonly headers: Headers | Record<string, string | string[] | undefined>;
  readonly ip?: string;
  readonly body?: unknown;
}

export interface ObservableResponse {
  readonly status: number;
  readonly headers?: Headers | Record<string, string | string[] | undefined>;
  readonly body?: unknown;
}

export interface ObservableContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly startTime: number;
  readonly method: string;
  readonly path: string;
  readonly route?: string;
  readonly query: Record<string, unknown>;
  readonly params: Record<string, string | string[]>;
  readonly client: ClientMetadata;
  readonly ip: ClientIpInfo;
  readonly headers?: Record<string, string>;
  readonly requestBody?: unknown;
  auth?: AuthContext;
}
