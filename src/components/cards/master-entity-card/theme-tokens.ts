export type CardThemeVariant = 'lime' | 'blue' | 'amber' | 'red' | 'purple';

export interface CardThemeVisuals {
  gradient: string;
  glow: string;
  border: string;
  textColor: string;
  dotColor: string;
  dotGlow: string;
}

export interface CardThemeToken {
  id: CardThemeVariant;
  label: string;
  swatchHex: string;
  dark: CardThemeVisuals;
  light: CardThemeVisuals;
}

/**
 * ============================================================================
 * DOMAIN & DESIGN TOKENS LAYER (Theme-Respecting & Zero-Glow Architecture)
 * ============================================================================
 * Tokens utilize dynamic theme variables with clean flat contrast.
 * Glow is explicitly set to transparent for a crisp, professional aesthetic.
 */
export const CARD_THEME_TOKENS: Record<CardThemeVariant, CardThemeToken> = {
  lime: {
    id: 'lime',
    label: 'Lime Green (Buka / Aktif / Hadir)',
    swatchHex: '#9ef038',
    dark: {
      gradient: 'linear-gradient(90deg, #9ef038 0%, #a5f344 50%, #98eb32 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--success, #9ef038) 40%, transparent)',
      textColor: '#1c2908',
      dotColor: '#9ef038',
      dotGlow: 'transparent'
    },
    light: {
      gradient: 'linear-gradient(90deg, #bef264 0%, #a3e635 50%, #84cc16 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--success, #84cc16) 30%, transparent)',
      textColor: '#1a2e05',
      dotColor: '#4d7c0f',
      dotGlow: 'transparent'
    }
  },
  blue: {
    id: 'blue',
    label: 'Electric Blue (Cuti / Info / Dokter)',
    swatchHex: '#38bdf8',
    dark: {
      gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 50%, #2dd4bf 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--info, #38bdf8) 40%, transparent)',
      textColor: '#082032',
      dotColor: '#38bdf8',
      dotGlow: 'transparent'
    },
    light: {
      gradient: 'linear-gradient(90deg, #7dd3fc 0%, #38bdf8 50%, #0284c7 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--info, #0284c7) 30%, transparent)',
      textColor: '#082f49',
      dotColor: '#0369a1',
      dotGlow: 'transparent'
    }
  },
  amber: {
    id: 'amber',
    label: 'Sunset Amber (Menunggu / Pending)',
    swatchHex: '#fbbf24',
    dark: {
      gradient: 'linear-gradient(90deg, #fbbf24 0%, #facc15 50%, #f59e0b 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--warning, #fbbf24) 40%, transparent)',
      textColor: '#291802',
      dotColor: '#fbbf24',
      dotGlow: 'transparent'
    },
    light: {
      gradient: 'linear-gradient(90deg, #fde047 0%, #facc15 50%, #eab308 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--warning, #eab308) 30%, transparent)',
      textColor: '#422006',
      dotColor: '#a16207',
      dotGlow: 'transparent'
    }
  },
  red: {
    id: 'red',
    label: 'Coral Red (Tutup / Non-Aktif / Batal)',
    swatchHex: '#ff4d6d',
    dark: {
      gradient: 'linear-gradient(90deg, #ff4d6d 0%, #ff6b6b 50%, #f43f5e 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--destructive, #ff4d6d) 40%, transparent)',
      textColor: '#fff0f3',
      dotColor: '#ff4d6d',
      dotGlow: 'transparent'
    },
    light: {
      gradient: 'linear-gradient(90deg, #fda4af 0%, #fb7185 50%, #f43f5e 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--destructive, #f43f5e) 30%, transparent)',
      textColor: '#4c0519',
      dotColor: '#be123c',
      dotGlow: 'transparent'
    }
  },
  purple: {
    id: 'purple',
    label: 'Vivid Purple (Spesialis / Bidan / Custom)',
    swatchHex: '#c084fc',
    dark: {
      gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 50%, #8b5cf6 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--primary, #c084fc) 40%, transparent)',
      textColor: '#faf5ff',
      dotColor: '#c084fc',
      dotGlow: 'transparent'
    },
    light: {
      gradient: 'linear-gradient(90deg, #d8b4fe 0%, #c084fc 50%, #a855f7 100%)',
      glow: 'transparent',
      border: 'color-mix(in oklch, var(--primary, #a855f7) 30%, transparent)',
      textColor: '#3b0764',
      dotColor: '#7e22ce',
      dotGlow: 'transparent'
    }
  }
};

export function resolveCardTheme(statusOrTheme?: string): CardThemeToken {
  if (!statusOrTheme) return CARD_THEME_TOKENS.lime;

  const normalized = statusOrTheme.toUpperCase().replace(/[\s-]+/g, '_');

  if (normalized === 'LIME') return CARD_THEME_TOKENS.lime;
  if (normalized === 'BLUE') return CARD_THEME_TOKENS.blue;
  if (normalized === 'AMBER' || normalized === 'YELLOW') return CARD_THEME_TOKENS.amber;
  if (normalized === 'RED' || normalized === 'ROSE') return CARD_THEME_TOKENS.red;
  if (normalized === 'PURPLE' || normalized === 'VIOLET') return CARD_THEME_TOKENS.purple;

  switch (normalized) {
    case 'OPEN':
    case 'BUKA':
    case 'ACTIVE':
    case 'AKTIF':
    case 'HADIR':
    case 'PRESENT':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'SELESAI':
      return CARD_THEME_TOKENS.lime;

    case 'ON_LEAVE':
    case 'LEAVE':
    case 'CUTI':
    case 'BOOKED':
    case 'UPCOMING':
    case 'INFO':
    case 'TERKONEKSI':
      return CARD_THEME_TOKENS.blue;

    case 'PENDING':
    case 'MENUNGGU':
    case 'MENUNGGU_VERIFIKASI':
    case 'WAITING':
    case 'LATE':
    case 'TERLAMBAT':
    case 'WARNING':
      return CARD_THEME_TOKENS.amber;

    case 'CLOSED':
    case 'TUTUP':
    case 'INACTIVE':
    case 'NONAKTIF':
    case 'NON_AKTIF':
    case 'CANCELLED':
    case 'BATAL':
    case 'DIBATALKAN':
    case 'EXPIRED':
    case 'REVOKED':
    case 'DESTRUCTIVE':
      return CARD_THEME_TOKENS.red;

    case 'SPECIALTY':
    case 'MIDWIFE':
    case 'AFILIASI_KERABAT':
    case 'KERABAT':
    case 'CUSTOM':
      return CARD_THEME_TOKENS.purple;

    default:
      return CARD_THEME_TOKENS.lime;
  }
}
