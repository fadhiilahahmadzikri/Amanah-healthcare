'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { NotificationCard } from '@/components/ui/notification-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useNotificationCenter } from '../model/useNotificationCenter';

export function NotificationCenter() {
  const notificationCenter = useNotificationCenter();

  return (
    <Popover open={notificationCenter.open} onOpenChange={notificationCenter.actions.setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Icons.notification className='h-5 w-5' />
          {notificationCenter.unreadTotal > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]'
            >
              {notificationCenter.unreadTotal > 99 ? '99+' : notificationCenter.unreadTotal}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-full sm:w-[500px] p-0 rounded-2xl shadow-xl'>
        <div className='flex items-center justify-between px-5 pt-5 pb-4'>
          <h4 className='text-xl font-bold tracking-tight'>Notifikasi Klinik</h4>
          <Button
            variant='ghost'
            size='sm'
            disabled={notificationCenter.notifications.length === 0}
            className='h-auto p-0 text-[14px] font-semibold text-primary hover:text-primary/90 hover:bg-transparent'
            onClick={notificationCenter.actions.markAllAsRead}
          >
            <Icons.checks className='mr-1.5 h-4 w-4' /> Tandai semua dibaca
          </Button>
        </div>

        <Tabs
          defaultValue='all'
          className='w-full'
          onValueChange={notificationCenter.actions.changeTab}
        >
          <div className='px-5 pb-3'>
            <TabsList className='w-full justify-start h-10 bg-transparent p-0 gap-4'>
              {[
                { value: 'all', label: 'Semua', count: notificationCenter.categoriesCount.all },
                {
                  value: 'Janji Temu',
                  label: 'Janji Temu',
                  count: notificationCenter.categoriesCount.janjiTemu
                },
                {
                  value: 'Promo',
                  label: 'Promo',
                  count: notificationCenter.categoriesCount.promo
                },
                {
                  value: 'Hasil Lab',
                  label: 'Hasil Lab',
                  count: notificationCenter.categoriesCount.lab
                }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className='relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none flex items-center gap-2 text-xs'
                >
                  {tab.label}{' '}
                  <Badge
                    variant='secondary'
                    className='px-1.5 rounded-sm bg-muted text-muted-foreground font-semibold text-[10px]'
                  >
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent
            value={notificationCenter.activeTab}
            className='m-0 border-t border-border/50'
          >
            <ScrollArea className='h-[420px]'>
              {notificationCenter.filteredNotifications.length > 0 ? (
                <div className='flex flex-col'>
                  {notificationCenter.filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      id={notification.id}
                      title={notification.sender}
                      body={notification.body}
                      user={{
                        name: notification.sender,
                        handle: notification.roleSubtitle,
                        avatar: notification.avatar
                      }}
                      category={notification.category}
                      status={notification.status}
                      createdAt={notification.createdAt}
                      onMarkAsRead={notificationCenter.actions.markAsRead}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Icons.notification}
                  title='Tidak ada notifikasi'
                  description='Notifikasi akan ditampilkan di sini setelah tersedia.'
                  className='min-h-[360px] border-0 bg-transparent'
                />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className='flex items-center justify-between border-t border-border/50 p-4'>
          <Link
            href='/dashboard/notifications'
            className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2'
            onClick={notificationCenter.actions.close}
          >
            Kelola notifikasi
          </Link>
          <Button
            className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs'
            asChild
          >
            <Link href='/dashboard/notifications' onClick={notificationCenter.actions.close}>
              Lihat semua notifikasi
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
