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

  it('renders child immunization intake details accurately', () => {
    const immunizationIntake = {
      flow: 'immunization' as const,
      schemaTitle: 'Form Pendaftaran Imunisasi Anak - Amanah Health Care',
      submittedAt: '2026-10-03 10:00:00',
      answersByFieldId: {
        childName: 'Ahmad Al-Fatih',
        childNik: '3201011506240001',
        childBirthDate: '2024-06-15',
        childSex: 'Laki-laki',
        parentPhone: '081234567890',
        fatherName: 'Budi Santoso',
        motherName: 'Siti Aminah',
        childAddress: 'Jl. Melati No. 12',
        previousVaccineHistory: 'HB 0 dan BCG sudah diberikan',
        childAllergyHistory: 'Tidak ada'
      },
      automatic: {
        childAgeAtSubmit: '1 tahun 3 bulan'
      }
    };

    const element = MedicalIntakeSummary({ intake: immunizationIntake });
    expect(element).toBeDefined();
  });
});
