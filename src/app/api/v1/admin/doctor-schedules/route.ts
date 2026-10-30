import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth/session.dal';
import { AUDIENCE, PERMISSIONS } from '@/core/auth/permissions.constants';
import { fetchAdminDoctorSchedules } from '@/features/jadwal-dokter/api/doctor-schedule-service';
import { withApiObservability } from '@/core/observability/adapters/http/route-observability.adapter';

export const dynamic = 'force-dynamic';

export const GET = withApiObservability(async function GET(request: NextRequest) {
  // 1. Dynamic RBAC Guard
  const sessionResult = await getSession();
  if (sessionResult.status !== 'authenticated') {
    return NextResponse.json(
      { error: 'Sesi autentikasi tidak valid atau belum masuk' },
      { status: 401 }
    );
  }
  const isInternal = sessionResult.audience === AUDIENCE.INTERNAL;
  const userPerms = sessionResult.user.permissions ?? [];
  const canReadSchedules =
    userPerms.includes('*') || userPerms.includes(PERMISSIONS.SCHEDULES.READ);

  if (!isInternal || !canReadSchedules) {
    return NextResponse.json(
      { error: 'Akses ditolak: Anda tidak memiliki izin untuk melihat jadwal staf' },
      { status: 403 }
    );
  }

  // 2. Parse query parameters
  const { searchParams } = request.nextUrl;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;
  const search = searchParams.get('search') || undefined;
  const month = searchParams.get('month') || undefined;
  const date = searchParams.get('date') || undefined;
  const poli = searchParams.get('poli')?.split(',').filter(Boolean);
  const sessionFilter = searchParams.get('session')?.split(',').filter(Boolean);
  const status = searchParams.get('status')?.split(',').filter(Boolean);

  try {
    const data = await fetchAdminDoctorSchedules({
      page,
      limit,
      search,
      month,
      date,
      poli,
      session: sessionFilter,
      status
    });

    return NextResponse.json({
      success: true,
      data: {
        doctors: data.doctors,
        meta: data.meta
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
