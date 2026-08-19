# Environment Variable Management — Full Reference

Zero browser. All terminal.

---

## Core Concepts

### Three Environments
- `development` — local dev (`next dev`, `vite dev`, etc.)
- `preview` — every `vercel deploy` without `--prod`
- `production` — `vercel deploy --prod` or `git push` to production branch

### Sensitive vs Plain
When adding a var via CLI, Vercel defaults to **sensitive** for production/preview:
- Sensitive: encrypted at rest, cannot be viewed after set (even in dashboard)
- Non-sensitive: visible in dashboard
- Development env: always encrypted (Vercel API restriction), never sensitive flag

---

## Add Environment Variables

### Interactive (prompts for value securely)
```bash
# Single environment
vercel env add DATABASE_URL production

# Multiple environments at once
vercel env add DATABASE_URL production preview

# All three environments
vercel env add NEXT_PUBLIC_API_URL production preview development
```

CLI prompts: `Enter value for DATABASE_URL:` — value is not echoed.

### Non-interactive (pipe value in)
```bash
# Pipe value — no prompt
echo "postgresql://user:pass@host:5432/db" | vercel env add DATABASE_URL production

# From file content
cat /secrets/db-url.txt | vercel env add DATABASE_URL production
```

### Force overwrite (skip confirmation)
```bash
vercel env add DATABASE_URL production --force
```

### Update existing variable
```bash
vercel env update DATABASE_URL production
# Prompts for new value
```

---

## List and Inspect

```bash
# All environments
vercel env ls

# Specific environment
vercel env ls production
vercel env ls preview
vercel env ls development

# Specific environment + branch (preview only)
vercel env ls preview --git-branch feature/my-feature
```

Output: shows var name, environment, type (sensitive/plain), created date.
Sensitive values: cannot be read back. Name visible, value not.

---

## Pull to Local File

### Pull development vars (most common)
```bash
vercel env pull .env.local
# Creates/overwrites .env.local with development environment vars
```

### Pull specific environment
```bash
vercel env pull .env.production --environment=production
vercel env pull .env.preview --environment=preview
```

### Pull for a specific branch (preview)
```bash
vercel env pull .env.local --git-branch my-feature-branch
```

### Pull without writing file (inject into process)
```bash
vercel env run -- node scripts/seed.js
vercel env run -- npm run migrate
# Fetches vars from linked project and injects them as env vars
# Development environment by default
```

### Pull for vercel build / vercel dev (different from env pull)
```bash
# vercel pull writes to .vercel/ — used by vercel build and vercel dev
vercel pull
vercel pull --environment=production
```

Note: `vercel env pull` → writes to a file you specify.
      `vercel pull` → writes to `.vercel/.env.$target.local` for internal CLI use.

---

## Remove Variables

```bash
# Interactive confirmation
vercel env rm DATABASE_URL production

# Skip confirmation
vercel env rm DATABASE_URL production --yes
```

---

## Bulk Operations

### Bulk push from .env file (no native CLI command — use workarounds)

**Option A: Loop in bash (native)**
```bash
# Read .env file and add each var to production
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  # Strip surrounding quotes from value
  value="${value%\"}"
  value="${value#\"}"
  echo "$value" | vercel env add "$key" production --force
done < .env.production
```

**Option B: vercel-env-push (community tool)**
```bash
npx vercel-env-push .env.production production
npx vercel-env-push .env.production production preview  # multiple environments
```

Warning: if env vars were created across multiple environments in dashboard,
vercel-env-push targeting a single environment will remove vars from other environments.
Use the multi-environment flag to avoid this.

---

## Framework-Specific Env Variable Rules

### Next.js
- `NEXT_PUBLIC_*` — baked into static bundle at build time. Must be set in Vercel before build, not just at runtime.
- Server-only vars — no prefix needed. Available in API routes, Server Components, Route Handlers.
- Changing `NEXT_PUBLIC_*` vars requires a new deploy (cache invalidation).

```bash
vercel env add NEXT_PUBLIC_API_URL production preview development
vercel env add DATABASE_URL production preview
# Then redeploy:
vercel deploy --prod --force
```

### Vite
- `VITE_*` — baked into bundle at build time. Same rule as NEXT_PUBLIC_*.
- Non-prefixed vars: server-side only (not available in browser bundle).

```bash
vercel env add VITE_API_BASE_URL production preview development
```

### SvelteKit
- `PUBLIC_*` — baked into bundle (via `$env/static/public`)
- Private env: available server-side only (via `$env/static/private` or `$env/dynamic/private`)

### Nuxt
- `NUXT_PUBLIC_*` — exposed to client
- `NUXT_*` — server-only

---

## CI/CD Pattern — Complete Non-Interactive Workflow

```bash
# In GitHub Actions / GitLab CI / any CI runner:

# 1. Store secrets in CI secrets store:
#    VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

# 2. In CI pipeline:
export VERCEL_TOKEN=${{ secrets.VERCEL_TOKEN }}
export VERCEL_ORG_ID=${{ secrets.VERCEL_ORG_ID }}
export VERCEL_PROJECT_ID=${{ secrets.VERCEL_PROJECT_ID }}

# 3. Install CLI
npm i -g vercel

# 4. Pull settings (no login needed — VERCEL_TOKEN covers auth)
vercel pull --yes --environment=production

# 5. Build locally
vercel build --prod

# 6. Deploy prebuilt output
vercel deploy --prebuilt --prod
```

### Why --prebuilt?
Build happens in CI, not on Vercel's build servers.
Faster. Reproducible. Uses your CI's caching.
Vercel just hosts the output — no rebuild on their end.

---

## Security Rules

**Never do this:**
```bash
vercel deploy --token $VERCEL_TOKEN  # token visible in ps aux, shell history
```

**Always do this:**
```bash
export VERCEL_TOKEN=<token>
vercel deploy  # CLI reads from env var internally
```

**Never commit:**
- `.env.local`
- `.env.production`
- Any file containing real secret values

**Always commit:**
- `.env.example` — with placeholder values, documents what vars are needed
- `.vercelignore` — exclude files from upload

**.vercelignore example:**
```
.env*
.env.local
node_modules
.git
*.test.*
coverage/
```

---

## Environment Variable Size Limits

- Total per deployment: 64KB (all vars combined)
- Edge Functions / Middleware: 5KB per individual var
- If near limit: consider using Vercel Edge Config for large configs

---

## Diagnose Missing Env Vars in Build

```bash
# After a failed build, inspect what vars were available
vercel inspect <failed-deployment-url> --logs

# Verify vars are set before deploying
vercel env ls production

# Test locally with production vars
vercel env pull .env.production.local --environment=production
NODE_ENV=production node -e "require('./src/config')"
```
