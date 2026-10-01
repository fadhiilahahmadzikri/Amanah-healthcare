export const klinikKeys = {
  all: ['klinik'] as const,
  appointments: () => [...klinikKeys.all, 'appointments'] as const,
  queues: () => [...klinikKeys.all, 'queues'] as const,
  doctors: () => [...klinikKeys.all, 'doctors'] as const
};
