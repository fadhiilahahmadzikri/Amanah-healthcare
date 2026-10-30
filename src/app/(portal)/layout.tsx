import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';
import { isRouteAuthorized } from '@/lib/rbac/route-manifest';
import { filterNavGroupsByAccess } from '@/lib/rbac/navigation';
import { AuthorizationProvider } from '@/lib/rbac/auth-context';
import { navGroups } from '@/config/nav-config';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth/session.dal';
import { getRoleLandingPath } from '@/core/routes';

export const metadata: Metadata = {
  title: 'Amanah Healthcare Portal',
  description: 'Sistem Informasi Manajemen Rumah Sakit Amanah Healthcare',
  robots: {
    index: false,
    follow: false
  }
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers();
  const { user, role: userRole, audience } = await requireSession();
  const pathname = reqHeaders.get('x-pathname') || getRoleLandingPath(audience);

  // Enforce Route Manifest RBAC at Layout Boundary
  const authResult = isRouteAuthorized(pathname, {
    audience,
    permissions: user.permissions ?? [],
    role: userRole
  });

  if (!authResult.allowed) {
    if (authResult.reason === 'forbidden') {
      const destination = getRoleLandingPath(audience);
      if (pathname !== destination) {
        redirect(destination);
      }
    }
  }

  // Pre-filter navigation groups on the server for Zero-Flicker Hydration
  const authorizedNavGroups = filterNavGroupsByAccess(navGroups, audience, user.permissions);

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <AuthorizationProvider
      initialUser={user}
      initialRole={userRole}
      initialAudience={audience}
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
            </InfobarProvider>
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthorizationProvider>
  );
}
