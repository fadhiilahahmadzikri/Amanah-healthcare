export function parsePureNumeric(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().replace(',', '.');
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePureInteger(value: unknown): number | null {
  const numeric = parsePureNumeric(value);
  if (numeric === null) {
    return null;
  }
  return Math.round(numeric);
}
