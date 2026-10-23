import type { LeaveRequestItem } from '../../api/types';

export type KanbanColumnId = 'pending' | 'approved' | 'rejected' | 'cancelled';

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

export interface UserLeaveGroup {
  staffId: string;
  staffName: string;
  staffRole?: string;
  avatarUrl?: string | null;
  items: LeaveRequestItem[];
}

export interface ActiveDragState {
  leave: LeaveRequestItem;
  sourceColumnId: KanbanColumnId;
  currentColumnId: KanbanColumnId | null;
  width: number;
  height: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}
