import { clientFetch } from '@/lib/client-fetch';
import type {
  AssignReplacementPayload,
  CancelReplacementPayload,
  ReplacementFilterParams,
  ReplacementOpportunityItem
} from './types';

export async function fetchReplacements(
  filters?: ReplacementFilterParams
): Promise<ReplacementOpportunityItem[]> {
  const query: Record<string, unknown> = {};
  if (filters?.status && filters.status !== 'all') query.status = filters.status;
  if (filters?.date) query.date = filters.date;
  if (filters?.startDate) query.startDate = filters.startDate;
  if (filters?.endDate) query.endDate = filters.endDate;

  return clientFetch<ReplacementOpportunityItem[]>('/api/v1/replacements', {
    method: 'GET',
    query
  });
}

export async function assignReplacement(
  id: string,
  payload: AssignReplacementPayload
): Promise<ReplacementOpportunityItem> {
  return clientFetch<ReplacementOpportunityItem>(`/api/v1/replacements/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function cancelReplacement(
  id: string,
  payload?: CancelReplacementPayload
): Promise<ReplacementOpportunityItem> {
  return clientFetch<ReplacementOpportunityItem>(`/api/v1/replacements/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload || {})
  });
}
