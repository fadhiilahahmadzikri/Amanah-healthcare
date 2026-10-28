'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ClinicNotification } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { executeNotificationAction } from '../../utils/notification-action-dispatcher';
import { useViewer } from '../../hooks/use-viewer';

function NotificationTableRowAction({ item }: { item: ClinicNotification }) {
  const router = useRouter();
  const { role: userRole } = useViewer();
  const primaryAction = item.actions?.[0];

  if (primaryAction) {
    return (
      <Button
        variant={primaryAction.type === 'primary' ? 'default' : 'outline'}
        size='sm'
        onClick={() => {
          executeNotificationAction(router, primaryAction, item, userRole);
        }}
        className='text-xs h-7.5 px-3 rounded-lg'
      >
        {primaryAction.label}
      </Button>
    );
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => {
        toast.info(`Detail notifikasi ${item.sender}`, {
          description: item.body
        });
      }}
      className='text-xs h-7.5 px-3 rounded-lg border-border/60'
    >
      Detail
    </Button>
  );
}

export const columns: ColumnDef<ClinicNotification>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'title',
    accessorKey: 'sender',
    header: 'Notifikasi',
    cell: ({ row }) => {
      const notification = row.original;

      return (
        <div className='flex items-center gap-3 py-1.5'>
          <div className='relative size-9 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted'>
            <Avatar className='size-9'>
              <AvatarImage
                src={notification.avatar || DEFAULT_AVATAR_PATH}
                alt={notification.sender}
              />
              <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={notification.sender}
                  width={36}
                  height={36}
                  unoptimized
                  className='size-full rounded-full object-cover'
                />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className='min-w-0 flex-1 space-y-0.5'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-foreground text-xs truncate'>
                {notification.sender}
              </span>
              <span className='text-[10px] text-muted-foreground'>
                ({notification.roleSubtitle})
              </span>
            </div>
            <p className='text-xs text-muted-foreground truncate max-w-md'>{notification.body}</p>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Pengirim',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      if (!category) return null;
      return (
        <Badge variant='secondary' className='text-[10.5px] font-semibold border border-border/40'>
          {category}
        </Badge>
      );
    },
    meta: {
      label: 'Kategori',
      variant: 'multiSelect',
      options: [
        { label: 'Janji Temu', value: 'Janji Temu' },
        { label: 'Promo', value: 'Promo' },
        { label: 'Hasil Lab', value: 'Hasil Lab' },
        { label: 'Antrean', value: 'Antrean' },
        { label: 'Farmasi', value: 'Farmasi' },
        { label: 'Telemedisin', value: 'Telemedisin' },
        { label: 'Shift & Kehadiran', value: 'Shift & Kehadiran' },
        { label: 'Chat Pasien', value: 'Chat Pasien' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isUnread = status === 'unread';
      return (
        <Badge
          variant={isUnread ? 'default' : 'outline'}
          className={cn(
            'text-[10.5px] font-semibold',
            isUnread
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground border-border/50'
          )}
        >
          {isUnread ? 'Belum Dibaca' : 'Sudah Dibaca'}
        </Badge>
      );
    },
    meta: {
      label: 'Status',
      variant: 'select',
      options: [
        { label: 'Belum Dibaca', value: 'unread' },
        { label: 'Sudah Dibaca', value: 'read' }
      ]
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'createdAt',
    header: 'Waktu',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className='flex flex-col text-xs'>
          <span className='font-medium text-foreground'>{item.timeAgo}</span>
          <span className='text-[11px] text-muted-foreground truncate max-w-[140px]'>
            {item.dateFull}
          </span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => <NotificationTableRowAction item={row.original} />
  }
];
