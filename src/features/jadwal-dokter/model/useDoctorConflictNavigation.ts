'use client';

import { create } from 'zustand';
import type { DoctorDailySession } from '../api/types';

export type ConflictWizardType = 'add' | 'reschedule';
export type ConflictWizardStep = 'date' | 'room' | 'slot' | 'confirmation' | 'note';

export interface DoctorConflictReturnContext {
  sourceDoctorId: string;
  sourceDoctorName: string;
  sourceDate?: string;
  sourceSlotStartTime?: string;
  sourceSlotEndTime?: string;
  sourceSession?: DoctorDailySession | null;
  sourceSessionId?: string;
  sourceRoomId?: string;
  wizardType: ConflictWizardType;
  initialStep?: ConflictWizardStep;
}

export type ConflictNavigationPhase = 'idle' | 'inspecting' | 'returning';

export interface DoctorConflictNavigationState {
  phase: ConflictNavigationPhase;
  returnContext: DoctorConflictReturnContext | null;
  highlightSlotTime: string | null;
  pendingReopen: DoctorConflictReturnContext | null;
  isInspecting: boolean;

  inspectConflictDoctor: (params: {
    occupantDoctorId: string;
    targetSlotTime?: string;
    context: DoctorConflictReturnContext;
    onNavigate?: (occupantDoctorId: string, slotTime?: string) => void;
  }) => void;

  returnToSourceWizard: (params?: {
    onNavigateBack?: (sourceDoctorId: string) => void;
  }) => void;

  consumePendingReopen: (
    currentDoctorId?: string,
    secondaryId?: string
  ) => DoctorConflictReturnContext | null;
  clearConflictNavigation: () => void;
  setHighlightSlotTime: (time: string | null) => void;
}

export const useDoctorConflictNavigation = create<DoctorConflictNavigationState>((set, get) => ({
  phase: 'idle',
  returnContext: null,
  highlightSlotTime: null,
  pendingReopen: null,
  isInspecting: false,

  inspectConflictDoctor: ({ occupantDoctorId, targetSlotTime, context, onNavigate }) => {
    set({
      phase: 'inspecting',
      isInspecting: true,
      returnContext: context,
      highlightSlotTime: targetSlotTime ?? null,
      pendingReopen: null
    });
    onNavigate?.(occupantDoctorId, targetSlotTime);
  },

  returnToSourceWizard: (params) => {
    const { returnContext } = get();
    if (!returnContext) return;

    const sourceDoctorId = returnContext.sourceDoctorId;
    const reopenPayload: DoctorConflictReturnContext = {
      ...returnContext,
      initialStep: returnContext.initialStep || 'room'
    };

    set({
      phase: 'returning',
      isInspecting: false,
      pendingReopen: reopenPayload,
      highlightSlotTime: null
    });

    params?.onNavigateBack?.(sourceDoctorId);
  },

  consumePendingReopen: (currentDoctorId?: string, secondaryId?: string) => {
    const { pendingReopen } = get();
    if (!pendingReopen) return null;

    if (currentDoctorId) {
      const match =
        pendingReopen.sourceDoctorId === currentDoctorId ||
        (secondaryId && pendingReopen.sourceDoctorId === secondaryId);
      if (!match) return null;
    }

    set({
      phase: 'idle',
      isInspecting: false,
      returnContext: null,
      pendingReopen: null
    });

    return pendingReopen;
  },

  clearConflictNavigation: () => {
    set({
      phase: 'idle',
      isInspecting: false,
      returnContext: null,
      highlightSlotTime: null,
      pendingReopen: null
    });
  },

  setHighlightSlotTime: (time) => {
    set({ highlightSlotTime: time });
  }
}));
