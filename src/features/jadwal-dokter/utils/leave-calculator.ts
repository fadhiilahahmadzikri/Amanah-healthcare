import type { DoctorSchedule } from "../api/types";
import { SCHEDULE_STATUS } from "../constants/schedule-shift.constants";

export function isDoctorOnLeaveOnDay(
	doctor?: DoctorSchedule,
	dayNumber?: number,
): { isLeave: boolean; reason?: string } {
	if (!doctor || dayNumber === undefined) return { isLeave: false };

	const monthlyItem = doctor.monthly_schedule?.find(
		(day) => day.day === dayNumber,
	);

	const monthlyStatus = (monthlyItem?.status || "").toUpperCase();

	if (monthlyStatus === SCHEDULE_STATUS.CUTI) {
		return {
			isLeave: true,
			reason:
				(monthlyItem?.notes as string) ||
				(doctor.cuti_reason as string) ||
				"Cuti Dokter",
		};
	}

	if (monthlyItem && monthlyStatus === SCHEDULE_STATUS.OPEN) {
		if (doctor.cuti_start && doctor.cuti_end) {
			const startDay = extractDayNumber(doctor.cuti_start);
			const endDay = extractDayNumber(doctor.cuti_end);
			if (startDay !== null && endDay !== null) {
				return {
					isLeave: dayNumber >= startDay && dayNumber <= endDay,
					reason: (doctor.cuti_reason as string) || "Cuti Dokter",
				};
			}
		}
		return { isLeave: false };
	}

	const docStatus = (doctor.status_dokter || "").toUpperCase();
	const schedStatus = (doctor.status_jadwal || "").toUpperCase();

	const isDoctorOnLeave = Boolean(
		doctor.is_cuti ||
			docStatus === SCHEDULE_STATUS.CUTI ||
			schedStatus === SCHEDULE_STATUS.CUTI,
	);

	if (!isDoctorOnLeave) return { isLeave: false };

	if (doctor.cuti_start && doctor.cuti_end) {
		const startDay = extractDayNumber(doctor.cuti_start);
		const endDay = extractDayNumber(doctor.cuti_end);

		if (startDay !== null && endDay !== null) {
			return {
				isLeave: dayNumber >= startDay && dayNumber <= endDay,
				reason: (doctor.cuti_reason as string) || undefined,
			};
		}
	}

	return { isLeave: true, reason: (doctor.cuti_reason as string) || undefined };
}

export function extractDayNumber(dateStr: string): number | null {
	if (dateStr.includes("-")) {
		const parts = dateStr.split("-");
		const day = Number.parseInt(parts[2] ?? "", 10);
		return Number.isNaN(day) ? null : day;
	}
	const day = Number.parseInt(dateStr.split(" ")[0] ?? "", 10);
	return Number.isNaN(day) ? null : day;
}

export type SimpleScheduleStatus = "buka" | "selesai" | "cuti" | "tutup";

export function resolveDayStatus(
	dayNumber: number,
	doctor?: DoctorSchedule,
): SimpleScheduleStatus {
	if (!doctor) return "tutup";

	const leaveCheck = isDoctorOnLeaveOnDay(doctor, dayNumber);
	if (leaveCheck.isLeave) {
		return "cuti";
	}

	const monthlyItem = doctor.monthly_schedule?.find((d) => d.day === dayNumber);
	if (monthlyItem) {
		const raw = (monthlyItem.dayStatus || monthlyItem.status || "").trim().toUpperCase();
		if (raw === SCHEDULE_STATUS.CUTI) {
			return "cuti";
		}
		if (raw === SCHEDULE_STATUS.CLOSED) {
			return "tutup";
		}
		if (raw === SCHEDULE_STATUS.OPEN || raw === SCHEDULE_STATUS.OCCUPIED) {
			return "buka";
		}
		return "tutup";
	}

	if (!doctor.monthly_schedule || doctor.monthly_schedule.length === 0) {
		if (
			doctor.sesi_harian?.some((s) => {
				const sStatus = (s.status_sesi || "").toUpperCase();
				return (
					sStatus === SCHEDULE_STATUS.OPEN ||
					sStatus === SCHEDULE_STATUS.OCCUPIED
				);
			})
		) {
			return "buka";
		}

		const rawDocStatus = (doctor.status_dokter || "").trim().toUpperCase();
		if (
			rawDocStatus === SCHEDULE_STATUS.OPEN ||
			rawDocStatus === SCHEDULE_STATUS.OCCUPIED
		) {
			return "buka";
		}
	}

	return "tutup";
}
