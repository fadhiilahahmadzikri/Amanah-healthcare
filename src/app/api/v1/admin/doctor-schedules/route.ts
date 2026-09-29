import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedSession } from '@/lib/guard';
import { fetchAdminDoctorSchedules } from '@/features/jadwal-dokter/api/doctor-schedule-service';
import { withApiObservability } from '@/core/observability/adapters/http/route-observability.adapter';

export const dynamic = 'force-dynamic';

export const GET = withApiObservability(async function GET(request: NextRequest) {
  // 1. RBAC Guard: Require Admin
  const session = await getUnifiedSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Sesi autentikasi tidak valid atau belum masuk' },
      { status: 401 }
    );
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak: Hanya administrator yang dapat melihat jadwal dokter' },
      { status: 403 }
    );
  }

  // 2. Parse query parameters
  const { searchParams } = request.nextUrl;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 6;
  const search = searchParams.get('search') || undefined;
  const month = searchParams.get('month') || undefined;
  const date = searchParams.get('date') || undefined;
  const poli = searchParams.get('poli')?.split(',').filter(Boolean);
  const status = searchParams.get('status')?.split(',').filter(Boolean);

  try {
    const data = await fetchAdminDoctorSchedules({
      page,
      limit,
      search,
      month,
      date,
      poli,
      status
    });

    return NextResponse.json({
      doctors: data.doctors,
      total_doctors: data.meta.total_doctors,
      meta: data.meta
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
