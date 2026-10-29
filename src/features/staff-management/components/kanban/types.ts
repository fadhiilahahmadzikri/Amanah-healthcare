import type { StaffMember } from '../../api/staff-management.api';
import type { StaffType, StaffRoleCode } from '../../constants/staff.constants';

export interface StaffKanbanColumnDef {
  id: StaffType;
  title: string;
  roleCode: StaffRoleCode;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export interface StaffKanbanBoardProps {
  staffs: StaffMember[];
  onOpenRoster?: (staff: StaffMember) => void;
  onOpenDetail?: (staff: StaffMember) => void;
  selectedStaffId?: string | null;
  className?: string;
}

export interface StaffKanbanColumnProps {
  column: StaffKanbanColumnDef;
  staffs: StaffMember[];
  onOpenRoster?: (staff: StaffMember) => void;
  onOpenDetail?: (staff: StaffMember) => void;
  selectedStaffId?: string | null;
  className?: string;
}
