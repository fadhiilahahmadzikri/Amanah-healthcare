export function computeConsultationElapsedSeconds(
  startedAt?: string | Date | null,
  completedAt?: string | Date | null,
  referenceNow?: Date
): number {
  if (!startedAt) return 0;
  const startTime = new Date(startedAt).getTime();
  if (Number.isNaN(startTime)) return 0;

  const endTime = completedAt
    ? new Date(completedAt).getTime()
    : (referenceNow || new Date()).getTime();
  if (Number.isNaN(endTime) || endTime < startTime) return 0;

  return Math.floor((endTime - startTime) / 1000);
}

export function formatConsultationTimer(elapsedSeconds: number): string {
  if (elapsedSeconds <= 0) return '0 Menit';

  const days = Math.floor(elapsedSeconds / 86400);
  const remainingHoursSec = elapsedSeconds % 86400;
  const hours = Math.floor(remainingHoursSec / 3600);
  const remainingMinsSec = remainingHoursSec % 3600;
  const mins = Math.floor(remainingMinsSec / 60);
  const secs = remainingMinsSec % 60;

  // ≥ 1 Hari
  if (days > 0) {
    return hours > 0 ? `${days} Hari ${hours} Jam` : `${days} Hari`;
  }

  // ≥ 1 Jam (e.g. 634 menit -> 10 Jam 34 Menit)
  if (hours > 0) {
    return mins > 0 ? `${hours} Jam ${mins} Menit` : `${hours} Jam`;
  }

  // < 1 Jam
  if (mins === 0) {
    return `${secs} Dtk`;
  }
  if (secs === 0) {
    return `${mins} Menit`;
  }
  return `${mins} Menit ${secs} Dtk`;
}

export function formatConsultationSummary(elapsedSeconds: number): string {
  if (elapsedSeconds <= 0) return '0 Menit';

  const days = Math.floor(elapsedSeconds / 86400);
  const remainingHoursSec = elapsedSeconds % 86400;
  const hours = Math.floor(remainingHoursSec / 3600);
  const remainingMinsSec = remainingHoursSec % 3600;
  const mins = Math.max(1, Math.round(remainingMinsSec / 60));

  if (days > 0) {
    return hours > 0 ? `${days} Hari ${hours} Jam` : `${days} Hari`;
  }
  if (hours > 0) {
    return mins > 0 ? `${hours} Jam ${mins} Menit` : `${hours} Jam`;
  }
  return `${mins} Menit`;
}

export function isConsultationOvertime(elapsedSeconds: number, policyMinutes?: number): boolean {
  if (elapsedSeconds <= 0 || !policyMinutes || policyMinutes <= 0) return false;
  return elapsedSeconds > policyMinutes * 60;
}
