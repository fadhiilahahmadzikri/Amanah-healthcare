"use client";

import { cn } from "@/lib/utils";

export interface AppointmentTimeTrajectoryProps {
	startTime: string;
	endTime: string;
	durationText?: string;
	visitType?: string;
	variant?: "card" | "modal";
	className?: string;
}

export function AppointmentTimeTrajectory({
	startTime,
	endTime,
	durationText,
	visitType,
	variant = "card",
	className,
}: AppointmentTimeTrajectoryProps) {
	const isModal = variant === "modal";

	return (
		<div
			className={cn(
				"w-full flex items-center justify-between select-none min-w-0",
				isModal
					? "my-4 py-2.5 border-y border-border/40"
					: "my-3.5 sm:my-4 py-1 px-1",
				className,
			)}
		>
			<div className="flex flex-col items-start min-w-[55px] shrink-0">
				<span
					className={cn(
						"font-bold text-foreground leading-tight tracking-tight font-sans",
						isModal ? "text-xl sm:text-2xl" : "text-[17px] sm:text-[18px]",
					)}
				>
					{startTime}
				</span>
				<span
					className={cn(
						"font-normal text-muted-foreground mt-0.5",
						isModal ? "text-xs" : "text-[10.5px]",
					)}
				>
					Mulai
				</span>
			</div>

			<div className="flex-1 flex flex-col items-center px-2 sm:px-3 min-w-0">
				{durationText && (
					<span
						className={cn(
							"font-semibold text-muted-foreground mb-1",
							isModal ? "text-xs" : "text-[11px]",
						)}
					>
						{durationText}
					</span>
				)}
				<div className="w-full flex items-center justify-center relative">
					<span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
					<div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 mx-2" />
					<span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
				</div>
				{visitType && (
					<span
						className={cn(
							"font-normal text-muted-foreground mt-1 truncate max-w-[140px]",
							isModal ? "text-xs" : "text-[10.5px]",
						)}
					>
						{visitType}
					</span>
				)}
			</div>

			<div className="flex flex-col items-end min-w-[55px] shrink-0">
				<span
					className={cn(
						"font-bold text-foreground leading-tight tracking-tight font-sans",
						isModal ? "text-xl sm:text-2xl" : "text-[17px] sm:text-[18px]",
					)}
				>
					{endTime}
				</span>
				<span
					className={cn(
						"font-normal text-muted-foreground mt-0.5",
						isModal ? "text-xs" : "text-[10.5px]",
					)}
				>
					Selesai
				</span>
			</div>
		</div>
	);
}
