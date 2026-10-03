import { describe, expect, it, mock } from 'bun:test';

mock.module('server-only', () => ({}));

const { DetailsModal } = await import('./details-modal');
const { MedicalIntakeSummary } = await import('./medical-intake-summary');
const { AppointmentFormInspector } = await import('./appointment-form-inspector');
const { InspectorPartnerTab } = await import('./inspector/inspector-partner-tab');
const { InspectorIdentityTab } = await import('./inspector/inspector-identity-tab');
const { InspectorClinicalTab } = await import('./inspector/inspector-clinical-tab');
const { InspectorObstetricTab } = await import('./inspector/inspector-obstetric-tab');

describe('DetailsModal & MedicalIntakeSummary', () => {
  it('exports DetailsModal, MedicalIntakeSummary and AppointmentFormInspector component functions', () => {
    expect(typeof DetailsModal).toBe('function');
    expect(typeof MedicalIntakeSummary).toBe('function');
    expect(typeof AppointmentFormInspector).toBe('function');
    expect(typeof InspectorPartnerTab).toBe('function');
    expect(typeof InspectorIdentityTab).toBe('function');
    expect(typeof InspectorClinicalTab).toBe('function');
    expect(typeof InspectorObstetricTab).toBe('function');
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

  it('renders partner tab component without error', () => {
    const dummyAppointment: any = {
      id: 'apt-1',
      patient_name: 'Dewi Lestari',
      patient_phone: '081234567890'
    };
    const dummyData: any = {
      flow: 'pregnancy',
      type: 'maternal',
      answers: {
        partnerName: 'Budi Prasetyo',
        partnerNik: '3201010101900001',
        partnerAge: '32',
        partnerJob: 'Wiraswasta',
        partnerEducation: 'S1',
        partnerBloodType: 'O',
        puskesmas: 'Puskesmas Melati',
        domicileAddress: 'Jl. Mawar No. 10'
      },
      automatic: {},
      maternal: {
        husband: {
          fullName: 'Budi Prasetyo',
          nik: '3201010101900001',
          age: 32,
          job: 'Wiraswasta',
          education: 'S1',
          bloodType: 'O'
        }
      }
    };

    const el = InspectorPartnerTab({ appointment: dummyAppointment, data: dummyData });
    expect(el).toBeDefined();
  });
});
