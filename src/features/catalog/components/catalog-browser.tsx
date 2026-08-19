'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { catalogProductsQueryOptions } from '../api/queries';
import { CATALOG_MAX_PAGES, CATALOG_PAGE_SIZE } from '../api/service';
import type { CatalogProduct } from '../api/types';
import { useCatalogCartStore } from '../store/cart-store';
import { CatalogCartSummary } from './catalog-cart-summary';
import { CatalogPreviewSheet } from './catalog-preview-sheet';
import { CatalogProductCard } from './catalog-product-card';

export function CatalogBrowser() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    name: parseAsString.withDefault('')
  });
  const [previewProduct, setPreviewProduct] = useState<CatalogProduct | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const addProduct = useCatalogCartStore((state) => state.addProduct);
  const filters = useMemo(
    () => ({
      page: Math.min(Math.max(params.page, 1), CATALOG_MAX_PAGES),
      ...(params.name.trim() && { search: params.name.trim() })
    }),
    [params.name, params.page]
  );
  const { data } = useSuspenseQuery(catalogProductsQueryOptions(filters));
  const totalPages = Math.max(
    1,
    Math.min(CATALOG_MAX_PAGES, Math.ceil(data.total_products / CATALOG_PAGE_SIZE))
  );

  useEffect(() => {
    if (params.page !== data.page) {
      void setParams({ page: data.page });
    }
  }, [data.page, params.page, setParams]);

  const handleAdd = (product: CatalogProduct) => {
    addProduct(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className='grid gap-6 2xl:grid-cols-[1fr_320px]'>
      <CatalogPreviewSheet
        product={previewProduct}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onAdd={handleAdd}
      />
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div className='relative w-full md:max-w-sm'>
            <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={params.name}
              onChange={(event) => setParams({ name: event.target.value, page: 1 })}
              placeholder='Search storefront products'
              className='pl-9'
            />
          </div>
          <div className='text-sm text-muted-foreground'>
            {data.total_products} products · page {data.page} of {totalPages}
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'>
          {data.products.map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              onPreview={(nextProduct) => {
                setPreviewProduct(nextProduct);
                setIsPreviewOpen(true);
              }}
              onAdd={handleAdd}
            />
          ))}
        </div>

        {data.products.length === 0 && (
          <div className='rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground'>
            No catalog products found.
          </div>
        )}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setParams({ page: Math.max(1, data.page - 1) })}
                className={cn(data.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
              />
            </PaginationItem>
            <span className='px-3 text-sm font-medium'>
              Page {data.page} of {totalPages}
            </span>
            <PaginationItem>
              <PaginationNext
                onClick={() => setParams({ page: Math.min(totalPages, data.page + 1) })}
                className={cn(
                  data.page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className='relative hidden 2xl:block'>
        <CatalogCartSummary />
      </div>
    </div>
  );
}
