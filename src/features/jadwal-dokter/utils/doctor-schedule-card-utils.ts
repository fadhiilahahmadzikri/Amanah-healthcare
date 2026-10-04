import type { DoctorDailySession, DoctorSchedule } from "../api/types";
import {
	SCHEDULE_STATUS,
	SCHEDULE_STATUS_LABELS,
} from "../constants/schedule-shift.constants";
import {
	DOCTOR_CARD_STATUS,
	type DoctorCardStatus,
	getDoctorCardStatus,
	hasConfiguredDoctorSchedule,
	isDoctorSessionActive,
	isSlotAvailable,
	isSlotClosed,
	isSlotUnscheduled,
	parseMinutesFromTime,
	UNCONFIGURED_SCHEDULE_VALUES,
} from "./doctor-schedule-predicates";

export {
	DOCTOR_CARD_STATUS,
	type DoctorCardStatus,
	getDoctorCardStatus,
	hasConfiguredDoctorSchedule,
	isDoctorSessionActive,
	isSlotAvailable,
	isSlotClosed,
	isSlotUnscheduled,
	UNCONFIGURED_SCHEDULE_VALUES,
};

export function parseTimeToMinutes(timeStr: string): number {
	return parseMinutesFromTime(timeStr);
}

export interface UpcomingScheduleResult {
	upcomingTime: string;
	sessionName?: string;
	activeTime?: string;
	hasActive?: boolean;
	isActiveClosed?: boolean;
	isTomorrow?: boolean;
}

export function formatUpcomingFallback(text?: string): string | undefined {
	if (
		!text ||
		text.trim() === "" ||
		text === DOCTOR_CARD_STATUS.BELUM_DIATUR ||
		text === "Belum diatur" ||
		text === "Tidak Ada Jadwal"
	) {
		return undefined;
	}
	const isSelesai = text.toLowerCase().includes("selesai");
	const match = text.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
	if (match) {
		const startH = Number.parseInt(match[1], 10);
		const startM = Number.parseInt(match[2], 10);
		const totalStartMin = startH * 60 + startM;
		const totalEndMin = totalStartMin + 30;
		const sTime = `${String(Math.floor(totalStartMin / 60)).padStart(2, "0")}.${String(totalStartMin % 60).padStart(2, "0")}`;
		const eTime = `${String(Math.floor(totalEndMin / 60)).padStart(2, "0")}.${String(totalEndMin % 60).padStart(2, "0")}`;
		const formatted = `${sTime} – ${eTime}`;
		return isSelesai ? `Besok, ${formatted}` : formatted;
	}
	const clean = text.replace(/:/g, ".");
	return isSelesai && !clean.toLowerCase().includes("besok")
		? `Besok, ${clean}`
		: clean;
}

export function parseDateToIso(dateStr?: string): string | undefined {
	if (!dateStr) return undefined;
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
	const MONTHS: Record<string, string> = {
		jan: "01",
		feb: "02",
		mar: "03",
		apr: "04",
		mei: "05",
		may: "05",
		jun: "06",
		jul: "07",
		agu: "08",
		aug: "08",
		sep: "09",
		okt: "10",
		oct: "10",
		nov: "11",
		des: "12",
		dec: "12",
	};
	const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
	if (match) {
		const day = match[1].padStart(2, "0");
		const monthKey = match[2].toLowerCase().slice(0, 3);
		const month = MONTHS[monthKey] || "01";
		const year = match[3];
		return `${year}-${month}-${day}`;
	}
	return undefined;
}

