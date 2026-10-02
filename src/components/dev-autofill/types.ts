export interface AutofillSchedule {
  dateStr: string;
  timeSlot: string;
}

export interface AutofillPayload {
  flow: string;
  values: Record<string, string>;
  schedule?: AutofillSchedule;
  step?: number;
}

export interface AutofillDefinition {
  id: string;
  name: string;
  flow: string;
  detect: () => boolean;
  fillFull: () => boolean;
  fillCurrentStep: () => boolean;
  clear: () => void;
}
