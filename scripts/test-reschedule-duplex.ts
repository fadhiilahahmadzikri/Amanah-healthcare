import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:3001';

async function postJson(url: string, body: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${url} failed [${res.status}]: ${text}`);
  }
  return await res.json();
}

async function getJson(url: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} failed [${res.status}]: ${text}`);
  }
  return await res.json();
}

async function runE2ETest() {
  console.log('=== STARTING DUPLEX RESCHEDULE LIVE E2E TEST ===\n');

  // 1. Login Admin
  console.log('[1] Logging in as Admin...');
  const adminLogin = await postJson('/api/v1/auth/email/login', {
    email: 'admin@amanah.com',
    password: 'secret123',
  });
  const adminToken = adminLogin.token || adminLogin.session?.token;
  console.log('    Admin logged in successfully.\n');

  // 2. Login Patient
  console.log('[2] Logging in as Patient...');
  const patientLogin = await postJson('/api/v1/auth/email/login', {
    email: 'pasien@amanah.com',
    password: 'secret123',
  });
  const patientToken = patientLogin.token || patientLogin.session?.token;
  const patientId = 'ab115dbf-cb8e-4ac8-8764-2586b07ca367';
  console.log('    Patient logged in successfully.\n');

  // 3. Connect Admin and Patient WebSockets
  console.log('[3] Connecting Admin & Patient WebSocket clients to Socket.IO...');
  const adminSocket = io(API_BASE, {
    path: '/socket.io',
    auth: { token: adminToken },
    transports: ['websocket'],
  });

  const patientSocket = io(API_BASE, {
    path: '/socket.io',
    auth: { token: patientToken },
    transports: ['websocket'],
  });

  const adminNotifications: any[] = [];
  adminSocket.on('notification:new', (notif) => {
    const receivedAt = Date.now();
    console.log(
      `    [WS-ADMIN] Received "${notif.title}" at ${new Date(receivedAt).toISOString()}`,
    );
    adminNotifications.push({ notif, receivedAt });
  });

  const patientNotifications: any[] = [];
  patientSocket.on('notification:new', (notif) => {
    const receivedAt = Date.now();
    console.log(
      `    [WS-PATIENT] Received "${notif.title}" at ${new Date(receivedAt).toISOString()}`,
    );
    patientNotifications.push({ notif, receivedAt });
  });

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      adminSocket.on('connect', () => {
        console.log('    Admin socket connected! Socket ID:', adminSocket.id);
        resolve();
      });
      adminSocket.on('connect_error', (err) => reject(err));
    }),
    new Promise<void>((resolve, reject) => {
      patientSocket.on('connect', () => {
        console.log('    Patient socket connected! Socket ID:', patientSocket.id);
        resolve();
      });
      patientSocket.on('connect_error', (err) => reject(err));
    }),
  ]);

  // 4. Dynamically Discover Doctors and Sessions from Canonical Database/API
  console.log('\n[4] Querying available doctor schedules dynamically...');
  const targetDate = '2026-10-01';
  const scheduleData = await getJson(`/api/v1/admin/doctor-schedules?date=${targetDate}`, adminToken);
  const doctors: any[] = scheduleData.data?.doctors || [];

  const initialDoctor =
    doctors.find(
      (d: any) =>
        d.nama_dokter?.toLowerCase().includes('ahmad') &&
        d.sesi_harian?.some((s: any) => s.status_sesi === 'OPEN' && s.slot_tersedia > 0),
    ) ||
    doctors.find((d: any) =>
      d.sesi_harian?.some((s: any) => s.status_sesi === 'OPEN' && s.slot_tersedia > 0),
    );
  if (!initialDoctor) {
    throw new Error('No doctor found with open session on ' + targetDate);
  }
  const initialSession =
    initialDoctor.sesi_harian.find(
      (s: any) =>
        s.status_sesi === 'OPEN' &&
        s.slot_tersedia > 0 &&
        !s.nama_sesi?.toLowerCase().includes('pagi'),
    ) ||
    initialDoctor.sesi_harian.find(
      (s: any) => s.status_sesi === 'OPEN' && s.slot_tersedia > 0,
    );

  const targetDoctor =
    doctors.find(
      (d: any) =>
        d.id !== initialDoctor.id &&
        d.nama_dokter?.includes('Rizky') &&
        d.sesi_harian?.some(
          (s: any) =>
            s.status_sesi === 'OPEN' &&
            s.slot_tersedia > 0 &&
            !s.nama_sesi?.toLowerCase().includes('pagi'),
        ),
    ) ||
    doctors.find(
      (d: any) =>
        d.id !== initialDoctor.id &&
        d.sesi_harian?.some(
          (s: any) =>
            s.status_sesi === 'OPEN' &&
            s.slot_tersedia > 0 &&
            !s.nama_sesi?.toLowerCase().includes('pagi'),
        ),
    );
  if (!targetDoctor) {
    throw new Error('No target doctor found for reschedule on ' + targetDate);
  }
  const targetSession =
    targetDoctor.sesi_harian.find(
      (s: any) =>
        s.status_sesi === 'OPEN' &&
        s.slot_tersedia > 0 &&
        !s.nama_sesi?.toLowerCase().includes('pagi'),
    ) ||
    targetDoctor.sesi_harian.find(
      (s: any) => s.status_sesi === 'OPEN' && s.slot_tersedia > 0,
    );

  console.log(`    Initial Doctor : ${initialDoctor.nama_dokter} (${initialDoctor.id})`);
  console.log(`    Initial Session: ${initialSession.nama_sesi} (${initialSession.waktu}), Session ID: ${initialSession.id}`);
  console.log(`    Target Doctor  : ${targetDoctor.nama_dokter} (${targetDoctor.id})`);
  console.log(`    Target Session : ${targetSession.nama_sesi} (${targetSession.waktu}), Session ID: ${targetSession.id}\n`);

  // 5. Patient creates initial appointment
  console.log(`[5] Patient booking initial appointment with ${initialDoctor.nama_dokter}...`);
  const poliUmumId = '53fa8088-46c8-4611-9dea-99a54f4a45ab';
  const layananUmumId = '59c6b882-5a93-487d-945d-fd08d2a7bb82';

  const appointment = await postJson(
    '/api/v1/appointments',
    {
      patientId,
      poliklinikId: poliUmumId,
      layananId: layananUmumId,
      staffId: initialDoctor.id,
      appointmentDate: targetDate,
      session: initialSession.nama_sesi.toUpperCase(),
      visitType: 'Pemeriksaan Baru',
      complaint: 'Pemeriksaan tensi darah rutin',
    },
    patientToken,
  );
  console.log(`    Appointment created: ID = ${appointment.id}`);
  console.log(`    Original Doctor = ${appointment.doctorName} (staffId: ${appointment.staffId})`);
  console.log(`    Original Time   = ${appointment.scheduledStartTime} - ${appointment.scheduledEndTime}`);
  console.log(`    Original Queue  = ${appointment.queueNumber}`);

  // Wait 1.5s for creation notification propagation
  await new Promise((r) => setTimeout(r, 1500));

  // 6. TEST FLOW 1: Patient-to-Admin Reschedule
  console.log(`\n[6] FLOW 1: Patient rescheduling appointment to ${targetDoctor.nama_dokter} (${targetSession.nama_sesi}, Session ID: ${targetSession.id})...`);
  const rescheduleStartTime = Date.now();

  const rescheduled = await postJson(
    `/api/v1/appointments/${appointment.id}/reschedule`,
    {
      target_date: targetDate,
      target_session_id: targetSession.id,
      reason: 'Penyesuaian waktu pasien ke sesi lain',
    },
    patientToken,
  );

  console.log('    Patient Reschedule API call succeeded!');
  console.log(`    New Doctor Scheduled : ${rescheduled.doctorName} (staffId: ${rescheduled.staffId})`);
  console.log(`    New Scheduled Time   : ${rescheduled.scheduledStartTime} - ${rescheduled.scheduledEndTime}`);

  // 7. Verify real-time notification received by Admin
  console.log('\n[7] Waiting for Admin WebSocket notification ("Perubahan Jadwal Janji Temu Pasien")...');
  let adminRescheduleNotif: any = null;
  const timeoutMs = 8000;
  const pollStart = Date.now();

  while (Date.now() - pollStart < timeoutMs) {
    adminRescheduleNotif = adminNotifications.find(
      (n) =>
        n.receivedAt >= rescheduleStartTime &&
        (n.notif.title.includes('Perubahan Jadwal') ||
          n.notif.body?.includes('memindahkan jadwal')),
    );
    if (adminRescheduleNotif) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (!adminRescheduleNotif) {
    console.error('DEBUG: adminNotifications count:', adminNotifications.length);
    console.error('DEBUG: adminNotifications content:', JSON.stringify(adminNotifications, null, 2));
    console.error('DEBUG: patientNotifications count:', patientNotifications.length);
    console.error('DEBUG: patientNotifications content:', JSON.stringify(patientNotifications, null, 2));
    adminSocket.disconnect();
    patientSocket.disconnect();
    throw new Error('FAIL: Admin did not receive real-time notification for patient reschedule within 8 seconds!');
  }

  const latencyAdmin = adminRescheduleNotif.receivedAt - rescheduleStartTime;
  console.log('    SUCCESS! Real-time notification received by Admin:');
  console.log(`    - Title   : "${adminRescheduleNotif.notif.title}"`);
  console.log(`    - Body    : "${adminRescheduleNotif.notif.body}"`);
  console.log(`    - Sender  : ${adminRescheduleNotif.notif.senderName} (${adminRescheduleNotif.notif.senderRole})`);
  console.log(`    - Latency : ${latencyAdmin}ms`);

  // 8. Verify Canonical DB State after patient reschedule (Ghost Appointment check)
  console.log('\n[8] Verifying canonical DB state (Ghost Appointment check)...');
  const latestApt = await getJson(`/api/v1/appointments/${appointment.id}`, adminToken);
  console.log(`    DB appointment ID          : ${latestApt.id}`);
  console.log(`    DB practitionerId (staffId): ${latestApt.staffId}`);
  console.log(`    DB doctorName              : ${latestApt.doctorName}`);
  console.log(`    DB scheduledStartTime      : ${latestApt.scheduledStartTime}`);
  console.log(`    DB scheduledEndTime        : ${latestApt.scheduledEndTime}`);

  if (latestApt.staffId !== targetDoctor.id) {
    adminSocket.disconnect();
    patientSocket.disconnect();
    throw new Error(`FAIL: practitionerId (${latestApt.staffId}) was NOT updated to target doctor (${targetDoctor.id})! Ghost appointment bug still exists!`);
  }
  console.log('    CONFIRMED: practitionerId updated to new session doctor (No ghost appointment!)');

  // 9. TEST FLOW 2: Admin-to-Patient Reschedule (Reverse Duplex)
  console.log(`\n[9] FLOW 2: Admin shifting doctor ${targetDoctor.nama_dokter}'s session to new start time...`);
  const adminShiftStartTime = Date.now();

  const [startHour, startMinute] = targetSession.jam_mulai.split(':').map(Number);
  const shiftedMinute = (startMinute + 15) % 60;
  const shiftedHour = startHour + Math.floor((startMinute + 15) / 60);
  const newStartTime = `${String(shiftedHour).padStart(2, '0')}:${String(shiftedMinute).padStart(2, '0')}`;

  const adminShiftResult = await postJson(
    `/api/v1/admin/doctor-schedules/${targetDoctor.id}/sessions/${targetSession.id}/reschedule`,
    {
      targetDate: targetDate,
      targetStartTime: newStartTime,
      targetEndTime: targetSession.jam_selesai,
      reason: 'Penyesuaian jam mulai dokter dari klinik',
      rescheduleActiveAppointments: true,
    },
    adminToken,
  );
  console.log('    Admin Shift API succeeded!');
  console.log(`    Shift result: ${JSON.stringify(adminShiftResult.data?.rescheduledSchedule?.timeRange || adminShiftResult.message)}`);

  // 10. Verify real-time notification received by Patient
  console.log('\n[10] Waiting for Patient WebSocket notification ("Jadwal Janji Temu Diperbarui oleh Klinik")...');
  let patientRescheduleNotif: any = null;
  const pollStart2 = Date.now();

  while (Date.now() - pollStart2 < timeoutMs) {
    patientRescheduleNotif = patientNotifications.find(
      (n) =>
        n.receivedAt >= adminShiftStartTime &&
        (n.notif.title.includes('Diperbarui oleh Klinik') ||
          n.notif.body?.includes('dipindahkan ke tanggal')),
    );
    if (patientRescheduleNotif) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (!patientRescheduleNotif) {
    console.error('DEBUG: patientNotifications count:', patientNotifications.length);
    console.error('DEBUG: patientNotifications content:', JSON.stringify(patientNotifications, null, 2));
    adminSocket.disconnect();
    patientSocket.disconnect();
    throw new Error('FAIL: Patient did not receive real-time notification for admin session shift within 8 seconds!');
  } else {
    const latencyPatient = patientRescheduleNotif.receivedAt - adminShiftStartTime;
    console.log('    SUCCESS! Real-time notification received by Patient:');
    console.log(`    - Title   : "${patientRescheduleNotif.notif.title}"`);
    console.log(`    - Body    : "${patientRescheduleNotif.notif.body}"`);
    console.log(`    - Sender  : ${patientRescheduleNotif.notif.senderName} (${patientRescheduleNotif.notif.senderRole})`);
    console.log(`    - Latency : ${latencyPatient}ms`);
  }

  // 11. Verify Canonical DB State after admin session shift
  console.log('\n[11] Verifying appointment timing after admin session shift...');
  const shiftedApt = await getJson(`/api/v1/appointments/${appointment.id}`, adminToken);
  console.log(`    DB scheduledStartTime : ${shiftedApt.scheduledStartTime}`);
  console.log(`    DB scheduledEndTime   : ${shiftedApt.scheduledEndTime}`);

  adminSocket.disconnect();
  patientSocket.disconnect();
  console.log('\n=== DUPLEX RESCHEDULE LIVE E2E TEST COMPLETED SUCCESSFULLY! ===');
  process.exit(0);
}

runE2ETest().catch((err) => {
  console.error('\nE2E Test Failed:', err);
  process.exit(1);
});
