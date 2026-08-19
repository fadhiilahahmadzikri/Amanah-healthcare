import type { Order, Product } from '@/constants/mock-db';
import type { OnboardingData, TrackerData } from '@/features/shipping/api/types';

export type BusinessMetrics = {
  balance: number;
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  lowStockCount: number;
  activeShipments: number;
  reportTotals: {
    averageOrderValue: number;
    inventoryValue: number;
    shippingValue: number;
  };
};

export function buildBusinessMetrics({
  orders,
  products,
  balance,
  shippingRecords = [],
  trackerRecords = []
}: {
  orders: Order[];
  products: Product[];
  balance: number;
  shippingRecords?: OnboardingData[];
  trackerRecords?: TrackerData[];
}): BusinessMetrics {
  const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const completedOrders = orders.filter((order) =>
    ['COMPLETED', 'DELIVERED', 'SHIPPED'].includes(order.status)
  ).length;
  const pendingOrders = orders.filter((order) => order.status === 'PENDING').length;
  const cancelledOrders = orders.filter((order) => order.status === 'CANCELLED').length;
  const inventoryValue = products.reduce(
    (total, product) => total + product.currentStock * product.cost,
    0
  );
  const shippingValue = shippingRecords.reduce(
    (total, record) => total + parseCurrency(record.price),
    0
  );

  return {
    balance,
    revenue,
    totalOrders: orders.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    fulfillmentRate: orders.length ? (completedOrders / orders.length) * 100 : 0,
    lowStockCount: products.filter((product) => product.currentStock <= product.minStock).length,
    activeShipments:
      shippingRecords.filter((record) => record.status === 'Shipping').length +
      trackerRecords.filter((record) => (record.progress ?? 0) < 1).length,
    reportTotals: {
      averageOrderValue: orders.length ? revenue / orders.length : 0,
      inventoryValue,
      shippingValue
    }
  };
}

function parseCurrency(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
