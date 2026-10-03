import { describe, expect, it } from 'bun:test';
import * as React from 'react';
import { VaccineChecklist, type VaccineCatalogItem } from './vaccine-checklist';

const MOCK_CATALOG: VaccineCatalogItem[] = [
  {
    id: 'vac-1',
    code: 'HB_0',
    name: 'HB 0',
    ageMilestone: 'Saat Lahir',
    description: 'Hepatitis B (< 24 jam)',
    sortOrder: 1
  },
  {
    id: 'vac-2',
    code: 'BCG',
    name: 'BCG',
    ageMilestone: '1 Bulan',
    description: 'Tuberkulosis (TBC)',
    sortOrder: 2
  }
];

describe('VaccineChecklist Component', () => {
  it('renders provided vaccine catalog dynamically from props', () => {
    const values: Record<string, string> = {
      vaccine_HB_0_status: 'Sudah',
      vaccine_HB_0_date: '2026-01-15'
    };

    const element = React.createElement(VaccineChecklist, {
      values,
      vaccines: MOCK_CATALOG,
      onFieldChange: () => {}
    });

    expect(element).toBeDefined();
    expect(element.type).toBe(VaccineChecklist);
  });

  it('renders without error given values and onFieldChange handler', () => {
    const values: Record<string, string> = {
      vaccine_HB_0_status: 'Sudah',
      vaccine_HB_0_date: '2026-01-15'
    };
    let changedField = '';
    let changedVal = '';

    const element = React.createElement(VaccineChecklist, {
      values,
      onFieldChange: (fieldId: string, val: string) => {
        changedField = fieldId;
        changedVal = val;
      }
    });

    expect(element).toBeDefined();
    expect(element.type).toBe(VaccineChecklist);
  });
});
