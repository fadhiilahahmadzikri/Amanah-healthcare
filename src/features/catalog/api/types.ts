import type { Product } from '@/constants/mock-db';

export type CatalogProduct = Product & {
  categoryName: string;
};

export type CatalogFilters = {
  page?: number;
  search?: string;
};

export type CatalogProductsResponse = {
  products: CatalogProduct[];
  total_products: number;
  page: number;
  page_size: number;
  max_pages: number;
};

export type CatalogProductResponse = {
  product: CatalogProduct;
};

export type CatalogCartItem = {
  productId: string;
  sku: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};
