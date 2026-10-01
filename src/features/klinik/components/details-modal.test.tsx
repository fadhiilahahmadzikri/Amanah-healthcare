import { describe, expect, it } from 'bun:test';
import { DetailsModal } from './details-modal';
import { MedicalIntakeSummary } from './medical-intake-summary';

describe('DetailsModal & MedicalIntakeSummary', () => {
  it('exports DetailsModal and MedicalIntakeSummary component functions', () => {
    expect(typeof DetailsModal).toBe('function');
    expect(typeof MedicalIntakeSummary).toBe('function');
  });
});
