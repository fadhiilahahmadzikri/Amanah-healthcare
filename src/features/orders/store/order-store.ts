import { create } from 'zustand';
import { mockDb, Order, OrderStatus } from '@/constants/mock-db';
import { enrichOrderPresentationData } from '../lib/order-origin';
import { useOrderActivityStore } from './order-activity-store';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrders: () => Order[];
}

const initialOrders = mockDb.orders.map(enrichOrderPresentationData);

mockDb.orders = initialOrders;

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: initialOrders,
  addOrder: (order) => {
    const enrichedOrder = enrichOrderPresentationData(order);

    set((state) => {
      const newOrders = [...state.orders, enrichedOrder];

      mockDb.orders.push(enrichedOrder);
      return { orders: newOrders };
    });
    useOrderActivityStore.getState().incrementUnreadOrders();
  },
  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const newOrders = state.orders.map((order) => {
        if (order.id === orderId) {
          if (
            (status === 'COMPLETED' || status === 'SHIPPED') &&
            order.status !== 'COMPLETED' &&
            order.status !== 'SHIPPED'
          ) {
            order.items.forEach((item) => {
              const product = mockDb.products.find((p) => p.id === item.productId);
              if (product) {
                product.currentStock = Math.max(0, product.currentStock - item.quantity);
              }
            });
          }
          return { ...order, status, updatedAt: new Date().toISOString() };
        }
        return order;
      });

      mockDb.orders = newOrders;
      return { orders: newOrders };
    });
  },
  getOrders: () => get().orders
}));
