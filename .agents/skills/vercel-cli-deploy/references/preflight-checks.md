# Pre-Flight Checks — Full Reference

Run all 4 checks before any other command. Never skip.

---

## Check 1: Is Vercel CLI Installed?

```bash
which vercel
# → /usr/local/bin/vercel  (installed via npm -g)
# → not found              (not installed)

vercel --version
# → Vercel CLI 44.x.x
```

**Not installed:**
```bash
# npm (recommended)
npm i -g vercel

# pnpm
pnpm add -g vercel

# yarn
yarn global add vercel

# bun
bun add -g vercel

# npx (no install, one-time use)
npx vercel deploy
```

Version check: Vercel CLI requires v22+ for full env variable support (sensitive vars).
Upgrade: `npm i -g vercel` (same command — overwrites with latest).

---

## Check 2: Is CLI Authenticated?

```bash
vercel whoami
# → username             (authenticated)
# → Error: not authenticated
```

`vercel whoami` is safe to run in any directory.
It does not trigger implicit linking.

### Auth source priority (CLI checks in this order):
1. `--token <token>` flag (avoid — exposes in shell history)
2. `VERCEL_TOKEN` environment variable (preferred for CI)
3. Session stored in `~/.local/share/com.vercel.cli/` (from `vercel login`)

### Check if VERCEL_TOKEN is set:
```bash
echo $VERCEL_TOKEN
# → empty: not set
# → token value: set
```

### Interactive auth (local dev):
```bash
vercel login
# Opens browser tab for OAuth once.
# Session saved locally — persists across terminal sessions.
# To log out: vercel logout
```

### Token-based auth (CI/CD, scripts):
```bash
export VERCEL_TOKEN=<token>
# Do NOT: vercel deploy --token $VERCEL_TOKEN  (visible in ps aux)
# DO:     export VERCEL_TOKEN=<token> && vercel deploy
```

### Verify which team/scope you're authenticated as:
```bash
vercel teams list
vercel whoami --scope <team-slug>
```

---

## Check 3: Is the Project Linked?

```bash
# Check both — one of these must exist for a linked project
cat .vercel/project.json 2>/dev/null
cat .vercel/repo.json 2>/dev/null

# project.json = single-project link (vercel link)
# repo.json    = monorepo link (vercel link --repo)
```

### project.json structure:
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

### repo.json structure (monorepo):
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "remoteName": "origin"
}
```

### Linking (when .vercel/ does not exist):
```bash
# Single project
vercel link

# Monorepo — links entire repo, not one project
vercel link --repo

# Non-interactive (existing project name known)
vercel link --yes --project my-project-name
```

### Wrong team linked (common mistake):
```bash
# Detect: orgId in .vercel/project.json doesn't match your team
vercel whoami   # shows current team
# Fix:
rm -rf .vercel
vercel link     # re-link under correct team
```

### .vercel/ should be in .gitignore:
```bash
echo ".vercel" >> .gitignore
```
Exception: `repo.json` can be committed in monorepos if all team members share the same org.

---

## Check 4: Is There a Git Remote?

```bash
git remote get-url origin 2>/dev/null
# → https://github.com/user/repo.git   (has remote)
# → (empty)                            (no remote)
```

Git remote presence determines the ideal deploy path:

| Has Remote | Linked | Best Path |
|---|---|---|
| Yes | Yes | `git push` → auto-deploy via Vercel git integration |
| Yes | No | `vercel link` first, then `git push` |
| No | Yes | `vercel deploy` via CLI |
| No | No | `vercel link` then `vercel deploy` |

---

## Full Pre-Flight Script

Paste this at the start of any deploy workflow to surface all state at once:

```bash
echo "=== VERCEL PRE-FLIGHT CHECK ==="

echo ""
echo "1. CLI version:"
vercel --version 2>/dev/null || echo "NOT INSTALLED"

echo ""
echo "2. Auth status:"
vercel whoami 2>/dev/null || echo "NOT AUTHENTICATED"

echo ""
echo "3. Project link:"
cat .vercel/project.json 2>/dev/null \
  || cat .vercel/repo.json 2>/dev/null \
  || echo "NOT LINKED"

echo ""
echo "4. Git remote:"
git remote get-url origin 2>/dev/null || echo "NO REMOTE"

echo ""
echo "5. VERCEL_TOKEN:"
[ -n "$VERCEL_TOKEN" ] && echo "SET (${#VERCEL_TOKEN} chars)" || echo "NOT SET"

echo ""
echo "6. Env file:"
[ -f ".env.local" ] && echo ".env.local EXISTS" || echo "NO .env.local"
[ -f ".env" ] && echo ".env EXISTS" || echo "NO .env"
```

---

## Team Scope Issues

If you're a member of multiple teams, every CLI command that touches projects needs `--scope`:

```bash
# List your teams
vercel teams list

# Deploy to specific team
vercel deploy --scope my-team-slug

# Set default scope for session
vercel teams switch my-team-slug
```

When `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` are both set in environment, `--scope` is inferred automatically. This is the recommended CI pattern.
