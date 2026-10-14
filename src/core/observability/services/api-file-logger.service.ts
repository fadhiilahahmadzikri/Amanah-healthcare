import fs from 'node:fs';
import path from 'node:path';
import type { ApiLogTransaction } from '../models/api-log-record';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB rotation threshold

export class ApiFileLoggerService {
  private logDir: string | null = null;
  private currentStream: fs.WriteStream | null = null;
  private currentFilePath: string = '';
  private currentDateStr: string = '';
  private currentVersion: number = 1;

  private getLogDirectoryPath(): string {
    if (!this.logDir) {
      const getRuntimeRoot = () => (typeof process !== 'undefined' && typeof process['cwd'] === 'function' ? process['cwd']() : '.');
      const customDir = process.env.API_LOG_DIR;
      this.logDir = customDir
        ? path.resolve(customDir)
        : path.resolve(getRuntimeRoot(), 'logs', 'http-api');
    }
    return this.logDir;
  }

  private ensureLogDir(): void {
    try {
      const targetDir = this.getLogDirectoryPath();
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch {
      // Degrade gracefully if filesystem has permission restrictions
    }
  }

  private getTodayDateStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private resolveActiveFilePath(): string {
    const today = this.getTodayDateStr();

    if (this.currentDateStr !== today) {
      this.currentDateStr = today;
      this.currentVersion = 1;
    }

    const dir = this.getLogDirectoryPath();
    let fileName = `api-${this.currentDateStr}.log`;
    let candidatePath = path.join(dir, fileName);

    // If file exists and exceeds max size, find next version
    while (fs.existsSync(candidatePath)) {
      try {
        const stats = fs.statSync(candidatePath);
        if (stats.size >= MAX_FILE_SIZE_BYTES) {
          this.currentVersion++;
          fileName = `api-${this.currentDateStr}.v${this.currentVersion}.log`;
          candidatePath = path.join(dir, fileName);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    return candidatePath;
  }

  private getStream(): fs.WriteStream | null {
    const targetPath = this.resolveActiveFilePath();

    if (this.currentStream && this.currentFilePath === targetPath) {
      return this.currentStream;
    }

    // Close previous stream if changing file/date
    if (this.currentStream) {
      try {
        this.currentStream.end();
      } catch {
        // Ignore stream close error
      }
      this.currentStream = null;
    }

    try {
      this.ensureLogDir();
      this.currentFilePath = targetPath;
      this.currentStream = fs.createWriteStream(targetPath, {
        flags: 'a',
        encoding: 'utf8'
      });
      return this.currentStream;
    } catch {
      return null;
    }
  }

  /**
   * Appends an API transaction record as a single JSON line (NDJSON)
   */
  logTransaction(record: ApiLogTransaction): void {
    try {
      const stream = this.getStream();
      if (!stream) return;

      const serialized = JSON.stringify(record) + '\n';
      stream.write(serialized);
    } catch {
      // Logging must never crash the main application process
    }
  }

  getLogDirectory(): string {
    return this.getLogDirectoryPath();
  }

  getActiveLogFilePath(): string {
    return this.resolveActiveFilePath();
  }

  getAvailableLogFiles(): string[] {
    try {
      const dir = this.getLogDirectoryPath();
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.log'))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }
}

// SSOT Singleton
export const apiFileLogger = new ApiFileLoggerService();
