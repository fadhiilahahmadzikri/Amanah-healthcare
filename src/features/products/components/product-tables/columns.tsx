'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Product } from '../../api/types';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

const tableDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Archived', label: 'Archived' }
];

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='px-1'>
        <Checkbox
          aria-label='Select all products'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='px-1'>
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Product' />,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className='flex items-center gap-3'>
          <div className='flex-shrink-0 h-10 w-10 rounded bg-muted/50 flex items-center justify-center'>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={40}
                height={40}
                unoptimized
                className='h-full w-full object-cover rounded'
              />
            ) : (
              <Icons.media className='h-5 w-5 text-muted-foreground' />
            )}
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-foreground'>{product.name}</span>
            <span className='text-xs text-muted-foreground line-clamp-1 max-w-[300px]'>
              {product.description || 'No description available.'}
            </span>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Product',
      placeholder: 'Search products...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => <DataTableColumnHeader column={column} title='SKU' />,
    cell: ({ row }) => <span className='text-muted-foreground'>{row.original.sku}</span>
  },
  {
    accessorKey: 'categoryId',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal'>
        {row.original.categoryId === 'cat-1'
          ? 'Electronics'
          : row.original.categoryId === 'cat-2'
            ? 'Groceries'
            : row.original.categoryId === 'cat-3'
              ? 'Automotive'
              : 'Templates'}
      </Badge>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const status = row.original.status || 'Active';
      return (
        <Badge
          variant='outline'
          className={
            status === 'Active'
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : status === 'Draft'
                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
          }
        >
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Status', variant: 'multiSelect', options: STATUS_OPTIONS }
  },
  {
    accessorKey: 'currentStock',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Stock' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.currentStock}</span>
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Price' />,
    cell: ({ row }) => <span className='font-medium'>${row.original.price.toFixed(2)}</span>
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Created' />,
    cell: ({ row }) => (
      <span className='text-muted-foreground whitespace-nowrap'>
        {tableDateFormatter.format(new Date(row.original.createdAt))}
      </span>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
