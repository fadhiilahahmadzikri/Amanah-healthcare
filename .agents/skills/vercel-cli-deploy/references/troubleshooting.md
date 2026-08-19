# Troubleshooting — Vercel CLI Error Catalog

---

## Authentication Errors

### "Error: Not authenticated"
```
Cause: No session and no VERCEL_TOKEN
Fix:
  Interactive: vercel login
  CI/CD:       export VERCEL_TOKEN=<token>
  Verify:      vercel whoami
```

### "Error: The specified token is not valid"
```
Cause: Token expired or revoked
Fix:
  Create new token: vercel.com/account/tokens
  Update VERCEL_TOKEN in CI secrets
  Local: vercel logout && vercel login
```

### "Error: project configuration does not belong to a team you are a member of"
```
Cause: .vercel/project.json has orgId from a team you left or cloned from someone else
Fix:
  rm -rf .vercel
  vercel link
  Verify team: vercel whoami → vercel teams list
```

### "Authentication required" in CI despite VERCEL_TOKEN being set
```
Cause: Token set after vercel process started, or in subshell
Fix:
  Ensure: export VERCEL_TOKEN=... (not just VERCEL_TOKEN=...)
  Verify: vercel whoami (must return username before any other command)
  Check: token scope matches the project's team
```

---

## Build Errors

### "No framework detected"
```
Cause: Framework package not in dependencies (only devDependencies) or package.json missing
Fix:
  Move framework to dependencies:
    "dependencies": { "next": "^14.0.0" }  (not devDependencies)
  Or override in vercel.json:
    { "framework": "nextjs", "buildCommand": "npm run build" }
```

### "No Build Script found"
```
Cause: package.json has no "build" script and no framework detected
Fix:
  Add to package.json:
    "scripts": { "build": "vite build" }
  Or in vercel.json:
    { "buildCommand": "vite build", "outputDirectory": "dist" }
```

### "Error: No Next.js version detected"
```
Cause: next not in dependencies
Fix:
  npm i next react react-dom  (saves to dependencies)
  Verify: cat package.json | grep '"next"'
```

### Build succeeds locally but fails on Vercel
```
Cause 1: Missing env vars — NEXT_PUBLIC_* or VITE_* not set in Vercel
  Fix: vercel env add NEXT_PUBLIC_API_URL production preview development

Cause 2: Case-sensitive imports (Vercel Linux vs macOS)
  Fix: check all import paths match exact filename case

Cause 3: Missing package in dependencies (only in devDependencies)
  Fix: npm i <package> --save (moves to dependencies)

Cause 4: Node.js version mismatch
  Fix: add to package.json:
    "engines": { "node": "22.x" }
  Or in vercel.json:
    { "buildCommand": "node --version && npm run build" }  (debug)
```

### "NEXT_PUBLIC_* env var has wrong value in production"
```
Cause: Var baked at build time from wrong environment, or cached build used
Fix:
  vercel deploy --prod --force  (bypasses build cache)
  Verify vars: vercel env ls production
```

---

## Linking Errors

### "Error: Could not find project with that name"
```
Cause: Project name doesn't exist in the selected scope
Fix:
  vercel link  (use interactive selector — lists all your projects)
  Or: create new project with vercel link → "No" to linking existing
```

### Wrong project linked (deployed to wrong project)
```
Detect: cat .vercel/project.json → check projectId
Fix:
  rm -rf .vercel
  vercel link --project correct-project-name
  Or: re-run vercel and select correct project
```

### Monorepo: deployed root instead of sub-package
```
Cause: vercel run from repo root, not package root
Fix:
  cd packages/my-app && vercel deploy --prod
  Or: vercel.json at root with rootDirectory set
  Or: vercel deploy --cwd packages/my-app
```

---

## Deployment Errors

### "Error: The deployment attempt timed out"
```
Cause: Build takes too long (Vercel hobby: 45min limit, pro: unlimited)
Fix:
  Optimize build time
  Use --prebuilt: build in CI, deploy prebuilt output
  vercel build --prod && vercel deploy --prebuilt --prod
```

