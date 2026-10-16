import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface StaffManagementToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  staffsCount: number;
  invitationsCount: number;
  onInviteStaff: () => void;
}

export function StaffManagementToolbar({
  searchQuery,
  onSearchChange,
  staffsCount,
  invitationsCount,
  onInviteStaff
}: StaffManagementToolbarProps) {
  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0'>
      <div className='flex flex-wrap items-center gap-2.5 flex-1'>
        <div className='relative w-full sm:w-72'>
          <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Cari nama atau email staf...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-8 h-9 text-xs'
          />
        </div>

        <TabsList className='grid grid-cols-2 h-9'>
          <TabsTrigger value='members' className='text-xs gap-1.5 px-3'>
            <Icons.users className='h-3.5 w-3.5' />
            Staf ({staffsCount})
          </TabsTrigger>
          <TabsTrigger value='invitations' className='text-xs gap-1.5 px-3'>
            <Icons.mail className='h-3.5 w-3.5' />
            Undangan ({invitationsCount})
          </TabsTrigger>
        </TabsList>
      </div>

      <div className='flex items-center gap-2 shrink-0 justify-end'>
        <Button onClick={onInviteStaff} size='sm' className='h-9 gap-1.5'>
          <Icons.userPlus className='h-4 w-4' />
          Undang Staf
        </Button>
      </div>
    </div>
  );
}
