export const clinicEssentialsKeys = {
  all: ['admin', 'facilities'] as const,
  unitTypes: () => [...clinicEssentialsKeys.all, 'unit-types'] as const,
  units: () => [...clinicEssentialsKeys.all, 'units'] as const,
  rooms: (unitId?: string) => [...clinicEssentialsKeys.all, 'rooms', unitId] as const,
  categories: (unitId?: string) => [...clinicEssentialsKeys.all, 'categories', unitId] as const,
  services: (categoryId?: string, unitId?: string) =>
    [...clinicEssentialsKeys.all, 'services', categoryId, unitId] as const,
  forms: () => [...clinicEssentialsKeys.all, 'forms'] as const,
  relationships: () => [...clinicEssentialsKeys.all, 'relationships'] as const,
  facilities: () => [...clinicEssentialsKeys.all, 'facilities-items'] as const,
  faqs: () => [...clinicEssentialsKeys.all, 'faqs'] as const,
  bloodTypes: (params?: { search?: string; status?: string }) =>
    params ? ([...clinicEssentialsKeys.all, 'blood-types', params] as const) : ([...clinicEssentialsKeys.all, 'blood-types'] as const),
  educationLevels: (params?: { search?: string; status?: string }) =>
    params ? ([...clinicEssentialsKeys.all, 'education-levels', params] as const) : ([...clinicEssentialsKeys.all, 'education-levels'] as const),
  religions: (params?: { search?: string; status?: string }) =>
    params ? ([...clinicEssentialsKeys.all, 'religions', params] as const) : ([...clinicEssentialsKeys.all, 'religions'] as const),
  occupations: (params?: { search?: string; status?: string }) =>
    params ? ([...clinicEssentialsKeys.all, 'occupations', params] as const) : ([...clinicEssentialsKeys.all, 'occupations'] as const)
};
