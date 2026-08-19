import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SimulationState {
  isSimulationEnabled: boolean;
  timeInterval: number;
  transactionVolume: number;
  isNotificationSoundEnabled: boolean;

  toggleSimulation: (enabled: boolean) => void;
  setTimeInterval: (interval: number) => void;
  setTransactionVolume: (volume: number) => void;
  toggleNotificationSound: (enabled: boolean) => void;
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      isSimulationEnabled: false,
      timeInterval: 5000,
      transactionVolume: 1,
      isNotificationSoundEnabled: true,

      toggleSimulation: (enabled) => set({ isSimulationEnabled: enabled }),
      setTimeInterval: (interval) => set({ timeInterval: interval }),
      setTransactionVolume: (volume) => set({ transactionVolume: volume }),
      toggleNotificationSound: (enabled) => set({ isNotificationSoundEnabled: enabled })
    }),
    {
      name: 'simulation-settings'
    }
  )
);
