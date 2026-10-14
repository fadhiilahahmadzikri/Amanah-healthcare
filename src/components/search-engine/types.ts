import type React from 'react';

export interface SearchEngineSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category?: string;
  badge?: string;
  queryValue?: string;
}

export interface SearchEngineResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  queryValue?: string;
  onSelect?: () => void;
}

export interface SearchEngineQuickFilter {
  id: string;
  label: string;
  isActive: boolean;
  onToggle: () => void;
  count?: number;
}

export interface SearchEngineConfig {
  id: string;
  title: string;
  description?: string;
  placeholder?: string;
  query: string;
  onQueryChange: (query: string) => void;
  onClear?: () => void;
  onSubmit?: (query: string) => void;
  indexItems?: SearchEngineResultItem[];
  suggestions?: SearchEngineSuggestion[];
  quickFilters?: SearchEngineQuickFilter[];
  recentSearchesKey?: string;
  emptyText?: string;
  isLoading?: boolean;
  totalResultsCount?: number;
  realtimeSync?: boolean;
}

export interface SearchEngineTriggerProps {
  config: SearchEngineConfig;
  isOpen: boolean;
  onOpen: () => void;
  className?: string;
  ariaLabel?: string;
  variant?: 'icon' | 'compact' | 'pill';
  showBadge?: boolean;
}

export interface SearchEngineDialogProps {
  config: SearchEngineConfig;
  isOpen: boolean;
  onClose: () => void;
}
