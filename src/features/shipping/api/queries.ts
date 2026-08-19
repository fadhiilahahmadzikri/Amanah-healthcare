import { queryOptions } from '@tanstack/react-query';
import { getTrackerData, getOnboardingData, getOnboardingById } from './service';
import type { ShippingFilters } from './types';

export const shippingKeys = {
  all: ['shipping'] as const,
  tracker: (filters: ShippingFilters) => [...shippingKeys.all, 'tracker', filters] as const,
  onboarding: (filters: ShippingFilters) => [...shippingKeys.all, 'onboarding', filters] as const,
  onboardingDetail: (id: string) => [...shippingKeys.all, 'onboarding', 'detail', id] as const
};

export const trackerQueryOptions = (filters: ShippingFilters) =>
  queryOptions({
    queryKey: shippingKeys.tracker(filters),
    queryFn: () => getTrackerData(filters)
  });

export const onboardingQueryOptions = (filters: ShippingFilters) =>
  queryOptions({
    queryKey: shippingKeys.onboarding(filters),
    queryFn: () => getOnboardingData(filters)
  });

export const onboardingByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: shippingKeys.onboardingDetail(id),
    queryFn: () => getOnboardingById(id)
  });
