import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Admin Authentication, Role Lifecycle & Multi-Persona Sidebar Integration', () => {
  let createdRoleId = '';
  let createdRoleName = '';
  let createdRoleCode = '';

  test.beforeEach(async ({ db }) => {
    db.cleanupE2EArtifacts({ roleCodeLike: 'dokter_e2e_%' });
  });

  test.afterEach(async ({ db }) => {
    db.cleanupE2EArtifacts({ roleCodeLike: createdRoleCode || 'dokter_e2e_%', roleId: createdRoleId });
  });

  test('E2E Flow: Admin Login -> Sidebar Verification -> Create Role -> DB Verify -> Logout -> Persona Delta -> Teardown Rollback', async ({
    page,
    collector,
    db,
    authPage,
    sidebarPage,
    rolePage,
  }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@amanah.com';
    const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'secret123';
    const ts = Date.now();
    createdRoleName = `Dokter E2E ${ts}`;
    createdRoleCode = `dokter_e2e_${ts}`;

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Admin Login
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_1_Admin_Login', async () => {
      await authPage.navigateToSignIn();
      await authPage.login(adminEmail, adminPassword);
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Admin Sidebar Verification
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_2_Admin_Sidebar_Verification', async () => {
      await sidebarPage.assertAdminNavigationVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Role Creation in Role Management & DB State Assert
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_3_Role_Creation', async () => {
      await rolePage.navigate();
      await rolePage.openCreateModal();
      const role = await rolePage.fillAndSubmitRole({
        code: createdRoleCode,
        name: createdRoleName,
        description: 'Peran uji coba otomatis E2E Playwright',
        tier: 'macro',
        audience: 'internal',
      });
      createdRoleId = role.id;
      expect(createdRoleId, 'Created role ID must be returned by API').toBeTruthy();

      // Assert UI card rendered
      await rolePage.assertRoleInList(createdRoleName, createdRoleCode);

      // Assert direct PostgreSQL persistence via read-only SELECT
      const dbRow = await db.findRoleById(createdRoleId);
      expect(dbRow, 'Created role must be persisted in PostgreSQL').not.toBeNull();
      expect(dbRow?.name).toBe(createdRoleName);
      expect(dbRow?.code).toBe(createdRoleCode);
      expect(dbRow?.tier).toBe('macro');
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Admin Logout
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_4_Admin_Logout', async () => {
      await sidebarPage.logout();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Unauthenticated & Role Access Guard Verification
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_5_Sidebar_RBAC_Delta', async () => {
      // Unauthenticated session must NOT access protected admin routes
      await page.goto('/admin/management-role', { waitUntil: 'domcontentloaded' });
      // Next.js middleware / auth guard redirects back to /auth/sign-in
      await page.waitForURL((url) => url.pathname.includes('/auth/sign-in'), { timeout: 15000 });
      await expect(page.locator('input[name="email"]')).toBeVisible();

      // Admin modules and sidebar are strictly absent when logged out
      await expect(page.locator('[data-slot="sidebar"], [data-sidebar="sidebar"], aside')).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 6: Teardown & Rollback (Flush Created Role)
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_6_Teardown_Rollback', async () => {
      // Log back in as Admin to perform authorized UI cleanup
      await authPage.navigateToSignIn();
      await authPage.login(adminEmail, adminPassword);
      await rolePage.navigate();
      await rolePage.deleteRole(createdRoleName);

      // Verify in PostgreSQL: strictly 0 rows remain
      const count = await db.countRolesById(createdRoleId);
      expect(count, 'Deleted role must be cleanly purged from DB').toBe(0);
    });

    // ─────────────────────────────────────────────────────────────
    // Final Telemetry Check: Zero Fatal Runtime Errors Across 4 Layers
    // (Allow expected 401/session probes after logout)
    // ─────────────────────────────────────────────────────────────
    collector.assertClean([/\/api\/auth/, /\/api\/v1\/auth\/me/]);
  });
});
