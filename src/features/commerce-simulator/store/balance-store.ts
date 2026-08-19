'use client';

import { create } from 'zustand';

type BalanceStore = {
  balance: number;
  appliedOrderIds: string[];
  applyBalance: (orderId: string, amount: number) => void;
};

export const useBalanceStore = create<BalanceStore>((set) => ({
  balance: 0,
  appliedOrderIds: [],
  applyBalance: (orderId, amount) =>
    set((state) => {
      if (state.appliedOrderIds.includes(orderId)) {
        return state;
      }

      return {
        balance: Number((state.balance + amount).toFixed(2)),
        appliedOrderIds: [...state.appliedOrderIds, orderId]
      };
    })
}));
