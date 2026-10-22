import { NextRequest } from 'next/server';
import { proxyToUpstream } from '@/server/proxy/upstream-proxy';

export const dynamic = 'force-dynamic';

async function handleAuthProxy(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> }
) {
  const resolvedParams = await context.params;
  return proxyToUpstream(request, {
    prefix: '/api/auth',
    pathSegments: resolvedParams.all
  });
}

export {
  handleAuthProxy as GET,
  handleAuthProxy as POST,
  handleAuthProxy as PUT,
  handleAuthProxy as PATCH,
  handleAuthProxy as DELETE,
  handleAuthProxy as OPTIONS
};
