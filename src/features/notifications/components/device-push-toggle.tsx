'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useWebPushRegistration } from '../hooks/use-web-push-registration';

export function DevicePushToggle() {
  const { isSupported, isSubscribed, isLoading, subscribePush, unsubscribePush } =
    useWebPushRegistration();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribePush();
      if (ok) {
        toast.info('Notifikasi push pada perangkat ini telah dinonaktifkan.');
      } else {
        toast.error('Gagal menonaktifkan notifikasi perangkat.');
      }
    } else {
      const ok = await subscribePush();
      if (ok) {
        toast.success('Notifikasi dan getaran panggilan aktif di perangkat ini!');
      } else {
        toast.warning('Izin notifikasi tidak diberikan atau diblokir pada browser Anda.');
      }
    }
  };

  return (
    <div className='flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20'>
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <div className='size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
          <Icons.notification className='size-4' />
        </div>
        <div className='min-w-0 flex-1 space-y-0.5'>
          <h4 className='text-xs sm:text-sm font-semibold text-foreground truncate'>
            {isSubscribed
              ? 'Notifikasi & Getaran HP Aktif'
              : 'Aktifkan Pengingat Suara & Getaran HP'}
          </h4>
          <p className='text-xs text-muted-foreground truncate'>
            {isSubscribed
              ? 'Perangkat ini akan bergetar saat nomor antrean Anda dipanggil.'
              : 'Dapatkan pemberitahuan langsung saat giliran periksa tiba meski layar tertutup.'}
          </p>
        </div>
      </div>

      <Button
        type='button'
        variant={isSubscribed ? 'outline' : 'default'}
        size='sm'
        shape='pill'
        disabled={isLoading}
        onClick={handleToggle}
        className='shrink-0 text-xs font-semibold'
      >
        {isLoading ? (
          <Icons.spinner className='size-3.5 animate-spin mr-1' />
        ) : isSubscribed ? (
          <Icons.check className='size-3.5 mr-1 text-emerald-500' />
        ) : (
          <Icons.notification className='size-3.5 mr-1' />
        )}
        {isSubscribed ? 'Aktif' : 'Aktifkan'}
      </Button>
    </div>
  );
}
