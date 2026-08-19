# Image Optimization

Use `next/image` for automatic image optimization.

## Always Use next/image

```tsx

<img src='/hero.png' alt='Hero' />;

import Image from 'next/image';
<Image src='/hero.png' alt='Hero' width={800} height={400} />;
```

## Required Props

Images need explicit dimensions to prevent layout shift:

```tsx

import heroImage from './hero.png'
<Image src={heroImage} alt="Hero" />

<Image src="https://example.com/image.jpg" alt="Hero" width={800} height={400} />

<div style={{ position: 'relative', width: '100%', height: 400 }}>
  <Image src="/hero.png" alt="Hero" fill style={{ objectFit: 'cover' }} />
</div>
```

## Remote Images Configuration

Remote domains must be configured in `next.config.js`:

```js

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**'
      },
      {
        protocol: 'https',
        hostname: '*.cdn.com'
      }
    ]
  }
};
```

## Responsive Images

Use `sizes` to tell the browser which size to download:

```tsx

<Image
  src="/hero.png"
  alt="Hero"
  fill
  sizes="100vw"
/>

<Image
  src="/card.png"
  alt="Card"
  fill
  sizes="(max-width: 768px) 100vw, 33vw"
/>

<Image
  src="/avatar.png"
  alt="Avatar"
  width={200}
  height={200}
  sizes="200px"
/>
```

## Blur Placeholder

Prevent layout shift with placeholders:

```tsx

import heroImage from './hero.png'
<Image src={heroImage} alt="Hero" placeholder="blur" />

<Image
  src="https://example.com/image.jpg"
  alt="Hero"
  width={800}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>

<Image
  src="https://example.com/image.jpg"
  alt="Hero"
  width={800}
  height={400}
  placeholder="empty"
  style={{ backgroundColor: '#e0e0e0' }}
/>
```

## Priority Loading

Use `priority` for above-the-fold images (LCP):

```tsx

<Image src="/hero.png" alt="Hero" fill priority />

<Image src="/card.png" alt="Card" width={400} height={300} />
```

## Common Mistakes

```tsx

<Image src="/hero.png" alt="Hero" fill />

<Image src="/hero.png" alt="Hero" fill sizes="100vw" />

<Image src="/hero.png" alt="Hero" width={16} height={9} />

<Image src="/hero.png" alt="Hero" fill sizes="100vw" style={{ objectFit: 'cover' }} />

<Image src="https://untrusted.com/image.jpg" alt="Image" width={400} height={300} />

```

## Static Export

When using `output: 'export'`, use `unoptimized` or custom loader:

```tsx

<Image src='/hero.png' alt='Hero' width={800} height={400} unoptimized />;

module.exports = {
  output: 'export',
  images: { unoptimized: true }
};

const cloudinaryLoader = ({ src, width, quality }) => {
  return `https://res.cloudinary.com/demo/image/upload/w_${width},q_${quality || 75}/${src}`;
};

<Image loader={cloudinaryLoader} src='sample.jpg' alt='Sample' width={800} height={400} />;
```
