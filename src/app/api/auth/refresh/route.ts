import { NextResponse } from 'next/server';
import { refreshTokenCommand } from '@/server/services/auth/refresh-token.command';
import { withApiObservability } from '@/core/observability/adapters/http/route-observability.adapter';

export const POST = withApiObservability(async function POST() {
  const result = await refreshTokenCommand();

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        message: result.error.message,
        code: result.error.code
      },
      {
        status: result.error.status || 401
      }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.value
  });
});
