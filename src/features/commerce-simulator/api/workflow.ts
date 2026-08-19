import { mockDb, type Order, type OrderItem } from '@/constants/mock-db';
import { useOrderStore } from '@/features/orders/store/order-store';
import { useSimulatorCounterStore } from '@/features/simulator/store';
import { generateInvoiceForOrder } from '@/features/invoices/api/service';
import { fakeShipping } from '@/constants/mock-shipping';
import { enrichOrderPresentationData } from '@/features/orders/lib/order-origin';
import { useBalanceStore } from '../store/balance-store';

export type SimulationStage =
  | 'created'
  | 'invoiced'
  | 'shipment_prepared'
  | 'tracking'
  | 'completed'
  | 'balanced';

export type SimulationWorkflow = {
  order: Order;
  invoiceNumber: string;
  shipmentId: string;
  routeProgress: number;
  currentStage: SimulationStage;
  timestamps: Partial<Record<SimulationStage, string>>;
  financialResult: {
    revenue: number;
    balanceApplied: number;
  };
};

export async function runSimulationWorkflow(): Promise<SimulationWorkflow | null> {
  const order = createOrderCommand();

  if (!order) {
    return null;
  }

  const timestamps: SimulationWorkflow['timestamps'] = {
    created: new Date().toISOString()
  };
  const invoice = generateInvoiceCommand(order);
  timestamps.invoiced = new Date().toISOString();
  const shipment = await prepareShipmentCommand(order);
  timestamps.shipment_prepared = new Date().toISOString();
  const routeProgress = advanceTrackingCommand(shipment.id);
  timestamps.tracking = new Date().toISOString();
  completeWorkflowCommand(order.id);
  timestamps.completed = new Date().toISOString();
  const balanceApplied = applyBalanceCommand(order);
  timestamps.balanced = new Date().toISOString();

  return {
    order,
    invoiceNumber: invoice.invoiceNumber,
    shipmentId: shipment.id,
    routeProgress,
    currentStage: 'balanced',
    timestamps,
    financialResult: {
      revenue: order.totalAmount,
      balanceApplied
    }
  };
}

export function createOrderCommand(): Order | null {
  const products = mockDb.products.filter((product) => product.status !== 'Archived');
  const customers = mockDb.customers;

  if (products.length === 0 || customers.length === 0) {
    return null;
  }

  const customer = customers[Math.floor(Math.random() * customers.length)];
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items: OrderItem[] = [];
  let totalAmount = 0;

  for (let index = 0; index < itemCount; index += 1) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const subtotal = product.price * quantity;

    items.push({
      id: crypto.randomUUID(),
      productId: product.id,
      quantity,
      unitPrice: product.price,
      subtotal
    });
    totalAmount += subtotal;
  }

  const paymentMethods = ['CREDIT_CARD', 'CASH_ON_DELIVERY'] as const;
  const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  const order: Order = enrichOrderPresentationData({
    id: crypto.randomUUID(),
    orderNumber: useSimulatorCounterStore.getState().getNextOrderNumber(),
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    customerAvatarUrl: customer.avatarUrl,
    totalAmount: Number(totalAmount.toFixed(2)),
    paymentMethod,
    paymentStatus: paymentMethod === 'CREDIT_CARD' ? 'PAID' : 'PENDING',
    status: 'PENDING',
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useOrderStore.getState().addOrder(order);
  return order;
}

export function generateInvoiceCommand(order: Order) {
  return generateInvoiceForOrder(order);
}

export async function prepareShipmentCommand(order: Order) {
  const record = await fakeShipping.createOnboardingData({
    customer: order.customerName,
    product: order.items.map((item) => item.productId).join(', '),
    orderId: order.orderNumber,
    address: order.customerAddress ?? 'Address pending confirmation',
    price: `$${order.totalAmount.toFixed(2)}`,
    status: 'Packed'
  });

  return record;
}

export function advanceTrackingCommand(shipmentId?: string) {
  return fakeShipping.advanceTrackingProgress(shipmentId);
}

export function completeWorkflowCommand(orderId: string) {
  // Deliberately removed auto-shipping so users can progress status manually
}

export function applyBalanceCommand(order: Order) {
  if (order.paymentStatus !== 'PAID') {
    return 0;
  }

  useBalanceStore.getState().applyBalance(order.id, order.totalAmount);
  return order.totalAmount;
}
