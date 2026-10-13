import 'server-only';
import { serverEnv } from '@/core/config/env.server';

export function getBaseApiUrl(): string {
  const raw = (serverEnv.API_BASE_URL || 'http://localhost:3001').trim();
  return (raw || 'http://localhost:3001').replace(/\/+$/, '');
}
