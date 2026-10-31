import { Page, expect } from '@playwright/test';

export interface CreateRoleData {
  code: string;
  name: string;
  description?: string;
  tier?: 'macro' | 'micro';
  audience?: 'internal' | 'external';
}

export class RoleManagementPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/admin/management-role', { waitUntil: 'domcontentloaded' });
    await expect(this.page.getByRole('button', { name: 'Tambah Peran' })).toBeVisible({
      timeout: 15000
    });
  }

  async openCreateModal() {
    await this.page.getByRole('button', { name: 'Tambah Peran' }).click();
    await expect(this.page.getByRole('heading', { name: 'Buat Peran Baru' })).toBeVisible({
      timeout: 5000
    });
  }

  async fillAndSubmitRole(
    data: CreateRoleData
  ): Promise<{ id: string; code: string; name: string }> {
    // Stage 1: Name and Code
    await this.page.fill('#role-name', data.name);
    await this.page.fill('#role-code', data.code);
    await this.page.getByRole('button', { name: 'Lanjut' }).click();

    // Stage 2: Description
    if (data.description) {
      await this.page.fill('#role-desc', data.description);
    }
    await this.page.getByRole('button', { name: 'Lanjut' }).click();

    // Stage 3: Hierarchy (Tier & Audience)
    if (data.tier && data.tier === 'micro') {
      await this.page.getByRole('button', { name: /Micro \(Sub-Peran\)/i }).click();
    }
    if (data.audience && data.audience === 'external') {
      await this.page.getByRole('button', { name: /Pasien Portal/i }).click();
    }
    await this.page.getByRole('button', { name: 'Lanjut' }).click();

    // Stage 4: Clinical Status
    await this.page.getByRole('button', { name: 'Lanjut' }).click();

    // Stage 5: Permissions & Final Submit
    const [createRes] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/v1/admin/roles') && r.request().method() === 'POST'
      ),
      this.page.getByRole('button', { name: 'Simpan Peran' }).click()
    ]);

    expect(
      createRes.ok(),
      `Role creation API failed: ${createRes.status()} ${await createRes.text()}`
    ).toBeTruthy();
    const body = await createRes.json();
    return {
      id: body.id,
      code: body.code,
      name: body.name
    };
  }

  async assertRoleInList(roleName: string, roleCode: string) {
    await expect(this.page.getByRole('heading', { name: roleName, exact: true })).toBeVisible({
      timeout: 10000
    });
    await expect(this.page.getByText(roleCode, { exact: true })).toBeVisible();
  }

  async deleteRole(roleName: string) {
    // Locate the role card container
    const card = this.page
      .locator('div', {
        has: this.page.getByRole('heading', { name: roleName, exact: true })
      })
      .filter({ has: this.page.locator('button') })
      .first();

    await expect(card).toBeVisible({ timeout: 5000 });

    // Click the delete (trash) button within the card footer
    const trashButton = card
      .locator(
        '[data-slot="card-footer"] button, footer button, [class*="CardFooter"] button, [class*="footer"] button'
      )
      .last();
    await expect(trashButton).toBeVisible({ timeout: 5000 });
    await trashButton.click();

    // Confirm inside DeleteRoleDialog
    const confirmButton = this.page.getByRole('button', { name: 'Ya, Hapus' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });

    const [deleteRes] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/v1/admin/roles/') && r.request().method() === 'DELETE'
      ),
      confirmButton.click()
    ]);

    expect(deleteRes.ok(), `Role deletion API failed: ${deleteRes.status()}`).toBeTruthy();

    // Verify card is no longer in list
    await expect(this.page.getByRole('heading', { name: roleName, exact: true })).not.toBeVisible({
      timeout: 10000
    });
  }
}
