import { z } from 'zod';

export const invalidParamSchema = z.object({
  name: z.string(),
  reason: z.string(),
  code: z.string().optional()
});

export const problemDetailsSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number(),
  statusCode: z.number().optional(),
  detail: z.string().optional(),
  message: z.string().optional(),
  instance: z.string().optional(),
  code: z.string().optional(),
  invalidParams: z.array(invalidParamSchema).optional(),
  retryAfter: z.number().optional(),
  traceId: z.string().optional(),
  timestamp: z.string().optional()
});

export type InvalidParam = z.infer<typeof invalidParamSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

export function isProblemDetails(data: unknown): data is ProblemDetails {
  return problemDetailsSchema.safeParse(data).success;
}
