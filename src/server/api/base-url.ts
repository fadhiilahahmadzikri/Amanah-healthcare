import 'server-only';
import { getServerUpstream } from '@/core/config/endpoints';

export function getBaseApiUrl(): string {
  return getServerUpstream();
}
