import { betterAuth } from 'better-auth';
import { oauthPopup, organization, admin } from 'better-auth/plugins';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { ac, admin as adminRole, patient, user } from './permissions';

const dbPath = path.resolve(process.cwd(), 'auth.db');
const db = new DatabaseSync(dbPath);

export const auth = betterAuth({
  appName: 'Amanah Healthcare',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret:
    process.env.BETTER_AUTH_SECRET ||
    'amanah-healthcare-better-auth-secret-key-2026-32chars-security',
  database: db,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }
  },
  plugins: [
    organization(),
    admin({
      ac,
      roles: { admin: adminRole, patient, user },
      defaultRole: 'patient',
      adminRoles: ['admin']
    }),
    oauthPopup()
  ],
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000']
});
