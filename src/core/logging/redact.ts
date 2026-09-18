const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'authorization',
  'cookie',
  'nik',
  'idcardnumber',
  'creditcard'
]);

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact Bearer tokens in headers/strings
    return data.replace(/Bearer\s+[\w\-._~+/]+=*/gi, 'Bearer [REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        redacted[key] = redactSensitiveData(val);
      } else {
        redacted[key] = val;
      }
    }
    return redacted;
  }

  return data;
}
