'use client';

import * as React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/rbac/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

export function OrgSwitcher() {
  const { isMobile, state, setOpenMobile } = useSidebar();
  const router = useRouter();
  const { role, isReady } = useAuthContext();

  const handleCloseMobile = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const isAdmin = role === 'admin';

  const organization = {
    id: 'amanah-main',
    name: 'Amanah Healthcare',
    role: isAdmin ? 'Klinik Admin' : 'Portal Pasien'
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg'>
                <Image
                  src='/healthcare/assets/images/logo_healthcare_1_7a4161db.webp'
                  alt='Logo Amanah Healthcare'
                  width={32}
                  height={32}
                  className='size-8 object-contain'
                  priority
                />
              </div>
              <div
                className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 overflow-hidden opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              >
                <span className='truncate font-medium'>{organization.name}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {!isReady ? <Skeleton className='h-3 w-16 inline-block' /> : organization.role}
                </span>
              </div>
              <Icons.chevronsUpDown
                className={`ml-auto transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Unit Layanan Klinik
            </DropdownMenuLabel>
            <DropdownMenuItem className='gap-2 p-2' onClick={handleCloseMobile}>
              <div className='flex size-6 items-center justify-center overflow-hidden rounded-md'>
                <Image
                  src='/healthcare/assets/images/logo_healthcare_1_7a4161db.webp'
                  alt='Logo Amanah Healthcare'
                  width={24}
                  height={24}
                  className='size-6 object-contain'
                />
              </div>
              {organization.name}
              <Icons.check className='ml-auto size-4' />
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='gap-2 p-2'
                  onClick={() => {
                    handleCloseMobile();
                    router.push('/dashboard/workspaces');
                  }}
                >
                  <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                    <Icons.add className='size-4' />
                  </div>
                  <div className='text-muted-foreground font-medium'>Kelola Layanan</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
