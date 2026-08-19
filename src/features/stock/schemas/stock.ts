import * as z from 'zod';

export const stockOperationSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional()
});

export type StockOperationFormValues = z.infer<typeof stockOperationSchema>;
