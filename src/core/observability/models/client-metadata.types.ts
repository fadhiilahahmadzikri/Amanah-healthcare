export interface ClientMetadata {
  readonly type?: string;
  readonly platform?: string;
  readonly appVersion?: string;
  readonly buildNumber?: string;
  readonly deviceId?: string;
  readonly deviceModel?: string;
  readonly osVersion?: string;
  readonly userAgent?: string;
  readonly origin?: string;
  readonly referer?: string;
}

export interface ClientIpInfo {
  readonly ip: string;
  readonly source: 'socket' | 'trusted_forwarded' | 'untrusted_forwarded' | 'real_ip' | 'unknown';
  readonly isTrustedProxy: boolean;
}
