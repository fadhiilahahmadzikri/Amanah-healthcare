import type { ReactNode } from 'react';
import { Caveat, Lora, Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans'
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat'
});

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora'
});

type PublicSiteRouteShellProps = {
  children: ReactNode;
};

export function PublicSiteRouteShell({ children }: PublicSiteRouteShellProps) {
  return (
    <div
      className={`${plusJakartaSans.variable} ${caveat.variable} ${lora.variable} public-site-scope min-h-screen`}
    >
      {children}
    </div>
  );
}
