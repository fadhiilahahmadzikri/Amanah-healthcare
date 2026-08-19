import { create } from 'zustand';

interface SimulatorCounterState {
  orderCount: number;
  getNextOrderNumber: () => string;
}

export const useSimulatorCounterStore = create<SimulatorCounterState>((set, get) => ({
  orderCount: 100,
  getNextOrderNumber: () => {
    const current = get().orderCount + 1;
    set({ orderCount: current });
    return `ORD-${String(current).padStart(3, '0')}`;
  }
}));
