#!/usr/bin/env bash
# Looks through git history for files that look like dummy/mock/sample data
# and were later deleted -- often the best available spec for a DB schema,
# since it's literally what the frontend was built and tested against.
# Read-only. Run from anywhere inside the repo.

set -uo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository -- skip this technique and rely on types/forms/API stubs instead."
  exit 0
fi

PATTERN='(mock|dummy|sample|fake|seed|fixture|placeholder)'

echo "=== Deleted files whose path looks like dummy/mock/sample data ==="
# --pretty=format: (empty) suppresses commit hash/author/message so only
# file paths come through -- otherwise a commit message that happens to
# contain a word like "dummy" would show up as a false-positive "path".
CANDIDATES=$(git log --diff-filter=D --name-only --pretty=format: 2>/dev/null | grep -iE "$PATTERN" | sort -u)

if [ -z "$CANDIDATES" ]; then
  echo "No obviously-named candidates found. Try:"
  echo "  git log --diff-filter=D --name-only   # eyeball everything ever deleted"
  echo "  git log -p -- <path>                  # full history of a specific file you suspect"
  exit 0
fi

echo "$CANDIDATES"
echo
echo "=== To recover a file's content right before it was deleted, run: ==="
echo "$CANDIDATES" | while IFS= read -r path; do
  [ -z "$path" ] && continue
  commit=$(git log --diff-filter=D --format="%H" -- "$path" 2>/dev/null | head -1)
  [ -z "$commit" ] && continue
  printf '  git show %s^:"%s"\n' "$commit" "$path"
done
