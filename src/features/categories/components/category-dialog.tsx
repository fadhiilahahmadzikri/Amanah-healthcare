'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createCategoryMutation, updateCategoryMutation } from '../api/mutations';
import type { Category } from '../api/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categorySchema, type CategoryFormValues } from '../schemas/category';
import { categoryKeys } from '../api/queries';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Category | null;
}

export function CategoryDialog({ isOpen, onClose, initialData }: CategoryDialogProps) {
  const isEdit = !!initialData;
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...createCategoryMutation,
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      onClose();
    },
    onError: () => {
      toast.error('Failed to create category');
    }
  });

  const updateMutation = useMutation({
    ...updateCategoryMutation,
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      onClose();
    },
    onError: () => {
      toast.error('Failed to update category');
    }
  });

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? ''
    } as CategoryFormValues,
    validators: {
      onSubmit: categorySchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        description: value.description
      };

      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<CategoryFormValues>();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <form.AppForm>
            <form.Form className='space-y-4'>
              <FormTextField
                name='name'
                label='Category Name'
                required
                placeholder='Enter category name'
              />
              <FormTextareaField
                name='description'
                label='Description'
                required
                placeholder='Enter category description'
                rows={3}
              />
              <div className='flex justify-end gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={onClose}>
                  Cancel
                </Button>
                <form.SubmitButton>{isEdit ? 'Update' : 'Create'}</form.SubmitButton>
              </div>
            </form.Form>
          </form.AppForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
