export const klinikKeys = {
  all: ['klinik'] as const,
  appointments: () => [...klinikKeys.all, 'appointments'] as const,
  queues: () => [...klinikKeys.all, 'queues'] as const,
  doctors: () => [...klinikKeys.all, 'doctors'] as const,
  maternalReferenceOptions: () => [...klinikKeys.all, 'maternal', 'reference-options'] as const,
  occupations: () => [...klinikKeys.all, 'occupations'] as const,
  appointmentIntake: (appointmentId: string) =>
    [...klinikKeys.all, 'intake', appointmentId] as const,
  vaccineCatalog: () => [...klinikKeys.all, 'immunization', 'vaccines'] as const
};
