'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
  SearchEngineConfig,
  SearchEngineSuggestion,
  SearchEngineQuickFilter,
  SearchEngineResultItem
} from '../types';

export interface UseStateSearchEngineOptions {
  query: string;
  onQueryChange: (query: string) => void;
  id?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  indexItems?: SearchEngineResultItem[];
  suggestions?: SearchEngineSuggestion[];
  quickFilters?: SearchEngineQuickFilter[];
  recentSearchesKey?: string;
  totalResultsCount?: number;
}

export function useStateSearchEngine({
  query,
  onQueryChange,
  id = 'state-search',
  title = 'Pencarian Data',
  description,
  placeholder = 'Ketik kata kunci pencarian...',
  indexItems,
  suggestions,
  quickFilters,
  recentSearchesKey,
  totalResultsCount
}: UseStateSearchEngineOptions) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = useCallback(() => {
    onQueryChange('');
  }, [onQueryChange]);

  const config: SearchEngineConfig = useMemo(
    () => ({
      id,
      title,
      description,
      placeholder,
      query,
      onQueryChange,
      onClear: handleClear,
      indexItems,
      suggestions,
      quickFilters,
      recentSearchesKey: recentSearchesKey || `clinic_recent_search_${id}`,
      totalResultsCount
    }),
    [
      id,
      title,
      description,
      placeholder,
      query,
      onQueryChange,
      handleClear,
      indexItems,
      suggestions,
      quickFilters,
      recentSearchesKey,
      totalResultsCount
    ]
  );

  return {
    config,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    query,
    setQuery: onQueryChange,
    clearQuery: handleClear
  };
}
