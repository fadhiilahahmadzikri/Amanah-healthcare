import Image from 'next/image';
import Link from 'next/link';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Link href='/' aria-label='Amanah Healthcare home'>
            <Image
              src='/logo.svg'
              alt='Logo'
              width={154}
              height={45}
              className='mr-2 h-10 w-auto object-contain'
              priority
            />
          </Link>
        </div>
        <div className='absolute inset-0 h-full w-full overflow-hidden'>
          <Image
            src='/auth-bg.png'
            alt='Amanah Healthcare'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
        </div>
        <div className='relative z-20 mt-auto text-white'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Pelayanan yang ramah, dokter yang profesional, dan suasana klinik yang nyaman
              membuat saya merasa tenang selama mendapatkan perawatan.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>

      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center'>{children}</div>
      </div>
    </main>
  );
}
