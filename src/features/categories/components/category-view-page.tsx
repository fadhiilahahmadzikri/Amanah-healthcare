'use client';

import { useState, type ReactNode } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { deleteCategoryMutation } from '../api/mutations';
import { categoryByIdOptions } from '../api/queries';
import { CategoryDialog } from './category-dialog';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

type CategoryViewPageProps = {
  categoryId: string;
};

export default function CategoryViewPage({ categoryId }: CategoryViewPageProps) {
  const { data } = useSuspenseQuery(categoryByIdOptions(categoryId));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutation({
    ...deleteCategoryMutation,
    onSuccess: () => {
      toast.success('Category deleted successfully');
      router.push('/dashboard/categories');
    },
    onError: () => {
      toast.error('Failed to delete category');
    }
  });

  if (!data?.success || !data?.category) {
    notFound();
  }

  const category = data.category;

  return (
    <div className='flex flex-col gap-6'>
      <AlertModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(category.id)}
        loading={deleteMutation.isPending}
      />
      <CategoryDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={category}
      />

      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>{category.name}</h2>
          <p className='text-muted-foreground'>ID: {category.id}</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsEditDialogOpen(true)}>
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </Button>
          <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.media className='h-5 w-5 text-muted-foreground' /> Category Details
            </CardTitle>
            <CardDescription>Core category information</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Name'>{category.name}</DetailRow>
            <DetailRow label='ID'>{category.id}</DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.text className='h-5 w-5 text-muted-foreground' /> Description
            </CardTitle>
            <CardDescription>Detailed description</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              {category.description || 'No description available for this category.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className='flex flex-wrap gap-6 py-4 text-xs text-muted-foreground'>
          <span>
            Created: {category.createdAt ? dateFormatter.format(new Date(category.createdAt)) : '-'}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 border-b py-2 last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{children}</span>
    </div>
  );
}
