import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthFlowView } from './auth-flow-view';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage() {
  return (
    <Suspense>
      <AuthFlowView />
    </Suspense>
  );
}
