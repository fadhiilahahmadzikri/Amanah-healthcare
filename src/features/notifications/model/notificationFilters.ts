import type {
  ClinicNotification,
  ClinicNotificationCategory,
  ClinicNotificationStatus
} from '../types';

export type NotificationCategoryFilter = ClinicNotificationCategory | 'ALL';
export type NotificationStatusFilter = ClinicNotificationStatus | 'ALL';
export type NotificationViewStyle = 'card' | 'table';

export interface NotificationFilterState {
  categoryFilter: NotificationCategoryFilter;
  statusFilter: NotificationStatusFilter;
  searchQuery: string;
}

export function filterNotifications(
  notifications: ClinicNotification[],
  filters: NotificationFilterState
): ClinicNotification[] {
  const query = filters.searchQuery.toLowerCase().trim();

  return notifications.filter((item) => {
    const matchCat = filters.categoryFilter === 'ALL' || item.category === filters.categoryFilter;
    const matchStatus = filters.statusFilter === 'ALL' || item.status === filters.statusFilter;

    if (!query) {
      return matchCat && matchStatus;
    }

    const searchableFields = [item.sender, item.body, item.category, item.roleSubtitle];
    const matchSearch = searchableFields.some((field) => field.toLowerCase().includes(query));

    return matchCat && matchStatus && matchSearch;
  });
}

export function paginateNotifications(
  notifications: ClinicNotification[],
  currentPage: number,
  pageSize: number
): ClinicNotification[] {
  const start = (currentPage - 1) * pageSize;
  return notifications.slice(start, start + pageSize);
}

export function getIsFiltered(filters: NotificationFilterState): boolean {
  if (filters.searchQuery.trim().length > 0) return true;
  if (filters.categoryFilter !== 'ALL') return true;
  return filters.statusFilter !== 'ALL';
}

export function getIsAllSelected(
  notifications: ClinicNotification[],
  selectedIds: Set<string>
): boolean {
  return notifications.length > 0 && notifications.every((item) => selectedIds.has(item.id));
}

export function toggleSelection(selectedIds: Set<string>, id: string): Set<string> {
  const next = new Set(selectedIds);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  return next;
}

export function togglePageSelection(
  selectedIds: Set<string>,
  notifications: ClinicNotification[],
  isAllSelected: boolean
): Set<string> {
  const next = new Set(selectedIds);

  notifications.forEach((item) => {
    if (isAllSelected) {
      next.delete(item.id);
    } else {
      next.add(item.id);
    }
  });

  return next;
}
