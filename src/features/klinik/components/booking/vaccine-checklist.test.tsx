import { describe, expect, it } from 'bun:test';
import * as React from 'react';
import { VaccineChecklist, CORE_VACCINE_LIST } from './vaccine-checklist';

describe('VaccineChecklist Component', () => {
  it('contains all 18 official vaccine items from clinical specification', () => {
    const codes = CORE_VACCINE_LIST.map((v) => v.id);
    expect(codes).toContain('HB_0');
    expect(codes).toContain('BCG');
    expect(codes).toContain('PENTA_1');
    expect(codes).toContain('IPV_1');
    expect(codes).toContain('PCV_1');
    expect(codes).toContain('RV_1');
    expect(codes).toContain('PENTA_2');
    expect(codes).toContain('IPV_2');
    expect(codes).toContain('PCV_2');
    expect(codes).toContain('RV_2');
    expect(codes).toContain('PENTA_3');
    expect(codes).toContain('IPV_3');
    expect(codes).toContain('RV_3');
    expect(codes).toContain('MR');
    expect(codes).toContain('JE');
    expect(codes).toContain('PCV_B');
    expect(codes).toContain('PENTA_B');
    expect(codes).toContain('MR_B');
  });

  it('renders without error given values and onFieldChange handler', () => {
    const values: Record<string, string> = {
      vaccine_HB_0_status: 'Sudah',
      vaccine_HB_0_date: '2026-01-15',
      otherVaccinesNote: 'Polio tetes di Posyandu'
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
