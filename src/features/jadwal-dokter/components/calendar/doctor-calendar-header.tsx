"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

export const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

export interface DoctorCalendarHeaderProps {
	currentMonth: number;
	currentYear: number;
	onMonthChange: (month: number) => void;
	onYearChange: (year: number) => void;
	onToday: () => void;
	onPrevMonth: () => void;
	onNextMonth: () => void;
	isCalendarOpen?: boolean;
	onToggleCalendar?: () => void;
}

export function DoctorCalendarHeader({
	currentMonth,
	currentYear,
	onMonthChange: _onMonthChange,
	onYearChange: _onYearChange,
	onToday,
	onPrevMonth,
	onNextMonth,
	isCalendarOpen = false,
	onToggleCalendar,
}: DoctorCalendarHeaderProps) {
	return (
		<div className="p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/10 shrink-0 font-sans">
			<div className="flex items-center gap-3">
				<h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
					{MONTH_NAMES[currentMonth]} {currentYear}
				</h2>
				<button
					type="button"
					onClick={onToday}
					className="px-3 py-1 text-xs font-semibold rounded-full border border-border/60 bg-background hover:bg-muted text-foreground/85 hover:text-foreground transition-colors shadow-2xs cursor-pointer"
				>
					Hari Ini
				</button>
			</div>

			<div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
				{onToggleCalendar && (
					<button
						type="button"
						onClick={onToggleCalendar}
						className={cn(
							"size-7 flex items-center justify-center rounded-lg border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer",
							isCalendarOpen &&
								"border-primary/50 bg-primary/10 text-primary font-bold shadow-xs",
						)}
						aria-label="Buka kalender tanggal"
						title="Buka kalender"
					>
						<Icons.calendar className="size-3.5" />
					</button>
				)}

				<div className="flex items-center border border-border/50 rounded-lg bg-background p-0.5 shadow-2xs">
					<button
						type="button"
						onClick={onPrevMonth}
						className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
						aria-label="Bulan Sebelumnya"
					>
						<Icons.chevronLeft className="size-4" />
					</button>
					<button
						type="button"
						onClick={onNextMonth}
						className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
						aria-label="Bulan Berikutnya"
					>
						<Icons.chevronRight className="size-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
