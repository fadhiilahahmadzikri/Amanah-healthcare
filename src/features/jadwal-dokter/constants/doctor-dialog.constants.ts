/**
 * Registry of all modal, drawer, and wizard dialog types for the doctor schedule domain.
 * Plug-and-play architecture: any new dialog/modal is registered here as a single source of truth.
 */
export const DOCTOR_DIALOG_TYPE = {
  NONE: 'none',
  DETAIL_SHEET: 'detail',
  EDIT: 'edit'
} as const;

export type DoctorDialogType = (typeof DOCTOR_DIALOG_TYPE)[keyof typeof DOCTOR_DIALOG_TYPE];

export const DOCTOR_DETAIL_TAB = {
  SESI: 'sesi'
} as const;

export type DoctorDetailTab = (typeof DOCTOR_DETAIL_TAB)[keyof typeof DOCTOR_DETAIL_TAB];
