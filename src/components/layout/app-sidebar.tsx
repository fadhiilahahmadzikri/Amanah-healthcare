'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { SidebarSkeleton } from '@/components/layout/sidebar-skeleton';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, navGroups, status, isReady } = useAuthContext();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  // Idempotent state management: close mobile sidebar when navigating or clicking active link
  const handleNavClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  // Ensure mobile sidebar is closed when route changes
  React.useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {!isReady || status === 'unknown' ? (
          <SidebarSkeleton />
        ) : (
          navGroups.map((group) => (
            <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                  const itemIsActive = isNavItemActive(pathname, item.url, item.items);
                  return item?.items && item?.items?.length > 0 ? (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive || itemIsActive}
                      className='group/collapsible'
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={itemIsActive}>
                            {item.icon && <Icon />}
                            <span>{item.title}</span>
                            <Icons.chevronRight className='transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ml-auto' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => {
                              const SubIcon = subItem.icon ? Icons[subItem.icon] : null;

                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSameOrChildPath(pathname, subItem.url)}
                                  >
                                    <Link href={subItem.url} onClick={handleNavClick}>
                                      {SubIcon && <SubIcon />}
                                      <span className='min-w-0 flex-1 truncate'>
                                        {subItem.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={itemIsActive}>
                        <Link href={item.url} onClick={handleNavClick}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user ? (
                    <UserAvatarProfile className='h-8 w-8 rounded-lg' showInfo user={user} />
                  ) : (
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-muted animate-pulse' />
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <div className='h-3.5 w-20 rounded bg-muted animate-pulse mb-1' />
                        <div className='h-2.5 w-28 rounded bg-muted animate-pulse' />
                      </div>
                    </div>
                  )}
                  <Icons.chevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile className='h-8 w-8 rounded-lg' showInfo user={user} />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      handleNavClick();
                      router.push('/dashboard/profile');
                    }}
                  >
                    <Icons.account className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  {role === 'admin' && (
                    <DropdownMenuItem
                      onClick={() => {
                        handleNavClick();
                        router.push('/dashboard/billing');
                      }}
                    >
                      <Icons.creditCard className='mr-2 h-4 w-4' />
                      Billing
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    handleNavClick();
                    await signOut();
                    window.location.href = '/auth/sign-in';
                  }}
                  className='cursor-pointer text-destructive focus:text-destructive'
                >
                  <Icons.logout className='mr-2 h-4 w-4' />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function isNavItemActive(pathname: string, url: string, items?: Array<{ url: string }>): boolean {
  if (url !== '#' && isSameOrChildPath(pathname, url)) {
    return true;
  }

  return items?.some((item) => isSameOrChildPath(pathname, item.url)) ?? false;
}

function isSameOrChildPath(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(`${url}/`);
}
