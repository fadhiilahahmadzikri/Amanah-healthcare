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

  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    background: isPinned ? 'var(--background)' : undefined,
    width: column.getSize(),
    zIndex: isPinned ? (isHeader ? 30 : 10) : 0
  };
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
