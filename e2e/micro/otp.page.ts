import { Page, expect } from '@playwright/test';

export class OtpPage {
  constructor(private page: Page) {}

  async submitOtp(otpCode: string) {
    await this.page.waitForURL((url) => url.pathname.includes('/verify-otp'), { timeout: 15000 });
    
    const otpInput = this.page.locator('#otp-code');
    await expect(otpInput).toBeVisible({ timeout: 10000 });
    await otpInput.click();
    await otpInput.fill(otpCode);

    const submitBtn = this.page.getByRole('button', { name: 'Verifikasi dan Aktifkan Akun' });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });

    const [verifyRes] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/auth/email-otp/verify-email') && r.request().method() === 'POST'
      ),
      submitBtn.click(),
    ]);

    expect(verifyRes.ok(), `OTP verification status: ${verifyRes.status()}`).toBeTruthy();

    // After verification, user lands on clinic portal /klinik/antrean
    await this.page.waitForURL((url) => url.pathname.includes('/klinik/antrean'), { timeout: 20000 });
  }
}
