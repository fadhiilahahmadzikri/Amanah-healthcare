"use client";

import { cn } from "@/lib/utils";
import { getStatusConfig } from "@/styles/clinical-tokens";

export interface AppointmentStatusPillProps {
	status?: string | null;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function AppointmentStatusPill({
	status,
	size = "md",
	className,
}: AppointmentStatusPillProps) {
	const config = getStatusConfig(status || "");

	const sizeClasses = {
		sm: "text-[10px] sm:text-[10.5px] px-2 py-0.5 gap-1",
		md: "text-[11px] sm:text-[11.5px] px-2.5 py-1 gap-1.5",
		lg: "text-xs sm:text-[13px] px-3.5 py-1.5 gap-2",
	};

	const dotSizes = {
		sm: "size-1.5",
		md: "size-2",
		lg: "size-2.5",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full font-bold border backdrop-blur-xs select-none shadow-none tracking-tight shrink-0 transition-colors",
				sizeClasses[size] || sizeClasses.md,
				config.pillBg,
				config.pillBorder,
				className,
			)}
		>
			<span
				className={cn(
					"rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20",
					dotSizes[size] || dotSizes.md,
					config.dotGradient,
				)}
			/>
			<span
				className={cn(
					"bg-clip-text text-transparent font-bold tracking-tight font-sans",
					config.textGradient,
				)}
			>
				{config.label}
			</span>
		</span>
	);
}
