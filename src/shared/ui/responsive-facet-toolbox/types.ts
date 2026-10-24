'use client';

import type { ComponentType, ReactNode } from 'react';

export interface FacetOption {
  label: string;
  value: string;
  count?: number;
  dotColor?: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface FacetGroupDefinition {
  id: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  mode?: 'single' | 'multi';
  options: FacetOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  onReset?: () => void;
  popoverWidth?: string;
}

export interface DateFilterConfig {
  label?: string;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  defaultDate?: Date;
  resetLabel?: string;
}

export interface ResponsiveFacetToolboxProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onOpenSearchDialog?: () => void;
  isSearchEngineActive?: boolean;
  dateFilter?: DateFilterConfig;
  facets: FacetGroupDefinition[];
  isFiltered?: boolean;
  onResetAll?: () => void;
  activeFilterCount?: number;
  actionsSlot?: ReactNode;
  extraRightSlot?: ReactNode;
  isCompact?: boolean;
  className?: string;
}
