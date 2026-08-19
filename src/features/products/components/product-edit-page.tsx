'use client';

import { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  EditFormActions,
  EditFormField,
  EditFormFieldGrid,
  EditFormSection
} from '@/components/forms/edit-form-shell';
import { ImageUploadField } from '@/components/forms/image-upload-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categoriesQueryOptions } from '@/features/categories/api/queries';
import { updateProductMutation } from '../api/mutations';
import { productByIdOptions } from '../api/queries';
import type { Product, ProductMutationPayload } from '../api/types';

type ProductEditPageProps = {
  productId: string;
};

type ProductFormState = {
  sku: string;
  name: string;
  categoryId: string;
  brand: string;
  price: number;
  comparePrice: number;
  cost: number;
  currentStock: number;
  minStock: number;
  description: string;
  imageUrl?: string;
  status: Product['status'];
  featured: boolean;
};

const productStatusOptions: Product['status'][] = ['Active', 'Draft', 'Archived'];

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const router = useRouter();
  const { data } = useSuspenseQuery(productByIdOptions(productId));
  const { data: categoryData } = useSuspenseQuery(categoriesQueryOptions({ limit: 100 }));
  const product = data.product;
  const [form, setForm] = useState<ProductFormState>(() => getInitialFormState(product));

  const updateMutation = useMutation({
    ...updateProductMutation,
    onSuccess: () => {
      toast.success('Product updated successfully');
      router.push(`/dashboard/products/${product.id}`);
    },
    onError: () => {
      toast.error('Failed to update product');
    }
  });

  if (!data.success) {
    notFound();
  }

  const updateForm = (values: Partial<ProductFormState>) => {
    setForm((current) => ({ ...current, ...values }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.sku.trim() || !form.categoryId) {
      toast.error('Complete required product information');
      return;
    }

    updateMutation.mutate({
      id: product.id,
      values: buildProductPayload(form)
    });
  };

  const handleCancel = () => {
    router.push(`/dashboard/products/${product.id}`);
  };

  return (
    <div className='flex max-w-4xl flex-col gap-4'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Edit: {product.name}</h2>
        <p className='text-muted-foreground text-sm'>Update product information.</p>
      </div>

      <EditFormSection
        title='Basic Information'
        description='Product name, description, and identifiers.'
      >
        <EditFormFieldGrid>
          <EditFormField label='Name'>
            <Input
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='SKU'>
            <Input value={form.sku} onChange={(event) => updateForm({ sku: event.target.value })} />
          </EditFormField>
        </EditFormFieldGrid>
        <EditFormField label='Description'>
          <Textarea
            value={form.description}
            onChange={(event) => updateForm({ description: event.target.value })}
            className='min-h-24'
          />
        </EditFormField>
      </EditFormSection>

      <EditFormSection title='Pricing' description='Set prices and cost for margin tracking.'>
        <EditFormFieldGrid columns={3}>
          <EditFormField label='Price'>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={form.price}
              onChange={(event) => updateForm({ price: getNumberInputValue(event.target.value) })}
            />
          </EditFormField>
          <EditFormField label='Compare Price'>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={form.comparePrice}
              onChange={(event) =>
                updateForm({ comparePrice: getNumberInputValue(event.target.value) })
              }
            />
          </EditFormField>
          <EditFormField label='Cost'>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={form.cost}
              onChange={(event) => updateForm({ cost: getNumberInputValue(event.target.value) })}
            />
          </EditFormField>
        </EditFormFieldGrid>
      </EditFormSection>

      <EditFormSection title='Organization' description='Category, brand, and inventory.'>
        <EditFormFieldGrid columns={3}>
          <EditFormField label='Category'>
            <Select
              value={form.categoryId}
              onValueChange={(categoryId) => updateForm({ categoryId })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryData.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </EditFormField>
          <EditFormField label='Brand'>
            <Input
              value={form.brand}
              onChange={(event) => updateForm({ brand: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='Stock'>
            <Input
              type='number'
              min={0}
              value={form.currentStock}
              onChange={(event) =>
                updateForm({ currentStock: getNumberInputValue(event.target.value) })
              }
            />
          </EditFormField>
          <EditFormField label='Status'>
            <Select
              value={form.status}
              onValueChange={(status) => updateForm({ status: status as Product['status'] })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {productStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </EditFormField>
          <Field orientation='horizontal' className='items-end gap-2 pb-2 md:col-span-2'>
            <Checkbox
              id='featured-product'
              checked={form.featured}
              onCheckedChange={(checked) => updateForm({ featured: checked === true })}
            />
            <FieldLabel htmlFor='featured-product'>Featured product</FieldLabel>
          </Field>
        </EditFormFieldGrid>
      </EditFormSection>

      <EditFormSection
        title='Product Image'
        description='Primary image shown in product lists and detail pages.'
      >
        <ImageUploadField
          value={form.imageUrl}
          onChange={(imageUrl) => updateForm({ imageUrl })}
          alt={form.name || 'Product image'}
        />
      </EditFormSection>

      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}

function getInitialFormState(product: Product): ProductFormState {
  return {
    sku: product.sku,
    name: product.name,
    categoryId: product.categoryId,
    brand: product.brand ?? 'DashboardPack',
    price: product.price,
    comparePrice: product.comparePrice ?? roundCurrency(product.price * 1.3),
    cost: product.cost,
    currentStock: product.currentStock,
    minStock: product.minStock,
    description: product.description,
    imageUrl: product.imageUrl,
    status: product.status,
    featured: product.featured ?? false
  };
}

function buildProductPayload(form: ProductFormState): ProductMutationPayload {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    categoryId: form.categoryId,
    brand: form.brand.trim() || undefined,
    price: roundCurrency(form.price),
    comparePrice: form.comparePrice > 0 ? roundCurrency(form.comparePrice) : undefined,
    cost: roundCurrency(form.cost),
    currentStock: Math.max(0, Math.round(form.currentStock)),
    minStock: Math.max(0, Math.round(form.minStock)),
    description: form.description.trim(),
    imageUrl: form.imageUrl,
    status: form.status,
    featured: form.featured
  };
}

function getNumberInputValue(value: string) {
  return Number(value) || 0;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}
