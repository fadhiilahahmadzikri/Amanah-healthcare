import { describe, expect, it } from 'bun:test';
import { mapBackendToClinicNotification } from './notification-mapper';
import type { BackendNotification } from '../api/notification-api-service';

describe('mapBackendToClinicNotification', () => {
  it('should map appointment backend notification to ClinicNotification correctly', () => {
    const backendNotif: BackendNotification = {
      id: 'notif-uuid-1',
      category: 'appointment',
      title: 'Pendaftaran Janji Temu Berhasil',
      body: 'Nomor antrean P-001 telah dikonfirmasi.',
      senderName: 'Sistem Pendaftaran',
      senderRole: 'Pendaftaran',
      isRead: false,
      createdAt: '2026-09-29T10:00:00.000Z',
      badgeIcon: 'calendar',
      actions: [
        {
          label: 'Lihat Antrean',
          actionKey: 'view_appointment',
          actionType: 'primary',
          url: '/dashboard/appointments/apt-1'
        }
      ]
    };

    const result = mapBackendToClinicNotification(backendNotif);

    expect(result.id).toBe('notif-uuid-1');
    expect(result.title).toBe('Pendaftaran Janji Temu Berhasil');
    expect(result.sender).toBe('Sistem Pendaftaran');
    expect(result.roleSubtitle).toBe('Pendaftaran');
    expect(result.body).toBe('Nomor antrean P-001 telah dikonfirmasi.');
    expect(result.category).toBe('Janji Temu');
    expect(result.status).toBe('unread');
    expect(result.createdAt).toBe('2026-09-29T10:00:00.000Z');
    expect(result.actions?.length).toBe(1);
    expect(result.actions?.[0].label).toBe('Lihat Antrean');
  });

  it('should sanitize stringified JSON objects in senderName or senderRole', () => {
    const backendNotif: BackendNotification = {
      id: 'notif-uuid-json',
      category: 'appointment',
      title: 'Pendaftaran Janji Temu Berhasil',
      body: 'Nomor antrean P-002 telah dikonfirmasi.',
      senderName: '{"id":"552fae2e-3ff8-47e2-8c89-0e6d0d1f9511","name":"ADMIN"}',
      senderRole: '{"id":"552fae2e-3ff8-47e2-8c89-0e6d0d1f9511","name":"ADMIN"}',
      isRead: false,
      createdAt: '2026-09-29T10:00:00.000Z'
    };

    const result = mapBackendToClinicNotification(backendNotif);

    expect(result.title).toBe('Pendaftaran Janji Temu Berhasil');
    expect(result.sender).toBe('ADMIN');
    expect(result.roleSubtitle).toBe('ADMIN');
    expect(result.sender).not.toContain('{');
    expect(result.roleSubtitle).not.toContain('{');
  });

  it('should map read status and default titles gracefully', () => {
    const backendNotif: BackendNotification = {
      id: 'notif-uuid-2',
      category: 'lab_result',
      title: null,
      body: 'Hasil tes darah sudah keluar.',
      isRead: true,
      readAt: '2026-09-29T11:00:00.000Z',
      createdAt: '2026-09-29T10:30:00.000Z'
    };

    const result = mapBackendToClinicNotification(backendNotif);

    expect(result.id).toBe('notif-uuid-2');
    expect(result.title).toBe('Hasil Lab');
    expect(result.category).toBe('Hasil Lab');
    expect(result.status).toBe('read');
    expect(result.avatar).toBe('');
  });

  it('should map avatar from visualKey or metadata without using dummy fallbacks', () => {
    const notifWithVisualKey: BackendNotification = {
      id: 'notif-vk',
      category: 'appointment',
      body: 'Antrean telah tiba.',
      visualKey: 'https://cdn.amanah.com/avatars/user-1.webp',
      createdAt: '2026-09-29T10:00:00.000Z'
    };
    expect(mapBackendToClinicNotification(notifWithVisualKey).avatar).toBe(
      'https://cdn.amanah.com/avatars/user-1.webp'
    );

    const notifWithPatientUserId: BackendNotification = {
      id: 'notif-user-id',
      category: 'appointment',
      body: 'Antrean telah tiba.',
      metadata: { patientUserId: 'usr-abc-123' },
      createdAt: '2026-09-29T10:00:00.000Z'
    };
    expect(mapBackendToClinicNotification(notifWithPatientUserId).avatar).toBe(
      '/api/v1/users/usr-abc-123/avatar'
    );
  });
});
