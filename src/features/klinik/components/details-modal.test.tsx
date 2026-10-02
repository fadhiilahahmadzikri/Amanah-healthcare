import { describe, expect, it, mock } from 'bun:test';

mock.module('server-only', () => ({}));

const { DetailsModal } = await import('./details-modal');
const { MedicalIntakeSummary } = await import('./medical-intake-summary');
const { AppointmentFormInspector } = await import('./appointment-form-inspector');

describe('DetailsModal & MedicalIntakeSummary', () => {
  it('exports DetailsModal, MedicalIntakeSummary and AppointmentFormInspector component functions', () => {
    expect(typeof DetailsModal).toBe('function');
    expect(typeof MedicalIntakeSummary).toBe('function');
    expect(typeof AppointmentFormInspector).toBe('function');
  });
});
