'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Invoice } from '../../store/invoice-store';
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

export const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'OVERDUE':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'CANCELLED':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const columns: ColumnDef<Invoice>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='px-1'>
        <Checkbox
          aria-label='Select all invoices'
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
          aria-label={`Select ${row.original.invoiceNumber}`}
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
    id: 'invoiceNumber',
    accessorKey: 'invoiceNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Invoice' />,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Icons.fileTypeDoc className='h-4 w-4 text-emerald-500' />
        <span className='font-medium'>{row.original.invoiceNumber}</span>
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Invoice', placeholder: 'Search invoice...', variant: 'text' }
  },
  {
    id: 'customer',
    accessorKey: 'customerName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 rounded-md'>
            {invoice.customerAvatarUrl && (
              <AvatarImage src={invoice.customerAvatarUrl} alt={invoice.customerName} />
            )}
            <AvatarFallback className='rounded-md text-xs bg-primary/10 text-primary'>
              {getInitials(invoice.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium leading-none'>{invoice.customerName}</span>
            <span className='text-xs text-muted-foreground mt-1'>{invoice.customerEmail}</span>
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
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={cn('capitalize border', getStatusColor(row.original.status))}
      >
        {row.original.status.toLowerCase()}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: { label: 'Status', variant: 'multiSelect', options: STATUS_OPTIONS }
  },
  {
    id: 'dueDate',
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
    cell: ({ row }) => {
      const isOverdue = row.original.status === 'OVERDUE';
      return (
        <span
          className={cn('whitespace-nowrap', isOverdue ? 'text-red-500' : 'text-muted-foreground')}
        >
          {tableDateFormatter.format(new Date(row.original.dueDate))}
        </span>
      );
    }
  },
  {
    id: 'issuedAt',
    accessorKey: 'issuedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Issued' />,
    cell: ({ row }) => {
      return (
        <span className='text-muted-foreground whitespace-nowrap'>
          {tableDateFormatter.format(new Date(row.original.issuedAt))}
        </span>
      );
    }
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    cell: ({ row }) => <span className='font-medium'>${row.original.totalAmount.toFixed(2)}</span>
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
