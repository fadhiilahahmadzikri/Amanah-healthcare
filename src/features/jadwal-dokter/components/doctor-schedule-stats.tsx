"use client";

import type React from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DoctorDailySession, DoctorSchedule } from "../api/types";
import {
	DOCTOR_CARD_STATUS,
	getUpcomingScheduleTime,
} from "../utils/doctor-schedule-card-utils";

export interface DoctorScheduleStatsProps {
	scheduleTime: string;
	availableSlots: number;
	totalCapacity: number;
	displaySlot?: string;
	sessions?: DoctorDailySession[];
	doctor?: DoctorSchedule;
	date?: string;
	className?: string;
}

export function DoctorScheduleStats({
	scheduleTime,
	availableSlots: _availableSlots,
	totalCapacity,
	displaySlot: _displaySlot,
	sessions,
	doctor,
	date,
	className,
}: DoctorScheduleStatsProps) {
	const now = new Date();
	const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const isPastDate = Boolean(date && date < todayIso);

	const { activeTime, hasActive, isActiveClosed } =
		isPastDate
			? { activeTime: undefined, hasActive: false, isActiveClosed: false }
			: getUpcomingScheduleTime(scheduleTime, sessions, doctor);

	const resolvedUpcoming = isPastDate
		? DOCTOR_CARD_STATUS.SELESAI
		: doctor?.jadwal_praktik_mendatang || DOCTOR_CARD_STATUS.BELUM_DIATUR;

	const slotDisplay =
		doctor?.display_akumulasi_slot ||
		_displaySlot ||
		`${doctor?.slot_terisi_akumulasi ?? 0}/${totalCapacity > 0 ? totalCapacity : 0}`;

	if (hasActive && activeTime) {
		return (
			<div
				className={cn(
					"grid grid-cols-3 gap-2 sm:gap-2.5 pt-3 mt-3.5 border-t border-border/50 relative z-20",
					className,
				)}
			>
				<div className="flex flex-col min-w-0">
					{isActiveClosed ? (
						<div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
							<span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
							<span className="truncate">Tutup</span>
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
							<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
							<span className="truncate">Sedang Aktif</span>
						</div>
					)}
					<span className="font-bold text-foreground font-mono mt-1 text-[13px] sm:text-[13.5px] tracking-tight truncate">
						{activeTime}
					</span>
				</div>

				<div className="flex flex-col min-w-0">
					<div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
						<Icons.clock className="size-3 shrink-0 text-muted-foreground/80" />
						<span className="truncate">Jadwal Mendatang</span>
					</div>
					<span className="font-bold text-foreground font-mono mt-1 text-[13px] sm:text-[13.5px] tracking-tight truncate">
						{resolvedUpcoming}
					</span>
				</div>

				<div className="flex flex-col min-w-0">
					<div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
						<Icons.teams className="size-3 shrink-0 text-muted-foreground/80" />
						<span className="truncate">Pasien Terdaftar</span>
					</div>
					<div className="flex items-center gap-1 text-[13px] sm:text-[13.5px] font-bold text-foreground font-mono mt-1 tracking-tight">
						<Icons.user className="size-3 text-foreground shrink-0" />
						<span>{slotDisplay}</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-3 pt-3.5 mt-3.5 border-t border-border/50 relative z-20",
				className,
			)}
		>
			<div className="flex flex-col min-w-0">
				<div className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
					<Icons.clock className="size-3.5 shrink-0 text-muted-foreground/80" />
					<span>Jadwal Mendatang</span>
				</div>
				<span className="font-bold text-foreground font-mono mt-1 text-[15px] sm:text-[15.5px] tracking-tight truncate">
					{resolvedUpcoming}
				</span>
			</div>

			<div className="flex flex-col min-w-0">
				<div className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
					<Icons.teams className="size-3.5 shrink-0 text-muted-foreground/80" />
					<span>Pasien Terdaftar</span>
				</div>
				<div className="flex items-center gap-1.5 text-[15px] sm:text-[15.5px] font-bold text-foreground font-mono mt-1 tracking-tight">
					<Icons.user className="size-3.5 text-foreground shrink-0" />
					<span>{slotDisplay}</span>
				</div>
			</div>
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
