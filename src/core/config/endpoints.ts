import 'server-only';
import { serverEnv } from './env.server';

/**
 * Mendapatkan basis URL upstream server backend (NestJS).
 * Digunakan KHUSUS di lingkungan server (Route Handlers, Server Actions, SSR).
 * Tidak boleh bocor ke client bundle browser.
 */
export function getServerUpstream(): string {
  const upstream = serverEnv.API_BASE_URL;
  if (!upstream) {
    throw new Error(
      '[Config Error] API_BASE_URL tidak terdefinisi di environment server. Pastikan API_BASE_URL telah disetel pada .env.'
    );
  }
  return upstream.replace(/\/+$/, '');
}
