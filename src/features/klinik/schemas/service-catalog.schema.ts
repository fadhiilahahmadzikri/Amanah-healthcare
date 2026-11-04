import { z } from 'zod';

export const ServiceCatalogItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  prefix: z.string(),
  description: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  specialtyCode: z.string().nullable().optional(),
  intakeFormId: z.string().nullable().optional(),
  intakeFormCode: z.string().nullable().optional(),
  intakeFormName: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  categoryId: z.string().optional(),
  poliklinikId: z.string(),
  poliklinikName: z.string(),
  complaints: z.array(z.string()).default([]),
  isBookable: z.boolean().optional()
});

export type ServiceCatalogItem = z.infer<typeof ServiceCatalogItemSchema>;

export const ServiceCategoryCatalogSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  iconName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  poliklinikId: z.string(),
  poliklinikName: z.string(),
  unitIds: z.array(z.string()).optional(),
  units: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  services: z.array(ServiceCatalogItemSchema).default([])
});

export type ServiceCategoryCatalog = z.infer<typeof ServiceCategoryCatalogSchema>;

export const ServiceCatalogResponseSchema = z.object({
  success: z.boolean().default(true),
  categories: z.array(ServiceCategoryCatalogSchema).default([])
});

export type ServiceCatalogResponse = z.infer<typeof ServiceCatalogResponseSchema>;
