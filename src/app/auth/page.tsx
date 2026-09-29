import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/core/routes';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function AuthPage() {
  redirect(ROUTES.signIn);
}
