---
name: vercel-cli-deploy
description: >
  Expert knowledge base for deploying JavaScript projects to Vercel via CLI — terminal-only, zero browser interaction.
  Activate this skill whenever the user mentions: deploy to Vercel, Vercel CLI, vercel deploy, hosting on Vercel,
  vercel login, vercel link, vercel env, environment variables Vercel, Vercel production deploy, vercel --prod,
  preview deployment, vercel project setup, vercel.json configuration, VERCEL_TOKEN, or any question about
  pushing a Next.js / Vite / SvelteKit / Nuxt / Remix / React project to Vercel from the terminal.
  Also trigger when the user asks about Vercel CLI authentication, token-based auth, CI/CD with Vercel,
  or "how do I deploy without touching the dashboard".
---

# Vercel CLI Deploy — Knowledge Base

All interaction is terminal-only. No browser dashboard. No clicking.

Read reference files when needed:
- `references/preflight-checks.md` — Step-by-step system state detection
- `references/env-management.md` — Full env variable workflow (add/pull/push/bulk)
- `references/framework-matrix.md` — Framework-specific detection + overrides
- `references/troubleshooting.md` — Error catalog and fixes

---

## Mental Model: Three State Variables

Before any deploy command, know the answers to:

```
1. CLI INSTALLED?       which vercel || npm list -g vercel
2. AUTHENTICATED?       vercel whoami
3. PROJECT LINKED?      cat .vercel/project.json || cat .vercel/repo.json
```

These three checks gate every operation. Run them in this order. Do not skip.

**Safe commands to run anywhere (no side effects):**
- `vercel whoami` — safe in any directory, linked or not
- `vercel ls` — safe in unlinked directory (shows all account deployments)
- `git remote get-url origin` — pure read

**Commands that MUST NOT run in unlinked directories:**
- `vercel link` — will prompt interactively or silently auto-link as side effect
- `vercel project inspect` — same
- `vercel ls` in a directory that will trigger implicit link

---

## Pre-Flight Decision Tree

```
[ Start ]
    │
    ▼
CLI installed?
├── NO  → Install: npm i -g vercel
│         then confirm: vercel --version
│
└── YES ──▶ vercel whoami
                │
                ├── Returns username → AUTHENTICATED ✓
                │       │
                │       ▼
                │   Project linked?
                │   cat .vercel/project.json 2>/dev/null
                │   ├── File exists → LINKED ✓ → go to Deploy
                │   └── File missing → run: vercel link
                │
                └── Error / empty → NOT AUTHENTICATED
                        │
                        ▼
                    VERCEL_TOKEN in env?
                    echo $VERCEL_TOKEN
                    ├── YES → export VERCEL_TOKEN=... (already set)
                    │         CLI picks it up natively. No --token flag needed.
                    └── NO  → Interactive: vercel login
                              CI/CD:       export VERCEL_TOKEN=<token>
                              Token source: vercel.com/account/tokens
```

→ Full detail: `references/preflight-checks.md`

---

## Deploy Commands — Core Reference

### Preview deploy (default — always safe)
```bash
vercel
# or
vercel deploy
```

### Production deploy (explicit intent required)
```bash
vercel --prod
# or
vercel deploy --prod
```

### Deploy without waiting for build to finish
```bash
vercel deploy --no-wait
```

### Force deploy (bypass build cache)
```bash
vercel deploy --force
```

### Deploy to a specific team scope
```bash
vercel deploy --scope <team-slug>
```

### Deploy to custom environment (Pro/Enterprise)
```bash
vercel deploy --target=staging
```

---

## Authentication Methods

### Method 1: Interactive (local development)
```bash
vercel login
# Opens browser once for OAuth. Session stored in ~/.local/share/com.vercel.cli
```

### Method 2: Token-based (CI/CD, automation, non-interactive)
```bash
# Set as env var — preferred. Never pass as CLI flag (shell history leak).
export VERCEL_TOKEN=<your-token>
vercel whoami   # verify it works
```

Token creation: `vercel.com/account/tokens` → New Token → select scope + expiry.

### Method 3: Environment variables for full non-interactive CI
```bash
export VERCEL_TOKEN=<token>
export VERCEL_ORG_ID=<org-id>       # from .vercel/project.json → orgId
export VERCEL_PROJECT_ID=<proj-id>  # from .vercel/project.json → projectId
# With all three set: vercel link is not needed
vercel deploy --prod
```

---

## Project Linking

### New project (first deploy)
```bash
cd my-project
vercel
# Prompts: Set up project? → y
# Prompts: Which scope? → select team or personal
# Prompts: Link to existing? → n (new) or y (existing)
# Prompts: Project name, directory, build settings (auto-detected)
# Creates .vercel/project.json
```

### Link to existing Vercel project
```bash
vercel link
# or non-interactively:
vercel link --yes --project <project-name>
```

### Monorepo — link entire repo (not single project)
```bash
vercel link --repo
# Creates .vercel/repo.json instead of project.json
# Wrong if you used project.json for monorepo — re-link with --repo
```

### Inspect linked state
```bash
cat .vercel/project.json
# { "orgId": "team_xxx", "projectId": "prj_xxx" }
```

---

## Post-Deploy Inspection

```bash
# Get deployment URL after deploy
vercel ls --limit 1

# Inspect a specific deployment (build logs, functions, etc.)
vercel inspect <deployment-url>

# Stream live logs
vercel logs <deployment-url>

# Rollback to previous deployment
vercel rollback

# Promote a preview to production
vercel promote <deployment-url>
```

---

## Environment Variables — Quick Reference

→ Full workflow in `references/env-management.md`

```bash
# List all env vars
vercel env ls

# Add (interactive value prompt)
vercel env add SECRET_KEY production

# Add to multiple environments
vercel env add API_URL production preview development

# Pull to .env.local (development vars only)
vercel env pull .env.local

# Pull specific environment
vercel env pull .env.production --environment=production

# Run a command with env vars injected (no file written)
vercel env run -- node scripts/seed.js

# Remove
vercel env rm SECRET_KEY production
```

---

## vercel.json — Configuration Overrides

Only needed when auto-detection fails or needs customization.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "next dev",
  "regions": ["sin1"],
  "functions": {
    "api/**/*.js": { "maxDuration": 30 }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "X-Content-Type-Options", "value": "nosniff" }]
    }
  ]
}
```

Framework values: `nextjs`, `vite`, `sveltekit`, `nuxtjs`, `remix`, `astro`, `react`, `vue`, `gatsby`

→ Framework-specific settings: `references/framework-matrix.md`
→ Common errors from misconfiguration: `references/troubleshooting.md`

---

## Professional Engineer Workflow Pattern

This is what a senior engineer does before every deploy:

```bash
# 1. Verify state
vercel whoami
cat .vercel/project.json

# 2. Sync env vars to local
vercel env pull .env.local

# 3. Local build test (catch errors before deploy)
npm run build

# 4. Preview deploy first — NEVER prod without preview
vercel deploy

# 5. Verify preview URL works
# open https://<preview>.vercel.app

# 6. Only then: promote to production
vercel --prod
# or: vercel promote <preview-url>
```

**Rule:** Production is never the first deploy. Preview is the gate.
