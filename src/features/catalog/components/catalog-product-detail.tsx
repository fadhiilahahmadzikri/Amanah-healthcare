'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { catalogProductByIdQueryOptions } from '../api/queries';
import { useCatalogCartStore } from '../store/cart-store';
import { CatalogCartSummary } from './catalog-cart-summary';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function CatalogProductDetail({ productId }: { productId: string }) {
  const { data } = useSuspenseQuery(catalogProductByIdQueryOptions(productId));
  const addProduct = useCatalogCartStore((state) => state.addProduct);

  if (!data.product) {
    notFound();
  }

  const product = data.product;

  const handleAdd = () => {
    addProduct(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className='grid gap-6 xl:grid-cols-[1fr_340px]'>
      <div className='flex flex-col gap-6'>
        <Button variant='outline' className='w-fit' asChild>
          <Link href='/dashboard/catalog'>
            <Icons.chevronLeft />
            Back to Catalog
          </Link>
        </Button>

        <div className='grid gap-6 lg:grid-cols-[minmax(320px,0.85fr)_1fr]'>
          <div className='relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted'>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes='(max-width: 1024px) 100vw, 50vw'
                unoptimized
                className='object-cover'
              />
            ) : (
              <div className='flex size-full items-center justify-center text-muted-foreground'>
                <Icons.product />
              </div>
            )}
          </div>

          <div className='flex flex-col gap-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge>{product.categoryName}</Badge>
              <Badge variant='outline'>{product.status}</Badge>
              {product.featured && <Badge variant='secondary'>Featured</Badge>}
            </div>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>{product.name}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>SKU {product.sku}</p>
            </div>
            <div>
              <p className='text-3xl font-semibold'>{currencyFormatter.format(product.price)}</p>
              {product.comparePrice && (
                <p className='text-muted-foreground line-through'>
                  {currencyFormatter.format(product.comparePrice)}
                </p>
              )}
            </div>
            <p className='leading-relaxed text-muted-foreground'>{product.description}</p>
            <Button className='w-fit' onClick={handleAdd}>
              <Icons.add />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <CatalogStat title='Stock' value={`${product.currentStock} units`} />
          <CatalogStat title='Minimum Stock' value={`${product.minStock} units`} />
          <CatalogStat title='Brand' value={product.brand ?? 'House Brand'} />
        </div>
      </div>
      <CatalogCartSummary />
    </div>
  );
}

function CatalogStat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm text-muted-foreground'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-xl font-semibold'>{value}</p>
      </CardContent>
    </Card>
  );
}
