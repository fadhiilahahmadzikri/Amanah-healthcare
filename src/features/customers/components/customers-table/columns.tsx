'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Customer } from '../../store/customer-store';
import { CellAction } from './cell-action';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const tableDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

export const columns: ColumnDef<Customer>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='px-1'>
        <Checkbox
          aria-label='Select all customers'
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
    id: 'customer',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 rounded-md'>
            {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt={customer.name} />}
            <AvatarFallback className='rounded-md text-xs bg-primary/10 text-primary'>
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium leading-none'>{customer.name}</span>
            <span className='mt-1 text-xs text-muted-foreground'>{customer.email}</span>
          </div>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Customer',
      placeholder: 'Search customer...',
      variant: 'text',
      icon: Icons.user
    }
  },
  {
    accessorKey: 'company',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Company' />,
    cell: ({ row }) => <span className='text-muted-foreground'>{row.original.company}</span>
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
    cell: ({ row }) => <span className='text-muted-foreground'>{row.original.phone}</span>
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={cn(
          'border',
          row.original.status === 'Active'
            ? 'bg-green-500/10 text-green-500 border-green-500/20'
            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        )}
      >
        {row.original.status}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: { label: 'Status', variant: 'multiSelect', options: STATUS_OPTIONS }
  },
  {
    accessorKey: 'orders',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Orders' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.orders}</span>
  },
  {
    accessorKey: 'totalSpent',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total Spent' />,
    cell: ({ row }) => (
      <span className='font-medium'>
        $
        {row.original.totalSpent.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </span>
    )
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Joined' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {tableDateFormatter.format(new Date(row.original.joinedAt))}
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
