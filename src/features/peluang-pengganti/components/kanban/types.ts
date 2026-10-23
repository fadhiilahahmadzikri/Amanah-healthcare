import type { ReplacementOpportunityItem } from '../../api/types';
import type { ReplacementStatus } from '../../constants/replacement.constants';

export type KanbanColumnId = ReplacementStatus;

export interface KanbanColumnDef {
  id: KanbanColumnId;
  title: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  acceptsDrop: boolean;
  canDragItems: boolean;
}

export interface DateReplacementGroup {
  dateKey: string;
  dateLabel: string;
  items: ReplacementOpportunityItem[];
}

export interface ActiveDragState {
  opportunity: ReplacementOpportunityItem;
  sourceColumnId: KanbanColumnId;
  currentColumnId: KanbanColumnId | null;
  width: number;
  height: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}
