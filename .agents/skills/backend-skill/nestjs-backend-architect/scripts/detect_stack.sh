#!/usr/bin/env bash
# Quick static reconnaissance of a repo's stack, run from the repo root.
# Read-only: makes no changes anywhere. Meant to save Phase 1 from
# re-deriving this by hand every single time.

set -uo pipefail

echo "=== Lockfile / package manager ==="
found_lock=0
for f in package-lock.json yarn.lock pnpm-lock.yaml bun.lockb; do
  if [ -f "$f" ]; then
    echo "Lockfile: $f"
    found_lock=1
  fi
done
[ "$found_lock" -eq 0 ] && echo "No lockfile at repo root."
if [ -f package.json ]; then
  echo "Root package.json: yes"
else
  echo "Root package.json: NOT FOUND at repo root (check subfolders — may be a monorepo)"
fi

echo
echo "=== Monorepo signals ==="
mono_found=0
for f in pnpm-workspace.yaml turbo.json nx.json lerna.json; do
  if [ -f "$f" ]; then
    echo "Found: $f"
    mono_found=1
  fi
done
[ -d apps ] && { echo "Found apps/ directory"; mono_found=1; }
[ -d packages ] && { echo "Found packages/ directory"; mono_found=1; }
[ "$mono_found" -eq 0 ] && echo "No monorepo signals — looks like a single app."

# Collect all package.json files up front (excluding node_modules), reused below.
PKG_FILES=$(find . -maxdepth 3 -name package.json -not -path '*/node_modules/*' 2>/dev/null)

echo
echo "=== Frontend framework hints ==="
if [ -z "$PKG_FILES" ]; then
  echo "No package.json found within 3 levels."
else
  echo "$PKG_FILES" | while IFS= read -r pkg; do
    hits=$(grep -oE '"(react|next|vue|nuxt|@angular/core|svelte|vite)"' "$pkg" 2>/dev/null | sort -u | tr -d '"')
    if [ -n "$hits" ]; then
      echo "-- $pkg --"
      echo "$hits" | sed 's/^/   /'
    fi
  done
fi

echo
echo "=== NestJS backend already present? ==="
nest_cli=$(find . -maxdepth 4 -iname "nest-cli.json" -not -path '*/node_modules/*' 2>/dev/null)
if [ -n "$nest_cli" ]; then
  echo "Found nest-cli.json:"
  echo "$nest_cli" | sed 's/^/   /'
else
  echo "No nest-cli.json found."
fi
if [ -n "$PKG_FILES" ]; then
  nest_pkg=$(echo "$PKG_FILES" | xargs grep -l '"@nestjs/core"' 2>/dev/null)
  [ -n "$nest_pkg" ] && echo "@nestjs/core dependency found in: $nest_pkg"
fi

echo
echo "=== ORM hints ==="
if [ -n "$PKG_FILES" ]; then
  echo "$PKG_FILES" | while IFS= read -r pkg; do
    hits=$(grep -oE '"(typeorm|@nestjs/typeorm|prisma|@prisma/client|mongoose|@nestjs/mongoose|sequelize|drizzle-orm)"' "$pkg" 2>/dev/null | sort -u | tr -d '"')
    [ -n "$hits" ] && echo "[$pkg] $(echo "$hits" | tr '\n' ' ')"
  done
fi
schema_prisma=$(find . -maxdepth 3 -iname "schema.prisma" -not -path '*/node_modules/*' 2>/dev/null)
[ -n "$schema_prisma" ] && echo "Found schema.prisma: $schema_prisma"

echo
echo "=== Database / Docker hints ==="
find . -maxdepth 2 \( -iname "docker-compose*.yml" -o -iname "compose*.yml" \) -not -path '*/node_modules/*' 2>/dev/null
find . -maxdepth 2 -iname "Dockerfile*" -not -path '*/node_modules/*' 2>/dev/null
if [ -n "$PKG_FILES" ]; then
  echo "$PKG_FILES" | while IFS= read -r pkg; do
    hits=$(grep -oE '"(pg|mysql2?|sqlite3|better-sqlite3|mongodb)"' "$pkg" 2>/dev/null | sort -u | tr -d '"')
    [ -n "$hits" ] && echo "[$pkg] driver: $(echo "$hits" | tr '\n' ' ')"
  done
fi
env_files=$(find . -maxdepth 2 -iname ".env*" -not -path '*/node_modules/*' 2>/dev/null)
[ -n "$env_files" ] && echo "Found env file(s):" && echo "$env_files" | sed 's/^/   /'

echo
echo "=== Docker CLI available in this environment? ==="
if command -v docker >/dev/null 2>&1; then
  docker --version
  docker compose version 2>/dev/null || echo "(docker compose v2 plugin not detected — check for standalone docker-compose instead)"
else
  echo "docker CLI not found on PATH here."
fi

echo
echo "Done — this is a static, read-only scan. Cross-check anything surprising by opening the file directly."
