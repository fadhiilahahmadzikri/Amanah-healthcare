"use client";

import { Icons } from "@/components/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { SimpleScheduleStatus } from "../../utils/leave-calculator";

export const STATUS_CONFIG: Record<
	SimpleScheduleStatus,
	{
		label: string;
		cellBg: string;
		border: string;
		text: string;
		dotBg: string;
	}
> = {
	buka: {
		label: "Buka",
		cellBg: "bg-success-subtle hover:bg-success-subtle/80",
		border: "border-success-border",
		text: "text-success",
		dotBg: "bg-success",
	},
	selesai: {
		label: "Selesai",
		cellBg: "bg-muted/10 hover:bg-muted/20",
		border: "border-border/30",
		text: "text-muted-foreground/60",
		dotBg: "bg-muted-foreground/30",
	},
	tutup: {
		label: "Tutup",
		cellBg: "bg-muted/30 hover:bg-muted/40",
		border: "border-border/50",
		text: "text-muted-foreground",
		dotBg: "bg-muted-foreground/40",
	},
};

export interface DoctorCalendarDayCellProps {
	day: number;
	status: SimpleScheduleStatus;
	isPast: boolean;
	isSelected: boolean;
	isCellUpdating: boolean;
	isCellDisabled: boolean;
	readOnly: boolean;
	monthName: string;
	onSelectDay: (day: number) => void;
	onStatusChange?: (day: number, status: "OPEN" | "CLOSED") => void;
	onNavigateToDailyGrid?: (day: number) => void;
}

export function DoctorCalendarDayCell({
	day,
	status,
	isPast,
	isSelected,
	isCellUpdating,
	isCellDisabled,
	readOnly,
	monthName,
	onSelectDay,
	onStatusChange,
	onNavigateToDailyGrid,
}: DoctorCalendarDayCellProps) {
	const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.tutup;
	const isFinished = isPast || status === "selesai";

	if (isFinished) {
		return (
			<button
				type="button"
				className={cn(
					"w-full h-full min-h-[52px] sm:min-h-[58px] rounded-xl border border-border/20 bg-muted/10 p-2 flex flex-col justify-between text-left select-none cursor-pointer transition-all outline-none",
					isSelected && "ring-2 ring-primary/40 shadow-xs border-primary/40",
					isPast && "opacity-40",
				)}
				onClick={() => onSelectDay(day)}
			>
				<div className="flex items-center justify-between w-full">
					<span className="text-xs sm:text-sm tabular-nums font-bold text-muted-foreground">
						{day}
					</span>
					<span className="size-1.5 rounded-full bg-muted-foreground/40" />
				</div>
				<div className="mt-1 flex items-center justify-between gap-1 w-full">
					<span className="text-[10px] sm:text-[11.5px] font-bold text-muted-foreground/70 leading-none select-none tracking-tight block">
						Selesai
					</span>
					{onNavigateToDailyGrid && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onSelectDay(day);
								onNavigateToDailyGrid(day);
							}}
							title={`Buka Jadwal & Kuota tanggal ${day}`}
							className="size-4 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-background/90 transition-all opacity-60 cursor-pointer shrink-0"
						>
							<Icons.arrowUpRight className="size-3 stroke-[2.5]" />
						</button>
					)}
				</div>
			</button>
		);
	}

	const cellContent = (
		<div
			className={cn(
				"w-full h-full min-h-[52px] sm:min-h-[58px] rounded-xl border p-2 flex flex-col justify-between transition-all text-left relative cursor-pointer group/cell overflow-hidden",
				cfg.cellBg,
				cfg.border,
				isSelected && "ring-2 ring-primary/40 shadow-xs",
				isCellDisabled && "cursor-wait",
			)}
		>
			{isCellUpdating && (
				<div
					role="status"
					aria-label="Menyimpan perubahan jadwal"
					className="absolute inset-0 z-20 rounded-xl bg-background/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 animate-in fade-in duration-150"
				>
					<Spinner className="size-4 text-primary" />
					<span className="text-[9.5px] font-bold text-foreground/80 tracking-tight leading-none">
						Menyimpan...
					</span>
				</div>
			)}

			<div className="flex items-center justify-between">
				<span className="text-xs sm:text-sm tabular-nums font-bold leading-none text-foreground">
					{day}
				</span>
				<span className={cn("size-2 rounded-full shrink-0", cfg.dotBg)} />
			</div>

			<div className="mt-1 flex items-center justify-between gap-1">
				<span
					className={cn(
						"text-[10px] sm:text-[11.5px] font-bold leading-none select-none tracking-tight block",
						cfg.text,
					)}
				>
					{cfg.label}
				</span>

				{onNavigateToDailyGrid && (
					<button
						type="button"
						onClick={(e) => {
							if (isCellDisabled) return;
							e.stopPropagation();
							onSelectDay(day);
							onNavigateToDailyGrid(day);
						}}
						title={`Buka Jadwal & Kuota tanggal ${day}`}
						className={cn(
							"size-4 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-background/90 transition-all opacity-60 group-hover/cell:opacity-100 cursor-pointer shrink-0",
							isCellDisabled && "pointer-events-none opacity-20",
						)}
					>
						<Icons.arrowUpRight className="size-3 stroke-[2.5]" />
					</button>
				)}
			</div>
		</div>
	);

	if (readOnly) {
		return (
			<button
				type="button"
				onClick={() => onSelectDay(day)}
				className="w-full h-full text-left outline-none"
			>
				{cellContent}
			</button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				disabled={isCellDisabled}
				onClick={() => onSelectDay(day)}
			>
				<button
					type="button"
					disabled={isCellDisabled}
					className={cn(
						"w-full h-full text-left outline-none",
						isCellDisabled && "cursor-wait pointer-events-none",
					)}
				>
					{cellContent}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="w-44">
				{onNavigateToDailyGrid && (
					<>
						<DropdownMenuItem
							onClick={() => {
								onSelectDay(day);
								onNavigateToDailyGrid(day);
							}}
							className="text-xs font-bold text-primary flex items-center justify-between cursor-pointer"
						>
							<span>Lihat Jadwal Harian</span>
							<Icons.arrowUpRight className="size-3.5 stroke-[2.2]" />
						</DropdownMenuItem>
						<div className="h-px bg-border/40 my-1" />
					</>
				)}
				<div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">
					Ubah status tanggal {day} {monthName}:
				</div>
				{(["OPEN", "CLOSED"] as const).map((st) => {
					const itemCfg =
						st === "OPEN" ? STATUS_CONFIG.buka : STATUS_CONFIG.tutup;
					const isCurrent = st === (status === "buka" ? "OPEN" : "CLOSED");
					return (
						<DropdownMenuItem
							key={st}
							onClick={() => onStatusChange?.(day, st)}
							className="text-xs font-bold flex items-center justify-between cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<span className={cn("size-2 rounded-full", itemCfg.dotBg)} />
								<span className={itemCfg.text}>{itemCfg.label}</span>
							</div>
							{isCurrent && (
								<Icons.check className="size-3 text-primary stroke-[3]" />
							)}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
