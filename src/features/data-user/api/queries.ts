import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { userService } from './service';
import type { UserFilters, UserItem } from './types';

export const userKeys = {
  all: ['users'] as const,
  list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
  infiniteList: (filters: UserFilters) => [...userKeys.all, 'infinite-list', filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  drivers: () => [...userKeys.all, 'backup-drivers'] as const,
  roles: () => [...userKeys.all, 'roles'] as const
};

export const usersQueryOptions = (filters: UserFilters) =>
  queryOptions({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.getUsers(filters)
  });

export const userInfiniteQueryOptions = (filters: UserFilters) =>
  infiniteQueryOptions({
    queryKey: userKeys.infiniteList(filters),
    queryFn: ({ pageParam = 1 }) =>
      userService.getUsers({
        ...filters,
        page: pageParam as number,
        limit: filters.limit ?? 25
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const limit = filters.limit ?? 25;
      if (!lastPage?.users || lastPage.users.length < limit) {
        return undefined;
      }
      if (allPages.length >= lastPage.totalPages) {
        return undefined;
      }
      return allPages.length + 1;
    }
  });

export const userByIdOptions = (id?: string | null) =>
  queryOptions({
    queryKey: userKeys.detail(id || ''),
    queryFn: () => (id ? userService.getUserById(id) : null),
    enabled: Boolean(id)
  });

export const backupDriversQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.drivers(),
    queryFn: () => userService.getBackupDrivers()
  });

export const activeRolesQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.roles(),
    queryFn: () => userService.getActiveRoles(),
    staleTime: 5 * 60 * 1000
  });
