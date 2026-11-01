import type * as React from 'react';

/**
 * Agnostic item definition for SideTray navigation items.
 */
export interface SideTrayItem<T extends string = string> {
  key: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  count?: number;
  badge?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Display mode for SideTray:
 * - 'push': Adjusts layout width so content in adjacent container is pushed without overlay.
 * - 'overlay': Floats on top of content with backdrop/shadow.
 * - 'auto': 'push' on desktop (>= 1024px), 'overlay' on mobile (< 1024px).
 */
export type SideTrayMode = 'push' | 'overlay' | 'auto';

/**
 * Props for the master SideTray component.
 */
export interface SideTrayProps<T extends string = string> {
  items: SideTrayItem<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
  title?: string;
  defaultExpanded?: boolean;
  defaultPinned?: boolean;
  isExpanded?: boolean;
  isPinned?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onPinnedChange?: (pinned: boolean) => void;
  width?: number | string;
  mode?: SideTrayMode;
  hoverToPeek?: boolean;
  showPinButton?: boolean;
  className?: string;
  triggerAriaLabel?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
}

/**
 * Props for SideTrayLayout container.
 */
export interface SideTrayLayoutProps {
  children: React.ReactNode;
  tray: React.ReactNode;
  className?: string;
  contentClassName?: string;
}
