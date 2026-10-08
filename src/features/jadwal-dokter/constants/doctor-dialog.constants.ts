/**
 * Registry of all modal, drawer, and wizard dialog types for the doctor schedule domain.
 * Plug-and-play architecture: any new dialog/modal is registered here as a single source of truth.
 */
export const DOCTOR_DIALOG_TYPE = {
  NONE: 'none',
  DETAIL_SHEET: 'detail',
  WIZARD_RESCHEDULE: 'reschedule',
  WIZARD_ADD_SESSION: 'add_session',
  EDIT: 'edit'
} as const;

export type DoctorDialogType = (typeof DOCTOR_DIALOG_TYPE)[keyof typeof DOCTOR_DIALOG_TYPE];

export const WIZARD_STEP = {
  DATE: 'date',
  ROOM: 'room',
  SESSION: 'session',
  SLOT: 'slot',
  NOTE: 'note',
  CONFIRMATION: 'confirmation'
} as const;

export type WizardStep = (typeof WIZARD_STEP)[keyof typeof WIZARD_STEP];

export const INSPECTION_PHASE = {
  IDLE: 'idle',
  INSPECTING: 'inspecting',
  RETURNING: 'returning'
} as const;

export type InspectionPhase = (typeof INSPECTION_PHASE)[keyof typeof INSPECTION_PHASE];
