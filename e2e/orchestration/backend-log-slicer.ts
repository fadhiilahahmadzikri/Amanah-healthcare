import { execSync } from 'node:child_process';

export class BackendLogSlicer {
  private startTime: string;

  constructor(startTime?: string) {
    this.startTime = startTime || new Date().toISOString();
  }

  captureLogs(): string {
    const cmd = `docker logs backend-api-1 --since "${this.startTime}" --tail 250`;
    try {
      return execSync(cmd, { encoding: 'utf-8' });
    } catch (e: any) {
      return `Failed to fetch backend logs: ${e.message}`;
    }
  }

  assertNoFatalErrors() {
    const logs = this.captureLogs();
    // Check for fatal unhandled exceptions or panic
    const fatalMatches = logs
      .split('\n')
      .filter((line) => line.includes('FATAL') || line.includes('TypeError: Cannot read properties of undefined'));
    if (fatalMatches.length > 0) {
      throw new Error(`Fatal backend errors observed:\n${fatalMatches.join('\n')}`);
    }
  }
}
