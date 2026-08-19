# Scripts

Loading third-party scripts in Next.js.

## Use next/script

Always use `next/script` instead of native `<script>` tags for better performance.

```tsx

<script src='https://example.com/script.js'></script>;

import Script from 'next/script';

<Script src='https://example.com/script.js' />;
```

## Inline Scripts Need ID

Inline scripts require an `id` attribute for Next.js to track them.

```tsx

<Script dangerouslySetInnerHTML={{ __html: 'console.log("hi")' }} />

<Script id="my-script" dangerouslySetInnerHTML={{ __html: 'console.log("hi")' }} />

<Script id="show-banner">
  {`document.getElementById('banner').classList.remove('hidden')`}
</Script>
```

## Don't Put Script in Head

`next/script` should not be placed inside `next/head`. It handles its own positioning.

```tsx

import Head from 'next/head'
import Script from 'next/script'

<Head>
  <Script src="/analytics.js" />
</Head>

<Head>
  <title>Page</title>
</Head>
<Script src="/analytics.js" />
```

## Loading Strategies

```tsx

<Script src="/analytics.js" strategy="afterInteractive" />

<Script src="/widget.js" strategy="lazyOnload" />

<Script src="/critical.js" strategy="beforeInteractive" />

<Script src="/heavy.js" strategy="worker" />
```

## Google Analytics

Use `@next/third-parties` instead of inline GA scripts.

```tsx

<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX" />
<Script id="ga-init">
  {`window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXX');`}
</Script>

import { GoogleAnalytics } from '@next/third-parties/google'

export default function Layout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXX" />
    </html>
  )
}
```

## Google Tag Manager

```tsx
import { GoogleTagManager } from '@next/third-parties/google';

export default function Layout({ children }) {
  return (
    <html>
      <GoogleTagManager gtmId='GTM-XXXXX' />
      <body>{children}</body>
    </html>
  );
}
```

## Other Third-Party Scripts

```tsx

import { YouTubeEmbed } from '@next/third-parties/google';

<YouTubeEmbed videoid='dQw4w9WgXcQ' />;

import { GoogleMapsEmbed } from '@next/third-parties/google';

<GoogleMapsEmbed apiKey='YOUR_API_KEY' mode='place' q='Brooklyn+Bridge,New+York,NY' />;
```

## Quick Reference

| Pattern                                       | Issue                      | Fix                       |
| --------------------------------------------- | -------------------------- | ------------------------- |
| `<script src="...">`                          | No optimization            | Use `next/script`         |
| `<Script>` without id                         | Can't track inline scripts | Add `id` attribute        |
| `<Script>` inside `<Head>`                    | Wrong placement            | Move outside Head         |
| Inline GA/GTM scripts                         | No optimization            | Use `@next/third-parties` |
| `strategy="beforeInteractive"` outside layout | Won't work                 | Only use in root layout   |
