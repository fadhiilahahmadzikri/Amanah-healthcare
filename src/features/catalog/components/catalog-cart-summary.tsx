'use client';

import Image from 'next/image';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCatalogCartStore } from '../store/cart-store';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function CatalogCartSummary() {
  const items = useCatalogCartStore((state) => state.items);
  const setQuantity = useCatalogCartStore((state) => state.setQuantity);
  const clearCart = useCatalogCartStore((state) => state.clearCart);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className='sticky top-20 self-start'>
      <CardHeader className='flex flex-row items-center justify-between gap-3'>
        <CardTitle className='text-base'>Cart Preview</CardTitle>
        <Badge variant='secondary'>{count} items</Badge>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {items.length === 0 ? (
          <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
            Add products to preview cart quantities.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className='flex items-center justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                {item.imageUrl && (
                  <div className='relative size-10 shrink-0 overflow-hidden rounded border bg-muted'>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      className='object-cover'
                    />
                  </div>
                )}
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>{item.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {currencyFormatter.format(item.price)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                >
                  <Icons.minus />
                </Button>
                <span className='w-8 text-center text-sm font-semibold'>{item.quantity}</span>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                >
                  <Icons.add />
                </Button>
              </div>
            </div>
          ))
        )}
        <div className='flex items-center justify-between border-t pt-3 text-sm font-semibold'>
          <span>Total</span>
          <span>{currencyFormatter.format(total)}</span>
        </div>
        {items.length > 0 && (
          <Button type='button' variant='outline' onClick={clearCart}>
            <Icons.trash />
            Clear Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