### "Error: Function size limit exceeded"
```
Cause: Serverless function bundle too large (250MB limit)
Fix:
  Check what's being bundled: vercel inspect <url> --logs
  Add large dependencies to external: next.config.js serverExternalPackages
  Use edge runtime for smaller bundle size
```

### "404 on all routes except /"
```
Cause: SPA with client-side routing, no rewrite rule
Fix (vercel.json):
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
Applies to: Vite, CRA, any SPA without SSR
```

### "502 Bad Gateway" on API routes
```
Cause: Function crashed at startup
Fix:
  vercel logs <deployment-url>  — look for runtime error
  Common: missing env var at runtime, DB connection string wrong
  Test locally: vercel env run -- node api/handler.js
```

---

## Environment Variable Errors

### "env var undefined at runtime but set in dashboard"
```
Cause 1: Var set after deploy — env vars only apply to NEW deployments
  Fix: redeploy after setting var
        vercel deploy --prod

Cause 2: Wrong environment — set for production, tested in preview
  Fix: vercel env add MY_VAR production preview

Cause 3: NEXT_PUBLIC_* set for runtime but not build time
  Fix: for NEXT_PUBLIC_*, must be available during build, not just runtime
       Set in: development, preview, production environments in Vercel
       Then: vercel deploy --prod --force
```

### "Sensitive environment variable cannot be read"
```
This is expected behavior — sensitive vars are write-only after setting.
If you need to verify:
  vercel env ls production  (shows name, not value)
  Set a new test var to verify the pipeline works:
    echo "test" | vercel env add TEST_VAR production
    vercel env ls production | grep TEST_VAR
    vercel env rm TEST_VAR production
```

### "Edge Config connection string is outdated"
```
Cause: EDGE_CONFIG env var references deleted Edge Config or invalid token
Fix:
  vercel env rm EDGE_CONFIG production
  Provision new Edge Config and update
```

---

## Domain and URL Errors

### Preview URL not accessible / 401
```
Cause: Deployment protection enabled (Vercel Authentication)
Fix:
  Disable for preview: Project Settings → Deployment Protection → off for Preview
  Or: add Bypass header in requests (x-vercel-protection-bypass)
  Or: create shareable link: vercel share <deployment-url>
```

### Custom domain not pointing to new deployment
```
Cause: Used vercel deploy --skip-domain — domains not auto-promoted
Fix:
  vercel promote <new-deployment-url>
  Or: vercel alias <deployment-url> <domain>
```

---

## CI/CD Specific

### "Error: Command failed: vercel deploy" in GitHub Actions
```
Fix: ensure all three vars are exported:
  export VERCEL_TOKEN=${{ secrets.VERCEL_TOKEN }}
  export VERCEL_ORG_ID=${{ secrets.VERCEL_ORG_ID }}
  export VERCEL_PROJECT_ID=${{ secrets.VERCEL_PROJECT_ID }}

VERCEL_ORG_ID and VERCEL_PROJECT_ID: read from .vercel/project.json
  orgId → VERCEL_ORG_ID
  projectId → VERCEL_PROJECT_ID
```

### Deployment triggers on every push but only specific paths changed
```
Fix: set ignoreCommand in vercel.json:
  { "ignoreCommand": "git diff HEAD^ HEAD --quiet . ':(exclude)docs'" }
  Returns exit code 0 → skip build
  Returns exit code 1 → build
```

---

## Debug Commands

```bash
# Full build logs for a deployment
vercel inspect <deployment-url> --logs

# Stream logs live (for running deployments)
vercel logs <deployment-url> --follow

# Check deployment status
vercel ls --limit 5

# Test a specific route
vercel curl /api/health --deployment <deployment-url>

# Rollback to last working deployment
vercel rollback

# Force fresh build (no cache)
vercel deploy --force
```
