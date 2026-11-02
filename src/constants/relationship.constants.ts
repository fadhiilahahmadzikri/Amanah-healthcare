/**
 * Utility to dynamically format relationship labels.
 * Upstream relation labels from the database take precedence; falls back to formatted code.
 * Zero hardcoded maps or artificial constants.
 */
export function getRelationshipLabel(type?: string | null, customLabel?: string | null): string {
  if (customLabel && customLabel.trim().length > 0) {
    return customLabel.trim();
  }
  if (!type || type.trim().length === 0) return '-';
  // Gracefully format dynamic relational code (e.g. "anak_kandung" -> "Anak Kandung")
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
