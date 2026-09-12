import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage({ stars: _stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Sign Up
      </Link>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image
            src='/logo.svg'
            alt='Logo'
            width={154}
            height={45}
            className='mr-2 h-10 w-auto object-contain'
            priority
          />
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
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <ClerkSignUpForm
            fallbackRedirectUrl='/dashboard/admin'
            initialValues={{
              emailAddress: 'your_mail+clerk_test@example.com'
            }}
          />
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms-of-service'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy-policy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
