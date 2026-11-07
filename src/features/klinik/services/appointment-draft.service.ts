export interface NewPatientDraftData {
  relationship: string;
  fullName: string;
  nik: string;
  motherName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  knowsBloodType: boolean | null;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  emergencyContactPatientId: string;
  region: {
    line1: string;
    provinceName?: string;
    provinceCode?: string;
    regencyName?: string;
    regencyCode?: string;
    districtName?: string;
    districtCode?: string;
    villageName?: string;
    villageCode?: string;
  };
  occupationCode: string;
}

export interface BookingFormDraft {
  userId: string;
  step: string;
  selectedPoliId: string | null;
  selectedCategoryId: string | null;
  selectedService: any | null;
  selectedPatientId: string | null;
  dateStr: string;
  session: any | null;
  selectedSessionId: string | null;
  sessionLabel?: string;
  visitType: string;
  complaint: string;
  activeMedicalFlow: string | null;
  medicalValues?: Record<string, string>;
  medicalStep?: number;
  historyCounts?: { pregnancy: number; contraception: number };
  newPatientStep?: number;
  newPatientData?: Partial<NewPatientDraftData> | null;
  updatedAt: number;
}

export interface InspectorFormDraft {
  appointmentId: string;
  formData: Record<string, any>;
  immunizationFormData: Record<string, any>;
  regularFormData: Record<string, any>;
  updatedAt: number;
}

const DRAFT_BOOKING_PREFIX = 'amanah_draft_booking_';
const DRAFT_INSPECTOR_PREFIX = 'amanah_draft_inspector_';
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const appointmentDraftService = {
  saveBookingDraft(userId: string, data: Partial<BookingFormDraft>): void {
    if (typeof window === 'undefined' || !userId) return;
    try {
      const existing: Partial<BookingFormDraft> = this.getBookingDraft(userId) || {};
      const draft: BookingFormDraft = {
        userId,
        step: data.step ?? existing.step ?? 'poli',
        selectedPoliId: data.selectedPoliId ?? existing.selectedPoliId ?? null,
        selectedCategoryId: data.selectedCategoryId ?? existing.selectedCategoryId ?? null,
        selectedService: data.selectedService ?? existing.selectedService ?? null,
        selectedPatientId: data.selectedPatientId ?? existing.selectedPatientId ?? null,
        dateStr: data.dateStr ?? existing.dateStr ?? '',
        session: data.session ?? existing.session ?? null,
        selectedSessionId: data.selectedSessionId ?? existing.selectedSessionId ?? null,
        sessionLabel: data.sessionLabel ?? existing.sessionLabel ?? '',
        visitType: data.visitType ?? existing.visitType ?? '',
        complaint: data.complaint ?? existing.complaint ?? '',
        activeMedicalFlow: data.activeMedicalFlow ?? existing.activeMedicalFlow ?? null,
        medicalValues: data.medicalValues ?? existing.medicalValues,
        medicalStep: data.medicalStep ?? existing.medicalStep,
        historyCounts: data.historyCounts ?? existing.historyCounts,
        newPatientStep: data.newPatientStep ?? existing.newPatientStep,
        newPatientData: data.newPatientData !== undefined ? data.newPatientData : existing.newPatientData,
        updatedAt: Date.now()
      };
      localStorage.setItem(`${DRAFT_BOOKING_PREFIX}${userId}`, JSON.stringify(draft));
    } catch {
      // Ignore quota exceeded or storage disabled
    }
  },

  getBookingDraft(userId: string): BookingFormDraft | null {
    if (typeof window === 'undefined' || !userId) return null;
    try {
      const raw = localStorage.getItem(`${DRAFT_BOOKING_PREFIX}${userId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BookingFormDraft;
      if (Date.now() - parsed.updatedAt > DRAFT_MAX_AGE_MS) {
        this.clearBookingDraft(userId);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  clearBookingDraft(userId: string): void {
    if (typeof window === 'undefined' || !userId) return;
    try {
      localStorage.removeItem(`${DRAFT_BOOKING_PREFIX}${userId}`);
    } catch {
      // Ignore storage errors
    }
  },

  hasBookingDraft(userId: string): boolean {
    return Boolean(this.getBookingDraft(userId));
  },

  saveInspectorDraft(appointmentId: string, data: Partial<InspectorFormDraft>): void {
    if (typeof window === 'undefined' || !appointmentId) return;
    try {
      const draft: InspectorFormDraft = {
        appointmentId,
        formData: data.formData ?? {},
        immunizationFormData: data.immunizationFormData ?? {},
        regularFormData: data.regularFormData ?? {},
        updatedAt: Date.now()
      };
      localStorage.setItem(`${DRAFT_INSPECTOR_PREFIX}${appointmentId}`, JSON.stringify(draft));
    } catch {
      // Ignore quota exceeded
    }
  },

  getInspectorDraft(appointmentId: string): InspectorFormDraft | null {
    if (typeof window === 'undefined' || !appointmentId) return null;
    try {
      const raw = localStorage.getItem(`${DRAFT_INSPECTOR_PREFIX}${appointmentId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as InspectorFormDraft;
      if (Date.now() - parsed.updatedAt > DRAFT_MAX_AGE_MS) {
        this.clearInspectorDraft(appointmentId);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  clearInspectorDraft(appointmentId: string): void {
    if (typeof window === 'undefined' || !appointmentId) return;
    try {
      localStorage.removeItem(`${DRAFT_INSPECTOR_PREFIX}${appointmentId}`);
    } catch {
      // Ignore
    }
  },

  hasInspectorDraft(appointmentId: string): boolean {
    return Boolean(this.getInspectorDraft(appointmentId));
  }
};
