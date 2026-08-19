'use client';

import { useSimulationStore } from '@/features/settings/store';
import { useSimulator } from '../use-simulator';

export function SimulatorRunner() {
  const { isSimulationEnabled, timeInterval, transactionVolume, isNotificationSoundEnabled } =
    useSimulationStore();

  useSimulator({
    enabled: isSimulationEnabled,
    intervalMs: timeInterval,
    volume: transactionVolume,
    soundEnabled: isNotificationSoundEnabled
  });

  return null;
}
