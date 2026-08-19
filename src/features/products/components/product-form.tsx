'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createProductMutation, updateProductMutation } from '../api/mutations';
import type { Product } from '../api/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { productSchema, type ProductFormValues } from '@/features/products/schemas/product';
import { categoriesQueryOptions } from '@/features/categories/api/queries';
import { useMemo, useState, useRef } from 'react';
import { Icons } from '@/components/icons';
import Image from 'next/image';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: categoryData } = useQuery(categoriesQueryOptions({ limit: 100 }));
  const categoryOptions = useMemo(() => {
    return (
      categoryData?.categories.map((c) => ({
        label: c.name,
        value: c.id
      })) || []
    );
  }, [categoryData]);

  const createMutation = useMutation({
    ...createProductMutation,
    onSuccess: () => {
      toast.success('Product created successfully');
      router.push('/dashboard/products');
    },
    onError: () => {
      toast.error('Failed to create product');
    }
  });

  const updateMutation = useMutation({
    ...updateProductMutation,
    onSuccess: () => {
      toast.success('Product updated successfully');
      router.push('/dashboard/products');
    },
    onError: () => {
      toast.error('Failed to update product');
    }
  });

  const form = useAppForm({
    defaultValues: {
      sku: initialData?.sku ?? '',
      name: initialData?.name ?? '',
      categoryId: initialData?.categoryId ?? '',
      price: initialData?.price,
      cost: initialData?.cost,
      minStock: initialData?.minStock ?? 0,
      description: initialData?.description ?? '',
      imageUrl: initialData?.imageUrl ?? ''
    } as ProductFormValues,
    validators: {
      onSubmit: productSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        sku: value.sku,
        name: value.name,
        categoryId: value.categoryId,
        price: value.price!,
        cost: value.cost!,
        minStock: value.minStock,
        description: value.description,
        imageUrl: imagePreview || undefined
      };

      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } = useFormFields<ProductFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormTextField name='sku' label='SKU' required placeholder='Enter SKU' />

              <FormTextField
                name='name'
                label='Product Name'
                required
                placeholder='Enter product name'
              />

              <FormSelectField
                name='categoryId'
                label='Category'
                required
                options={categoryOptions}
                placeholder='Select category'
              />

              <FormTextField
                name='price'
                label='Price'
                required
                type='number'
                min={0}
                step={0.01}
                placeholder='Enter price'
              />

              <FormTextField
                name='cost'
                label='Cost'
                required
                type='number'
                min={0}
                step={0.01}
                placeholder='Enter cost'
              />

              <FormTextField
                name='minStock'
                label='Minimum Stock'
                type='number'
                min={0}
                placeholder='Enter minimum stock'
              />
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              required
              placeholder='Enter product description'
              maxLength={500}
              rows={4}
            />

            <div className='flex flex-col gap-3'>
              <label htmlFor='product-image-upload' className='text-sm font-medium'>
                Product Image
              </label>
              <div
                role='button'
                tabIndex={0}
                className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors relative'
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {imagePreview ? (
                  <div className='relative w-full aspect-video md:aspect-[21/9] rounded-md overflow-hidden bg-black/5'>
                    <Image
                      src={imagePreview}
                      alt='Preview'
                      fill
                      sizes='(min-width: 768px) 50vw, 100vw'
                      unoptimized
                      className='w-full h-full object-contain'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2'
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <Icons.trash className='w-4 h-4' />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Icons.upload className='w-8 h-8 mb-2' />
                    <p className='text-sm font-medium'>Click to upload image</p>
                    <p className='text-xs text-muted-foreground'>SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </>
                )}
                <input
                  id='product-image-upload'
                  aria-label='Upload product image'
                  type='file'
                  ref={fileInputRef}
                  className='hidden'
                  accept='image/*'
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Product' : 'Add Product'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
