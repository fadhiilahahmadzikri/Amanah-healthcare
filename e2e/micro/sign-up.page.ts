import { Page, expect } from '@playwright/test';

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

export class SignUpPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/auth/sign-up', { waitUntil: 'domcontentloaded' });
    await expect(this.page.getByRole('button', { name: 'Buat akun' })).toBeVisible({ timeout: 15000 });
  }

  async submitRegistration(data: SignUpFormData) {
    await this.page.fill('input[name="name"]', data.name);
    await this.page.fill('input[name="email"]', data.email);
    await this.page.fill('input[name="password"]', data.password);
    await this.page.fill('input[name="confirmPassword"]', data.password);

    await this.page.getByRole('button', { name: 'Buat akun' }).click();

    // Verify redirect to /verify-otp
    await this.page.waitForURL((url) => url.pathname.includes('/verify-otp'), { timeout: 15000 });
    await expect(this.page.getByRole('button', { name: 'Verifikasi dan Aktifkan Akun' })).toBeVisible({ timeout: 10000 });
  }
}
