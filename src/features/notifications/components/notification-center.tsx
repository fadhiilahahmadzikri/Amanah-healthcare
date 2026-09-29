'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { NotificationCard } from '@/components/ui/notification-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useNotificationCenter } from '../model/useNotificationCenter';

export function NotificationCenter() {
  const { open, notifications, unreadTotal, actions } = useNotificationCenter();

  return (
    <Popover open={open} onOpenChange={actions.setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Icons.notification className='h-5 w-5' />
          {unreadTotal > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]'
            >
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-full sm:w-[500px] p-0 rounded-2xl shadow-xl'>
        <div className='flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50'>
          <h4 className='text-xl font-bold tracking-tight'>Notifikasi Klinik</h4>
          <Button
            variant='ghost'
            size='sm'
            disabled={notifications.length === 0}
            className='h-auto p-0 text-[14px] font-semibold text-primary hover:text-primary/90 hover:bg-transparent'
            onClick={actions.markAllAsRead}
          >
            <Icons.checks className='mr-1.5 h-4 w-4' /> Tandai semua dibaca
          </Button>
        </div>

        <ScrollArea className='h-[420px]'>
          {notifications.length > 0 ? (
            <div className='flex flex-col'>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.title}
                  body={notification.body}
                  user={{
                    name: notification.sender,
                    avatar: notification.avatar
                  }}
                  category={notification.category}
                  status={notification.status}
                  createdAt={notification.createdAt}
                  onMarkAsRead={actions.markAsRead}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Icons.notification}
              title='Tidak ada notifikasi'
              description='Belum ada notifikasi baru saat ini.'
              className='min-h-[360px] border-0 bg-transparent'
            />
          )}
        </ScrollArea>

        <div className='flex items-center justify-between border-t border-border/50 p-4'>
          <Link
            href='/dashboard/notifications'
            className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2'
            onClick={actions.close}
          >
            Kelola notifikasi
          </Link>
          <Button
            className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs'
            asChild
          >
            <Link href='/dashboard/notifications' onClick={actions.close}>
              Lihat semua notifikasi
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
