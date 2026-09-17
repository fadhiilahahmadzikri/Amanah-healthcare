'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

interface AuthStatusAlertProps {
  message?: string | null;
  tone?: 'error' | 'info';
}

export function AuthStatusAlert({ message, tone = 'error' }: AuthStatusAlertProps) {
  if (!message) return null;

  return (
    <Alert variant={tone === 'error' ? 'destructive' : 'default'}>
      {tone === 'error' ? <Icons.alertCircle /> : <Icons.info />}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
