'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';

/**
 * Stable Sidebar Skeleton rendered when authorization state is UNKNOWN.
 * Strictly adheres to "No Unauthorized First Paint":
 * Paints zero navigation links or role-specific identifiers while state is resolving.
 */
export function SidebarSkeleton() {
  return (
    <div className='flex flex-col gap-4 py-2'>
      <SidebarGroup className='py-0'>
        <SidebarGroupLabel>
          <Skeleton className='h-3 w-16' />
        </SidebarGroupLabel>
        <SidebarMenu className='gap-1.5'>
          {Array.from({ length: 5 }).map((_, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton className='pointer-events-none'>
                <Skeleton className='h-4 w-4 shrink-0 rounded' />
                <Skeleton className='h-4 rounded' style={{ width: `${60 + (idx % 3) * 20}%` }} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className='py-0'>
        <SidebarGroupLabel>
          <Skeleton className='h-3 w-14' />
        </SidebarGroupLabel>
        <SidebarMenu className='gap-1.5'>
          {Array.from({ length: 3 }).map((_, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton className='pointer-events-none'>
                <Skeleton className='h-4 w-4 shrink-0 rounded' />
                <Skeleton className='h-4 rounded' style={{ width: `${50 + (idx % 2) * 25}%` }} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}
