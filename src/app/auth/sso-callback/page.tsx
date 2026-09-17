import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | SSO Callback',
  robots: {
    index: false,
    follow: false
  }
};

export default function SsoCallbackPage() {
  redirect('/dashboard/admin');
}
