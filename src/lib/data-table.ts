import type { ExtendedColumnFilter, FilterOperator, FilterVariant } from '@/types/data-table';
import type { Column } from '@tanstack/react-table';

import { dataTableConfig } from '@/config/data-table';

export function getCommonPinningStyles<TData>({
  column,
  isHeader = false
}: {
  column: Column<TData>;
  isHeader?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const size = column.getSize();

  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : undefined,
    width: size !== 150 ? size : undefined,
    minWidth: isPinned && size !== 150 ? size : undefined,
    maxWidth: isPinned && size !== 150 ? size : undefined,
    zIndex: isPinned ? (isHeader ? 30 : 10) : undefined
  };
}

export function getCommonPinningClasses<TData>({
  column,
  isHeader = false
}: {
  column: Column<TData>;
  isHeader?: boolean;
}): string {
  const isPinned = column.getIsPinned();
  if (!isPinned) return '';

  if (isPinned === 'left') {
    if (isHeader) {
      return 'sticky left-0 bg-surface-subtle dark:bg-muted border-r border-border/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]';
    }
    return 'sticky left-0 bg-card group-hover/row:bg-surface-subtle/80 dark:group-hover/row:bg-muted/30 [tr[data-state=selected]_&]:bg-muted/50 border-r border-border/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] transition-colors';
  }

  if (isPinned === 'right') {
    if (isHeader) {
      return 'sticky right-0 bg-surface-subtle dark:bg-muted border-l border-border/60 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]';
    }
    return 'sticky right-0 bg-card group-hover/row:bg-surface-subtle/80 dark:group-hover/row:bg-muted/30 [tr[data-state=selected]_&]:bg-muted/50 border-l border-border/40 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] transition-colors';
  }

  return '';
}

export function getFilterOperators(filterVariant: FilterVariant) {
  const operatorMap: Record<FilterVariant, { label: string; value: FilterOperator }[]> = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    range: dataTableConfig.numericOperators,
    date: dataTableConfig.dateOperators,
    dateRange: dataTableConfig.dateOperators,
    boolean: dataTableConfig.booleanOperators,
    select: dataTableConfig.selectOperators,
    multiSelect: dataTableConfig.multiSelectOperators
  };

  return operatorMap[filterVariant] ?? dataTableConfig.textOperators;
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
  const operators = getFilterOperators(filterVariant);

  return operators[0]?.value ?? (filterVariant === 'text' ? 'iLike' : 'eq');
}

const UNARY_FILTER_OPERATORS = new Set<FilterOperator>(['isEmpty', 'isNotEmpty']);

export function getValidFilters<TData>(
  filters: ExtendedColumnFilter<TData>[]
): ExtendedColumnFilter<TData>[] {
  return filters.filter((filter) => {
    if (UNARY_FILTER_OPERATORS.has(filter.operator)) {
      return true;
    }
    if (Array.isArray(filter.value)) {
      return filter.value.length > 0;
    }
    if (typeof filter.value === 'string') {
      return filter.value.trim().length > 0;
    }
    return filter.value !== null && filter.value !== undefined;
  });
}