export function getUpcomingScheduleTime(
	scheduleTime: string,
	sessions?: DoctorDailySession[],
	doctor?: DoctorSchedule,
	referenceDate?: Date,
): UpcomingScheduleResult {
	const now = referenceDate ?? new Date();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	const allSlots: Array<{
		startTime: string;
		endTime: string;
		isAvailable: boolean;
		isOpen: boolean;
		sessionName?: string;
	}> = [];

	if (doctor?.shifts && doctor.shifts.length > 0) {
		for (const shift of doctor.shifts) {
			for (const slot of shift.slots) {
				if (isSlotUnscheduled(slot)) continue;

				const closed = isSlotClosed(slot);
				allSlots.push({
					startTime: slot.startTime,
					endTime: slot.endTime,
					isAvailable: !closed && isSlotAvailable(slot),
					isOpen: !closed,
					sessionName: shift.contextLabel,
				});
			}
		}
	} else if (
		doctor?.timeline_intervals &&
		doctor.timeline_intervals.length > 0
	) {
		for (const it of doctor.timeline_intervals) {
			if (isSlotUnscheduled(it)) continue;

			const closed = isSlotClosed(it);
			allSlots.push({
				startTime: it.startTime,
				endTime: it.endTime,
				isAvailable: !closed && isSlotAvailable(it),
				isOpen: !closed,
			});
		}
	} else if (sessions && sessions.length > 0) {
		const sorted = sessions.toSorted(
			(a, b) =>
				parseTimeToMinutes(a.jam_mulai) - parseTimeToMinutes(b.jam_mulai),
		);
		for (const s of sorted) {
			const sessionStatus = (s.status_sesi || "").toUpperCase();
			const isSessionOpen =
				sessionStatus === SCHEDULE_STATUS.OPEN ||
				sessionStatus ===
					SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.OPEN].toUpperCase();
			const hasSlot = (s.slot_tersedia ?? 1) > 0;
			const sMin = parseTimeToMinutes(s.jam_mulai);
			const eMin = parseTimeToMinutes(s.jam_selesai);
			for (let m = sMin; m < eMin; m += 30) {
				const slotStart = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
				const slotEndMin = m + 30;
				const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;
				allSlots.push({
					startTime: slotStart,
					endTime: slotEnd,
					isAvailable: isSessionOpen && hasSlot,
					isOpen: isSessionOpen,
					sessionName: s.nama_sesi,
				});
			}
		}
	}

	let activeTime: string | undefined;
	let hasActive = false;
	let isActiveClosed = false;

	const currentMatchingSlot = allSlots.find(
		(slot) =>
			parseTimeToMinutes(slot.startTime) <= currentMinutes &&
			parseTimeToMinutes(slot.endTime) > currentMinutes,
	);

	if (currentMatchingSlot) {
		hasActive = true;
		activeTime = `${currentMatchingSlot.startTime.replace(":", ".")} – ${currentMatchingSlot.endTime.replace(":", ".")}`;
		isActiveClosed = !currentMatchingSlot.isOpen;
	} else if (sessions && sessions.length > 0 && allSlots.length === 0) {
		const activeSession = sessions.find((s) =>
			isDoctorSessionActive(s, currentMinutes),
		);
		if (activeSession) {
			hasActive = true;
			isActiveClosed = isSlotClosed({ status: activeSession.status_sesi });
			const sStart = parseTimeToMinutes(activeSession.jam_mulai);
			const offset = Math.floor((currentMinutes - sStart) / 30) * 30;
			const winStart = sStart + offset;
			const winEnd = winStart + 30;
			const sTime = `${String(Math.floor(winStart / 60)).padStart(2, "0")}.${String(winStart % 60).padStart(2, "0")}`;
			const eTime = `${String(Math.floor(winEnd / 60)).padStart(2, "0")}.${String(winEnd % 60).padStart(2, "0")}`;
			activeTime = `${sTime} – ${eTime}`;
		}
	}

	const futureAvailableSlot = allSlots.find(
		(slot) =>
			slot.isAvailable &&
			slot.isOpen === true &&
			parseTimeToMinutes(slot.startTime) > currentMinutes,
	);

	if (futureAvailableSlot) {
		const sTime = futureAvailableSlot.startTime.replace(":", ".");
		const eTime = futureAvailableSlot.endTime.replace(":", ".");
		const formattedUpcoming = `${sTime} – ${eTime}`;
		return {
			upcomingTime: formattedUpcoming,
			sessionName: futureAvailableSlot.sessionName,
			activeTime,
			hasActive,
			isActiveClosed,
			isTomorrow: false,
		};
	}

	const firstAvailableSlot = allSlots.find(
		(slot) => slot.isAvailable && slot.isOpen === true,
	);
	if (firstAvailableSlot) {
		const sTime = firstAvailableSlot.startTime.replace(":", ".");
		const eTime = firstAvailableSlot.endTime.replace(":", ".");
		const isPastSlot =
			parseTimeToMinutes(firstAvailableSlot.startTime) <= currentMinutes;
		const rawUpcoming = `${sTime} – ${eTime}`;
		const formattedUpcoming = isPastSlot
			? `Besok, ${rawUpcoming}`
			: rawUpcoming;
		return {
			upcomingTime: formattedUpcoming,
			sessionName: firstAvailableSlot.sessionName,
			activeTime,
			hasActive,
			isActiveClosed,
			isTomorrow: isPastSlot,
		};
	}

	if (sessions && sessions.length > 0) {
		const upcomingSession = sessions.find(
			(s) =>
				parseTimeToMinutes(s.jam_mulai) > currentMinutes &&
				!isSlotClosed({ status: s.status_sesi }),
		);

		if (upcomingSession) {
			const sMin = parseTimeToMinutes(upcomingSession.jam_mulai);
			const eMin = sMin + 30;
			const sTime = upcomingSession.jam_mulai.replace(":", ".");
			const eTime = `${String(Math.floor(eMin / 60)).padStart(2, "0")}.${String(eMin % 60).padStart(2, "0")}`;
			const formattedUpcoming = `${sTime} – ${eTime}`;
			return {
				upcomingTime: formattedUpcoming,
				sessionName: upcomingSession.nama_sesi,
				activeTime,
				hasActive,
				isActiveClosed,
				isTomorrow: false,
			};
		}

		const firstSession =
			sessions.find((s) => !isSlotClosed({ status: s.status_sesi })) ||
			sessions[0];

		if (firstSession) {
			const sMin = parseTimeToMinutes(firstSession.jam_mulai);
			const eMin = sMin + 30;
			const sTime = firstSession.jam_mulai.replace(":", ".");
			const eTime = `${String(Math.floor(eMin / 60)).padStart(2, "0")}.${String(eMin % 60).padStart(2, "0")}`;
			const isPastSession =
				parseTimeToMinutes(firstSession.jam_selesai) <= currentMinutes ||
				parseTimeToMinutes(firstSession.jam_mulai) <= currentMinutes;
			const rawUpcoming = `${sTime} – ${eTime}`;
			const formattedUpcoming = isPastSession
				? `Besok, ${rawUpcoming}`
				: rawUpcoming;
			return {
				upcomingTime: formattedUpcoming,
				sessionName: firstSession.nama_sesi,
				activeTime,
				hasActive,
				isActiveClosed,
				isTomorrow: isPastSession,
			};
		}
	}

	if (scheduleTime && scheduleTime.trim() !== "") {
		const formattedUpcoming = formatUpcomingFallback(scheduleTime);
		const cleanTime = formattedUpcoming || scheduleTime.replace(/:/g, ".");
		return {
			upcomingTime: cleanTime,
			activeTime,
			hasActive,
			isActiveClosed,
			isTomorrow: false,
		};
	}

	return {
		upcomingTime: DOCTOR_CARD_STATUS.BELUM_DIATUR,
		activeTime,
		hasActive,
		isActiveClosed,
		isTomorrow: false,
	};
}
