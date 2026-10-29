import { describe, expect, it } from 'bun:test';
import { isProtectedRoute, getRoleLandingPath, ROUTES, safeRedirect } from '@/core/routes';
import { isRouteAuthorized, resolveRouteRule } from '@/lib/rbac/route-manifest';
import { navGroups } from '@/config/nav-config';

describe('Role-Based Portal Routing & RBAC Architecture', () => {
  describe('Canonical Routes Definition (Single Source of Truth)', () => {
    it('defines explicit /admin and /klinik routes with zero legacy dashboard pollution', () => {
      expect(ROUTES.admin).toBe('/admin');
      expect(ROUTES.adminAppointmentPasien).toBe('/admin/appointment-pasien');
      expect(ROUTES.adminDoctorSchedules).toBe('/admin/jadwal-dokter');
      expect(ROUTES.adminStaff).toBe('/admin/staff');
      expect(ROUTES.adminLeaveManagement).toBe('/admin/manajemen-perizinan');
      expect(ROUTES.adminPayroll).toBe('/admin/payroll');
      expect(ROUTES.clinicQueue).toBe('/klinik/antrean');
      expect(ROUTES.clinicAppointments).toBe('/klinik/janji-temu');
      expect(ROUTES.clinicHistory).toBe('/klinik/history');
      expect(ROUTES.clinicChat).toBe('/klinik/chat');

      // Zero legacy /dashboard properties
      expect((ROUTES as any).dashboard).toBeUndefined();
      expect((ROUTES as any).dashboardAppointmentPasien).toBeUndefined();
      expect((ROUTES as any).dashboardPatient).toBeUndefined();
    });

    it('identifies protected prefixes strictly as /admin, /klinik, and /patient-registration', () => {
      expect(isProtectedRoute('/admin')).toBe(true);
      expect(isProtectedRoute('/admin/appointment-pasien')).toBe(true);
      expect(isProtectedRoute('/admin/jadwal-dokter')).toBe(true);
      expect(isProtectedRoute('/klinik')).toBe(true);
      expect(isProtectedRoute('/klinik/antrean')).toBe(true);
      expect(isProtectedRoute('/patient-registration')).toBe(true);

      // Public and legacy routes are not protected prefixes
      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/layanan')).toBe(false);
      expect(isProtectedRoute('/auth/sign-in')).toBe(false);
      expect(isProtectedRoute('/dashboard')).toBe(false);
    });

    it('resolves deterministic role landing destinations', () => {
      expect(getRoleLandingPath('admin')).toBe('/admin/appointment-pasien');
      expect(getRoleLandingPath('staff_doctor')).toBe('/admin/appointment-pasien');
      expect(getRoleLandingPath('staff_midwife')).toBe('/admin/appointment-pasien');
      expect(getRoleLandingPath('patient')).toBe('/klinik/antrean');
      expect(getRoleLandingPath(null)).toBe('/admin/appointment-pasien');
    });

    it('safely validates internal redirects without allowing open redirects or dangerous protocols', () => {
      expect(safeRedirect('/admin/jadwal-dokter')).toBe('/admin/jadwal-dokter');
      expect(safeRedirect('/klinik/janji-temu')).toBe('/klinik/janji-temu');
      expect(safeRedirect('https://malicious.site', '/admin/appointment-pasien')).toBe(
        '/admin/appointment-pasien'
      );
      expect(safeRedirect('//malicious.site', '/admin/appointment-pasien')).toBe(
        '/admin/appointment-pasien'
      );
      expect(safeRedirect(null, '/admin/appointment-pasien')).toBe('/admin/appointment-pasien');
    });
  });

  describe('Route Manifest Fail-Closed Authorization', () => {
    it('allows public routes unconditionally', () => {
      expect(isRouteAuthorized('/', null).allowed).toBe(true);
      expect(isRouteAuthorized('/tentang-kami', null).allowed).toBe(true);
      expect(isRouteAuthorized('/layanan', null).allowed).toBe(true);
      expect(isRouteAuthorized('/kehadiran-live', null).allowed).toBe(true);
    });

    it('restricts auth-only routes to unauthenticated visitors', () => {
      expect(isRouteAuthorized('/auth/sign-in', null).allowed).toBe(true);
      expect(isRouteAuthorized('/auth/sign-up', null).allowed).toBe(true);
      expect(isRouteAuthorized('/auth/sign-in', 'admin').allowed).toBe(false);
      expect(isRouteAuthorized('/auth/sign-in', 'patient').allowed).toBe(false);
    });

    it('enforces admin-only access on administrative routes', () => {
      const adminRoutes = [
        '/admin/appointment-pasien',
        '/admin/data-pasien',
        '/admin/jadwal-dokter',
        '/admin/staff',
        '/admin/kehadiran-pegawai',
        '/admin/manajemen-perizinan',
        '/admin/peluang-pengganti',
        '/admin/payroll',
        '/admin/chat',
        '/admin/settings',
        '/admin/notifications'
      ];

      for (const route of adminRoutes) {
        // Admin and medical staff are allowed
        expect(isRouteAuthorized(route, 'admin').allowed).toBe(true);
        expect(isRouteAuthorized(route, 'staff_doctor').allowed).toBe(true);
        expect(isRouteAuthorized(route, 'staff_midwife').allowed).toBe(true);

        // Patients are rejected
        expect(isRouteAuthorized(route, 'patient').allowed).toBe(false);
        // Unauthenticated users are rejected
        expect(isRouteAuthorized(route, null).allowed).toBe(false);
      }
    });

    it('enforces patient-only access on clinic portal routes', () => {
      const clinicRoutes = [
        '/klinik/antrean',
        '/klinik/janji-temu',
        '/klinik/history',
        '/klinik/chat',
        '/klinik/panduan',
        '/klinik/notifications'
      ];

      for (const route of clinicRoutes) {
        expect(isRouteAuthorized(route, 'patient').allowed).toBe(true);
        expect(isRouteAuthorized(route, 'admin').allowed).toBe(false);
        expect(isRouteAuthorized(route, null).allowed).toBe(false);
      }
    });

    it('fails closed on unknown routes in protected zones', () => {
      expect(isRouteAuthorized('/admin/unknown-secret-page', 'patient').allowed).toBe(false);
      expect(isRouteAuthorized('/klinik/unknown-page', 'admin').allowed).toBe(false);
    });
  });

  describe('Navigation Configuration Hierarchy (Breadcrumb SSOT)', () => {
    it('maps admin appointment-pasien under Pelayanan Pasien', () => {
      const adminGroup = navGroups.find((g) => g.label === 'Amanah Admin');
      expect(adminGroup).toBeDefined();

      const patientService = adminGroup?.items.find((i) => i.title === 'Pelayanan Pasien');
      expect(patientService).toBeDefined();

      const apptItem = patientService?.items?.find((i) => i.title === 'Appointment Pasien');
      expect(apptItem?.url).toBe('/admin/appointment-pasien');
    });

    it('maps admin jadwal-dokter under Manajemen SDM', () => {
      const adminGroup = navGroups.find((g) => g.label === 'Amanah Admin');
      const hrm = adminGroup?.items.find((i) => i.title === 'Manajemen SDM');
      expect(hrm).toBeDefined();

      const scheduleItem = hrm?.items?.find((i) => i.title === 'Jadwal Dokter');
      expect(scheduleItem?.url).toBe('/admin/jadwal-dokter');
    });

    it('maps clinic antrean under Klinik', () => {
      const clinicGroup = navGroups.find((g) => g.label === 'Klinik');
      const clinicItem = clinicGroup?.items.find((i) => i.title === 'Klinik');
      expect(clinicItem).toBeDefined();

      const queueSub = clinicItem?.items?.find((i) => i.title === 'Cek Antrean');
      expect(queueSub?.url).toBe('/klinik/antrean');
    });
  });
});
