import { routeManifest, isRouteAuthorized, resolveRouteRule } from '../src/lib/rbac/route-manifest.ts';

console.log('=== RUNNING RIGOROUS RBAC MATRIX VERIFICATION ===\n');

const testCases = [
  // 1. Admin-only routes
  { path: '/dashboard/admin', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/appointment-pasien', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/data-pasien', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/jadwal-dokter', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/kehadiran-pegawai', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/chat', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/workspaces', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/workspaces/team', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/billing', adminExpected: true, patientExpected: false, guestExpected: false },
  { path: '/dashboard/settings', adminExpected: true, patientExpected: false, guestExpected: false },

  // 2. Patient-only routes
  { path: '/dashboard/klinik/antrean', adminExpected: false, patientExpected: true, guestExpected: false },
  { path: '/dashboard/klinik/janji-temu', adminExpected: false, patientExpected: true, guestExpected: false },
  { path: '/dashboard/klinik/profile', adminExpected: false, patientExpected: true, guestExpected: false },
  { path: '/dashboard/klinik/panduan', adminExpected: false, patientExpected: true, guestExpected: false },
  { path: '/dashboard/notifications', adminExpected: false, patientExpected: true, guestExpected: false },
  { path: '/patient-registration', adminExpected: false, patientExpected: true, guestExpected: false },

  // 3. Shared authenticated routes
  { path: '/dashboard', adminExpected: true, patientExpected: true, guestExpected: false },
  { path: '/dashboard/profile', adminExpected: true, patientExpected: true, guestExpected: false },

  // 4. Public routes
  { path: '/', adminExpected: true, patientExpected: true, guestExpected: true },
  { path: '/layanan', adminExpected: true, patientExpected: true, guestExpected: true },
  { path: '/fasilitas', adminExpected: true, patientExpected: true, guestExpected: true },
  { path: '/kontak', adminExpected: true, patientExpected: true, guestExpected: true },
  { path: '/tentang-kami', adminExpected: true, patientExpected: true, guestExpected: true },

  // 5. Auth-only routes
  { path: '/auth/sign-in', adminExpected: false, patientExpected: false, guestExpected: true },
  { path: '/auth/sign-up', adminExpected: false, patientExpected: false, guestExpected: true }
];

let failures = 0;

for (const tc of testCases) {
  const adminRes = isRouteAuthorized(tc.path, 'admin');
  const patientRes = isRouteAuthorized(tc.path, 'patient');
  const guestRes = isRouteAuthorized(tc.path, null);

  let passed = true;

  if (adminRes.allowed !== tc.adminExpected) {
    console.error(`❌ FAIL [ADMIN] ${tc.path}: expected ${tc.adminExpected}, got ${adminRes.allowed} (${adminRes.reason})`);
    passed = false;
    failures++;
  }

  if (patientRes.allowed !== tc.patientExpected) {
    console.error(`❌ FAIL [PATIENT] ${tc.path}: expected ${tc.patientExpected}, got ${patientRes.allowed} (${patientRes.reason})`);
    passed = false;
    failures++;
  }

  if (guestRes.allowed !== tc.guestExpected) {
    console.error(`❌ FAIL [GUEST] ${tc.path}: expected ${tc.guestExpected}, got ${guestRes.allowed} (${guestRes.reason})`);
    passed = false;
    failures++;
  }

  if (passed) {
    console.log(`✅ PASS: ${tc.path.padEnd(35)} | Admin: ${adminRes.allowed ? 'ALLOW' : 'DENY'} | Patient: ${patientRes.allowed ? 'ALLOW' : 'DENY'} | Guest: ${guestRes.allowed ? 'ALLOW' : 'DENY'}`);
  }
}

if (failures === 0) {
  console.log('\n🎉 ALL RBAC MATRIX TESTS PASSED WITH ZERO FAILURES!');
} else {
  console.error(`\n💥 ${failures} RBAC MATRIX TESTS FAILED!`);
  process.exit(1);
}
