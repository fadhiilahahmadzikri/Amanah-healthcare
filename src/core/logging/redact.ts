import { redactSensitiveValue } from '@/core/observability';

export function redactSensitiveData(data: unknown): unknown {
  return redactSensitiveValue(data);
}
