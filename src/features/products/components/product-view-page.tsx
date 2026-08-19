'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AlertModal } from '@/components/modal/alert-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { deleteProductMutation } from '../api/mutations';
import { productByIdOptions } from '../api/queries';
import type { Product } from '../api/types';
import ProductForm from './product-form';

type ProductViewPageProps = {
  productId: string;
};

const productDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const categoryLabels: Record<string, string> = {
  'cat-1': 'Electronics',
  'cat-2': 'Groceries',
  'cat-3': 'Automotive'
};

export default function ProductViewPage({ productId }: ProductViewPageProps) {
  if (productId === 'new') {
    return <ProductForm initialData={null} pageTitle='Create New Product' />;
  }

  return <ProductDetails productId={productId} />;
}

function ProductDetails({ productId }: { productId: string }) {
  const { data } = useSuspenseQuery(productByIdOptions(productId));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutation({
    ...deleteProductMutation,
    onSuccess: () => {
      toast.success('Product deleted successfully');
      router.push('/dashboard/products');
    },
    onError: () => {
      toast.error('Failed to delete product');
    }
  });

  if (!data?.success || !data?.product) {
    notFound();
  }

  const product = data.product;
  const comparePrice = product.comparePrice ?? roundCurrency(product.price * 1.3);
  const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;
  const brand = product.brand ?? 'DashboardPack';
  const updatedAt = product.updatedAt ?? product.createdAt;

  return (
    <div className='flex flex-col gap-6'>
      <AlertModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(product.id)}
        loading={deleteMutation.isPending}
      />

      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>{product.name}</h2>
          <p className='text-muted-foreground'>SKU: {product.sku}</p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
          >
            <Icons.edit className='mr-2 h-4 w-4' /> Edit
          </Button>
          <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.product className='h-5 w-5 text-muted-foreground' /> Product Details
            </CardTitle>
            <CardDescription>Core product information</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Name'>{product.name}</DetailRow>
            <DetailRow label='SKU'>{product.sku}</DetailRow>
            <DetailRow label='Status'>
              <Badge variant='outline' className={cn('border', getStatusColor(product.status))}>
                {product.status}
              </Badge>
            </DetailRow>
            <DetailRow label='Featured'>
              <Badge variant='secondary'>{product.featured ? 'Yes' : 'No'}</Badge>
            </DetailRow>
            <DetailRow label='Image'>
              <ProductThumbnail product={product} />
            </DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.billing className='h-5 w-5 text-muted-foreground' /> Pricing
            </CardTitle>
            <CardDescription>Price and cost details</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Price'>{formatCurrency(product.price)}</DetailRow>
            <DetailRow label='Compare Price'>
              <span className='text-muted-foreground line-through'>
                {formatCurrency(comparePrice)}
              </span>
            </DetailRow>
            <DetailRow label='Cost'>{formatCurrency(product.cost)}</DetailRow>
            <DetailRow label='Margin'>
              <span className='text-green-500'>{margin.toFixed(1)}%</span>
            </DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.barChart className='h-5 w-5 text-muted-foreground' /> Inventory & Stats
            </CardTitle>
            <CardDescription>Stock and sales data</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <DetailRow label='Stock'>{product.currentStock} units</DetailRow>
            <DetailRow label='Times Ordered'>0</DetailRow>
            <DetailRow label='Category'>{getCategoryLabel(product.categoryId)}</DetailRow>
            <DetailRow label='Brand'>{brand}</DetailRow>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            {product.description || 'No description available for this product.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='flex flex-wrap gap-6 py-4 text-xs text-muted-foreground'>
          <span>Created: {formatDate(product.createdAt)}</span>
          <span>Updated: {formatDate(updatedAt)}</span>
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

function ProductThumbnail({ product }: { product: Product }) {
  return (
    <span className='relative inline-flex size-10 overflow-hidden rounded-md bg-muted'>
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes='40px'
          unoptimized
          className='object-cover'
        />
      ) : (
        <span className='flex size-full items-center justify-center'>
          <Icons.media className='size-5 text-muted-foreground' />
        </span>
      )}
    </span>
  );
}

function getStatusColor(status: Product['status']) {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Draft':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'Archived':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

function getCategoryLabel(categoryId: string) {
  return categoryLabels[categoryId] ?? categoryId;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  return productDateFormatter.format(new Date(value));
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}
