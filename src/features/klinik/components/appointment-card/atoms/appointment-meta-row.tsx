"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface AppointmentMetaRowProps {
	date: string;
	location: string;
	className?: string;
}

export function AppointmentMetaRow({
	date,
	location,
	className,
}: AppointmentMetaRowProps) {
	return (
		<div
			className={cn(
				"w-full flex items-center justify-between text-[12px] px-0.5 py-0.5 border-t border-border/40 select-none min-w-0",
				className,
			)}
		>
			<div className="flex items-center gap-1.5 min-w-0 py-1.5 text-foreground font-semibold">
				<Icons.calendar
					className="size-3.5 text-primary shrink-0"
					strokeWidth={1.8}
				/>
				<span className="truncate">{date || "-"}</span>
			</div>

			<div className="w-[1px] h-3.5 bg-border/40 shrink-0 mx-1.5" />

			<div className="flex items-center gap-1.5 min-w-0 py-1.5 text-muted-foreground font-medium">
				<Icons.mapPin
					className="size-3.5 text-primary shrink-0"
					strokeWidth={1.8}
				/>
				<span className="truncate" title={location}>
					{location || "-"}
				</span>
			</div>
		</div>
	);
}
