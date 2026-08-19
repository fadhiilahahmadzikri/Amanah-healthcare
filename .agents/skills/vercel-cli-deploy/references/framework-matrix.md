# Framework Detection Matrix

Vercel auto-detects framework from `package.json` dependencies and file structure.
Override only when detection is wrong or project is non-standard.

---

## Auto-Detection Logic

Vercel reads `package.json` → checks for framework-specific packages → applies preset.

| Detects package | Framework Preset | Build Command | Output Directory |
|---|---|---|---|
| `next` | Next.js | `next build` | `.next` |
| `@sveltejs/kit` | SvelteKit | `vite build` | `.svelte-kit` |
| `nuxt` | Nuxt | `nuxt build` | `.output` |
| `@remix-run/react` | Remix | `remix build` | `build` |
| `astro` | Astro | `astro build` | `dist` |
| `vite` (no above) | Vite | `vite build` | `dist` |
| `react-scripts` | CRA | `react-scripts build` | `build` |
| `gatsby` | Gatsby | `gatsby build` | `public` |
| `vue` | Vue.js | `vite build` | `dist` |
| `@tanstack/start` | TanStack Start | auto | auto |
| None matched | Other | (requires manual config) | `public` |

---

## Per-Framework CLI Workflow

### Next.js

```bash
# Deploy
vercel deploy --prod

# No vercel.json needed for standard Next.js projects
# Framework auto-detected from package.json → next dependency

# Required if using custom output dir or App Router + standalone:
```

```json
// vercel.json (only if needed)
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

**Env var rules:**
- `NEXT_PUBLIC_*` → baked into client bundle at build time → set before deploy
- Server vars → no prefix needed → available in Server Components, API routes, Route Handlers

**Common issues:**
- `next` not in `dependencies` (only in `devDependencies`) → detection fails → move to `dependencies`
- App Router with `output: 'standalone'` → set `outputDirectory: ".next/standalone"` in vercel.json

---

### Vite (React, Vue, Preact, plain)

```bash
vercel deploy --prod
# Auto-detects vite from package.json devDependencies
```

```json
// vercel.json — needed for SPA deep linking
{
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Env var rules:**
- `VITE_*` → baked into bundle → set before deploy
- Non-prefixed → server-side only (not accessible in browser)

**SPA routing fix:** Without the rewrite above, direct URL access to `/dashboard` returns 404.

---

### SvelteKit

```bash
# Install adapter first
npm i -D @sveltejs/adapter-vercel

# In svelte.config.js:
# import adapter from '@sveltejs/adapter-vercel'

vercel deploy --prod
```

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel'
export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs22.x',  // or edge
    })
  }
}
```

**Env var rules:**
- `PUBLIC_*` → `$env/static/public` → baked into bundle
- Private → `$env/static/private` or `$env/dynamic/private` → server only

---

### Nuxt

```bash
# Vercel preset is auto-configured by Nitro
vercel deploy --prod
```

**No adapter needed** — Nuxt uses Nitro which has built-in Vercel output format support.
Detect: `nuxt` or `nuxt3` in package.json.

**Env var rules:**
- `NUXT_PUBLIC_*` → exposed to client via `useRuntimeConfig().public`
- `NUXT_*` → server only via `useRuntimeConfig()`

```bash
vercel env add NUXT_PUBLIC_API_BASE https://api.example.com production preview development
vercel env add NUXT_SECRET_KEY xxx production
```

---

### Remix

```bash
# Install Vercel adapter
npm i @vercel/remix

# In remix.config.js:
# serverBuildTarget: "vercel"

vercel deploy --prod
```

No `vercel.json` usually needed. Auto-detected from `@remix-run/react` in package.json.

---

### Astro

```bash
# Install Vercel adapter
npm i @astrojs/vercel

# In astro.config.mjs:
# import vercel from '@astrojs/vercel/serverless'
# output: 'server', adapter: vercel()
```

**Static site (no SSR):**
```js
// astro.config.mjs
export default defineConfig({ output: 'static' })
// No adapter needed — Vercel hosts static output from dist/
```

**SSR:**
```js
import vercel from '@astrojs/vercel/serverless'
export default defineConfig({
  output: 'server',
  adapter: vercel()
})
```

---

### Monorepo Setup

When package.json is not at root, configure root directory:

```bash
# Deploy specific package in monorepo
vercel deploy --prod --cwd packages/my-app

# Or set rootDirectory in vercel.json at repo root:
```

```json
// vercel.json (repo root)
{
  "rootDirectory": "packages/my-app"
}
```

**Link entire monorepo:**
```bash
vercel link --repo   # creates .vercel/repo.json — not project.json
```

**Common mistake:** `vercel link` in monorepo creates `project.json` which tracks only one project.
Use `vercel link --repo` to track the entire repo across multiple projects.

---

## Override Framework Detection

When auto-detection is wrong:

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build:custom",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "devCommand": "npm run dev"
}
```

Or via CLI flags (per-deployment, not saved):
```bash
vercel deploy --build-env NODE_ENV=production
```

---

## vercel.json Schema Reference

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "outputDirectory": ".next",
  "devCommand": "next dev",
  "ignoreCommand": "git diff HEAD^ HEAD --quiet .",
  "regions": ["sin1", "sfo1"],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "redirects": [
    { "source": "/old", "destination": "/new", "permanent": true }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ],
  "crons": [
    { "path": "/api/cron/daily", "schedule": "0 0 * * *" }
  ]
}
```

**Region codes:** `iad1` (US East), `sfo1` (US West), `sin1` (Singapore), `cdg1` (Paris), `hnd1` (Tokyo), `gru1` (São Paulo)

Default region: `iad1`. Override for latency optimization toward your user base.
