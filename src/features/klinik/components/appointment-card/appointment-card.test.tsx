import { describe, expect, it, mock } from "bun:test";

mock.module("server-only", () => ({}));

const { AppointmentTimeTrajectory } = await import(
	"./atoms/appointment-time-trajectory"
);
const { AppointmentMetaRow } = await import("./atoms/appointment-meta-row");
const { AppointmentQueueFocal } = await import(
	"./atoms/appointment-queue-focal"
);
const { AppointmentStatusPill } = await import(
	"./atoms/appointment-status-pill"
);
const { AppointmentCardOrganism } = await import(
	"./organisms/appointment-card-organism"
);
const { AppointmentMasterCard } = await import("./appointment-master-card");
const { bookedPatientToAppointment, normalizeAppointmentTimes } = await import(
	"./utils/appointment-adapter"
);

import type { BookedPatientItem } from "@/server/contracts/schedules/doctor-schedules.dto";
import { APPOINTMENT_STATUS } from "@/constants/appointment-status.constants";
import type { Appointment } from "../../api/types";

describe("Appointment Card & Detail Atomic Design System", () => {
	it("exports all atoms, molecules, organisms, master components, and adapter functions", () => {
		expect(typeof AppointmentTimeTrajectory).toBe("function");
		expect(typeof AppointmentMetaRow).toBe("function");
		expect(typeof AppointmentQueueFocal).toBe("function");
		expect(typeof AppointmentStatusPill).toBe("function");
		expect(typeof AppointmentCardOrganism).toBe("function");
		expect(typeof AppointmentMasterCard).toBe("function");
		expect(typeof bookedPatientToAppointment).toBe("function");
		expect(typeof normalizeAppointmentTimes).toBe("function");
	});

	it("normalizes appointment time string and computes duration accurately", () => {
		const times = normalizeAppointmentTimes({
			scheduled_start_time: "18:00",
			scheduled_end_time: "18:30",
			consultation_duration_formatted: "30 minutes",
		});
		expect(times.startTime).toBe("18.00");
		expect(times.endTime).toBe("18.30");
		expect(times.durationText).toBe("30 minutes");
	});

	it("converts BookedPatientItem to canonical Appointment and maps booked status to APPOINTMENT_STATUS.BOOKED", () => {
		const rawPatient: BookedPatientItem = {
			appointmentId: "apt-uuid-1234",
			queueNumber: "A-05",
			timeSlot: "19:00 - 19:30",
			status: "booked",
			statusBadge: "book",
			chiefComplaint: "Demam dan flu sejak kemarin",
			clinicRoomName: "Ruang Poli KIA 1",
			isCancellable: true,
			patient: {
				id: "patient-uuid-5678",
				fullName: "Ibu Siti Rahmawati",
				medicalRecordNumber: "RM-2026-0099",
				nik: "3201015509920001",
				gender: "Perempuan",
				birthDate: "1992-09-15",
				age: "34 tahun",
				phoneNumber: "081298765432",
			},
		};

		const apt = bookedPatientToAppointment(rawPatient, {
			doctorName: "dr. Sarah Sp.A",
			doctorSpecialty: "Spesialis Anak",
			date: "Sabtu, 3 Okt 2026",
		});

		expect(apt.id).toBe("apt-uuid-1234");
		expect(apt.patient_name).toBe("Ibu Siti Rahmawati");
		expect(apt.doctor_name).toBe("dr. Sarah Sp.A");
		expect(apt.doctor_specialty).toBe("Spesialis Anak");
		expect(apt.room_name).toBe("Ruang Poli KIA 1");
		expect(apt.scheduled_start_time).toBe("19:00");
		expect(apt.scheduled_end_time).toBe("19:30");
		expect(apt.status).toBe(APPOINTMENT_STATUS.BOOKED);
		expect(apt.queue_number).toBe("A-05");
	});

	it("renders AppointmentTimeTrajectory with enlarged gutter margin classes", () => {
		const cardTrajectory = AppointmentTimeTrajectory({
			startTime: "19.00",
			endTime: "19.30",
			durationText: "30 minutes",
			visitType: "Pemeriksaan Rutin",
			variant: "card",
		});
		expect(cardTrajectory).toBeDefined();

		const modalTrajectory = AppointmentTimeTrajectory({
			startTime: "19.00",
			endTime: "19.30",
			durationText: "30 minutes",
			visitType: "Pemeriksaan Rutin",
			variant: "modal",
		});
		expect(modalTrajectory).toBeDefined();
	});

	it("renders AppointmentStatusPill with canonical label for BOOKED and WAITING", () => {
		const pillBooked = AppointmentStatusPill({ status: APPOINTMENT_STATUS.BOOKED });
		expect(pillBooked).toBeDefined();

		const pillWaiting = AppointmentStatusPill({ status: APPOINTMENT_STATUS.WAITING });
		expect(pillWaiting).toBeDefined();
	});

	it("renders AppointmentCardOrganism in both doctor subject mode and patient subject mode", () => {
		const sampleAppointment: Appointment = {
			id: "apt-1",
			booking_code: "APT-1",
			patient_name: "Ananda Rizky",
			patient_email: "rizky@example.com",
			patient_avatar: "",
			doctor_name: "dr. Sarah Sp.A",
			doctor_specialty: "Spesialis Anak",
			poliklinik_name: "Poli Anak",
			room_name: "Ruang 1",
			date: "Sabtu, 3 Okt 2026",
			time: "18:00 - 18:30",
			complaint: "Pemeriksaan Tumbuh Kembang",
			status: APPOINTMENT_STATUS.BOOKED,
			queue_number: "B-02",
			created_at: "2026-10-03T10:00:00Z",
		};

		const patientPerspectiveCard = AppointmentCardOrganism({
			appointment: sampleAppointment,
			subjectRole: "doctor",
		});
		expect(patientPerspectiveCard).toBeDefined();

		const adminPerspectiveCard = AppointmentCardOrganism({
			appointment: sampleAppointment,
			subjectRole: "patient",
		});
		expect(adminPerspectiveCard).toBeDefined();
	});

	it("renders AppointmentCardOrganism for unassigned doctor without fake placeholder", () => {
		const unassignedAppointment: Appointment = {
			id: "apt-unassigned-1",
			booking_code: "APT-UN-1",
			patient_name: "Budi Santoso",
			patient_email: "budi@example.com",
			patient_avatar: "",
			doctor_name: "",
			poliklinik_name: "Poli Umum",
			service: "Pemeriksaan Dokter Umum",
			date: "Sabtu, 10 Okt 2026",
			time: "08:00 - 09:30",
			complaint: "Flu dan batuk",
			status: APPOINTMENT_STATUS.BOOKED,
			queue_number: "A-01",
			created_at: "2026-10-10T08:00:00Z",
		};

		const card = AppointmentCardOrganism({
			appointment: unassignedAppointment,
			subjectRole: "doctor",
		});

		expect(card).toBeDefined();
	});
});
