import type { ReplacementStatus } from '../constants/replacement.constants';

export interface ReplacementOpportunityItem {
  id: string;
  leaveRequestId: string;
  sessionId: string;
  sessionCode?: string;
  sessionLabel?: string;
  startTime?: string | null;
  endTime?: string | null;
  workDate: string;
  originalStaffProfileId: string;
  originalPractitionerId?: string | null;
  originalStaffName?: string;
  originalStaffRole?: string | null;
  originalStaffAvatarUrl?: string | null;
  leaveReason?: string | null;
  claimedByStaffProfileId?: string | null;
  claimedByPractitionerId?: string | null;
  claimedByName?: string | null;
  claimedByRole?: string | null;
  claimedByAvatarUrl?: string | null;
  status: ReplacementStatus;
  claimedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ReplacementFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AssignReplacementPayload {
  staffProfileId: string;
  practitionerId?: string;
  notes?: string;
}

export interface CancelReplacementPayload {
  reason?: string;
}
