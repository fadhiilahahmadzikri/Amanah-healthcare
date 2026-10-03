"use client";

import * as React from "react";
import type { BookedPatientItem } from "@/server/contracts/schedules/doctor-schedules.dto";
import type { Appointment, Doctor } from "../../api/types";
import { AppointmentCardOrganism } from "./organisms/appointment-card-organism";
import { AppointmentDetailOrganism } from "./organisms/appointment-detail-organism";
import {
	bookedPatientToAppointment,
	type SessionContext,
} from "./utils/appointment-adapter";

export interface AppointmentMasterCardProps {
	appointment?: Appointment;
	patientItem?: BookedPatientItem;
	sessionContext?: SessionContext;
	doctor?: Doctor;
	subjectRole?: "doctor" | "patient";
	onViewDetails?: (appointment: Appointment) => void;
	onReschedule?: (appointment: Appointment) => void;
	onCancel?: (
		appointment: Appointment,
		reason?: string,
	) => Promise<void> | void;
	onCallPatient?: (appointment: Appointment) => Promise<void> | void;
	onCompletePatient?: (appointment: Appointment) => Promise<void> | void;
	isCallPending?: boolean;
	isCompletePending?: boolean;
	portalContainerRef?: React.RefObject<HTMLElement | null>;
	actionsSlot?: React.ReactNode;
	detailButtonLabel?: string;
	className?: string;
}

export function AppointmentMasterCard({
	appointment: rawAppointment,
	patientItem,
	sessionContext,
	doctor,
	subjectRole,
	onViewDetails,
	onReschedule,
	onCancel,
	onCallPatient,
	onCompletePatient,
	isCallPending = false,
	isCompletePending = false,
	portalContainerRef,
	actionsSlot,
	detailButtonLabel,
	className,
}: AppointmentMasterCardProps) {
	const [isDetailOpen, setIsDetailOpen] = React.useState(false);

	const effectiveAppointment = React.useMemo<Appointment | null>(() => {
		if (rawAppointment) return rawAppointment;
		if (patientItem)
			return bookedPatientToAppointment(patientItem, sessionContext);
		return null;
	}, [rawAppointment, patientItem, sessionContext]);

	if (!effectiveAppointment) return null;

	const effectiveSubjectRole =
		subjectRole || (patientItem ? "patient" : "doctor");

	const handleOpenDetail = (apt: Appointment) => {
		if (onViewDetails) {
			onViewDetails(apt);
		} else {
			setIsDetailOpen(true);
		}
	};

	return (
		<>
			<AppointmentCardOrganism
				appointment={effectiveAppointment}
				doctor={doctor}
				subjectRole={effectiveSubjectRole}
				onViewDetails={handleOpenDetail}
				onReschedule={onReschedule}
				actionsSlot={actionsSlot}
				detailButtonLabel={detailButtonLabel}
				className={className}
			/>

			{!onViewDetails && (
				<AppointmentDetailOrganism
					isOpen={isDetailOpen}
					appointment={effectiveAppointment}
					onClose={() => setIsDetailOpen(false)}
					onReschedule={onReschedule}
					onCancel={onCancel}
					onCallPatient={onCallPatient}
					onCompletePatient={onCompletePatient}
					isCallPending={isCallPending}
					isCompletePending={isCompletePending}
					portalContainerRef={portalContainerRef}
				/>
			)}
		</>
	);
}
