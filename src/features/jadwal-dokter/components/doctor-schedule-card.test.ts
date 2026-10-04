import { describe, expect, it } from "vitest";
import type { DoctorSchedule } from "../api/types";
import {
	DOCTOR_CARD_STATUS,
	formatUpcomingFallback,
	getDoctorCardStatus,
	getUpcomingScheduleTime,
	hasConfiguredDoctorSchedule,
	isSlotClosed,
	parseDateToIso,
} from "../utils/doctor-schedule-card-utils";

describe("DoctorScheduleCard Logic & Status Contracts", () => {
	const baseDoctor: DoctorSchedule = {
		id: "doc-1",
		nama_dokter: "dr. Ahmad Pratama",
		spesialisasi: "Poli Umum",
		status_dokter: "OPEN",
		status_jadwal: "OPEN",
		ruang_praktik: "Ruang Poli 1",
		tanggal_praktik: "2026-09-24",
		slot_tersedia: 12,
		kapasitas_per_hari: 12,
		jadwal_hari_ini: "08:00 - 12:00",
		is_cuti: false,
		sesi_harian: [
			{
				id: "sess-1",
				nama_sesi: "Sesi Pagi",
				jam_mulai: "08:00",
				jam_selesai: "12:00",
				kuota_pasien: 12,
				slot_tersedia: 12,
				status_sesi: "OPEN",
			},
		],
	};

	it("correctly identifies OPEN doctor as Buka during active session", () => {
		const refDate = new Date("2026-09-24T09:30:00");
		expect(getDoctorCardStatus(baseDoctor, refDate)).toBe(
			DOCTOR_CARD_STATUS.BUKA,
		);
	});

	it("correctly identifies doctor as Tutup when outside session hours before practice", () => {
		const refDate = new Date("2026-09-24T06:00:00");
		expect(getDoctorCardStatus(baseDoctor, refDate)).toBe(
			DOCTOR_CARD_STATUS.TUTUP,
		);
	});

	it("correctly identifies doctor as Selesai when all sessions today have elapsed", () => {
		const refDate = new Date("2026-09-24T23:14:00");
		expect(getDoctorCardStatus(baseDoctor, refDate)).toBe(
			DOCTOR_CARD_STATUS.SELESAI,
		);
	});

	it("correctly identifies CLOSED doctor (canonical backend enum) as Tutup even with configured sessions", () => {
		const closedDoctor: DoctorSchedule = {
			...baseDoctor,
			status_dokter: "CLOSED",
			status_jadwal: "CLOSED",
			slot_tersedia: 0,
			kapasitas_per_hari: 0,
		};
		expect(getDoctorCardStatus(closedDoctor)).toBe(DOCTOR_CARD_STATUS.TUTUP);
	});

	it("correctly identifies OCCUPIED doctor as Terisi during active session", () => {
		const refDate = new Date("2026-09-24T09:30:00");
		const occupiedDoctor: DoctorSchedule = {
			...baseDoctor,
			status_dokter: "OCCUPIED",
			status_jadwal: "OCCUPIED",
			sesi_harian: [
				{
					...baseDoctor.sesi_harian?.[0],
					id: "sess-1",
					nama_sesi: "Sesi Pagi",
					jam_mulai: "08:00",
					jam_selesai: "12:00",
					kuota_pasien: 12,
					status_sesi: "OCCUPIED",
					slot_tersedia: 0,
				},
			],
		};
		expect(getDoctorCardStatus(occupiedDoctor, refDate)).toBe(
			DOCTOR_CARD_STATUS.TERISI,
		);
	});

	it("correctly identifies doctor on leave as Cuti", () => {
		const cutiDoctor: DoctorSchedule = {
			...baseDoctor,
			is_cuti: true,
			cuti_reason: "Cuti Tahunan",
		};
		expect(getDoctorCardStatus(cutiDoctor)).toBe(DOCTOR_CARD_STATUS.CUTI);
	});

	it("correctly identifies unconfigured doctor as Belum Diatur", () => {
		const unconfiguredDoctor: DoctorSchedule = {
			...baseDoctor,
			sesi_harian: [],
			jadwal_hari_ini: "",
		};
		expect(hasConfiguredDoctorSchedule(unconfiguredDoctor)).toBe(false);
		expect(getDoctorCardStatus(unconfiguredDoctor)).toBe(
			DOCTOR_CARD_STATUS.BELUM_DIATUR,
		);
	});

	it("retrieves upcoming schedule time from active sessions", () => {
		const sessions = [
			{
				id: "s-1",
				nama_sesi: "Sesi Siang",
				jam_mulai: "13:00",
				jam_selesai: "17:00",
				kuota_pasien: 10,
				slot_tersedia: 10,
				status_sesi: "OPEN",
			},
		];
		const fixedMorning = new Date("2026-09-25T08:00:00");
		const upcoming = getUpcomingScheduleTime(
			"13:00 - 17:00",
			sessions,
			undefined,
			fixedMorning,
		);
		expect(upcoming.upcomingTime).toBe("13.00 – 13.30");
		expect(upcoming.sessionName).toBe("Sesi Siang");
	});

	it("correctly detects active session and upcoming session when time matches", () => {
		const now = new Date();
		const curH = String(now.getHours()).padStart(2, "0");
		const nextH = String((now.getHours() + 1) % 24).padStart(2, "0");
		const afterNextH = String((now.getHours() + 2) % 24).padStart(2, "0");

		const sessions = [
			{
				id: "s-now",
				nama_sesi: "Sesi Sekarang",
				jam_mulai: `${curH}:00`,
				jam_selesai: `${nextH}:00`,
				kuota_pasien: 10,
				slot_tersedia: 5,
				status_sesi: "OPEN",
			},
			{
				id: "s-next",
				nama_sesi: "Sesi Mendatang",
				jam_mulai: `${nextH}:00`,
				jam_selesai: `${afterNextH}:00`,
				kuota_pasien: 10,
				slot_tersedia: 10,
				status_sesi: "OPEN",
			},
		];

		const result = getUpcomingScheduleTime(
			`${curH}:00 - ${afterNextH}:00`,
			sessions,
		);
		expect(result.hasActive).toBe(true);
		expect(result.activeTime).toBeDefined();
		expect(result.upcomingTime).toBeDefined();
	});

	it("detects closed slots with backend contract fields", () => {
		expect(isSlotClosed({ status: "CLOSED" })).toBe(true);
		expect(isSlotClosed({ availabilityState: "CLOSED" })).toBe(true);
		expect(isSlotClosed({ effectiveStatus: "CLOSED" })).toBe(true);
		expect(isSlotClosed({ uiStatus: "CLOSED_CLINIC" })).toBe(true);
		expect(isSlotClosed({ closureInfo: { category: "OTHER" } })).toBe(true);
		expect(isSlotClosed({ closedReason: "SCHEDULE_CLOSED" })).toBe(true);
		expect(
			isSlotClosed({ status: "OPEN", availabilityState: "AVAILABLE" }),
		).toBe(false);
	});

	it("correctly marks current closed slot as isActiveClosed and skips it for upcoming slot", () => {
		const doctorWithClosedCurrentSlot: DoctorSchedule = {
			...baseDoctor,
			timeline_intervals: [
				{
					startTime: "10:30",
					endTime: "11:00",
					availabilityState: "AVAILABLE",
					status: "OPEN",
					effectiveStatus: "AVAILABLE",
				},
				{
					startTime: "11:00",
					endTime: "11:30",
					availabilityState: "CLOSED",
					status: "CLOSED",
					effectiveStatus: "CLOSED",
					uiStatus: "CLOSED_CLINIC",
					closureInfo: { reasonText: "Rapat Koordinasi Komite Medik" },
				},
				{
					startTime: "11:30",
					endTime: "12:00",
					availabilityState: "AVAILABLE",
					status: "OPEN",
					effectiveStatus: "AVAILABLE",
				},
			],
		};

		const fixedAtElevenTen = new Date("2026-09-26T11:10:00");
		const result = getUpcomingScheduleTime(
			"10:30 - 12:00",
			undefined,
			doctorWithClosedCurrentSlot,
			fixedAtElevenTen,
		);

		expect(result.hasActive).toBe(true);
		expect(result.isActiveClosed).toBe(true);
		expect(result.activeTime).toBe("11.00 – 11.30");
		expect(result.upcomingTime).toBe("11.30 – 12.00");
	});

	it("skips multiple closed slots sequentially (the riddle) to find nearest available upcoming slot", () => {
		const doctorWithMultipleClosedSlots: DoctorSchedule = {
			...baseDoctor,
			timeline_intervals: [
				{
					startTime: "11:00",
					endTime: "11:30",
					availabilityState: "CLOSED",
					uiStatus: "CLOSED_CLINIC",
				},
				{
					startTime: "11:30",
					endTime: "12:00",
					availabilityState: "CLOSED",
					uiStatus: "CLOSED_CLINIC",
				},
				{
					startTime: "12:00",
					endTime: "12:30",
					availabilityState: "CLOSED",
					uiStatus: "CLOSED_CLINIC",
				},
				{
					startTime: "12:30",
					endTime: "13:00",
					availabilityState: "AVAILABLE",
					status: "AVAILABLE",
				},
			],
		};

		const fixedAtElevenTen = new Date("2026-09-26T11:10:00");
		const result = getUpcomingScheduleTime(
			"11:00 - 13:00",
			undefined,
			doctorWithMultipleClosedSlots,
			fixedAtElevenTen,
		);

		expect(result.hasActive).toBe(true);
		expect(result.isActiveClosed).toBe(true);
		expect(result.activeTime).toBe("11.00 – 11.30");
		expect(result.upcomingTime).toBe("12.30 – 13.00");
	});

	it("formats upcoming fallback text from macro ranges to 30-min intervals", () => {
		expect(formatUpcomingFallback("Pagi (06:00 - 12:00)")).toBe(
			"06.00 – 06.30",
		);
		expect(
			formatUpcomingFallback("Siang (12:00 - 18:00) - Sedang Berlangsung"),
		).toBe("12.00 – 12.30");
		expect(formatUpcomingFallback("Shift Pagi (06:00 - 12:00) - Selesai")).toBe(
			"Besok, 06.00 – 06.30",
		);
		expect(formatUpcomingFallback("Belum diatur")).toBeUndefined();
	});

	it("correctly marks upcoming schedule as tomorrow when all sessions today have elapsed at 21:23", () => {
		const morningSessions = [
			{
				id: "sess-pagi",
				nama_sesi: "Shift Pagi",
				jam_mulai: "06:00",
				jam_selesai: "12:00",
				kuota_pasien: 12,
				slot_tersedia: 5,
				status_sesi: "OPEN",
			},
		];

		const lateNight = new Date("2026-10-03T21:23:00");
		const result = getUpcomingScheduleTime(
			"06:00 - 12:00",
			morningSessions,
			undefined,
			lateNight,
		);

		expect(result.hasActive).toBe(false);
		expect(result.isTomorrow).toBe(true);
		expect(result.upcomingTime).toBe("Besok, 06.00 – 06.30");
	});

	it("correctly marks upcoming schedule as tomorrow even when doctor has an active session right now at 21:38", () => {
		const doctorScheduleWithActiveAndMorning: DoctorSchedule = {
			...baseDoctor,
			sesi_harian: [
				{
					id: "sess-pagi",
					nama_sesi: "Shift Pagi",
					jam_mulai: "06:00",
					jam_selesai: "12:00",
					kuota_pasien: 12,
					slot_tersedia: 5,
					status_sesi: "OPEN",
				},
				{
					id: "sess-malam",
					nama_sesi: "Shift Malam",
					jam_mulai: "21:30",
					jam_selesai: "22:00",
					kuota_pasien: 12,
					slot_tersedia: 5,
					status_sesi: "OPEN",
				},
			],
		};

		const lateNightActive = new Date("2026-10-03T21:38:00");
		const result = getUpcomingScheduleTime(
			"06:00 - 22:00",
			doctorScheduleWithActiveAndMorning.sesi_harian,
			doctorScheduleWithActiveAndMorning,
			lateNightActive,
		);

		expect(result.hasActive).toBe(true);
		expect(result.activeTime).toBe("21.30 – 22.00");
		expect(result.isTomorrow).toBe(true);
		expect(result.upcomingTime).toBe("Besok, 06.00 – 06.30");
	});

	it("parses Indonesian date strings to ISO format", () => {
		expect(parseDateToIso("Sabtu, 26 Sep 2026")).toBe("2026-09-26");
		expect(parseDateToIso("2026-09-26")).toBe("2026-09-26");
		expect(parseDateToIso(undefined)).toBeUndefined();
	});
});
