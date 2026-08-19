import * as z from 'zod';

export const productSchema = z.object({
  sku: z.string().min(2, 'SKU must be at least 2 characters.'),
  name: z.string().min(2, 'Product name must be at least 2 characters.'),
  categoryId: z.string().min(1, 'Please select a category'),
  price: z.number({ message: 'Price is required' }),
  cost: z.number({ message: 'Cost is required' }),
  minStock: z.number({ message: 'Minimum stock is required' }),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
  imageUrl: z.string().optional()
});

export type ProductFormValues = z.infer<typeof productSchema>;
