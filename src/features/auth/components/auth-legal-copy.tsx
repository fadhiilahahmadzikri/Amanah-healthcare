import Link from 'next/link';

export function AuthLegalCopy() {
  return (
    <p>
      Dengan melanjutkan, Anda menyetujui{' '}
      <Link href='/terms-of-service' className='text-foreground underline underline-offset-4'>
        Terms of Service
      </Link>{' '}
      dan{' '}
      <Link href='/privacy-policy' className='text-foreground underline underline-offset-4'>
        Privacy Policy
      </Link>
      .
    </p>
  );
}
