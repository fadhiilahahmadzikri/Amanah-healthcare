/**
 * Pure helper to dynamically resolve relationship icons / emoji.
 * Prioritizes database icon_name from patient_relationship_types,
 * with canonical code and isSystem fallback.
 * Zero hardcoding to volatile display names.
 */
export function getRelationshipIcon(iconOrCode?: string | null, isSystem?: boolean): string {
  if (isSystem) return '👤';
  if (!iconOrCode) return '🤝';

  const val = String(iconOrCode).trim().toLowerCase();

  // 1. Direct match on database icon_name
  if (val === 'heart') return '💍';
  if (val === 'baby') return '👶';
  if (val === 'users') return '🧓';
  if (val === 'user-check') return '🏡';
  if (val === 'smile') return '🤝';
  if (val === 'user-plus' || val === 'user-x') return '👤';
  if (val === 'user') return '👥';

  // 2. Canonical code match
  if (val === 'self' || val === 'diri_sendiri' || val.includes('diri')) return '👤';
  if (val === 'child' || val === 'anak') return '👶';
  if (val === 'spouse' || val === 'pasangan' || val === 'suami' || val === 'istri') return '💍';
  if (val === 'parent' || val === 'orang_tua' || val === 'ayah' || val === 'ibu') return '🧓';
  if (val === 'sibling' || val === 'saudara' || val === 'kakak' || val === 'adik') return '👥';
  if (val === 'relative' || val === 'kerabat' || val === 'keluarga') return '🏡';

  return '🤝';
}
