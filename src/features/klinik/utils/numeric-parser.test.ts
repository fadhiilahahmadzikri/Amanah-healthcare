import { describe, expect, it } from 'bun:test';
import { parsePureInteger, parsePureNumeric } from './numeric-parser';

describe('parsePureNumeric', () => {
  it('handles numeric numbers directly', () => {
    expect(parsePureNumeric(23)).toBe(23);
    expect(parsePureNumeric(160.5)).toBe(160.5);
    expect(parsePureNumeric(0)).toBe(0);
    expect(parsePureNumeric(NaN)).toBeNull();
    expect(parsePureNumeric(Infinity)).toBeNull();
  });

  it('parses numeric string values without units', () => {
    expect(parsePureNumeric('23')).toBe(23);
    expect(parsePureNumeric('160.5')).toBe(160.5);
    expect(parsePureNumeric('  54.2  ')).toBe(54.2);
  });

  it('strips unit suffixes without fragile regex', () => {
    expect(parsePureNumeric('23 KG')).toBe(23);
    expect(parsePureNumeric('23.5 kg')).toBe(23.5);
    expect(parsePureNumeric('160.5 cm')).toBe(160.5);
    expect(parsePureNumeric('24 CM')).toBe(24);
    expect(parsePureNumeric('3200 gram')).toBe(3200);
  });

  it('returns null for empty, null, undefined or non-numeric inputs', () => {
    expect(parsePureNumeric('')).toBeNull();
    expect(parsePureNumeric('   ')).toBeNull();
    expect(parsePureNumeric(null)).toBeNull();
    expect(parsePureNumeric(undefined)).toBeNull();
    expect(parsePureNumeric('tidak ada')).toBeNull();
  });
});

describe('parsePureInteger', () => {
  it('parses integers and rounds decimals properly', () => {
    expect(parsePureInteger(31)).toBe(31);
    expect(parsePureInteger('31')).toBe(31);
    expect(parsePureInteger('31 tahun')).toBe(31);
    expect(parsePureInteger('2.4')).toBe(2);
    expect(parsePureInteger('2.8')).toBe(3);
    expect(parsePureInteger('')).toBeNull();
  });
});
