'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategoryMutation } from '../../api/mutations';
import { categoryKeys } from '../../api/queries';
import { toast } from 'sonner';
import { CategoryDialog } from '../category-dialog';
import type { Category } from '../../api/types';

interface CellActionProps {
  data: Category;
}

export function CellAction({ data }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...deleteCategoryMutation,
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete category');
    }
  });

  const onDelete = () => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(data.id);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <CategoryDialog isOpen={open} onClose={() => setOpen(false)} initialData={data} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <Icons.moreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Icons.edit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className='text-red-600'>
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
