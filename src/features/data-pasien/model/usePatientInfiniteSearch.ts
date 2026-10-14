'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { patientInfiniteSearchOptions } from '../api/queries';
import type { Patient } from '../api/types';

interface UsePatientInfiniteSearchParams {
  searchQuery?: string | null;
  gender?: string | null;
  status?: string | null;
  bloodType?: string | null;
  profileType?: string | null;
  sort?: string | null;
  enabled?: boolean;
}

export function usePatientInfiniteSearch({
  searchQuery,
  gender,
  status,
  bloodType,
  profileType,
  sort,
  enabled = true,
}: UsePatientInfiniteSearchParams) {
  const query = useInfiniteQuery({
    ...patientInfiniteSearchOptions({
      q: searchQuery || undefined,
      gender: gender || undefined,
      status: status || undefined,
      bloodType: bloodType || undefined,
      profileType: profileType || undefined,
      sort: sort || undefined,
      limit: 30,
    }),
    enabled: Boolean(enabled && searchQuery && searchQuery.trim().length > 0),
  });

  const allPatients = useMemo<Patient[]>(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.patients || []);
  }, [query.data?.pages]);

  const totalPatients = query.data?.pages[0]?.total_patients ?? allPatients.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !query.hasNextPage) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
      threshold: 0.1,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, query.hasNextPage]);

  return {
    ...query,
    patients: allPatients,
    totalPatients,
    sentinelRef,
  };
}
