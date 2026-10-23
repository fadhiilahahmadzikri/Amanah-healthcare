import { useQuery } from '@tanstack/react-query';
import { replacementKeys } from './query-keys';
import { fetchReplacements } from './service';
import type { ReplacementFilterParams } from './types';

export function useReplacementsQuery(filters?: ReplacementFilterParams) {
  return useQuery({
    queryKey: replacementKeys.list(filters),
    queryFn: () => fetchReplacements(filters),
    staleTime: 30_000
  });
}
