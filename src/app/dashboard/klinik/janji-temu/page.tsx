import PageContainer from "@/components/layout/page-container";
import { AppointmentsView } from "@/features/klinik/components/appointments-view";

export const metadata = {
  title: "Dashboard: Janji Temu",
};

export default function JanjiTemuPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle="Janji Temu"
      pageDescription="Kelola jadwal konsultasi dan reservasi poliklinik secara terpadu"
    >
      <AppointmentsView />
    </PageContainer>
  );
}
