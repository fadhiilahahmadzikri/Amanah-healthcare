'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Product } from '@/constants/mock-db';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'sku',
    header: ({ column }) => <DataTableColumnHeader column={column} title='SKU' />,
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('sku')}</div>,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Product Name' />,
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>{row.getValue('name')}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'currentStock',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Stock' />,
    cell: ({ row }) => {
      const current = row.original.currentStock;
      return <div className='font-semibold'>{current}</div>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const current = row.original.currentStock;
      const min = row.original.minStock;

      if (current <= 0) {
        return <Badge variant='destructive'>Out of Stock</Badge>;
      }
      if (current <= min) {
        return <Badge className='bg-yellow-500 hover:bg-yellow-600'>Low Stock</Badge>;
      }
      return <Badge className='bg-green-500 hover:bg-green-600'>In Stock</Badge>;
    }
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Price' />,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
      return <div>{formatted}</div>;
    }
  }
];
