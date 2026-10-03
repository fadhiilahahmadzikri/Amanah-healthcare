import type { DoctorDailySession, DoctorSchedule } from "../api/types";
import {
	AVAILABILITY_STATE,
	EFFECTIVE_SLOT_STATUS,
	SCHEDULE_STATUS,
	SCHEDULE_STATUS_LABELS,
	SLOT_ACTION_TYPE,
	SLOT_UI_STATUS,
} from "../constants/schedule-shift.constants";

export const DOCTOR_CARD_STATUS = {
	BUKA: "Buka",
	CUTI: "Cuti",
	TERISI: "Terisi",
	BELUM_DIATUR: "Belum Diatur",
	TUTUP: "Tutup",
	SELESAI: "Selesai",
} as const;

export type DoctorCardStatus =
	(typeof DOCTOR_CARD_STATUS)[keyof typeof DOCTOR_CARD_STATUS];

export const UNCONFIGURED_SCHEDULE_VALUES = new Set([
	"",
	"-",
	"belum diatur",
	"belum dijadwalkan",
]);

export function parseMinutesFromTime(timeStr: string): number {
	const clean = timeStr.replace(".", ":");
	const [h, m] = clean.split(":").map((v) => Number.parseInt(v, 10) || 0);
	return h * 60 + m;
}

export function hasConfiguredDoctorSchedule(doctor: DoctorSchedule): boolean {
	if (doctor.sesi_harian && doctor.sesi_harian.length > 0) {
		return true;
	}

	const scheduleTime = doctor.jadwal_hari_ini?.trim().toLowerCase() ?? "";
	return !UNCONFIGURED_SCHEDULE_VALUES.has(scheduleTime);
}

export function isSlotUnscheduled(slot: {
	availabilityState?: string | null;
	effectiveStatus?: string | null;
	uiStatus?: string | null;
	status?: string | null;
	sessionId?: string | null;
	appointmentRef?: unknown;
	actionType?: string | null;
}): boolean {
	if (slot.sessionId === null) return true;
	if (
		slot.appointmentRef === null &&
		slot.actionType === SLOT_ACTION_TYPE.ADD_SESSION
	) {
		return true;
	}

	const avail = (slot.availabilityState || "").toUpperCase();
	const eff = (slot.effectiveStatus || "").toUpperCase();
	const ui = (slot.uiStatus || "").toUpperCase();
	const status = (slot.status || "").toUpperCase();

	return (
		avail === AVAILABILITY_STATE.UNSCHEDULED ||
		eff === EFFECTIVE_SLOT_STATUS.UNSCHEDULED ||
		ui === SLOT_UI_STATUS.UNSCHEDULED ||
		ui === SLOT_UI_STATUS.UNSCHEDULED_PAST ||
		status === AVAILABILITY_STATE.UNSCHEDULED
	);
}

export function isSlotClosed(slot: {
	status?: string | null;
	availabilityState?: string | null;
	effectiveStatus?: string | null;
	uiStatus?: string | null;
	closure?: unknown;
	closureInfo?: unknown;
	closedReason?: string | null;
}): boolean {
	const status = (slot.status || "").toUpperCase();
	const avail = (slot.availabilityState || "").toUpperCase();
	const eff = (slot.effectiveStatus || "").toUpperCase();
	const ui = (slot.uiStatus || "").toUpperCase();
	const closedLabel =
		SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.CLOSED].toUpperCase();

	return (
		status === SCHEDULE_STATUS.CLOSED ||
		status === SLOT_UI_STATUS.CLOSED_LEAVE ||
		status === closedLabel ||
		avail === AVAILABILITY_STATE.CLOSED ||
		eff === EFFECTIVE_SLOT_STATUS.CLOSED ||
		ui.startsWith(SCHEDULE_STATUS.CLOSED) ||
		Boolean(slot.closure) ||
		Boolean(slot.closureInfo) ||
		Boolean(slot.closedReason)
	);
}

