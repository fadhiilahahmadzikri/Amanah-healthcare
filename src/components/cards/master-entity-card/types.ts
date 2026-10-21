import type React from 'react';
import type { CardThemeToken, CardThemeVariant, CardThemeVisuals } from './theme-tokens';

export type { CardThemeToken, CardThemeVariant, CardThemeVisuals };

export type EntityCardStatusTheme = 'open' | 'closed' | 'leave' | 'pending' | 'custom';

export interface EntityCardLipStyle {
  bg: string;
  text: string;
  border: string;
  hex: string;
}

export interface EntityCardStatusLipProps {
  status: string;
  label?: string;
  variant?: EntityCardStatusTheme;
  className?: string;
}

export interface EntityCardFrameProps {
  isSelected?: boolean;
  isPending?: boolean;
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  className?: string;
  children: React.ReactNode;
  onCardClick?: () => void;
  cardRef?: React.Ref<HTMLDivElement>;
}

export interface EntityCardIdentityProps {
  name: string;
  subtitle?: React.ReactNode;
  avatarUrl?: string | null;
  initials: string;
  onNameClick?: (e: React.MouseEvent) => void;
  isPending?: boolean;
  className?: string;
}

export interface EntityCardFooterProps {
  secondaryAction?: React.ReactNode;
  primaryAction?: React.ReactNode;
  className?: string;
}

export interface EntityCardGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Agnostic Master Entity Card Props
 * Supports standard entity layout (name, subtitle, avatar, status)
 * as well as completely customizable slots (headerSlot, identitySlot, contentSlot, bottomLipSlot).
 */
export interface MasterEntityCardProps {
  /** Operational status or canonical theme identifier */
  status?: string;
  /** Presentation label displayed in bottom banner lip */
  statusLabel?: string;
  /** Explicit card theme variant ('lime' | 'blue' | 'amber' | 'red' | 'purple') */
  statusVariant?: CardThemeVariant;
  /** Direct theme token override for custom domain colors */
  themeTokenOverride?: CardThemeToken;
  /** Active selection state */
  isSelected?: boolean;
  /** Pending or draft account/record state */
  isPending?: boolean;
  /** Visual variation style */
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  /** Primary entity title / name */
  name?: string;
  /** Subtitle node or string (specialty, role, description) */
  subtitle?: React.ReactNode;
  /** Avatar image URL */
  avatarUrl?: string | null;
  /** Fallback initials when avatar URL is unavailable */
  initials?: string;
  /** Optional background trailing watermark or illustration */
  trailingImage?: React.ReactNode;
  /** Custom header slot placed above identity */
  headerSlot?: React.ReactNode;
  /** Custom identity slot override */
  identitySlot?: React.ReactNode;
  /** Middle content slot for status, queues, badges, or details */
  contentSlot?: React.ReactNode;
  /** Custom bottom lip slot override */
  bottomLipSlot?: React.ReactNode;
  /** Secondary action button (e.g. settings / schedule) */
  secondaryAction?: React.ReactNode;
  /** Primary action button (e.g. view patients / details) */
  primaryAction?: React.ReactNode;
  /** Whether to render the footer action buttons */
  showActions?: boolean;
  /** Container click handler */
  onCardClick?: () => void;
  /** Title click handler */
  onTitleClick?: (e: React.MouseEvent) => void;
  /** Optional arbitrary children to render inside core surface */
  children?: React.ReactNode;
  /** Extra CSS classes */
  className?: string;
}
