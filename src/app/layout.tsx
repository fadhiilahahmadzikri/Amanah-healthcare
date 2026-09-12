import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import { getBaseUrl } from '@/features/public-site/lib/helpers';
import { defaultOgImages, defaultTwitterCard } from '@/features/public-site/lib/seo';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'Klinik Pratama Amanah Healthcare - Klinik Persalinan dan Umum Yogyakarta',
    template: '%s | Klinik Pratama Amanah Healthcare'
  },
  description:
    'Klinik Pratama Amanah Healthcare menyediakan layanan dokter umum, kebidanan & persalinan 24 jam, imunisasi anak, dan khitan di Condongcatur, Sleman, Yogyakarta.',
  keywords: [
    'klinik amanah',
    'klinik pratama amanah',
    'klinik pratama amanah healthcare',
    'klinik persalinan yogyakarta',
    'klinik bersalin sleman',
    'persalinan 24 jam jogja',
    'dokter umum condongcatur',
    'dokter umum sleman',
    'dokter umum jogja',
    'bidan 24 jam sleman',
    'khitan modern yogyakarta',
    'sunat anak yogyakarta',
    'imunisasi anak sleman',
    'pemeriksaan kehamilan jogja',
    'klinik bpjs condongcatur'
  ],
  authors: [{ name: 'Klinik Pratama Amanah Healthcare', url: getBaseUrl() }],
  creator: 'Klinik Pratama Amanah Healthcare',
  publisher: 'Klinik Pratama Amanah Healthcare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Klinik Pratama Amanah Healthcare',
    title: 'Klinik Pratama Amanah Healthcare - Klinik Persalinan dan Umum Yogyakarta',
    description:
      'Layanan dokter umum, kebidanan & persalinan 24 jam, imunisasi, dan khitan anak ramah trauma di Condongcatur, Sleman, Yogyakarta.',
    images: defaultOgImages
  },
  twitter: {
    ...defaultTwitterCard,
    title: 'Klinik Pratama Amanah Healthcare - Klinik Persalinan dan Umum Yogyakarta',
    description:
      'Layanan dokter umum, kebidanan & persalinan 24 jam, imunisasi, dan khitan anak ramah trauma di Condongcatur, Sleman, Yogyakarta.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: '/',
    languages: {
      'id-ID': '/'
    }
  },
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png'
    }
  ]
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='id' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set meta theme color
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
