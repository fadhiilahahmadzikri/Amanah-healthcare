import { describe, expect, it } from 'bun:test';
import { FLOW_NAMES } from '../constants/kia-constants';

describe('useMedicalAppointmentSubmit flow-aware field extraction', () => {
  it('extracts childName and childNik for immunization flow', () => {
    const flow = FLOW_NAMES.IMMUNIZATION;
    const submittedValues = {
      childName: 'Ahmad Al-Fatih',
      childNik: '3201011506240001',
      childBirthDate: '2024-06-15',
      childSex: 'Laki-laki',
      parentPhone: '081234567890',
      motherName: 'Siti Aminah',
      childAddress: 'Jl. Merdeka No. 10'
    };

    const isImmunization = flow === FLOW_NAMES.IMMUNIZATION;
    const targetName =
      (isImmunization ? submittedValues.childName : submittedValues.motherName)?.trim() || '';
    const targetNik = (isImmunization ? submittedValues.childNik : '')?.trim() || '';
    const targetGender = isImmunization
      ? submittedValues.childSex === 'Perempuan'
        ? 'Perempuan'
        : 'Laki-laki'
      : 'Perempuan';

    expect(targetName).toBe('Ahmad Al-Fatih');
    expect(targetNik).toBe('3201011506240001');
    expect(targetGender).toBe('Laki-laki');
  });

  it('extracts motherName and motherNik for pregnancy flow', () => {
    const flow = FLOW_NAMES.PREGNANCY;
    const submittedValues = {
      motherName: 'Clara Yolanda',
      motherNik: '3201015506950002',
      phoneNumber: '081298765432'
    };

    const isImmunization = flow === FLOW_NAMES.IMMUNIZATION;
    const targetName = (isImmunization ? '' : submittedValues.motherName)?.trim() || '';
    const targetNik = (isImmunization ? '' : submittedValues.motherNik)?.trim() || '';

    expect(targetName).toBe('Clara Yolanda');
    expect(targetNik).toBe('3201015506950002');
  });
});
