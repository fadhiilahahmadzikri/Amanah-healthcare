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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navGroups } from '@/config/nav-config';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { useOrderActivityStore } from '@/features/orders/store/order-activity-store';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const filteredGroups = useFilteredNavGroups(navGroups);
  const unreadOrderCount = useOrderActivityStore((state) => state.unreadOrderCount);
  const clearUnreadOrders = useOrderActivityStore((state) => state.clearUnreadOrders);

  React.useEffect(() => {
    if (isOrdersPath(pathname) && unreadOrderCount > 0) {
      clearUnreadOrders();
    }
  }, [clearUnreadOrders, pathname, unreadOrderCount]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const itemIsActive = isNavItemActive(pathname, item.url, item.items);
                const itemHasOrderActivity =
                  unreadOrderCount > 0 &&
                  Boolean(item.items?.some((subItem) => isOrdersPath(subItem.url)));
                const itemIsOrders = isOrdersPath(item.url);
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
                          {itemHasOrderActivity && (
                            <span className='ml-auto rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums group-data-[collapsible=icon]:hidden'>
                              {formatBadgeCount(unreadOrderCount)}
                            </span>
                          )}
                          <Icons.chevronRight
                            className={cn(
                              'transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90',
                              itemHasOrderActivity ? 'ml-0' : 'ml-auto'
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const SubIcon = subItem.icon ? Icons[subItem.icon] : null;
                            const subItemIsOrders = isOrdersPath(subItem.url);

                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSameOrChildPath(pathname, subItem.url)}
                                >
                                  <Link
                                    href={subItem.url}
                                    onClick={subItemIsOrders ? clearUnreadOrders : undefined}
                                  >
                                    {SubIcon && <SubIcon />}
                                    <span className='min-w-0 flex-1 truncate'>{subItem.title}</span>
                                    {subItemIsOrders && unreadOrderCount > 0 && (
                                      <span className='rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums'>
                                        {formatBadgeCount(unreadOrderCount)}
                                      </span>
                                    )}
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
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={itemIsActive}
                      className={cn(itemIsOrders && unreadOrderCount > 0 && 'pr-9')}
                    >
                      <Link href={item.url} onClick={itemIsOrders ? clearUnreadOrders : undefined}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {itemIsOrders && unreadOrderCount > 0 && (
                      <SidebarMenuBadge className='bg-primary text-primary-foreground'>
                        {formatBadgeCount(unreadOrderCount)}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
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
                  {user && (
                    <UserAvatarProfile className='h-8 w-8 rounded-lg' showInfo user={user} />
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
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <Icons.account className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  {organization && (
                    <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                      <Icons.creditCard className='mr-2 h-4 w-4' />
                      Billing
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Icons.logout className='mr-2 h-4 w-4' />
                  <SignOutButton redirectUrl='/auth/sign-in' />
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

function isOrdersPath(pathname: string): boolean {
  return isSameOrChildPath(pathname, '/dashboard/orders');
}

function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}
