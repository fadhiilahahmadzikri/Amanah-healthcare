import { clientFetch } from '@/lib/client-fetch';
import type {
  StaffAttendance,
  AttendanceFilterParams,
  AttendanceListResponse,
  QRPresenceConfig,
  AttendanceStatus
} from './types';

class AttendanceService {
  async getAttendanceList(params: AttendanceFilterParams): Promise<AttendanceListResponse> {
    const query = new URLSearchParams();
    if (params.date) query.set('date', params.date);
    if (params.shift && params.shift !== 'all') query.set('shift', params.shift);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const endpoint = `/api/v1/attendance/daily?${query.toString()}`;
    return clientFetch<AttendanceListResponse>(endpoint, {
      method: 'GET'
    });
  }

  async recordManualAttendance(
    staffIdOrCode: string,
    waktuInput?: string
  ): Promise<StaffAttendance> {
    return clientFetch<StaffAttendance>('/api/v1/attendance/manual', {
      method: 'POST',
      body: JSON.stringify({
        staffIdOrCode: staffIdOrCode.trim(),
        notes: waktuInput || undefined
      })
    });
  }

  async checkoutStaffAttendance(staffId: string): Promise<StaffAttendance> {
    return clientFetch<StaffAttendance>('/api/v1/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({ staffId })
    });
  }

  async generateNewQRToken(context?: string): Promise<QRPresenceConfig> {
    const res = await clientFetch<{
      id: string;
      qrCodeIdentifier: string;
      shift: string;
      rotationSeconds: number;
      validUntil: string;
      isActive: boolean;
      context?: string;
    }>('/api/v1/attendance/qr/rotate', {
      method: 'POST',
      body: JSON.stringify({ context })
    });

    return {
      status_presensi: res.isActive ? 'Aktif' : 'Tidak aktif',
      qr_code_identifier: res.qrCodeIdentifier,
      qr_context: res.context || 'Terminal Utama Presensi',
      qr_validity: res.validUntil ? new Date(res.validUntil).toLocaleTimeString('id-ID') : '',
      rotation_seconds: res.rotationSeconds || 30
    };
  }

  async getActiveQRConfig(): Promise<QRPresenceConfig> {
    const res = await clientFetch<{
      id: string;
      qrCodeIdentifier: string;
      shift: string;
      rotationSeconds: number;
      validUntil: string;
      isActive: boolean;
      context?: string;
    }>('/api/v1/attendance/qr/active', {
      method: 'GET'
    });

    return {
      status_presensi: res.isActive ? 'Aktif' : 'Tidak aktif',
      qr_code_identifier: res.qrCodeIdentifier,
      qr_context: res.context || 'Terminal Utama Presensi',
      qr_validity: res.validUntil ? new Date(res.validUntil).toLocaleTimeString('id-ID') : '',
      rotation_seconds: res.rotationSeconds || 30
    };
  }

  async updateQRConfig(payload: Partial<QRPresenceConfig>): Promise<QRPresenceConfig> {
    return this.generateNewQRToken(payload.qr_context);
  }

  // Compatibility stubs for legacy edit/delete modal interactions
  async updateStaffAttendance(
    id: string,
    payload: Partial<StaffAttendance>
  ): Promise<StaffAttendance> {
    return this.recordManualAttendance(payload.id_staf || id, payload.waktu);
  }

  async deleteStaffAttendance(id: string): Promise<boolean> {
    return true;
  }

  async createStaffAttendance(
    payload: Omit<StaffAttendance, 'id'> & { id?: string }
  ): Promise<StaffAttendance> {
    return this.recordManualAttendance(payload.id_staf, payload.waktu);
  }
}

export const attendanceService = new AttendanceService();
