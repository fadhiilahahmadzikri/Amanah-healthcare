"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import type { Appointment, Doctor } from "../../../api/types";
import { PixelTexture } from "../../pixel-texture";
import { AppointmentMetaRow } from "../atoms/appointment-meta-row";
import { AppointmentTimeTrajectory } from "../atoms/appointment-time-trajectory";
import { AppointmentCardFooter } from "../molecules/appointment-card-footer";
import { AppointmentCardHeader } from "../molecules/appointment-card-header";
import { normalizeAppointmentTimes } from "../utils/appointment-adapter";

export interface AppointmentCardOrganismProps {
	appointment: Appointment;
	doctor?: Doctor;
	subjectRole?: "doctor" | "patient";
	onViewDetails?: (appointment: Appointment) => void;
	onReschedule?: (appointment: Appointment) => void;
	actionsSlot?: React.ReactNode;
	detailButtonLabel?: string;
	className?: string;
}

export function AppointmentCardOrganism({
	appointment,
	doctor,
	subjectRole = "doctor",
	onViewDetails,
	onReschedule,
	actionsSlot,
	detailButtonLabel,
	className,
}: AppointmentCardOrganismProps) {
	const isPatientSubject = subjectRole === "patient";

	const docInfo: Doctor = doctor || {
		name: appointment.doctor_name || "",
		spec: appointment.doctor_specialty || "",
		avatar: "",
		location: "",
		rating: "",
		tags: [],
		schedule: "",
	};

	const displayName = isPatientSubject
		? appointment.patient_name || "Pasien"
		: appointment.doctor_name || docInfo.name || "-";

	const displaySubtitle = isPatientSubject
		? appointment.service ||
			appointment.poliklinik_name ||
			appointment.doctor_specialty ||
			"-"
		: appointment.doctor_specialty || docInfo.spec || "-";

	const displayAvatar = isPatientSubject
		? appointment.patient_avatar || ""
		: docInfo.avatar || "";

	const displayLocation =
		appointment.room_name ||
		appointment.room_location ||
		docInfo.location ||
		appointment.poliklinik_name ||
		"-";

	const { startTime, endTime, durationText } =
		normalizeAppointmentTimes(appointment);

	const isCancelled =
		appointment.status === "Batal" ||
		appointment.status === "CANCELLED" ||
		appointment.status === "Tidak Hadir" ||
		appointment.status === "NO_SHOW";
	const isCompleted =
		appointment.status === "Selesai" ||
		appointment.status === "COMPLETED" ||
		appointment.status === "Sedang Diperiksa" ||
		appointment.status === "IN_SERVICE";
	const canReschedule = !isCancelled && !isCompleted;

	return (
		<div
			className={cn(
				"group relative w-full bg-gradient-to-t from-primary/6 via-primary/[0.015] to-card dark:from-primary/12 dark:via-card dark:to-card text-card-foreground border border-border rounded-[20px] shadow-none hover:border-primary/60 hover:shadow-md overflow-hidden font-sans flex flex-col justify-between h-full p-3.5 sm:p-4 gap-1.5 select-none transition-all duration-200",
				className,
			)}
		>
			<div className="absolute bottom-0 left-0 right-0 h-[145px] pointer-events-none z-0 overflow-hidden">
				<PixelTexture
					colorMode="theme"
					maskVariant="curved-convex"
					invertMask={true}
					opacity={0.24}
					density="medium"
					pixelSize={4.5}
					gap={1.5}
					height="100%"
				/>
			</div>

			<div className="relative z-2 w-full">
				<AppointmentCardHeader
					subjectRole={subjectRole}
					name={displayName}
					subtitle={displaySubtitle}
					avatarUrl={displayAvatar}
					status={appointment.status}
				/>
			</div>

			<div className="relative z-2 w-full">
				<AppointmentMetaRow
					date={appointment.date || "-"}
					location={displayLocation}
				/>
			</div>

			<div className="relative z-2 w-full">
				<AppointmentTimeTrajectory
					startTime={startTime}
					endTime={endTime}
					durationText={durationText}
					visitType={appointment.visit_type || "-"}
					variant="card"
				/>
			</div>

			<div className="relative z-2 w-full mt-auto">
				<AppointmentCardFooter
					queueNumber={appointment.queue_number || "-"}
					onViewDetails={
						onViewDetails ? () => onViewDetails(appointment) : undefined
					}
					onReschedule={
						onReschedule ? () => onReschedule(appointment) : undefined
					}
					canReschedule={canReschedule}
					actionsSlot={actionsSlot}
					detailButtonLabel={detailButtonLabel}
				/>
			</div>
		</div>
	);
}
