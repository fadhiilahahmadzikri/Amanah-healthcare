import { create } from 'zustand';

interface OrderActivityStore {
  unreadOrderCount: number;
  incrementUnreadOrders: (count?: number) => void;
  clearUnreadOrders: () => void;
}

export const useOrderActivityStore = create<OrderActivityStore>((set) => ({
  unreadOrderCount: 0,
  incrementUnreadOrders: (count = 1) =>
    set((state) => ({ unreadOrderCount: state.unreadOrderCount + count })),
  clearUnreadOrders: () => set({ unreadOrderCount: 0 })
}));
