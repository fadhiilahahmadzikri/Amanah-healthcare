const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirmation',
  'passwd',
  'token',
  'refreshtoken',
  'accesstoken',
  'auth_token',
  'secret',
  'clientsecret',
  'client_secret',
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'nik',
  'idcardnumber',
  'creditcard',
  'cardnumber',
  'cvv',
  'cvc',
  'pin',
  'otp',
  'csrf',
  'x-csrf-token',
  'privatekey',
  'private_key',
  'apikey',
  'api-key',
  'x-api-key',
  'session',
  'session_token',
  'amanah_access_token',
  'amanah_refresh_token',
  'better-auth.session_token'
]);

const BEARER_REGEX = /Bearer\s+[\w\-._~+/]+=*/gi;
const BASIC_AUTH_REGEX = /Basic\s+[\w\-._~+/]+=*/gi;

export function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-_]/g, '');
  return SENSITIVE_KEYS.has(normalized) || SENSITIVE_KEYS.has(key.toLowerCase());
}

export function redactSensitiveValue(val: unknown): unknown {
  if (val === null || val === undefined) {
    return val;
  }

  if (typeof val === 'string') {
    let sanitized = val.replace(BEARER_REGEX, 'Bearer [REDACTED]');
    sanitized = sanitized.replace(BASIC_AUTH_REGEX, 'Basic [REDACTED]');
    return sanitized;
  }

  if (Array.isArray(val)) {
    return val.map(redactSensitiveValue);
  }

  if (typeof val === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = redactSensitiveValue(value);
      } else if (typeof value === 'string') {
        result[key] = redactSensitiveValue(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return val;
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (isSensitiveKey(lowerKey)) {
      result[lowerKey] = '[REDACTED]';
    } else {
      result[lowerKey] = String(redactSensitiveValue(value));
    }
  }
  return result;
}
