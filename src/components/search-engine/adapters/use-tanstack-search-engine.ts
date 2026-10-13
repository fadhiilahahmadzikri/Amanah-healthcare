'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Table } from '@tanstack/react-table';
import type {
  SearchEngineConfig,
  SearchEngineSuggestion,
  SearchEngineQuickFilter,
  SearchEngineResultItem
} from '../types';

export interface UseTanStackSearchEngineOptions<TData> {
  table: Table<TData>;
  columnId: string;
  id?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  indexItems?: SearchEngineResultItem[];
  suggestions?: SearchEngineSuggestion[];
  quickFilters?: SearchEngineQuickFilter[];
  recentSearchesKey?: string;
}

export function useTanStackSearchEngine<TData>({
  table,
  columnId,
  id = 'tanstack-table',
  title = 'Pencarian Data',
  description,
  placeholder = 'Ketik kata kunci pencarian...',
  indexItems,
  suggestions,
  quickFilters,
  recentSearchesKey
}: UseTanStackSearchEngineOptions<TData>) {
  const [isOpen, setIsOpen] = useState(false);

  const column = table.getColumn(columnId);
  const rawQuery = column?.getFilterValue();
  const query = typeof rawQuery === 'string' ? rawQuery : '';

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      column?.setFilterValue(newQuery.trim() ? newQuery : undefined);
    },
    [column]
  );

  const handleClear = useCallback(() => {
    column?.setFilterValue(undefined);
  }, [column]);

  const config: SearchEngineConfig = useMemo(
    () => ({
      id,
      title,
      description,
      placeholder,
      query,
      onQueryChange: handleQueryChange,
      onClear: handleClear,
      indexItems,
      suggestions,
      quickFilters,
      recentSearchesKey: recentSearchesKey || `clinic_recent_search_${id}`
    }),
    [
      id,
      title,
      description,
      placeholder,
      query,
      handleQueryChange,
      handleClear,
      indexItems,
      suggestions,
      quickFilters,
      recentSearchesKey
    ]
  );

  return {
    config,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    query,
    setQuery: handleQueryChange,
    clearQuery: handleClear
  };
}
