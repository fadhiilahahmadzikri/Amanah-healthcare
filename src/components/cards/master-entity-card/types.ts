import type React from 'react';

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

export interface MasterEntityCardProps {
  status: string;
  statusLabel?: string;
  statusVariant?: EntityCardStatusTheme;
  isSelected?: boolean;
  isPending?: boolean;
  variant?: 'default' | 'compact' | 'flat' | 'elevated';
  name: string;
  subtitle?: React.ReactNode;
  avatarUrl?: string | null;
  initials?: string;
  trailingImage?: React.ReactNode;
  contentSlot?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  primaryAction?: React.ReactNode;
  showActions?: boolean;
  onCardClick?: () => void;
  onTitleClick?: (e: React.MouseEvent) => void;
  className?: string;
}
