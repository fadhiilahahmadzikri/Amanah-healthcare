import { test as base, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { ErrorCollector } from './error-collector';
import { DbInspector } from '../orchestration/db-inspector';
import { BackendLogSlicer } from '../orchestration/backend-log-slicer';
import { MailpitInspector } from '../orchestration/mailpit-inspector';
import { AuthPage } from '../micro/auth.page';
import { SidebarPage } from '../micro/sidebar.page';
import { RoleManagementPage } from '../micro/role-management.page';
import { SignUpPage } from '../micro/sign-up.page';
import { OtpPage } from '../micro/otp.page';

const REPORT_DIR = path.resolve(__dirname, '../../e2e-report');

export type E2EFixtures = {
  collector: ErrorCollector;
  db: DbInspector;
  logSlicer: BackendLogSlicer;
  mailpit: MailpitInspector;
  authPage: AuthPage;
  sidebarPage: SidebarPage;
  rolePage: RoleManagementPage;
  signUpPage: SignUpPage;
  otpPage: OtpPage;
};

export const test = base.extend<E2EFixtures>({
  collector: async ({ page }, use, testInfo) => {
    const collector = new ErrorCollector(page);
    await collector.attach();
    await use(collector);

    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const findingsPath = path.join(REPORT_DIR, 'findings.json');
    fs.writeFileSync(findingsPath, JSON.stringify(collector.findings, null, 2));
    await testInfo.attach('findings', { path: findingsPath, contentType: 'application/json' });
  },

  db: async ({}, use) => {
    const db = new DbInspector();
    await use(db);
  },

  logSlicer: async ({}, use) => {
    const slicer = new BackendLogSlicer();
    await use(slicer);
  },

  mailpit: async ({}, use) => {
    const mailpit = new MailpitInspector();
    await use(mailpit);
  },

  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  sidebarPage: async ({ page }, use) => {
    const sidebarPage = new SidebarPage(page);
    await use(sidebarPage);
  },

  rolePage: async ({ page }, use) => {
    const rolePage = new RoleManagementPage(page);
    await use(rolePage);
  },

  signUpPage: async ({ page }, use) => {
    const signUpPage = new SignUpPage(page);
    await use(signUpPage);
  },

  otpPage: async ({ page }, use) => {
    const otpPage = new OtpPage(page);
    await use(otpPage);
  },
});

export { expect };
