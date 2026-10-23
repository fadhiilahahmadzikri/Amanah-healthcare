import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

const staged = run('git diff --cached --name-only --diff-filter=ACM').split('\n').map((f) => f.trim()).filter(Boolean);
if (staged.length === 0) process.exit(0);

// 1. Secret & Env Leak Guard
const SENSITIVE = [/^\.env(\..+)?$/, /firebase.*\.json$/i, /\.(pem|key|pfx)$/i];
const ALLOWED = [/example/i];

for (const file of staged) {
  if (ALLOWED.some((p) => p.test(file))) continue;
  if (SENSITIVE.some((p) => p.test(file))) {
    console.error(`\n❌ [SECRET GUARD] File rahasia/env tidak boleh di-commit: ${file}`);
    console.error('👉 Gunakan .\\pack-vault.ps1 di root monorepo untuk mengemas kredensial secara aman.\n');
    process.exit(1);
  }
}

// 2. CRLF to LF Normalization
const TEXT_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md', '.html']);
for (const file of staged) {
  const ext = path.extname(file).toLowerCase();
  if (!TEXT_EXTS.has(ext)) continue;

  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('\r\n')) {
      fs.writeFileSync(fullPath, content.replace(/\r\n/g, '\n'), 'utf8');
      run(`git add "${file}"`);
    }
  } catch {}
}
