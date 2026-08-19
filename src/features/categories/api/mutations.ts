import { createCategory, updateCategory, deleteCategory } from './service';

export const createCategoryMutation = {
  mutationFn: createCategory
};

export const updateCategoryMutation = {
  mutationFn: updateCategory
};

export const deleteCategoryMutation = {
  mutationFn: deleteCategory
};
