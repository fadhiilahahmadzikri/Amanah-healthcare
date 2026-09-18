import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthFlowView } from '@/features/auth/components/auth-flow-view';

export const metadata: Metadata = {
  title: 'Verifikasi Email | Amanah HealthCare',
  description: 'Verifikasi akun Anda dengan memasukkan 6-digit kode OTP.'
};

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <AuthFlowView />
    </Suspense>
  );
}
