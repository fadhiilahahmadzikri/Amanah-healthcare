'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useSession } from '@/lib/auth-client';
import { getRoleLandingPath, ROUTES } from '@/core/routes';

export default function NotFound() {
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthenticated = Boolean(session?.user);
  const userAudience = (session?.user as { audience?: string })?.audience;
  const destination = isAuthenticated ? getRoleLandingPath(userAudience) : ROUTES.home;

  const destinationLabel = isAuthenticated ? 'Kembali ke Portal' : 'Kembali ke Beranda';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(destination);
    }
  };

  return (
    <div className='absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <span className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent'>
        404
      </span>
      <h2 className='font-heading my-2 text-2xl font-bold'>Halaman Tidak Ditemukan</h2>
      <p className='text-muted-foreground max-w-md'>
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={handleBack} variant='outline' size='lg'>
          <Icons.arrowLeft className='size-4' />
          Kembali
        </Button>
        <Button asChild variant='default' size='lg'>
          <Link href={destination}>
            {isAuthenticated && <Icons.dashboard className='size-4' />}
            {destinationLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
