import { clientFetch } from '@/lib/client-fetch';
import type {
  StaffAttendance,
  AttendanceFilterParams,
  AttendanceListResponse,
  QRPresenceConfig
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

  async checkoutStaffAttendance(staffId: string, notes?: string): Promise<StaffAttendance> {
    return clientFetch<StaffAttendance>('/api/v1/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({
        staffId,
        notes: notes || undefined
      })
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
      rotation_seconds: res.rotationSeconds,
      validUntil: res.validUntil,
      valid_until: res.validUntil
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
      rotation_seconds: res.rotationSeconds,
      validUntil: res.validUntil,
      valid_until: res.validUntil
    };
  }

  async updateQRConfig(payload?: Partial<QRPresenceConfig>): Promise<QRPresenceConfig> {
    return this.generateNewQRToken(payload?.qr_context);
  }
}

export const attendanceService = new AttendanceService();
