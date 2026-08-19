import { mockDb, type Product } from '@/constants/mock-db';
import { v4 as uuidv4 } from 'uuid';
import { delay } from '@/constants/mock-db';
import type {
  ProductFilters,
  ProductsResponse,
  ProductByIdResponse,
  ProductMutationPayload
} from './types';

export async function getProducts(filters: ProductFilters): Promise<ProductsResponse> {
  await delay(500);
  let result = [...mockDb.products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters.categoryId) {
    const categories = filters.categoryId.split(',');
    result = result.filter((p) => categories.includes(p.categoryId));
  }

  if (filters.status) {
    const statuses = filters.status.split(',');
    result = result.filter((p) => statuses.includes(p.status));
  }

  const limit = filters.limit || 10;
  const page = filters.page || 1;
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Products fetched',
    total_products: result.length,
    offset,
    limit,
    products: paginated
  };
}

export async function getProductById(id: string): Promise<ProductByIdResponse> {
  await delay(500);
  const product = mockDb.products.find((p) => p.id === id);
  if (!product) throw new Error('Product not found');

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Product fetched',
    product
  };
}

export async function createProduct(data: ProductMutationPayload) {
  await delay(500);
  const now = new Date().toISOString();
  const newProduct: Product = {
    id: `prod-${uuidv4().substring(0, 6)}`,
    sku: data.sku,
    name: data.name,
    categoryId: data.categoryId,
    brand: data.brand,
    price: data.price,
    comparePrice: data.comparePrice,
    cost: data.cost,
    minStock: data.minStock,
    currentStock: data.currentStock ?? 0,
    description: data.description,
    imageUrl: data.imageUrl,
    createdAt: now,
    updatedAt: now,
    status: data.status ?? 'Active',
    featured: data.featured ?? false
  };
  mockDb.products.push(newProduct);
  return newProduct;
}

export async function updateProduct({
  id,
  values
}: {
  id: string;
  values: ProductMutationPayload;
}) {
  await delay(500);
  const idx = mockDb.products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');

  mockDb.products[idx] = {
    ...mockDb.products[idx],
    ...values,
    updatedAt: new Date().toISOString()
  };
  return mockDb.products[idx];
}

export async function deleteProduct(id: string) {
  await delay(500);
  const idx = mockDb.products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');

  mockDb.products.splice(idx, 1);
  return { success: true };
}
