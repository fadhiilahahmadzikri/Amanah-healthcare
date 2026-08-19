import { Order, OrderStatus, mockDb } from '@/constants/mock-db';
import { useOrderStore } from '../store/order-store';
import { useInfobar } from '@/components/ui/infobar';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { createInvoiceDocumentFromOrder } from '@/features/invoices/api/service';
import { InvoiceGenerationPanel } from '@/features/invoices/components/generation/invoice-generation-panel';
import { ShippingLabelSheet } from '@/features/shipping/labels/shipping-label-sheet';
import type { OnboardingData } from '@/features/shipping/api/types';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}
const getNextStatus = (current: OrderStatus): OrderStatus | null => {
  switch (current) {
    case 'PENDING':
      return 'PROCESSING';
    case 'PROCESSING':
      return 'READY_TO_SHIP';
    case 'READY_TO_SHIP':
      return 'SHIPPED';
    case 'SHIPPED':
      return 'DELIVERED';
    case 'DELIVERED':
      return 'COMPLETED';
    default:
      return null;
  }
};

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const { updateOrderStatus } = useOrderStore();
  const { setContent, setOpen } = useInfobar();
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const nextStatus = getNextStatus(order.status);
  const invoiceDocument = useMemo(() => createInvoiceDocumentFromOrder(order), [order]);
  const shippingRecord = useMemo<OnboardingData>(
    () => ({
      id: order.id,
      customer: order.customerName,
      product:
        order.items
          .map((item) => mockDb.products.find((product) => product.id === item.productId)?.name)
          .filter(Boolean)
          .join(', ') || 'Mixed items',
      orderId: order.orderNumber,
      address: order.customerAddress || 'No address provided',
      price: `$${order.totalAmount.toFixed(2)}`,
      status:
        order.status === 'COMPLETED' || order.status === 'DELIVERED'
          ? 'Completed'
          : order.status === 'SHIPPED'
            ? 'Shipping'
            : 'Packed',
      image: order.customerAvatarUrl ?? '',
      startCoord: [-6.2088, 106.8456],
      endCoord: [-6.24, 106.82]
    }),
    [order]
  );

  return (
    <>
      <ShippingLabelSheet
        open={isLabelOpen}
        onOpenChange={setIsLabelOpen}
        record={shippingRecord}
      />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent aria-describedby={undefined} className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>Order Details {order.orderNumber}</span>
              <Badge variant='outline'>{order.status.replace(/_/g, ' ')}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-4 py-4'>
            <div>
              <h4 className='font-medium text-sm text-muted-foreground mb-1'>Customer</h4>
              <p className='font-medium'>{order.customerName}</p>
              <p className='text-sm'>{order.customerPhone}</p>
              <p className='text-sm'>{order.customerAddress}</p>
            </div>
            <div>
              <h4 className='font-medium text-sm text-muted-foreground mb-1'>Payment & Tracking</h4>
              <p className='text-sm'>Method: {order.paymentMethod}</p>
              <p className='text-sm'>Status: {order.paymentStatus}</p>
              <p className='text-sm mt-2'>Tracking: {order.trackingNumber || 'Not available'}</p>
            </div>
          </div>

          <Separator />

          <div className='py-4'>
            <h4 className='font-medium text-sm text-muted-foreground mb-2'>Order Items</h4>
            <div className='space-y-2'>
              {order.items.map((item) => (
                <div key={item.id} className='flex justify-between items-center text-sm'>
                  <span>
                    {mockDb.products.find((p) => p.id === item.productId)?.name ?? item.productId} x{' '}
                    {item.quantity}
                  </span>
                  <span className='font-medium'>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className='flex justify-between items-center mt-4 pt-4 border-t font-bold'>
              <span>Total Amount</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className='flex flex-wrap sm:justify-between items-center mt-6 gap-2'>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setContent({
                    title: `Invoice ${invoiceDocument.invoiceNumber}`,
                    children: <InvoiceGenerationPanel invoice={invoiceDocument} />
                  });
                  setOpen(true);
                  onClose();
                }}
              >
                <Icons.fileTypeDoc className='mr-2 h-4 w-4' />
                Generate Invoice
              </Button>
              <Button variant='outline' onClick={() => setIsLabelOpen(true)}>
                <Icons.media className='mr-2 h-4 w-4' />
                Generate Resi
              </Button>
            </div>

            <div className='flex gap-2'>
              {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                <Button variant='destructive' onClick={() => handleStatusChange('CANCELLED')}>
                  Cancel
                </Button>
              )}
              {nextStatus && (
                <Button onClick={() => handleStatusChange(nextStatus)}>
                  Mark as {nextStatus.replace(/_/g, ' ')}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
