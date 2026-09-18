import 'server-only';
import { serverEnv } from '@/core/config/env.server';

export function getBaseApiUrl(): string {
  return serverEnv.API_BASE_URL.replace(/\/+$/, '');
}
