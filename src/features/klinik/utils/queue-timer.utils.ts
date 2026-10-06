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
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

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
  const mins = Math.max(1, Math.round(elapsedSeconds / 60));
  return `${mins} Menit`;
}

export function isConsultationOvertime(elapsedSeconds: number, policyMinutes?: number): boolean {
  if (elapsedSeconds <= 0 || !policyMinutes || policyMinutes <= 0) return false;
  return elapsedSeconds > policyMinutes * 60;
}
