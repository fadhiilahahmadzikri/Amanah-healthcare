import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { useRecordNavigation } from '@/hooks/use-record-navigation';
import { useOrderStore } from '../../store/order-store';
import { OrderDetailsModal } from '../order-details-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Order } from '@/constants/mock-db';
import { toast } from 'sonner';

interface CellActionProps {
  data: Order;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const navigateToOrder = useRecordNavigation('/dashboard/orders');
  const { updateOrderStatus } = useOrderStore();

  const handleCancel = () => {
    updateOrderStatus(data.id, 'CANCELLED');
    toast.success('Order cancelled successfully.');
    setOpenCancel(false);
  };

  return (
    <>
      <AlertModal
        isOpen={openCancel}
        onClose={() => setOpenCancel(false)}
        onConfirm={handleCancel}
        loading={false}
      />

      {openDetail && (
        <OrderDetailsModal order={data} isOpen={openDetail} onClose={() => setOpenDetail(false)} />
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigateToOrder(data)}>
            <Icons.search className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          {data.status !== 'CANCELLED' &&
            data.status !== 'COMPLETED' &&
            data.status !== 'DELIVERED' && (
              <DropdownMenuItem onClick={() => setOpenCancel(true)} className='text-red-600'>
                <Icons.close className='mr-2 h-4 w-4' /> Cancel Order
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
