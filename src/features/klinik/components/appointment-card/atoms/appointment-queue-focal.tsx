"use client";

import { cn } from "@/lib/utils";

export interface AppointmentQueueFocalProps {
	queueNumber: string;
	label?: string;
	className?: string;
}

export function AppointmentQueueFocal({
	queueNumber,
	label = "Nomor antrean",
	className,
}: AppointmentQueueFocalProps) {
	return (
		<div
			className={cn("flex flex-col items-start min-w-0 select-none", className)}
		>
			<span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-tight">
				{label}
			</span>
			<span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-primary leading-none mt-0.5">
				{queueNumber || "-"}
			</span>
		</div>
	);
}
