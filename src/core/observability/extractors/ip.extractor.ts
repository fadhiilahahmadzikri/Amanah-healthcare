import type { ClientIpInfo } from '../models/client-metadata.types';
import { extractHeadersMap } from './client-metadata.extractor';

export interface IpExtractionConfig {
  trustedProxies?: boolean | string[];
}

export function extractClientIp(
  headers: Headers | Record<string, string | string[] | undefined>,
  socketIp?: string,
  config: IpExtractionConfig = {}
): ClientIpInfo {
  const h = extractHeadersMap(headers);

  // Check if proxy trust is enabled via config or env
  const isTrustedProxy =
    config.trustedProxies === true ||
    process.env.TRUSTED_PROXY === 'true' ||
    process.env.NODE_ENV === 'production';

  // Cloudflare Header
  if (h['cf-connecting-ip'] && isTrustedProxy) {
    return {
      ip: h['cf-connecting-ip'],
      source: 'trusted_forwarded',
      isTrustedProxy: true
    };
  }

  // Standard X-Forwarded-For
  if (h['x-forwarded-for']) {
    const rawIps = h['x-forwarded-for'].split(',').map((ip) => ip.trim());
    const clientIp = rawIps[0];

    return {
      ip: clientIp || 'unknown',
      source: isTrustedProxy ? 'trusted_forwarded' : 'untrusted_forwarded',
      isTrustedProxy
    };
  }

  // X-Real-IP
  if (h['x-real-ip']) {
    return {
      ip: h['x-real-ip'],
      source: isTrustedProxy ? 'trusted_forwarded' : 'real_ip',
      isTrustedProxy
    };
  }

  // Socket IP if available
  if (socketIp) {
    return {
      ip: socketIp,
      source: 'socket',
      isTrustedProxy: false
    };
  }

  return {
    ip: '127.0.0.1',
    source: 'unknown',
    isTrustedProxy: false
  };
}
