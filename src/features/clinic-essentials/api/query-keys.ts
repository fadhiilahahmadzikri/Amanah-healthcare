export const clinicEssentialsKeys = {
  all: ['admin', 'facilities'] as const,
  units: () => [...clinicEssentialsKeys.all, 'units'] as const,
  rooms: (unitId?: string) => [...clinicEssentialsKeys.all, 'rooms', unitId] as const,
  categories: (unitId?: string) => [...clinicEssentialsKeys.all, 'categories', unitId] as const,
  services: (categoryId?: string, unitId?: string) =>
    [...clinicEssentialsKeys.all, 'services', categoryId, unitId] as const,
  forms: () => [...clinicEssentialsKeys.all, 'forms'] as const
};
