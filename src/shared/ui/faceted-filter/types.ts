import type React from 'react';

export interface FacetOption<T = string> {
  value: T;
  label: string;
  dotColor?: string;
  count?: number;
}

export interface FacetedFilterProps<T = string> {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: readonly FacetOption<T>[];
  selectedValues: readonly T[];
  onSelect: (value: T) => void;
  onReset?: () => void;
  mode?: 'single' | 'multi';
  placeholder?: string;
  emptyText?: string;
  resetLabel?: string;
  align?: 'start' | 'center' | 'end';
  popoverWidth?: string;
  showBadgesInTrigger?: boolean;
  maxTriggerBadges?: number;
  className?: string;
}
