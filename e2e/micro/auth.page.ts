import { Page, expect } from '@playwright/test';

export class AuthPage {
  constructor(private page: Page) {}

  async navigateToSignIn() {
    await this.page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('input[name="email"]')).toBeVisible({ timeout: 15000 });
  }

  async login(email: string, pass: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', pass);

    // In Next.js, login triggers loginAction (Server Action POST to /auth/sign-in) or better-auth API
    await Promise.all([
      this.page.waitForResponse(
        (r) => r.request().method() === 'POST' && (r.url().includes('/auth/sign-in') || r.url().includes('/api/'))
      ),
      this.page.getByRole('button', { name: 'Masuk' }).click(),
    ]);

    // Upon successful authentication, user is redirected to role landing path (/admin/appointment-pasien)
    await this.page.waitForURL((url) => !url.pathname.includes('/auth/sign-in'), { timeout: 15000 });
  }

  async registerPatient(name: string, email: string, pass: string) {
    await this.page.goto('/auth/sign-up', { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('input[name="name"]')).toBeVisible({ timeout: 15000 });

    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', pass);
    await this.page.fill('input[name="confirmPassword"]', pass);

    const [regRes] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.request().method() === 'POST' && (r.url().includes('/auth/sign-up') || r.url().includes('/api/'))
      ),
      this.page.getByRole('button', { name: 'Buat akun' }).click(),
    ]);

    expect(regRes.ok(), `Registration failed: ${regRes.status()} ${await regRes.text()}`).toBeTruthy();
  }
}
