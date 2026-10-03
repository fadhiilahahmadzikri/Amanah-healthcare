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
): DoctorCardStatus {
	const statusDokter = (doctor.status_dokter || "").trim().toUpperCase();
	const statusJadwal = (doctor.status_jadwal || "").trim().toUpperCase();
	const cutiStatus = SCHEDULE_STATUS.CUTI;
	const closedStatus = SCHEDULE_STATUS.CLOSED;
	const closedLabel =
		SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.CLOSED].toUpperCase();
	const occupiedStatus = SCHEDULE_STATUS.OCCUPIED;
	const occupiedLabel =
		SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.OCCUPIED].toUpperCase();

	if (
		doctor.is_cuti ||
		statusDokter === cutiStatus ||
		statusJadwal === cutiStatus
	) {
		return DOCTOR_CARD_STATUS.CUTI;
	}

	if (!hasConfiguredDoctorSchedule(doctor)) {
		return DOCTOR_CARD_STATUS.BELUM_DIATUR;
	}

	if (
		statusDokter === closedStatus ||
		statusDokter === closedLabel ||
		statusJadwal === closedStatus ||
		statusJadwal === closedLabel
	) {
		return DOCTOR_CARD_STATUS.TUTUP;
	}

	const now = referenceDate ?? new Date();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	const sessions = doctor.sesi_harian;
	if (sessions && sessions.length > 0) {
		const activeSession = sessions.find((s) =>
			isDoctorSessionActive(s, currentMinutes),
		);

		if (!activeSession) {
			return DOCTOR_CARD_STATUS.TUTUP;
		}

		if (isSlotClosed({ status: activeSession.status_sesi })) {
			return DOCTOR_CARD_STATUS.TUTUP;
		}

		const sessStatus = (activeSession.status_sesi || "").trim().toUpperCase();
		const isNoSlots =
			activeSession.slot_tersedia !== undefined &&
			activeSession.slot_tersedia <= 0;

		if (
			sessStatus === occupiedStatus ||
			sessStatus === occupiedLabel ||
			sessStatus === DOCTOR_CARD_STATUS.TERISI.toUpperCase() ||
			isNoSlots
		) {
			return DOCTOR_CARD_STATUS.TERISI;
		}

		return DOCTOR_CARD_STATUS.BUKA;
	}

	if (doctor.shifts && doctor.shifts.length > 0) {
		let hasActiveShift = false;
		let isOccupied = false;

		for (const shift of doctor.shifts) {
			for (const slot of shift.slots) {
				if (isSlotUnscheduled(slot)) continue;
				const sMin = parseMinutesFromTime(slot.startTime);
				const eMin = parseMinutesFromTime(slot.endTime);
				if (currentMinutes >= sMin && currentMinutes < eMin) {
					hasActiveShift = true;
					if (isSlotClosed(slot)) {
						return DOCTOR_CARD_STATUS.TUTUP;
					}
					if (!isSlotAvailable(slot)) {
						isOccupied = true;
					}
				}
			}
		}

		if (!hasActiveShift) {
			return DOCTOR_CARD_STATUS.TUTUP;
		}

		return isOccupied ? DOCTOR_CARD_STATUS.TERISI : DOCTOR_CARD_STATUS.BUKA;
	}

	if (
		statusDokter === occupiedStatus ||
		statusDokter === occupiedLabel ||
		statusDokter === DOCTOR_CARD_STATUS.TERISI.toUpperCase() ||
		statusJadwal === occupiedStatus ||
		statusJadwal === occupiedLabel ||
		statusJadwal === DOCTOR_CARD_STATUS.TERISI.toUpperCase() ||
		doctor.slot_tersedia <= 0
	) {
		return DOCTOR_CARD_STATUS.TERISI;
	}

	return DOCTOR_CARD_STATUS.BUKA;
}
