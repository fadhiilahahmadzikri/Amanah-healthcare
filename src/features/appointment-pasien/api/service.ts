import type {
  AdminAppointment,
  AppointmentFilters,
  AppointmentResponse,
  AppointmentSummary,
  AppointmentDetailResponse,
  LiveStatus
} from './types';

const appointmentRecords: AdminAppointment[] = [];

const emptyAppointmentSummary: AppointmentSummary = {
  total: 0,
  sudah_datang: 0,
  sudah_buat_janji: 0,
  menunggu: 0,
  sedang_periksa: 0,
  selesai: 0,
  tidak_ada_dokter: 0
};

export async function getAdminAppointments(
  filters: AppointmentFilters
): Promise<AppointmentResponse> {
  const limit = filters.limit ?? 10;
  const page = filters.page ?? 1;
  const filteredAppointments = sortAppointments(
    filterAppointments(appointmentRecords, filters),
    filters.sort
  );
  const offset = (page - 1) * limit;
  const appointments = filteredAppointments.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    total_appointments: filteredAppointments.length,
    offset,
    limit,
    appointments,
    summary: getAppointmentSummaryFromRecords()
  };
}

export async function getAdminAppointmentSummary(): Promise<AppointmentSummary> {
  return getAppointmentSummaryFromRecords();
}

export async function getAdminAppointmentById(id: number): Promise<AppointmentDetailResponse> {
  const appointment = appointmentRecords.find((record) => record.id === id) ?? null;

  return {
    success: Boolean(appointment),
    appointment,
    ...(appointment ? {} : { message: `Appointment dengan ID ${id} tidak ditemukan` })
  };
}

export async function updateAdminLiveStatus(id: number, status: LiveStatus) {
  const index = appointmentRecords.findIndex((record) => record.id === id);

  if (index === -1) {
    return {
      success: false,
      message: `Appointment dengan ID ${id} tidak ditemukan`
    };
  }

  const updatedAppointment = {
    ...appointmentRecords[index],
    live_status: status,
    status_kunjungan: status,
    updated_at: new Date().toISOString()
  };

  appointmentRecords[index] = updatedAppointment;

  return {
    success: true,
    message: 'Status live antrean berhasil diperbarui',
    appointment: updatedAppointment
  };
}

export async function deleteAdminAppointment(id: number) {
  const index = appointmentRecords.findIndex((record) => record.id === id);

  if (index === -1) {
    return {
      success: false,
      message: `Appointment dengan ID ${id} tidak ditemukan`
    };
  }

  appointmentRecords.splice(index, 1);

  return {
    success: true,
    message: 'Appointment berhasil dihapus'
  };
}

function getAppointmentSummaryFromRecords(): AppointmentSummary {
  if (appointmentRecords.length === 0) {
    return emptyAppointmentSummary;
  }

  return {
    total: appointmentRecords.length,
    sudah_datang: countByStatus('SUDAH DATANG'),
    sudah_buat_janji: countByStatus('SUDAH BUAT JANJI'),
    menunggu: countByStatus('MENUNGGU'),
    sedang_periksa: countByStatus('SEDANG PERIKSA'),
    selesai: countByStatus('SELESAI'),
    tidak_ada_dokter: countByStatus('TIDAK ADA DOKTER')
  };
}

function filterAppointments(
  records: AdminAppointment[],
  filters: AppointmentFilters
): AdminAppointment[] {
  return records.filter((record) => {
    if (filters.status && !includesFilter(filters.status, record.live_status)) return false;
    if (filters.poli && !includesFilter(filters.poli, record.layanan_poli)) return false;
    if (filters.search && !matchesAppointmentSearch(record, filters.search)) return false;

    return true;
  });
}

function sortAppointments(records: AdminAppointment[], sort?: string): AdminAppointment[] {
  if (!sort) return [...records];

  try {
    const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
    const firstSort = sortItems[0];

    if (!firstSort) return [...records];

    return [...records].sort((left, right) => {
      const leftValue = getAppointmentSortValue(left, firstSort.id);
      const rightValue = getAppointmentSortValue(right, firstSort.id);

      return firstSort.desc
        ? rightValue.localeCompare(leftValue)
        : leftValue.localeCompare(rightValue);
    });
  } catch {
    return [...records];
  }
}

function getAppointmentSortValue(appointment: AdminAppointment, id: string): string {
  if (id === 'pasien' || id === 'nama_pasien') return appointment.pasien;
  if (id === 'no_antrian') return appointment.no_antrian;

  return String((appointment as unknown as Record<string, unknown>)[id] ?? '');
}

function matchesAppointmentSearch(appointment: AdminAppointment, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  const searchableFields = [
    appointment.pasien,
    appointment.nama_pasien,
    appointment.id_pasien,
    appointment.no_antrian,
    appointment.dokter,
    appointment.layanan_poli,
    appointment.email_pasien,
    appointment.nomor_telepon_wa,
    appointment.keluhan_pasien,
    appointment.live_status
  ];

  return searchableFields.join(' ').toLowerCase().includes(query);
}

function includesFilter(filter: string | string[], value: string): boolean {
  const filters = Array.isArray(filter) ? filter : [filter];
  return filters.some((item) => item.toLowerCase() === value.toLowerCase());
}

function countByStatus(status: string): number {
  return appointmentRecords.filter((record) => record.live_status.toUpperCase() === status).length;
}
