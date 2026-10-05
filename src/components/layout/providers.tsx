'use client';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import { NotificationProvider } from '../providers/notification-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      <QueryProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </QueryProvider>
    </ActiveThemeProvider>
  );
}

