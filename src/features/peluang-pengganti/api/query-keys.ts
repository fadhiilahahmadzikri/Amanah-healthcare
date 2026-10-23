import type { ReplacementFilterParams } from './types';

export const replacementKeys = {
  all: ['replacements'] as const,
  lists: () => [...replacementKeys.all, 'list'] as const,
  list: (filters?: ReplacementFilterParams) => [...replacementKeys.lists(), filters ?? {}] as const,
  details: () => [...replacementKeys.all, 'detail'] as const,
  detail: (id: string) => [...replacementKeys.details(), id] as const
};
