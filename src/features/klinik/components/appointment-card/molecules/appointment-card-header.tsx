"use client";

import { cn } from "@/lib/utils";
import { DoctorAvatar } from "../../doctor-avatar";
import { AppointmentStatusPill } from "../atoms/appointment-status-pill";

export interface AppointmentCardHeaderProps {
	subjectRole?: "doctor" | "patient";
	name: string;
	subtitle?: string;
	avatarUrl?: string;
	status: string;
	className?: string;
}

export function AppointmentCardHeader({
	subjectRole = "doctor",
	name,
	subtitle,
	avatarUrl,
	status,
	className,
}: AppointmentCardHeaderProps) {
	const isPatient = subjectRole === "patient";

	return (
		<div
			className={cn(
				"w-full flex items-start justify-between gap-2.5 select-none min-w-0",
				className,
			)}
		>
			<div className="flex items-center gap-2.5 min-w-0 flex-1">
				<div className="size-11 sm:size-12 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square shadow-2xs">
					<DoctorAvatar
						name={name || (isPatient ? "Pasien" : "Dokter")}
						avatarUrl={avatarUrl}
						size={48}
					/>
				</div>

				<div className="min-w-0 flex-1 space-y-0.5">
					<h3
						className="text-[13.5px] sm:text-[14.5px] font-bold tracking-tight text-foreground truncate"
						title={name}
					>
						{name || "-"}
					</h3>
					{subtitle && (
						<p
							className="text-[11.5px] sm:text-[12px] font-medium text-muted-foreground truncate"
							title={subtitle}
						>
							{subtitle}
						</p>
					)}
				</div>
			</div>

			<div className="shrink-0 self-start pt-0.5">
				<AppointmentStatusPill status={status} size="sm" />
			</div>
		</div>
	);
}
