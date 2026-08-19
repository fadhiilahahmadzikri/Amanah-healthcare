import * as z from 'zod';

export const shippingSchema = z.object({
  customer: z.string().min(2, { message: 'Customer name must be at least 2 characters.' }),
  product: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  orderId: z.string().min(2, { message: 'Order ID is required.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  price: z.string().min(1, { message: 'Price is required.' }),
  status: z.enum(['Packed', 'Shipping', 'Completed']),
  startCoord: z.tuple([z.number(), z.number()]).optional(),
  endCoord: z.tuple([z.number(), z.number()]).optional()
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
