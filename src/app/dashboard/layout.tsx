// import { GreetingDialog } from '@/components/greeting-dialog';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SimulatorRunner } from '@/features/simulator/components/simulator-runner';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';
import { getCurrentPatientRegistrationContext } from '@/features/data-pasien/api/patient-registration-service';
import { getPatientRegistrationRedirectPath } from '@/features/data-pasien/api/registration-mapper';
import { PatientRegistrationModal } from '@/features/data-pasien/components/registration/patient-registration-modal';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const registrationContext = userId
    ? await getCurrentPatientRegistrationContext(userId)
    : { isComplete: false, initialName: '' };
  const redirectPath = getPatientRegistrationRedirectPath({
    isAuthenticated: Boolean(userId),
    isRegistrationComplete: registrationContext.isComplete,
    pathname: '/dashboard'
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <InfobarProvider defaultOpen={false}>
            <SimulatorRunner />
            {children}
            <InfoSidebar side='right' />
            <ChatwootWidget />
            {/* <GreetingDialog /> */}
            {!registrationContext.isComplete ? (
              <PatientRegistrationModal
                isOpen={true}
                initialName={registrationContext.initialName}
              />
            ) : null}
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
