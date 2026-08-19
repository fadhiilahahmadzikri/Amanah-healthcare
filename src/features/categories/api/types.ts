export type { Category } from '@/constants/mock-db';

export type CategoryFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type CategoriesResponse = {
  success: boolean;
  time: string;
  message: string;
  total_categories: number;
  offset: number;
  limit: number;
  categories: import('@/constants/mock-db').Category[];
};

export type CategoryByIdResponse = {
  success: boolean;
  time: string;
  message: string;
  category: import('@/constants/mock-db').Category;
};

export type CategoryMutationPayload = {
  name: string;
  description: string;
};
