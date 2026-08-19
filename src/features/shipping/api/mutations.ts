import { createOnboardingData, deleteOnboardingData, updateOnboardingData } from './service';
import type { ShippingMutationPayload } from './types';

export const createShippingMutation = {
  mutationFn: async (data: ShippingMutationPayload) => {
    return createOnboardingData(data);
  }
};

export const updateShippingMutation = {
  mutationFn: async ({ id, values }: { id: string; values: Partial<ShippingMutationPayload> }) => {
    return updateOnboardingData(id, values);
  }
};

export const deleteShippingMutation = {
  mutationFn: async (id: string) => {
    return deleteOnboardingData(id);
  }
};
