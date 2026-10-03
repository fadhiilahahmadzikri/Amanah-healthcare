import { describe, expect, it, mock } from 'bun:test';
import { formRequirementGuard } from './form-requirement-guard';
import { kiaIntakeService, type FormRequirementData } from '../api/kia-intake-service';

describe('formRequirementGuard', () => {
  it('prefetches and locks requirement deterministically without race condition', async () => {
    formRequirementGuard.reset();

    const mockRequirement: FormRequirementData = {
      flow: 'immunization',
      serviceId: 'srv-imunisasi-1',
      serviceName: 'Layanan Imunisasi Dasar Anak',
      isExistingPatient: true,
      patientId: 'patient-elvina',
      patientName: 'Elvina Hana',
      reusableIdentity: {
        childName: 'Elvina Hana',
        childNik: '3201015501230001',
        childBirthDate: '2023-05-15',
        childSex: 'Perempuan'
      },
      prefilledValues: {
        parentPhone: '081234567890',
        fatherName: 'Budi Santoso',
        motherName: 'Siti Aminah'
      },
      omittedFieldIds: ['childName', 'childNik', 'childBirthDate', 'childSex']
    };

    const spy = mock(() => Promise.resolve(mockRequirement));
    kiaIntakeService.getFormRequirement = spy as any;

    expect(formRequirementGuard.getActiveRequirement()).toBeNull();
    expect(formRequirementGuard.getCached('srv-imunisasi-1', 'patient-elvina')).toBeNull();

    const prefetchPromise = formRequirementGuard.prefetch('srv-imunisasi-1', 'patient-elvina');
    const samePromise = formRequirementGuard.prefetch('srv-imunisasi-1', 'patient-elvina');
    expect(prefetchPromise).toBe(samePromise);

    const prefetched = await prefetchPromise;
    expect(prefetched).toEqual(mockRequirement);
    expect(formRequirementGuard.getCached('srv-imunisasi-1', 'patient-elvina')).toEqual(mockRequirement);

    const locked = await formRequirementGuard.resolveAndLock('srv-imunisasi-1', 'patient-elvina');
    expect(locked).toEqual(mockRequirement);
    expect(formRequirementGuard.getActiveRequirement()).toEqual(mockRequirement);

    formRequirementGuard.clearActiveRequirement();
    expect(formRequirementGuard.getActiveRequirement()).toBeNull();
    expect(formRequirementGuard.getCached('srv-imunisasi-1', 'patient-elvina')).toEqual(mockRequirement);

    formRequirementGuard.reset();
    expect(formRequirementGuard.getCached('srv-imunisasi-1', 'patient-elvina')).toBeNull();
  });
});
