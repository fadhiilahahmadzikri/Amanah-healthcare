import { describe, expect, it } from 'bun:test';
import {
  resolveNotificationRoute,
  executeNotificationAction
} from './notification-action-dispatcher';

describe('NotificationActionDispatcher - Security & Route Allowlist', () => {
  it('should map view_queue to patient queue route for patient role', () => {
    const route = resolveNotificationRoute(
      { type: 'view_queue', params: { appointmentId: 'apt-1' } },
      null,
      'patient'
    );
    expect(route).toBe('/dashboard/klinik/antrean');
  });

  it('should map view_queue to appointment-pasien for clinic role', () => {
    const route = resolveNotificationRoute(
      { type: 'view_queue', params: { appointmentId: 'apt-1' } },
      null,
      'admin'
    );
    expect(route).toBe('/dashboard/appointment-pasien');
  });

  it('should map view_patient to jadwal-dokter for clinic role', () => {
    const route = resolveNotificationRoute(
      {
        type: 'view_patient',
        params: { staffId: 'doc-1', date: '2026-10-10', scheduledStartTime: '09:00:00' }
      },
      null,
      'admin'
    );
    expect(route).toContain('/dashboard/jadwal-dokter');
    expect(route).toContain('selectedDoctorId=doc-1');
    expect(route).toContain('openPatients=true');
  });

  it('should never route patient to clinic internal routes (jadwal-dokter)', () => {
    const route = resolveNotificationRoute(
      {
        type: 'view_patient',
        params: { staffId: 'doc-1' }
      },
      null,
      'patient'
    );
    expect(route).toBe('/dashboard/klinik/antrean');
  });

  it('should block external, protocol-relative, and dangerous URLs', () => {
    const dangerous1 = resolveNotificationRoute(
      { url: 'https://malicious-site.com/steal' },
      null,
      'patient'
    );
    expect(dangerous1).toBeNull();

    const dangerous2 = resolveNotificationRoute(
      { url: '//malicious-site.com' },
      null,
      'admin'
    );
    expect(dangerous2).toBeNull();

    const dangerous3 = resolveNotificationRoute(
      { url: 'javascript:alert(1)' },
      null,
      'admin'
    );
    expect(dangerous3).toBeNull();
  });

  it('should block unallowlisted routes for patient role', () => {
    const forbiddenForPatient = resolveNotificationRoute(
      { url: '/dashboard/admin/settings' },
      null,
      'patient'
    );
    expect(forbiddenForPatient).toBeNull();
  });

  it('should safely execute notification action without throwing', () => {
    let pushedRoute = '';
    const mockRouter = {
      push: (url: string) => {
        pushedRoute = url;
      }
    };

    executeNotificationAction(
      mockRouter,
      { type: 'view_queue', params: { appointmentId: 'apt-1' } },
      undefined,
      'patient'
    );

    expect(pushedRoute).toBe('/dashboard/klinik/antrean');
  });
});
