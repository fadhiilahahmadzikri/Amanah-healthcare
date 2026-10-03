"use client";

import type React from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DoctorDailySession, DoctorSchedule } from "../api/types";
import {
	formatUpcomingFallback,
	getUpcomingScheduleTime,
} from "../utils/doctor-schedule-card-utils";
import {
	ActiveSessionIndicator,
	SlotCounterIndicator,
	UpcomingScheduleIndicator,
} from "./doctor-card-atoms";

export interface DoctorScheduleStatsProps {
	scheduleTime: string;
	availableSlots: number;
	totalCapacity: number;
	displaySlot?: string;
	upcomingScheduleTime?: string;
	sessions?: DoctorDailySession[];
	doctor?: DoctorSchedule;
	className?: string;
}

export function DoctorScheduleStats({
	scheduleTime,
	availableSlots,
	totalCapacity,
	displaySlot: _displaySlot,
	upcomingScheduleTime,
	sessions,
	doctor,
	className,
}: DoctorScheduleStatsProps) {
	const { labelTime, activeTime, upcomingTime, hasActive, isActiveClosed } =
		getUpcomingScheduleTime(scheduleTime, sessions, doctor);
	const resolvedUpcoming =
		upcomingTime ||
		labelTime ||
		formatUpcomingFallback(upcomingScheduleTime) ||
		"Belum diatur";

	const effectiveTotal =
		totalCapacity > 0
			? totalCapacity
			: sessions && sessions.length > 0
				? sessions.reduce((acc, s) => acc + (s.kuota_pasien || 0), 0)
				: 0;

	const bookedCount =
		typeof doctor?.slot_terisi_akumulasi === "number"
			? doctor.slot_terisi_akumulasi
			: typeof doctor?.metrics?.occupiedSlots === "number"
				? doctor.metrics.occupiedSlots
				: Math.max(0, effectiveTotal - availableSlots);

	const slotDisplay =
		effectiveTotal > 0 ? `${bookedCount}/${effectiveTotal}` : "0/0";

	if (hasActive && activeTime) {
		return (
			<div
				className={cn(
					"flex items-center justify-between gap-2 pt-2.5 mt-3 border-t border-border/40 relative z-20 min-w-0",
					className,
				)}
			>
				<ActiveSessionIndicator time={activeTime} isClosed={isActiveClosed} />

				{resolvedUpcoming && resolvedUpcoming !== "Belum diatur" && (
					<UpcomingScheduleIndicator
						time={resolvedUpcoming}
						className="text-muted-foreground font-semibold text-[11.5px] sm:text-xs"
					/>
				)}

				<SlotCounterIndicator display={slotDisplay} />
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3 pt-2.5 mt-3 border-t border-border/40 relative z-20 min-w-0",
				className,
			)}
		>
			<UpcomingScheduleIndicator time={resolvedUpcoming} />
			<SlotCounterIndicator display={slotDisplay} />
		</div>
	);
}

export interface DoctorCardActionsProps {
	onReschedule?: (e: React.MouseEvent) => void;
	onDetail?: (e: React.MouseEvent) => void;
	rescheduleLabel?: string;
	detailLabel?: string;
	className?: string;
}

export function DoctorCardActions({
	onReschedule,
	onDetail,
	rescheduleLabel = "Reschedule",
	detailLabel = "Detail",
	className,
}: DoctorCardActionsProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-end gap-2 pt-3 mt-auto border-t border-border/40 relative z-20",
				className,
			)}
		>
			<Button
				type="button"
				variant="outline"
				size="card-action"
				shape="pill"
				onClick={onReschedule}
				className="font-semibold"
				leadingIcon={
					<Icons.calendar className="size-3.5 text-muted-foreground" />
				}
			>
				{rescheduleLabel}
			</Button>

			<Button
				type="button"
				variant="default"
				size="card-action"
				shape="pill"
				withTrailingCircleIcon
				onClick={onDetail}
				className="font-bold"
			>
				{detailLabel}
			</Button>
		</div>
	);
}
