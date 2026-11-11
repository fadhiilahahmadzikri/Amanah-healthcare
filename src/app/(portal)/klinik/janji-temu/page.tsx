import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { AppointmentsView } from '@/features/klinik';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Janji Temu'
};

interface JanjiTemuPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function JanjiTemuPage(props: JanjiTemuPageProps) {
  const rawParams = props.searchParams ? await props.searchParams : {};
  const query = new URLSearchParams();
  if (rawParams) {
    for (const [key, val] of Object.entries(rawParams)) {
      if (typeof val === 'string') {
        query.set(key, val);
      } else if (Array.isArray(val)) {
        val.forEach((v) => query.append(key, v));
      }
    }
  }
  const fullPath = query.toString() ? `/klinik/janji-temu?${query.toString()}` : '/klinik/janji-temu';
  await requireRouteAccess(fullPath);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Janji Temu'
      pageDescription='Kelola jadwal konsultasi dan reservasi poliklinik secara terpadu'
    >
      <Suspense fallback={null}>
        <AppointmentsView />
      </Suspense>
    </PageContainer>
  );
}
