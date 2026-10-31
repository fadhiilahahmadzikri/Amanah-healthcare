import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('External Persona Self-Registration, Mailpit OTP & Dynamic Role Activation Lifecycle', () => {
  let createdRoleId = '';
  let createdRoleName = '';
  let createdRoleCode = '';
  let externalUserEmail = '';
  const externalUserPassword = 'Password123!';

  test.beforeEach(async ({ db, mailpit }) => {
    // Ensure clean baseline before test execution
    db.cleanupE2EArtifacts();
    await mailpit.clearAll();
  });

  test.afterEach(async ({ db, mailpit }) => {
    // Fail-safe teardown: ALWAYS runs on both PASS and FAIL/ERROR
    db.cleanupE2EArtifacts({
      emailLike: externalUserEmail || 'pasien.e2e%',
      roleCodeLike: createdRoleCode || 'pasien_e2e_%',
      roleId: createdRoleId,
    });
    await mailpit.clearAll();
  });

  test('E2E Flow: Negative Check -> Admin Adds External Role -> Mailpit OTP Self-Registration -> External Clinic Sidebar -> Teardown', async ({
    page,
    context,
    collector,
    db,
    mailpit,
    authPage,
    sidebarPage,
    rolePage,
    signUpPage,
    otpPage,
  }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@amanah.com';
    const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'secret123';
    const ts = Date.now();
    createdRoleName = `Pasien E2E ${ts}`;
    createdRoleCode = `pasien_e2e_${ts}`;
    externalUserEmail = `pasien.e2e.${ts}@amanah.test`;

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Negative Check — Unauthenticated Clinic Portal Guard
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_1_Negative_Portal_Guard', async () => {
      await page.goto('/klinik/antrean', { waitUntil: 'domcontentloaded' });
      await page.waitForURL((url) => url.pathname.includes('/auth/sign-in'), { timeout: 15000 });
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Admin Login & Toggle Sidebar Inspection
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_2_Admin_Login_And_Sidebar_Expand', async () => {
      await authPage.navigateToSignIn();
      await authPage.login(adminEmail, adminPassword);
      // Explicitly expand collapsible sidebar sections to inspect child items
      await sidebarPage.assertAdminNavigationVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Admin Adds External Role via Role Management & DB Check
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_3_Admin_Adds_External_Role', async () => {
      await rolePage.navigate();
      await rolePage.openCreateModal();
      const role = await rolePage.fillAndSubmitRole({
        code: createdRoleCode,
        name: createdRoleName,
        description: 'Peran eksternal untuk verifikasi pendaftaran pasien dan antrean klinik',
        tier: 'micro',
        audience: 'external',
      });
      createdRoleId = role.id;
      expect(createdRoleId, 'Created external role ID must be returned by API').toBeTruthy();

      // Verify card rendered in list
      await rolePage.assertRoleInList(createdRoleName, createdRoleCode);

      // Verify directly in PostgreSQL via read-only SELECT
      const dbRow = await db.findRoleById(createdRoleId);
      expect(dbRow, 'Created role must be persisted in PostgreSQL').not.toBeNull();
      expect(dbRow?.audience).toBe('external');
      expect(dbRow?.tier).toBe('micro');
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Admin Logout & Session Cleanup
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_4_Admin_Logout', async () => {
      await sidebarPage.logout();
      await context.clearCookies();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 5: External User Self-Registration & Mailpit OTP Dispatch
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_5_External_Self_Registration', async () => {
      await mailpit.clearAll();
      await signUpPage.navigate();
      await signUpPage.submitRegistration({
        name: 'Pasien Uji E2E',
        email: externalUserEmail,
        password: externalUserPassword,
      });
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 6: Retrieve OTP from Mailpit & Verify Account
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_6_Mailpit_OTP_Verification', async () => {
      const otpCode = await mailpit.getLatestOtpForEmail(externalUserEmail, 15000);
      expect(otpCode, 'OTP code must be 6 digits extracted from Mailpit').toMatch(/^[0-9]{6}$/);

      await otpPage.submitOtp(otpCode);
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 7: External Sidebar Verification (Klinik vs Admin Hidden)
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_7_External_Sidebar_Verification', async () => {
      // User is on /klinik/antrean
      await sidebarPage.assertPatientNavigationVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 8: Teardown & Rollback (Flush Test Role)
    // ─────────────────────────────────────────────────────────────
    await collector.step('Step_8_Teardown_Rollback', async () => {
      // Clear cookies and log back in as admin to purge role
      await context.clearCookies();
      await authPage.navigateToSignIn();
      await authPage.login(adminEmail, adminPassword);
      await rolePage.navigate();
      await rolePage.deleteRole(createdRoleName);

      // Verify in PostgreSQL: role count returns to 0
      const count = await db.countRolesById(createdRoleId);
      expect(count, 'Deleted role must be purged from PostgreSQL').toBe(0);

      await mailpit.clearAll();
    });

    // ─────────────────────────────────────────────────────────────
    // Final Telemetry Check
    // ─────────────────────────────────────────────────────────────
    collector.assertClean([/\/api\/auth/, /\/api\/v1\/auth\/me/]);
  });
});
