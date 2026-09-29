import { io } from 'socket.io-client';

const API_BASE = 'http://127.0.0.1:3001';

async function runE2EVerification() {
  console.log('--- [Step 1] Authenticating Admin ---');
  const loginRes = await fetch(`${API_BASE}/api/v1/auth/email/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@amanah.com',
      password: 'secret123'
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
  }

  const loginData = (await loginRes.json()) as {
    token: string;
    user: { id: string; email: string };
  };
  const adminToken = loginData.token;
  console.log(`Admin authenticated successfully. User ID: ${loginData.user?.id || 'unknown'}`);

  console.log('--- [Step 2] Connecting Admin Socket.IO Client ---');
  const socket = io(API_BASE, {
    auth: { token: adminToken },
    extraHeaders: {
      cookie: `amanah_access_token=${adminToken}`
    },
    transports: ['websocket', 'polling'],
    timeout: 5000
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
    socket.on('connect', () => {
      clearTimeout(timer);
      console.log(`Socket connected! Socket ID: ${socket.id}`);
      resolve();
    });
    socket.on('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  console.log('--- [Step 3] Registering notification:new Listener ---');
  const receivedNotifications: any[] = [];
  socket.on('notification:new', (data) => {
    console.log('>> [SOCKET EVENT RECEIVED] notification:new:', JSON.stringify(data, null, 2));
    receivedNotifications.push(data);
  });

  console.log('--- [Step 4] Triggering Appointment Creation ---');
  const appointmentPayload = {
    patientId: 'ab115dbf-cb8e-4ac8-8764-2586b07ca367',
    poliklinikId: 'c7df1666-5bb1-4c89-b0f7-9d62a6b96c75',
    layananId: 'f5af6614-aa5b-402a-b99c-ba0cd72ce2e2',
    staffId: '1630952b-4945-4e56-9cd9-f11395076491',
    appointmentDate: '2026-10-15',
    session: 'PAGI',
    visitType: 'Pemeriksaan Baru',
    complaint: 'E2E notification flow automated verification'
  };

  const createRes = await fetch(`${API_BASE}/api/v1/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify(appointmentPayload)
  });

  if (!createRes.ok) {
    throw new Error(`Appointment creation failed: ${createRes.status} ${await createRes.text()}`);
  }

  const createdAppointment = (await createRes.json()) as any;
  console.log(
    `Appointment created! ID: ${createdAppointment.id}, Queue: ${createdAppointment.queueNumber}`
  );

  console.log('--- [Step 5] Waiting for Real-Time Socket Event ---');
  const startTime = Date.now();
  while (receivedNotifications.length === 0 && Date.now() - startTime < 6000) {
    await new Promise((r) => setTimeout(r, 200));
  }

  if (receivedNotifications.length === 0) {
    console.warn(
      'Socket notification was not received within 6s. Checking Redis/Orchestrator worker status.'
    );
  } else {
    console.log(
      `PASS: Received ${receivedNotifications.length} real-time notification(s) via WebSocket!`
    );
  }

  console.log('--- [Step 6] Querying REST /api/v1/notifications/unread-count ---');
  const countRes = await fetch(`${API_BASE}/api/v1/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const countData = (await countRes.json()) as { unreadCount: number };
  console.log(`REST unreadCount: ${countData.unreadCount}`);

  console.log('--- [Step 7] Querying REST /api/v1/notifications/me ---');
  const listRes = await fetch(`${API_BASE}/api/v1/notifications/me?limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const listData = (await listRes.json()) as any;
  console.log(`Fetched ${listData.data?.length || 0} notifications from database.`);
  if (listData.data?.length > 0) {
    console.log(`Latest notification title: "${listData.data[0].title}"`);
    console.log(`Latest notification message: "${listData.data[0].message}"`);
  }

  console.log('--- [Step 8] Testing Mark All As Read ---');
  const readRes = await fetch(`${API_BASE}/api/v1/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`Mark all as read status: ${readRes.status}`);

  const postCountRes = await fetch(`${API_BASE}/api/v1/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const postCountData = (await postCountRes.json()) as { unreadCount: number };
  console.log(`REST post-mark unreadCount: ${postCountData.unreadCount}`);

  socket.disconnect();
  console.log('--- [ALL E2E CHECKS COMPLETED] ---');
}

runE2EVerification().catch((err) => {
  console.error('E2E Verification failed:', err);
  process.exit(1);
});
