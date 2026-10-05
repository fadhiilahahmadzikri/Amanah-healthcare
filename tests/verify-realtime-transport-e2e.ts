import { io } from 'socket.io-client';
import { execSync } from 'child_process';

function queryDb(sql: string): string {
  const cmd = `docker exec -i amanah-healthcare-backend-postgres-1 psql -U amanah -d amanah_healthcare -t -A -c "${sql}"`;
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

async function main() {
  console.log('--- REALTIME NOTIFICATION TRANSPORT END-TO-END TEST ---');

  // 1. Authenticate Admin and retrieve ticket
  const adminLoginRes = await fetch('http://localhost:3001/api/v1/auth/email/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@amanah.com', password: 'secret123' })
  }).then(r => r.json());

  const adminToken = adminLoginRes.token;
  const adminUser = adminLoginRes.user;
  console.log(`[Admin] Authenticated as ${adminUser.id} (${adminUser.systemRole || 'ADMIN'})`);

  const adminTicketRes = await fetch('http://localhost:3001/api/v1/realtime/ticket', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  console.log(`[Admin] Acquired realtime ticket: ${adminTicketRes.ticket.substring(0, 10)}... (TTL: ${adminTicketRes.expiresInSec}s)`);

  // 2. Connect Admin to Socket.IO using Ticket
  const adminSocket = io('http://localhost:3001', {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { ticket: adminTicketRes.ticket }
  });

  const adminNotifications: any[] = [];
  adminSocket.on('connect', () => {
    console.log(`[Admin Socket] Connected successfully! [id=${adminSocket.id}]`);
  });
  adminSocket.on('notification:new', (notif) => {
    console.log(`[Admin Socket] LIVE EVENT RECEIVED! title="${notif.title}", audience="${notif.audience}", toast=${notif.presentation?.toast}`);
    adminNotifications.push(notif);
  });
  adminSocket.on('connect_error', (err) => {
    console.error('[Admin Socket] Connect error:', err.message);
  });

  // 3. Authenticate Patient and retrieve ticket
  const patientLoginRes = await fetch('http://localhost:3001/api/v1/auth/email/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pasien@amanah.com', password: 'secret123' })
  }).then(r => r.json());

  const patientToken = patientLoginRes.token;
  const patientUser = patientLoginRes.user;
  console.log(`[Patient] Authenticated as ${patientUser.id} (${patientUser.systemRole || 'PATIENT'})`);

  const patientTicketRes = await fetch('http://localhost:3001/api/v1/realtime/ticket', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());

  console.log(`[Patient] Acquired realtime ticket: ${patientTicketRes.ticket.substring(0, 10)}... (TTL: ${patientTicketRes.expiresInSec}s)`);

  // 4. Connect Patient to Socket.IO using Ticket
  const patientSocket = io('http://localhost:3001', {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { ticket: patientTicketRes.ticket }
  });

  const patientNotifications: any[] = [];
  patientSocket.on('connect', () => {
    console.log(`[Patient Socket] Connected successfully! [id=${patientSocket.id}]`);
  });
  patientSocket.on('notification:new', (notif) => {
    console.log(`[Patient Socket] LIVE EVENT RECEIVED! title="${notif.title}", audience="${notif.audience}", toast=${notif.presentation?.toast}`);
    patientNotifications.push(notif);
  });
  patientSocket.on('connect_error', (err) => {
    console.error('[Patient Socket] Connect error:', err.message);
  });

  // Wait 1s for both sockets to settle in their rooms
  await new Promise(r => setTimeout(r, 1000));

  // 5. Query relational DB for required IDs
  const patientProfileId = queryDb(`SELECT id FROM patient_profiles WHERE user_id = '${patientUser.id}' LIMIT 1;`);
  const poliId = queryDb(`SELECT id FROM clinic_units WHERE name = 'Poli Umum' LIMIT 1;`);
  const serviceId = queryDb(`SELECT id FROM clinic_services LIMIT 1;`);
  const doctorStaffId = queryDb(`SELECT id FROM staff_profiles WHERE staff_type = 'doctor' LIMIT 1;`);

  console.log(`[Booking DB Context] PatientProfile: ${patientProfileId}, Poli: ${poliId}, Service: ${serviceId}, DoctorStaff: ${doctorStaffId}`);

  // 6. Patient books an appointment via POST /api/v1/appointments
  const dateStr = '2026-10-' + String(15 + Math.floor(Math.random() * 10)).padStart(2, '0');
  const bookRes = await fetch('http://localhost:3001/api/v1/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`
    },
    body: JSON.stringify({
      patientId: patientProfileId,
      poliklinikId: poliId,
      layananId: serviceId,
      appointmentDate: dateStr,
      session: 'PAGI',
      visitType: 'Pemeriksaan Baru',
      complaint: 'Pemeriksaan Rutin Kesehatan (Realtime Transport Verification)',
      staffId: doctorStaffId
    })
  }).then(r => r.json());

  console.log(`[Booking] Appointment successfully created with ID: ${bookRes?.id || 'OK'}`);

  // 7. Wait up to 6 seconds for live socket events from outbox -> redis streams -> orchestrator -> socket
  console.log('[Listening] Waiting for realtime events across WebSocket rooms...');
  const start = Date.now();
  while (Date.now() - start < 6000) {
    if (adminNotifications.length > 0 && patientNotifications.length > 0) {
      break;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // 8. Assertions
  console.log('\n--- VERIFICATION ASSERTIONS ---');
  let success = true;

  if (adminNotifications.length === 0) {
    console.error('FAIL: Admin received NO realtime socket notifications without refresh!');
    success = false;
  } else {
    const adminNotif = adminNotifications[0];
    console.log('PASS: Admin received LIVE notification without refresh:');
    console.log(`  - Title: "${adminNotif.title}"`);
    console.log(`  - Audience: "${adminNotif.audience}" (Expected: clinic)`);
    console.log(`  - Toast enabled: ${adminNotif.presentation?.toast} (Expected: true)`);
    if (adminNotif.audience !== 'clinic' || adminNotif.presentation?.toast !== true) {
      console.error('FAIL: Admin notification properties mismatch!');
      success = false;
    }
  }

  if (patientNotifications.length === 0) {
    console.error('FAIL: Patient received NO realtime socket notifications without refresh!');
    success = false;
  } else {
    const patientNotif = patientNotifications[0];
    console.log('PASS: Patient received LIVE notification without refresh:');
    console.log(`  - Title: "${patientNotif.title}"`);
    console.log(`  - Audience: "${patientNotif.audience}" (Expected: patient)`);
    console.log(`  - Toast enabled: ${patientNotif.presentation?.toast} (Expected: false - actor suppressed)`);
    if (patientNotif.audience !== 'patient' || patientNotif.presentation?.toast !== false) {
      console.error('FAIL: Patient notification properties mismatch!');
      success = false;
    }
  }

  adminSocket.disconnect();
  patientSocket.disconnect();

  if (success) {
    console.log('\n=============================================================');
    console.log('>>> 100% REALTIME VERIFIED: ZERO PAGE REFRESH REQUIRED! <<<');
    console.log('=============================================================');
    process.exit(0);
  } else {
    console.error('\n>>> SOME ASSERTIONS FAILED! <<<');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
