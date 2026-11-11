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
        - On mobile: Fluid banner with object-[center_20%] framing so both doctor & patient are clearly visible with natural headroom.
        - On desktop: Fixed 50vw x 100vh panel locked to viewport so it never stretches or jumps when right form height changes.
      */}
      <aside className='relative w-full overflow-hidden h-52 sm:h-60 lg:h-full lg:sticky lg:top-0 flex flex-col justify-between p-5 sm:p-8 lg:p-12 shrink-0 select-none'>
        <div className='absolute inset-0 h-full w-full'>
          <Image
            src='/auth-bg.png'
            alt='Amanah Healthcare'
            fill
            className='object-cover object-[center_20%] lg:object-center'
            priority
          />
          {/* Blurry soft integrated white gradient on mobile: seamless transition to page background without black scrim */}
          <div className='absolute inset-x-0 bottom-0 h-24 sm:h-28 pointer-events-none lg:hidden backdrop-blur-sm [mask-image:linear-gradient(to_top,black_20%,transparent)]' />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/60 via-background/15 to-transparent pointer-events-none lg:hidden' />
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

        {/* Minimalist Quote / Tagline (Hidden on mobile to eliminate gap and let form section sit snuggly under banner) */}
        <div className='relative z-20 mt-auto pt-3 pb-2 sm:pb-3 hidden lg:block'>
          <blockquote className='max-w-md lg:max-w-lg'>
            <p className='text-xs sm:text-sm lg:text-base font-medium leading-relaxed text-white'>
              &ldquo;Pelayanan yang ramah, dokter yang profesional, dan suasana klinik yang nyaman.&rdquo;
            </p>
          </blockquote>
        </div>
      </aside>

      {/* 
        Right Panel / Form Container
        - On mobile: Slides snugly up into the banner's bottom fade (-mt-12 sm:-mt-16) to eliminate dead gap.
        - On desktop: Dedicated independent scrolling container (overflow-y-auto), perfectly centered.
      */}
      <section className='relative z-20 flex flex-col items-center w-full px-4 pb-8 pt-0 -mt-12 sm:-mt-16 lg:mt-0 sm:px-6 lg:justify-center lg:p-8 lg:h-full lg:overflow-y-auto'>
        <div className='flex w-full max-w-md flex-col items-center justify-center lg:my-auto pt-0 pb-6 sm:py-8 lg:py-12'>
          {children}
        </div>
      </section>
    </main>
  );
}