export function isSlotAvailable(slot: {
	isAvailable?: boolean;
	status?: string | null;
	availabilityState?: string | null;
	effectiveStatus?: string | null;
	isOccupied?: boolean;
}): boolean {
	if (slot.isOccupied) return false;
	if (typeof slot.isAvailable === "boolean") return slot.isAvailable;
	const status = (slot.status || "").toUpperCase();
	const avail = (slot.availabilityState || "").toUpperCase();
	const eff = (slot.effectiveStatus || "").toUpperCase();
	const openLabel = SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.OPEN].toUpperCase();

	return (
		status === AVAILABILITY_STATE.AVAILABLE ||
		status === SCHEDULE_STATUS.OPEN ||
		status === openLabel ||
		avail === AVAILABILITY_STATE.AVAILABLE ||
		eff === EFFECTIVE_SLOT_STATUS.AVAILABLE
	);
}

export function isDoctorSessionActive(
	session: DoctorDailySession,
	currentMinutes: number,
): boolean {
	const sMin = parseMinutesFromTime(session.jam_mulai);
	const eMin = parseMinutesFromTime(session.jam_selesai);
	if (eMin > sMin) {
		return currentMinutes >= sMin && currentMinutes < eMin;
	}
	return currentMinutes >= sMin || currentMinutes < eMin;
}

export function getDoctorCardStatus(
	doctor: DoctorSchedule,
	referenceDate?: Date,
	targetDate?: string,
): DoctorCardStatus {
	if (doctor.is_cuti) {
		return DOCTOR_CARD_STATUS.CUTI;
	}

	const statusDokter = (doctor.status_dokter || "").trim().toUpperCase();
	const statusJadwal = (doctor.status_jadwal || "").trim().toUpperCase();

	if (
		statusDokter === SCHEDULE_STATUS.CUTI ||
		statusDokter === "CUTI" ||
		statusJadwal === SCHEDULE_STATUS.CUTI ||
		statusJadwal === "CUTI"
	) {
		return DOCTOR_CARD_STATUS.CUTI;
	}

	if (!hasConfiguredDoctorSchedule(doctor)) {
		return DOCTOR_CARD_STATUS.BELUM_DIATUR;
	}

	if (
		statusDokter === SCHEDULE_STATUS.CLOSED ||
		statusDokter === "CLOSED" ||
		statusDokter === "TUTUP" ||
		statusJadwal === SCHEDULE_STATUS.CLOSED ||
		statusJadwal === "CLOSED" ||
		statusJadwal === "TUTUP"
	) {
		return DOCTOR_CARD_STATUS.TUTUP;
	}

	const now = referenceDate ?? new Date();
	const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

	if (targetDate && targetDate < todayIso) {
		return DOCTOR_CARD_STATUS.SELESAI;
	}

	if (
		statusDokter === SCHEDULE_STATUS.OCCUPIED ||
		statusDokter === "OCCUPIED" ||
		statusDokter === "TERISI" ||
		statusDokter === "PENUH" ||
		statusJadwal === SCHEDULE_STATUS.OCCUPIED ||
		statusJadwal === "OCCUPIED" ||
		statusJadwal === "TERISI" ||
		statusJadwal === "PENUH" ||
		(doctor.slot_tersedia !== undefined && doctor.slot_tersedia <= 0)
	) {
		return DOCTOR_CARD_STATUS.TERISI;
	}

	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	const sessions = doctor.sesi_harian;
	if (sessions && sessions.length > 0) {
		const allClosed = sessions.every((s) =>
			isSlotClosed({ status: s.status_sesi }),
		);
		if (allClosed) {
			return DOCTOR_CARD_STATUS.TUTUP;
		}

		const allPast = sessions.every(
			(s) => parseMinutesFromTime(s.jam_selesai) <= currentMinutes,
		);
		if (allPast && referenceDate !== undefined) {
			return DOCTOR_CARD_STATUS.TUTUP;
		}
	}

	return DOCTOR_CARD_STATUS.BUKA;
}
