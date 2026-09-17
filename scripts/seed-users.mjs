import { auth } from '../src/lib/auth.ts';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'auth.db');
const db = new DatabaseSync(dbPath);

async function main() {
  console.log('Seeding demo accounts...');

  // 1. Seed or update Admin
  const existingAdmin = db.prepare('SELECT id, email, role FROM user WHERE email = ?').get('admin@amanah.id');
  if (!existingAdmin) {
    console.log('Creating admin@amanah.id...');
    await auth.api.signUpEmail({
      body: {
        email: 'admin@amanah.id',
        password: 'Amanah123!',
        name: 'Admin Amanah'
      }
    });
  }
  // Ensure role is 'admin'
  db.prepare("UPDATE user SET role = 'admin' WHERE email = ?").run('admin@amanah.id');
  console.log('Admin account set to role: admin');

  // 2. Seed or update Patient
  const existingPatient = db.prepare('SELECT id, email, role FROM user WHERE email = ?').get('pasien@amanah.id');
  if (!existingPatient) {
    console.log('Creating pasien@amanah.id...');
    await auth.api.signUpEmail({
      body: {
        email: 'pasien@amanah.id',
        password: 'Pasien123!',
        name: 'Pasien Amanah'
      }
    });
  }
  // Ensure role is 'patient'
  db.prepare("UPDATE user SET role = 'patient' WHERE email = ?").run('pasien@amanah.id');
  console.log('Patient account set to role: patient');

  const users = db.prepare('SELECT id, name, email, role, banned FROM user').all();
  console.log('Current users in auth.db:', users);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
