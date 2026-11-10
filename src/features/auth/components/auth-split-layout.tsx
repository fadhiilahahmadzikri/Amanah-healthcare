import Image from 'next/image';
import Link from 'next/link';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className='relative min-h-screen w-full bg-background lg:h-screen lg:overflow-hidden lg:grid lg:grid-cols-2'>
      {/* 
        Mobile Banner (<lg) & Desktop Left Panel (lg+)
        - On mobile: Fluid banner at the top with seamless downward gradient to background.
        - On desktop: Fixed 50vw x 100vh panel locked to viewport so it never stretches or jumps when right form height changes.
      */}
      <aside className='relative w-full overflow-hidden h-56 sm:h-64 lg:h-full lg:sticky lg:top-0 flex flex-col justify-between p-5 sm:p-8 lg:p-12 shrink-0 select-none'>
        <div className='absolute inset-0 h-full w-full'>
          <Image
            src='/auth-bg.png'
            alt='Amanah Healthcare'
            fill
            className='object-cover object-center'
            priority
          />
          {/* Atmospheric dark scrim on mobile for rich contrast */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 lg:hidden' />
          {/* Subtle bottom edge feathering to page background on mobile */}
          <div className='absolute bottom-0 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background pointer-events-none lg:hidden' />
          {/* Contrast gradient on desktop */}
          <div className='absolute inset-0 hidden lg:block bg-gradient-to-t from-black/85 via-black/40 to-black/20' />
        </div>

        {/* Brand Logo */}
        <div className='relative z-20 flex items-center'>
          <Link href='/' aria-label='Amanah Healthcare home' className='inline-block'>
            <Image
              src='/logo.svg'
              alt='Logo Amanah Healthcare'
              width={140}
              height={40}
              className='h-8 sm:h-9 lg:h-10 w-auto object-contain'
              priority
            />
          </Link>
        </div>

        {/* Minimalist Quote / Tagline */}
        <div className='relative z-20 text-white mt-auto pt-3 pb-2 sm:pb-3'>
          <blockquote className='max-w-md lg:max-w-lg'>
            <p className='text-xs sm:text-sm lg:text-base font-medium leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.9),_0_2px_10px_rgba(0,0,0,0.7)]'>
              &ldquo;Pelayanan yang ramah, dokter yang profesional, dan suasana klinik yang nyaman.&rdquo;
            </p>
          </blockquote>
        </div>
      </aside>

      {/* 
        Right Panel / Form Container
        - On mobile: Flows fluidly below the banner with natural scrolling.
        - On desktop: Dedicated independent scrolling container (overflow-y-auto), perfectly centered.
      */}
      <section className='relative flex flex-col items-center justify-center w-full px-4 pb-8 pt-2 sm:px-6 lg:p-8 lg:h-full lg:overflow-y-auto'>
        <div className='flex w-full max-w-md flex-col items-center justify-center my-auto py-4 sm:py-8 lg:py-12'>
          {children}
        </div>
      </section>
    </main>
  );
}
