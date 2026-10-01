import { describe, expect, it } from 'bun:test';
import { kiaIntakeService } from './kia-intake-service';

describe('kiaIntakeService', () => {
  it('exports singleton instance with all required API methods', () => {
    expect(kiaIntakeService).toBeDefined();
    expect(typeof kiaIntakeService.createMaternityIntake).toBe('function');
    expect(typeof kiaIntakeService.createImmunizationIntake).toBe('function');
    expect(typeof kiaIntakeService.getIntakeByAppointmentId).toBe('function');
    expect(typeof kiaIntakeService.getMaternalIntakeById).toBe('function');
    expect(typeof kiaIntakeService.getImmunizationIntakeById).toBe('function');
  });
});
