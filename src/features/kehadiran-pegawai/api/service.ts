import type {
  StaffAttendance,
  AttendanceFilterParams,
  AttendanceListResponse,
  AttendanceMetrics,
  QRPresenceConfig,
  AttendanceStatus
} from './types';

const emptyAttendanceMetrics: AttendanceMetrics = {
  total_staf: 0,
  staf_hadir: 0,
  staf_tidak_hadir: 0,
  tingkat_kehadiran: 0,
  perubahan_total_staf: 0,
  perubahan_staf_hadir: 0,
  perubahan_staf_tidak_hadir: 0,
  perubahan_tingkat_kehadiran: 0,
  sparkline_total_staf: [],
  sparkline_staf_hadir: [],
  sparkline_staf_tidak_hadir: [],
  sparkline_tingkat_kehadiran: []
};

const emptyQRPresenceConfig: QRPresenceConfig = {
  status_presensi: 'Tidak aktif',
  qr_code_identifier: '',
  qr_context: '',
  qr_validity: '',
  rotation_seconds: 30
};

function getCurrentPresenceTime(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

class AttendanceService {
  private records: StaffAttendance[] = [];
  private metrics: AttendanceMetrics = { ...emptyAttendanceMetrics };
  private qrConfig: QRPresenceConfig = { ...emptyQRPresenceConfig };

  private calculateMetrics() {
    const total = this.records.length;
    const hadir = this.records.filter((r) => r.status === 'Hadir').length;
    const tidakHadir = total - hadir;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;

    this.metrics = {
      ...this.metrics,
      total_staf: total,
      staf_hadir: hadir,
      staf_tidak_hadir: tidakHadir,
      tingkat_kehadiran: rate
    };
  }

  async getAllStaff(): Promise<StaffAttendance[]> {
    return [...this.records];
  }

  async getAttendanceList(params: AttendanceFilterParams): Promise<AttendanceListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    let filtered = [...this.records];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.nama_staf.toLowerCase().includes(q) || r.id_staf.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((r) => r.kategori === params.category);
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((r) => r.status === params.status);
    }

    if (params.shift && params.shift !== 'all') {
      filtered = filtered.filter((r) => r.shift === params.shift);
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 8;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = filtered.slice(startIndex, endIndex);

    return {
      records: paginatedRecords,
      total,
      page,
      limit,
      totalPages,
      summary: this.metrics,
      qrConfig: this.qrConfig
    };
  }

  async recordManualAttendance(
    staffIdOrCode: string,
    waktuInput?: string
  ): Promise<StaffAttendance> {
    const q = staffIdOrCode.trim().toUpperCase();
    const index = this.records.findIndex(
      (r) => r.id_staf.toUpperCase() === q || r.id.toUpperCase() === q
    );

    if (index === -1) {
      throw new Error(`Staf dengan ID "${staffIdOrCode}" tidak ditemukan.`);
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = waktuInput || `${hours}:${minutes} WIB`;

    this.records[index] = {
      ...this.records[index],
      status: 'Hadir',
      waktu: timeFormatted
    };

    this.calculateMetrics();
    return this.records[index];
  }

  async updateAttendanceStatus(
    id: string,
    status: AttendanceStatus,
    waktu?: string
  ): Promise<StaffAttendance> {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Record with id ${id} not found`);
    }

    this.records[index] = {
      ...this.records[index],
      status,
      waktu: status === 'Hadir' ? waktu || `${getCurrentPresenceTime()} WIB` : '-'
    };

    this.calculateMetrics();
    return this.records[index];
  }

  async updateStaffAttendance(
    id: string,
    payload: Partial<StaffAttendance>
  ): Promise<StaffAttendance> {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Record with id ${id} not found`);
    }

    this.records[index] = {
      ...this.records[index],
      ...payload
    };

    this.calculateMetrics();
    return this.records[index];
  }

  async deleteStaffAttendance(id: string): Promise<boolean> {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Record with id ${id} not found`);
    }

    this.records.splice(index, 1);
    this.calculateMetrics();
    return true;
  }

  async createStaffAttendance(
    payload: Omit<StaffAttendance, 'id'> & { id?: string }
  ): Promise<StaffAttendance> {
    const newRecord: StaffAttendance = {
      id: payload.id || `att-${Date.now()}`,
      ...payload
    };

    this.records.unshift(newRecord);
    this.calculateMetrics();
    return newRecord;
  }

  async generateNewQRToken(context?: string): Promise<QRPresenceConfig> {
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    this.qrConfig = {
      ...this.qrConfig,
      qr_code_identifier: code,
      qr_context: context || this.qrConfig.qr_context
    };

    return this.qrConfig;
  }

  async updateQRConfig(payload: Partial<QRPresenceConfig>): Promise<QRPresenceConfig> {
    this.qrConfig = {
      ...this.qrConfig,
      ...payload
    };
    return this.qrConfig;
  }
}

export const attendanceService = new AttendanceService();
