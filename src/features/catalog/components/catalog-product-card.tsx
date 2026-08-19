'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CatalogProduct } from '../api/types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function CatalogProductCard({
  product,
  onPreview,
  onAdd
}: {
  product: CatalogProduct;
  onPreview: (product: CatalogProduct) => void;
  onAdd: (product: CatalogProduct) => void;
}) {
  return (
    <Card className='group relative h-full flex flex-col overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary'>
      <Link href={`/dashboard/catalog/${product.id}`} className='absolute inset-0 z-0' />
      <div className='relative aspect-[4/3] bg-muted'>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes='(max-width: 768px) 100vw, 25vw'
            unoptimized
            className='object-cover'
          />
        ) : (
          <div className='flex size-full items-center justify-center text-muted-foreground'>
            <Icons.product />
          </div>
        )}
      </div>
      <CardHeader className='gap-2'>
        <div className='flex items-start justify-between gap-3'>
          <CardTitle className='line-clamp-2 text-base'>{product.name}</CardTitle>
          <Badge variant='secondary'>{product.categoryName}</Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-semibold'>{currencyFormatter.format(product.price)}</span>
          <span className='text-muted-foreground'>{product.currentStock} in stock</span>
        </div>
      </CardHeader>
      <CardContent className='flex-1'>
        <p className='line-clamp-2 text-sm text-muted-foreground'>{product.description}</p>
      </CardContent>
      <CardFooter className='mt-auto grid grid-cols-2 gap-2 relative z-10'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='px-2 text-xs'
          onClick={(e) => {
            e.preventDefault();
            onPreview(product);
          }}
        >
          <Icons.search />
          View
        </Button>
        <Button
          type='button'
          size='sm'
          className='px-2 text-xs'
          onClick={(e) => {
            e.preventDefault();
            onAdd(product);
          }}
        >
          <Icons.add />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
