// import { GreetingDialog } from '@/components/greeting-dialog';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';
import { PatientRegistrationModal } from '@/features/data-pasien';
import {
  getCurrentPatientRegistrationContext,
  getPatientRegistrationRedirectPath
} from '@/features/data-pasien/index.server';
import { auth } from '@/lib/auth';
import { isRouteAuthorized } from '@/lib/rbac/route-manifest';
import { filterNavGroupsByRole, type SupportedRole } from '@/lib/rbac/navigation';
import { AuthorizationProvider } from '@/lib/rbac/auth-context';
import { navGroups } from '@/config/nav-config';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn',
  robots: {
    index: false,
    follow: false
  }
};

import { loadCurrentUser } from '@/server/loaders/auth.loader';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers();
  let user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null = null;
  let userRole: SupportedRole = 'patient';

  const session = await auth.api.getSession({ headers: reqHeaders });
  if (session?.user) {
    user = session.user;
    userRole = session.user.role === 'admin' ? 'admin' : 'patient';
  } else {
    const currentUser = await loadCurrentUser();
    if (currentUser) {
      user = {
        id: currentUser.id,
        name: currentUser.staff?.fullName || currentUser.patient?.fullName || currentUser.email,
        email: currentUser.email,
        role: currentUser.systemRole === 'ADMIN' ? 'admin' : 'patient'
      };
      userRole = currentUser.systemRole === 'ADMIN' ? 'admin' : 'patient';
    }
  }

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Enforce Route Manifest RBAC at Layout Boundary
  const pathname = reqHeaders.get('x-pathname') || '/dashboard';
  const authResult = isRouteAuthorized(pathname, userRole);

  if (!authResult.allowed) {
    if (authResult.reason === 'forbidden') {
      if (userRole === 'admin') {
        redirect('/dashboard/admin');
      } else {
        redirect('/dashboard/klinik/antrean');
      }
    }
  }

  const userId = user.id;
  const isPatient = userRole === 'patient';

  const registrationContext = isPatient
    ? await getCurrentPatientRegistrationContext(userId)
    : { isComplete: true, initialName: '' };

  const redirectPath = getPatientRegistrationRedirectPath({
    isAuthenticated: Boolean(userId),
    isRegistrationComplete: registrationContext.isComplete,
    pathname
  });

  if (redirectPath && redirectPath !== pathname) {
    redirect(redirectPath);
  }

  // Pre-filter navigation groups on the server for Zero-Flicker Hydration
  const authorizedNavGroups = filterNavGroupsByRole(navGroups, userRole);

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <AuthorizationProvider
      initialUser={user}
      initialRole={userRole}
      initialNavGroups={authorizedNavGroups}
      allNavGroups={navGroups}
    >
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <InfobarProvider defaultOpen={false}>
              {children}
              <InfoSidebar side='right' />
              <ChatwootWidget />
              {/* <GreetingDialog /> */}
              {isPatient && !registrationContext.isComplete ? (
                <PatientRegistrationModal
                  isOpen={true}
                  initialName={registrationContext.initialName}
                />
              ) : null}
            </InfobarProvider>
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthorizationProvider>
  );
}
