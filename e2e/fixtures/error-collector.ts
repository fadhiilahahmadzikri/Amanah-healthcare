import { test as base, expect, Page, Request, Response } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export type Finding = {
  ts: string;
  step: string;
  kind: 'http' | 'requestfailed' | 'console' | 'pageerror' | 'overlay';
  detail: Record<string, unknown>;
};

const redact = (s: string) =>
  s.replace(/("(?:pass(?:word)?|token|authorization|secret)"\s*:\s*)"[^"]*"/gi, '$1"[REDACTED]"');

const REPORT_DIR = path.resolve(__dirname, '../../e2e-report');

export class ErrorCollector {
  findings: Finding[] = [];
  currentStep = 'init';
  constructor(private page: Page) {}

  push(kind: Finding['kind'], detail: Record<string, unknown>) {
    this.findings.push({ ts: new Date().toISOString(), step: this.currentStep, kind, detail });
  }

  async attach() {
    const { page } = this;

    // Route unhandled promise rejections into the console channel.
    await page.addInitScript(() => {
      window.addEventListener('unhandledrejection', (e) => {
        const r = (e as PromiseRejectionEvent).reason;
        console.error('[e2e:unhandledrejection]', String(r?.stack ?? r));
      });
    });

    // Layer 2: every HTTP response with status >= 400
    page.on('response', async (res: Response) => {
      if (res.status() < 400) return;
      const req = res.request();
      let resBody = '', reqBody = '';
      try { resBody = (await res.text()).slice(0, 2000); } catch {}
      try { reqBody = (req.postData() ?? '').slice(0, 2000); } catch {}
      this.push('http', {
        method: req.method(),
        url: res.url(),
        status: res.status(),
        resourceType: req.resourceType(),
        requestBody: redact(reqBody),
        responseBody: redact(resBody),
        requestId: res.headers()['x-request-id'] ?? null,
      });
    });

    // Layer 2: network-level failures (DNS, CORS, connection refused)
    page.on('requestfailed', (req: Request) => {
      const err = req.failure()?.errorText;
      // Normal browser cancellation due to page navigation or RSC prefetch abortion
      if (err === 'net::ERR_ABORTED') return;
      this.push('requestfailed', { method: req.method(), url: req.url(), error: err });
    });

    // Layer 3: console errors + warnings (hydration mismatches show up here)
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        this.push('console', { level: msg.type(), text: msg.text().slice(0, 1500), location: msg.location() });
    });

    // Layer 3: uncaught exceptions
    page.on('pageerror', (err) =>
      this.push('pageerror', { name: err.name, message: err.message, stack: err.stack?.slice(0, 2000) }));
  }

  // White screen / Next.js error screens.
  async checkOverlay() {
    const crash = await this.page
      .getByText(/Application error: a client-side exception|Unhandled Runtime Error|Internal Server Error/i)
      .count();
    const blank = (await this.page.locator('body').innerText()).trim().length === 0;
    if (crash > 0 || blank) this.push('overlay', { crashTextFound: crash > 0, blankBody: blank });
  }

  async step<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.currentStep = name;
    try {
      return await fn();
    } finally {
      await this.checkOverlay();
      const screenPath = path.join(REPORT_DIR, `screens/${name.replace(/\W+/g, '_')}.png`);
      fs.mkdirSync(path.dirname(screenPath), { recursive: true });
      await this.page.screenshot({ path: screenPath, fullPage: true });
    }
  }

  // Fails the test if any non-warning finding is not covered by an allowlist entry.
  assertClean(allow: RegExp[] = []) {
    const bad = this.findings.filter((f) =>
      !(f.kind === 'console' && f.detail.level === 'warning') &&
      !allow.some((rx) => rx.test(JSON.stringify(f.detail))));
    expect(bad, `Unexpected runtime findings:\n${JSON.stringify(bad, null, 2)}`).toHaveLength(0);
  }
}

export const test = base.extend<{ collector: ErrorCollector }>({
  collector: async ({ page }, use, testInfo) => {
    const c = new ErrorCollector(page);
    await c.attach();
    await use(c);
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const findingsPath = path.join(REPORT_DIR, 'findings.json');
    fs.writeFileSync(findingsPath, JSON.stringify(c.findings, null, 2));
    await testInfo.attach('findings', { path: findingsPath, contentType: 'application/json' });
  },
});
export { expect };
