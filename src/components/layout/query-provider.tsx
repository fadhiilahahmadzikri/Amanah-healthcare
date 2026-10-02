'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query-client';
import { useDevtoolsShortcut } from '@/hooks/use-devtools-shortcut';
import { DevAutofillToolbar } from '@/components/dev-autofill/dev-autofill-toolbar';
import type * as React from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const { isVisible } = useDevtoolsShortcut();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isVisible && <ReactQueryDevtools />}
      {isVisible && process.env.NODE_ENV === 'development' && <DevAutofillToolbar />}
    </QueryClientProvider>
  );
}
