import { Icons } from '@/components/icons';

export interface ConsultationSessionItem {
  id: string;
  label: string;
  timeRange: string;
  value: string;
  desc?: string;
  icon?: typeof Icons.clock;
}

export function getSessionIcon(_sessionName?: string): typeof Icons.clock {
  return Icons.clock;
}
