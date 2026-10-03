"use client";

import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppointmentQueueFocal } from "../atoms/appointment-queue-focal";

export interface AppointmentCardFooterProps {
	queueNumber: string;
	onViewDetails?: () => void;
	onReschedule?: () => void;
	canReschedule?: boolean;
	actionsSlot?: React.ReactNode;
	detailButtonLabel?: string;
	className?: string;
}

const RescheduleIcon = ({
	className = "size-3.5",
	stroke = "currentColor",
}: {
	className?: string;
	stroke?: string;
}) => (
	<svg
		className={className}
		viewBox="0 0 24 24"
		fill="none"
		stroke={stroke}
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<path d="M12 10a3 3 0 1 0 3 3" />
		<polyline points="15 10 15 13 12 13" />
	</svg>
);

export function AppointmentCardFooter({
	queueNumber,
	onViewDetails,
	onReschedule,
	canReschedule = false,
	actionsSlot,
	detailButtonLabel = "Detail",
	className,
}: AppointmentCardFooterProps) {
	return (
		<div
			className={cn(
				"w-full flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 select-none min-w-0",
				className,
			)}
		>
			<AppointmentQueueFocal queueNumber={queueNumber} />

			<div className="flex items-center gap-2 shrink-0">
				{actionsSlot}

				{!actionsSlot && canReschedule && onReschedule && (
					<Button
						type="button"
						variant="outline"
						shape="pill"
						size="card-action"
						onClick={onReschedule}
						leadingIcon={
							<RescheduleIcon className="size-3.5" stroke="currentColor" />
						}
						className="font-semibold shadow-2xs cursor-pointer"
					>
						Reschedule
					</Button>
				)}

				{!actionsSlot && onViewDetails && (
					<Button
						type="button"
						variant="default"
						shape="pill"
						size="card-action"
						withTrailingCircleIcon
						onClick={onViewDetails}
						className="font-bold shadow-2xs cursor-pointer"
					>
						{detailButtonLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
