import { describe, expect, it } from 'bun:test';
import { parsePureInteger, parsePureNumeric } from './numeric-parser';

describe('Numeric Parser Utility', () => {
  describe('parsePureNumeric', () => {
    it('should parse integer numbers correctly', () => {
      expect(parsePureNumeric(123)).toBe(123);
      expect(parsePureNumeric('123')).toBe(123);
    });

    it('should parse decimal numbers with dot correctly', () => {
      expect(parsePureNumeric(123.5)).toBe(123.5);
      expect(parsePureNumeric('123.5')).toBe(123.5);
    });

    it('should parse decimal numbers with Indonesian comma correctly', () => {
      expect(parsePureNumeric('123,5')).toBe(123.5);
      expect(parsePureNumeric(' 52,25 ')).toBe(52.25);
    });

    it('should return null for empty or invalid inputs', () => {
      expect(parsePureNumeric(null)).toBeNull();
      expect(parsePureNumeric(undefined)).toBeNull();
      expect(parsePureNumeric('')).toBeNull();
      expect(parsePureNumeric('   ')).toBeNull();
      expect(parsePureNumeric('abc')).toBeNull();
      expect(parsePureNumeric('123abc')).toBeNull();
    });
  });

  describe('parsePureInteger', () => {
    it('should round numbers to integer', () => {
      expect(parsePureInteger(123)).toBe(123);
      expect(parsePureInteger('123.4')).toBe(123);
      expect(parsePureInteger('123,6')).toBe(124);
    });

    it('should return null for invalid inputs', () => {
      expect(parsePureInteger(null)).toBeNull();
      expect(parsePureInteger('invalid')).toBeNull();
    });
  });
});
