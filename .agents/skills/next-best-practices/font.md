# Font Optimization

Use `next/font` for automatic font optimization with zero layout shift.

## Google Fonts

```tsx

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Multiple Fonts

```tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Use in CSS:

```css
body {
  font-family: var(--font-inter);
}

code {
  font-family: var(--font-roboto-mono);
}
```

## Font Weights and Styles

```tsx

const inter = Inter({
  subsets: ['latin'],
  weight: '400'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700']
});

const inter = Inter({
  subsets: ['latin']

});

const inter = Inter({
  subsets: ['latin'],
  style: ['normal', 'italic']
});
```

## Local Fonts

```tsx
import localFont from 'next/font/local';

const myFont = localFont({
  src: './fonts/MyFont.woff2'
});

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal'
    }
  ]
});

const myFont = localFont({
  src: './fonts/MyFont-Variable.woff2',
  variable: '--font-my-font'
});
```

## Tailwind CSS Integration

```tsx

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

```js

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)']
      }
    }
  }
};
```

## Preloading Subsets

Only load needed character subsets:

```tsx

const inter = Inter({ subsets: ['latin'] });

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'] });
```

## Display Strategy

Control font loading behavior:

```tsx
const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});

```

## Don't Use Manual Font Links

Always use `next/font` instead of `<link>` tags for Google Fonts.

```tsx

<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />

<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

## Common Mistakes

```tsx

import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

@import url('https://fonts.googleapis.com/css2?family=Inter');

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] })

const inter = Inter({})

const inter = Inter({ subsets: ['latin'] })
```

## Font in Specific Components

```tsx

import { Inter, Playfair_Display } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
export const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

import { playfair } from '@/lib/fonts';

export function Heading({ children }) {
  return <h1 className={playfair.className}>{children}</h1>;
}
```
