import type { DoctorSchedule } from "../../api/types";

export interface DoctorScheduleInfoTabProps {
	doctor: DoctorSchedule;
}

export function DoctorScheduleInfoTab({ doctor }: DoctorScheduleInfoTabProps) {
	return (
		<div>
			<span className="text-xs font-normal text-muted-foreground/80 block mb-2">
				Informasi kontak & ruang praktik
			</span>
			<div className="grid grid-cols-2 gap-y-3 gap-x-5">
				<div className="border-b border-border/40 pb-2">
					<span className="text-xs font-normal text-muted-foreground/70 block mb-0.5">
						Unit fasilitas
					</span>
					<span className="text-sm font-medium text-foreground block truncate select-text">
						RS Amanah Healthcare
					</span>
				</div>

				<div className="border-b border-border/40 pb-2">
					<span className="text-xs font-normal text-muted-foreground/70 block mb-0.5">
						Spesialisasi
					</span>
					<span className="text-sm font-medium text-foreground block truncate select-text">
						{doctor.spesialisasi}
					</span>
				</div>

				<div className="border-b border-border/40 pb-2">
					<span className="text-xs font-normal text-muted-foreground/70 block mb-0.5">
						Email dokter
					</span>
					<span className="text-sm font-medium text-foreground block truncate font-mono select-text">
						{doctor.email && doctor.email.trim() !== "" ? (
							doctor.email
						) : (
							<span className="text-muted-foreground/60 font-sans italic text-xs font-normal">
								Belum ditambahkan
							</span>
						)}
					</span>
				</div>

				<div className="border-b border-border/40 pb-2">
					<span className="text-xs font-normal text-muted-foreground/70 block mb-0.5">
						Nomor telepon
					</span>
					<span className="text-sm font-medium text-foreground block truncate font-mono select-text">
						{doctor.nomor_telepon && doctor.nomor_telepon.trim() !== "" ? (
							doctor.nomor_telepon
						) : (
							<span className="text-muted-foreground/60 font-sans italic text-xs font-normal">
								Belum ditambahkan
							</span>
						)}
					</span>
				</div>

				<div className="border-b border-border/40 pb-2">
					<span className="text-xs font-normal text-muted-foreground/70 block mb-0.5">
						Ruang praktik
					</span>
					<span className="text-sm font-medium text-foreground block truncate select-text">
						{doctor.ruang_praktik && doctor.ruang_praktik.trim() !== "" ? (
							doctor.ruang_praktik
						) : doctor.sesi_harian?.[0]?.ruang ? (
							doctor.sesi_harian[0].ruang
						) : (
							<span className="text-muted-foreground/60 italic text-xs font-normal">
								Belum diatur
							</span>
						)}
					</span>
				</div>

				<div className="border-b border-border/40 pb-2">
					<span className="text-xs font-normal text-muted-foreground/70 block mb-0.5">
						Status dokter
					</span>
					<span className="text-sm font-bold text-foreground block truncate select-text">
						{doctor.status_dokter}
					</span>
				</div>
			</div>
		</div>
	);
}
