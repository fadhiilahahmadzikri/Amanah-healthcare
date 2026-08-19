'use client';

import Image from 'next/image';
import Link from 'next/link';

import { AdaptiveSheet } from '@/components/sheets/adaptive-sheet';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CatalogProduct } from '../api/types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function CatalogPreviewSheet({
  product,
  open,
  onOpenChange,
  onAdd
}: {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: CatalogProduct) => void;
}) {
  if (!product) {
    return null;
  }

  return (
    <AdaptiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={product.name}
      subtitle='Storefront Preview'
      description={product.sku}
      width={520}
      sheetContent={
        <div className='flex flex-col gap-5'>
          <div className='relative aspect-[4/3] overflow-hidden rounded-lg bg-muted'>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes='520px'
                unoptimized
                className='object-cover'
              />
            ) : (
              <div className='flex size-full items-center justify-center text-muted-foreground'>
                <Icons.product />
              </div>
            )}
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge>{product.categoryName}</Badge>
            <Badge variant='outline'>{product.status}</Badge>
            {product.featured && <Badge variant='secondary'>Featured</Badge>}
          </div>
          <div>
            <p className='text-2xl font-semibold'>{currencyFormatter.format(product.price)}</p>
            {product.comparePrice && (
              <p className='text-sm text-muted-foreground line-through'>
                {currencyFormatter.format(product.comparePrice)}
              </p>
            )}
          </div>
          <p className='text-sm leading-relaxed text-muted-foreground'>{product.description}</p>
        </div>
      }
      footer={
        <div className='flex justify-end gap-2'>
          <Button variant='outline' asChild>
            <Link href={`/dashboard/catalog/${product.id}`}>
              <Icons.externalLink />
              View Detail
            </Link>
          </Button>
          <Button onClick={() => onAdd(product)}>
            <Icons.add />
            Add to Cart
          </Button>
        </div>
      }
    />
  );
}
