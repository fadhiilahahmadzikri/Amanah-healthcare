import * as z from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters')
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
