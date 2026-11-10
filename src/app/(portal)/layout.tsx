import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';
import { AutoWebPushSync } from '@/features/notifications';
import { isRouteAuthorized } from '@/lib/rbac/route-manifest';
import { mapPageTreeToNavGroups } from '@/lib/rbac/navigation';
import { AuthorizationProvider } from '@/lib/rbac/auth-context';
import { getServerPageTree } from '@/server/dal/page-tree.dal';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth/session.dal';
import { ROUTES, getRoleLandingPath, PORTAL_PREFIXES } from '@/core/routes';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import { PromotionsProvider, PromoBanner, PromoModal } from '@/features/promotions';

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

  const landingPath = getRoleLandingPath(audience);

  if (!authResult.allowed) {
    if (pathname === landingPath) {
      redirect(ROUTES.sessionExpired);
    }
    redirect(landingPath);
  }

  // Enforce Dynamic Page Registry & CMS Kill-Switch at Layout Boundary
  const portalRoot = PORTAL_PREFIXES[audience];
  const isLandingOrPortalRoot =
    pathname === landingPath || pathname === portalRoot;

  const isAllowedByPageRegistry =
    !user.accessibleRoutes ||
    isLandingOrPortalRoot ||
    user.accessibleRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (!isAllowedByPageRegistry && pathname !== landingPath) {
    redirect(landingPath);
  }

  // Fetch canonical database application pages (SSOT)
  const pageTree = await getServerPageTree(audience);
  const authorizedNavGroups = mapPageTreeToNavGroups(
    pageTree,
    audience,
    user.accessibleRoutes
  );

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';
  const isExternalAudience = audience === AUDIENCE.EXTERNAL;

  const sidebarContent = (
    <SidebarInset>
      {isExternalAudience ? (
        <div className='sticky top-0 z-50 w-full'>
          <PromoBanner />
          <Header />
        </div>
      ) : (
        <Header />
      )}
      <InfobarProvider defaultOpen={false}>
        {children}
        <InfoSidebar side='right' />
        <ChatwootWidget />
        <AutoWebPushSync />
      </InfobarProvider>
    </SidebarInset>
  );

  return (
    <AuthorizationProvider
      initialUser={user}
      initialRole={userRole}
      initialAudience={audience}
      initialNavGroups={authorizedNavGroups}
    >
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          {isExternalAudience ? (
            <PromotionsProvider>
              {sidebarContent}
              <PromoModal />
            </PromotionsProvider>
          ) : (
            sidebarContent
          )}
        </SidebarProvider>
      </KBar>
    </AuthorizationProvider>
  );
}
