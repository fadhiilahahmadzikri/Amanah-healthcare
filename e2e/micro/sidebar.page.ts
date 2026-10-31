import { Page, expect } from '@playwright/test';

export class SidebarPage {
  constructor(private page: Page) {}

  get sidebar() {
    return this.page.locator('[data-slot="sidebar"], [data-sidebar="sidebar"], aside').first();
  }

  async expandGroup(title: string) {
    const trigger = this.sidebar.getByRole('button', { name: title, exact: true });
    await expect(trigger).toBeVisible({ timeout: 10000 });
    const state = await trigger.getAttribute('data-state');
    if (state !== 'open') {
      await trigger.click();
    }
  }

  async assertAdminNavigationVisible() {
    await expect(this.sidebar).toBeVisible({ timeout: 15000 });
    // Verify Admin group header and core administrative modules strictly inside the sidebar
    await expect(this.sidebar.getByText('Amanah Admin')).toBeVisible({ timeout: 10000 });
    
    // Explicitly click and expand collapsible toggles to expose menu items
    await this.expandGroup('Pelayanan Pasien');
    await this.expandGroup('Manajemen SDM');
  }

  async assertPatientNavigationVisible() {
    await expect(this.sidebar).toBeVisible({ timeout: 15000 });

    // Ensure desktop sidebar is expanded if in collapsed mode
    const sidebarState = await this.sidebar.getAttribute('data-state');
    if (sidebarState === 'collapsed') {
      const toggleBtn = this.page.getByRole('button', { name: 'Toggle Sidebar' }).first();
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
      }
    }

    // Expand Klinik group if present as collapsible
    const klinikTrigger = this.sidebar.getByRole('button', { name: 'Klinik', exact: true });
    if (await klinikTrigger.isVisible()) {
      const state = await klinikTrigger.getAttribute('data-state');
      if (state !== 'open') {
        await klinikTrigger.click();
      }
    }

    // Verify Patient Clinic links
    await expect(
      this.sidebar.locator('a[href="/klinik/antrean"], a:has-text("Cek Antrean")').first()
    ).toBeVisible({ timeout: 10000 });

    // Verify Admin modules are strictly hidden
    await expect(this.sidebar.getByText('Amanah Admin')).not.toBeVisible();
    await expect(this.sidebar.locator('a[href="/admin/management-role"]')).not.toBeVisible();
    await expect(this.sidebar.locator('a[href="/admin/payroll"]')).not.toBeVisible();
  }

  async logout() {
    // Click user profile menu trigger at sidebar footer
    const profileTrigger = this.sidebar
      .locator('[data-slot="sidebar-footer"] button, [data-sidebar="footer"] button')
      .first();
    await expect(profileTrigger).toBeVisible({ timeout: 10000 });
    await profileTrigger.click();

    // Click 'Keluar' in dropdown menu
    const logoutMenuItem = this.page.getByRole('menuitem', { name: 'Keluar' });
    await expect(logoutMenuItem).toBeVisible({ timeout: 5000 });
    await logoutMenuItem.click();

    // Verify redirect to /auth/sign-in
    await this.page.waitForURL((url) => url.pathname.includes('/auth/sign-in'), { timeout: 15000 });
  }
}
