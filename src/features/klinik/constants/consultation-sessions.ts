import { Icons } from '@/components/icons';

export interface ConsultationSessionItem {
  id: string;
  label: string;
  timeRange: string;
  value: string;
  desc?: string;
  icon?: typeof Icons.sun;
}

export function getSessionIcon(sessionName?: string): typeof Icons.sun {
  const norm = (sessionName || '').toLowerCase();
  if (norm.includes('pagi') || norm.includes('morning')) return Icons.sun;
  if (norm.includes('dini') || norm.includes('early')) return Icons.moon;
  if (norm.includes('malam') || norm.includes('night')) return Icons.moon;
  return Icons.clock;
}
