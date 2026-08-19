'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { mockDb } from '@/constants/mock-db';
import type { Order, OrderItem } from '@/constants/mock-db';
import { CellAction } from './cell-action';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY_TO_SHIP', label: 'Ready to Ship' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'PROCESSING':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'READY_TO_SHIP':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'SHIPPED':
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'DELIVERED':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
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

const tableDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const getProductNames = (items: OrderItem[]) => {
  if (!items || items.length === 0) return 'Unknown';
  const firstItem = items[0];
  const product = mockDb.products.find((p) => p.id === firstItem.productId);
  const name = product ? product.name : firstItem.productId;
  if (items.length > 1) return `${name} +${items.length - 1} more`;
  return name;
};

const getFirstProductImage = (items: OrderItem[]) => {
  if (!items || items.length === 0) return null;
  const firstItem = items[0];
  const product = mockDb.products.find((p) => p.id === firstItem.productId);
  return product?.imageUrl || null;
};

const TrendSparkline = ({ status }: { status: string }) => {
  const isPositive = status === 'COMPLETED' || status === 'DELIVERED' || status === 'SHIPPED';
  const isNeutral = status === 'PENDING' || status === 'PROCESSING' || status === 'READY_TO_SHIP';

  const color = isPositive ? 'text-green-500' : isNeutral ? 'text-yellow-500' : 'text-red-500';

  return (
    <svg
      className={cn('w-12 h-4', color)}
      viewBox='0 0 50 20'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
    >
      {isPositive && <path d='M0,15 Q10,10 20,15 T40,5 T50,0' />}
      {isNeutral && <path d='M0,10 Q15,5 30,15 T50,10' />}
      {!isPositive && !isNeutral && <path d='M0,5 Q10,15 20,5 T40,15 T50,20' />}
    </svg>
  );
};

export const columns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='px-1'>
        <Checkbox
          aria-label='Select all orders'
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
          aria-label={`Select ${row.original.orderNumber}`}
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
    id: 'orderNumber',
    accessorKey: 'orderNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.orderNumber}</span>,
    enableColumnFilter: true,
    meta: { label: 'Order', placeholder: 'Search order...', variant: 'text' }
  },
  {
    id: 'customer',
    accessorKey: 'customerName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Customer' />,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 rounded-md'>
            {order.customerAvatarUrl && (
              <AvatarImage src={order.customerAvatarUrl} alt={order.customerName} />
            )}
            <AvatarFallback className='rounded-md text-xs bg-primary/10 text-primary'>
              {getInitials(order.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium leading-none'>{order.customerName}</span>
            <span className='text-xs text-muted-foreground mt-1'>
              {order.customerEmail ??
                `${order.customerName.toLowerCase().replace(' ', '.')}@example.com`}
            </span>
            {order.countryName && (
              <span className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                {order.countryFlagUrl ? (
                  <img
                    src={order.countryFlagUrl}
                    alt={order.countryName}
                    className='h-3 w-4 object-cover rounded-[2px]'
                  />
                ) : (
                  <span>{order.countryFlag}</span>
                )}
                <span>{order.countryName}</span>
              </span>
            )}
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
    id: 'product',
    accessorFn: (row) => row.items[0]?.productId || 'Unknown',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Product' />,
    cell: ({ row }) => {
      const name = getProductNames(row.original.items);
      const imageUrl = getFirstProductImage(row.original.items);
      return (
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted'>
            {imageUrl ? (
              <img src={imageUrl} alt={name} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-secondary text-muted-foreground'>
                <Icons.media className='h-4 w-4' />
              </div>
            )}
          </div>
          <span className='text-muted-foreground whitespace-nowrap'>{name}</span>
        </div>
      );
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
        {row.original.status.replace(/_/g, ' ').toLowerCase()}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: { label: 'Status', variant: 'multiSelect', options: STATUS_OPTIONS }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    cell: ({ row }) => {
      return (
        <span className='text-muted-foreground whitespace-nowrap'>
          {tableDateFormatter.format(new Date(row.original.createdAt))}
        </span>
      );
    }
  },
  {
    id: 'trend',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Trend' />,
    cell: ({ row }) => <TrendSparkline status={row.original.status} />,
    enableSorting: false
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
