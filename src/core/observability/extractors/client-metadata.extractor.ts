import type { ClientMetadata } from '../models/client-metadata.types';

export function extractHeadersMap(
  headers: Headers | Record<string, string | string[] | undefined>
): Record<string, string> {
  const map: Record<string, string> = {};

  if (typeof (headers as Headers).forEach === 'function') {
    (headers as Headers).forEach((value, key) => {
      map[key.toLowerCase()] = value;
    });
  } else {
    for (const [key, val] of Object.entries(headers)) {
      if (val !== undefined && val !== null) {
        map[key.toLowerCase()] = Array.isArray(val) ? val.join(', ') : String(val);
      }
    }
  }

  return map;
}

export function extractClientMetadata(
  headers: Headers | Record<string, string | string[] | undefined>
): ClientMetadata {
  const h = extractHeadersMap(headers);

  const client: {
    type?: string;
    platform?: string;
    appVersion?: string;
    buildNumber?: string;
    deviceId?: string;
    deviceModel?: string;
    osVersion?: string;
    userAgent?: string;
    origin?: string;
    referer?: string;
  } = {};

  // Standard Web/HTTP headers
  if (h['user-agent']) client.userAgent = h['user-agent'];
  if (h['origin']) client.origin = h['origin'];
  if (h['referer']) client.referer = h['referer'];

  // Mobile / Client Custom Headers
  if (h['x-client-type']) client.type = h['x-client-type'];
  if (h['x-platform']) client.platform = h['x-platform'];
  if (h['x-app-version']) client.appVersion = h['x-app-version'];
  if (h['x-client-version'] && !client.appVersion) client.appVersion = h['x-client-version'];
  if (h['x-app-build'] || h['x-build-number'])
    client.buildNumber = h['x-app-build'] || h['x-build-number'];
  if (h['x-device-id']) client.deviceId = h['x-device-id'];
  if (h['x-device-model']) client.deviceModel = h['x-device-model'];
  if (h['x-os-version']) client.osVersion = h['x-os-version'];

  // If no explicit x-client-type, infer from User-Agent safely without inventing false device models
  if (!client.type && client.userAgent) {
    const ua = client.userAgent.toLowerCase();
    if (ua.includes('dart') || ua.includes('flutter')) {
      client.type = 'mobile/flutter';
    } else if (ua.includes('postman') || ua.includes('insomnia') || ua.includes('curl')) {
      client.type = 'api-client';
    } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari')) {
      client.type = 'browser';
    }
  }

  return client;
}
