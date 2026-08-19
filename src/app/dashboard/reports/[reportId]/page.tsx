import PageContainer from '@/components/layout/page-container';
import { ReportDetailPage } from '@/features/reports/components/report-detail-page';

export const metadata = {
  title: 'Dashboard: Report Detail'
};

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { reportId } = await params;

  return (
    <PageContainer scrollable>
      <ReportDetailPage reportId={reportId} />
    </PageContainer>
  );
}
