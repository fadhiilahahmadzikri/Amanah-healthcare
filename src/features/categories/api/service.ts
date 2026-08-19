import { mockDb } from '@/constants/mock-db';
import type { Category } from '@/constants/mock-db';
import { v4 as uuidv4 } from 'uuid';
import { delay } from '@/constants/mock-db';
import type {
  CategoryFilters,
  CategoriesResponse,
  CategoryByIdResponse,
  CategoryMutationPayload
} from './types';

export async function getCategories(filters: CategoryFilters): Promise<CategoriesResponse> {
  await delay(500);
  let result = [...mockDb.categories];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }

  const limit = filters.limit || 10;
  const page = filters.page || 1;
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Categories fetched',
    total_categories: result.length,
    offset,
    limit,
    categories: paginated
  };
}

export async function getCategoryById(id: string): Promise<CategoryByIdResponse> {
  await delay(500);
  const cat = mockDb.categories.find((c) => c.id === id);
  if (!cat) throw new Error('Category not found');

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Category fetched',
    category: cat
  };
}

export async function createCategory(data: CategoryMutationPayload) {
  await delay(500);
  const newCat: Category = {
    id: `cat-${uuidv4().substring(0, 6)}`,
    name: data.name,
    description: data.description
  };
  mockDb.categories.push(newCat);
  return newCat;
}

export async function updateCategory({
  id,
  values
}: {
  id: string;
  values: CategoryMutationPayload;
}) {
  await delay(500);
  const idx = mockDb.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');

  mockDb.categories[idx] = { ...mockDb.categories[idx], ...values };
  return mockDb.categories[idx];
}

export async function deleteCategory(id: string) {
  await delay(500);
  const idx = mockDb.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Category not found');

  mockDb.categories.splice(idx, 1);
  return { success: true };
}
