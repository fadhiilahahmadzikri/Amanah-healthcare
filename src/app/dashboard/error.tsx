'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex h-[calc(100vh-4rem)] w-full items-center justify-center p-6'>
      <EmptyState
        icon={Icons.warning}
        animated={false}
        title='Tidak dapat terhubung ke server'
        description={
          error?.message && !error.message.includes('digest')
            ? error.message
            : 'Terjadi kendala jaringan atau server backend sedang tidak aktif. Silakan coba lagi dalam beberapa saat.'
        }
        action={
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => window.location.reload()}>
              Muat Ulang Halaman
            </Button>
            <Button size='sm' onClick={() => reset()}>
              Coba Lagi
            </Button>
          </div>
        }
      />
    </div>
  );
}
