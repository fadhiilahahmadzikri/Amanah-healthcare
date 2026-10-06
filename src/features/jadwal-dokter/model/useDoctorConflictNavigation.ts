'use client';

import { create } from 'zustand';
import type { DoctorDailySession } from '../api/types';
import {
  DOCTOR_DIALOG_TYPE,
  type DoctorDialogType,
  WIZARD_STEP,
  type WizardStep,
  INSPECTION_PHASE,
  type InspectionPhase
} from '../constants/doctor-dialog.constants';

export type ConflictWizardType = DoctorDialogType | 'add' | 'reschedule';
export type ConflictWizardStep = WizardStep;

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

export type ReturnDoctorContext = DoctorConflictReturnContext;

export type ConflictNavigationPhase = InspectionPhase;

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

  returnToSourceWizard: (params?: { onNavigateBack?: (sourceDoctorId: string) => void }) => void;

  consumePendingReopen: (
    currentDoctorId?: string,
    secondaryId?: string
  ) => DoctorConflictReturnContext | null;
  clearConflictNavigation: () => void;
  setHighlightSlotTime: (time: string | null) => void;
}

export const useDoctorConflictNavigation = create<DoctorConflictNavigationState>((set, get) => ({
  phase: INSPECTION_PHASE.IDLE,
  returnContext: null,
  highlightSlotTime: null,
  pendingReopen: null,
  isInspecting: false,

  inspectConflictDoctor: ({ occupantDoctorId, targetSlotTime, context, onNavigate }) => {
    set({
      phase: INSPECTION_PHASE.INSPECTING,
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
      initialStep: returnContext.initialStep || WIZARD_STEP.ROOM
    };

    set({
      phase: INSPECTION_PHASE.RETURNING,
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
      phase: INSPECTION_PHASE.IDLE,
      isInspecting: false,
      returnContext: null,
      pendingReopen: null
    });

    return pendingReopen;
  },

  clearConflictNavigation: () => {
    set({
      phase: INSPECTION_PHASE.IDLE,
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
