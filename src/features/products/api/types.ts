import type { Product } from '@/constants/mock-db';

export type { Product };

export type ProductFilters = {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: string;
  status?: string;
};

export type ProductsResponse = {
  success: boolean;
  time: string;
  message: string;
  total_products: number;
  offset: number;
  limit: number;
  products: Product[];
};

export type ProductByIdResponse = {
  success: boolean;
  time: string;
  message: string;
  product: Product;
};

export type ProductMutationPayload = {
  sku: string;
  name: string;
  categoryId: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  cost: number;
  currentStock?: number;
  minStock: number;
  description: string;
  imageUrl?: string;
  status?: Product['status'];
  featured?: boolean;
};
