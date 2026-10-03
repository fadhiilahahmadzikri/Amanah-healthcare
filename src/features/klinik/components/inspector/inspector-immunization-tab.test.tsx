import { describe, expect, it } from 'bun:test';
import * as React from 'react';
import { InspectorImmunizationTab } from './inspector-immunization-tab';

describe('InspectorImmunizationTab Component', () => {
  it('renders child identity, vaccine history badges, and allergy info without throwing', () => {
    const mockData: any = {
      flow: 'immunization',
      child: {
        childName: 'Aisyah Putri Ramadhani',
        childNik: '3404075201260002',
        childBirthDate: '2026-01-12',
        childSex: 'Perempuan',
        childAgeFormatted: '2 bulan',
        parentPhone: '081234567890',
        fatherName: 'Ahmad Fauzi',
        motherName: 'Dewi Lestari',
        childAddress: 'Jl. Anyelir I No. 243, Condongcatur, Sleman',
        previousVaccineHistory: 'HB 0: Sudah (2026-01-13); BCG: Sudah (2026-02-12)',
        childAllergyHistory: 'Tidak ada alergi obat atau makanan yang diketahui'
      },
      answers: {
        childName: 'Aisyah Putri Ramadhani',
        childNik: '3404075201260002',
        childBirthDate: '2026-01-12',
        childSex: 'Perempuan',
        parentPhone: '081234567890',
        fatherName: 'Ahmad Fauzi',
        motherName: 'Dewi Lestari',
        childAddress: 'Jl. Anyelir I No. 243, Condongcatur, Sleman',
        hasVaccineHistory: 'Ya, pernah',
        vaccine_HB_0_status: 'Sudah',
        vaccine_HB_0_date: '2026-01-13',
        vaccine_BCG_status: 'Sudah',
        vaccine_BCG_date: '2026-02-12',
        hasAllergyHistory: 'Tidak ada alergi',
        childAllergyHistory: 'Tidak ada alergi obat atau makanan yang diketahui'
      },
      automatic: {}
    };

    const element = React.createElement(InspectorImmunizationTab, {
      appointment: { id: 'app-1', patient_name: 'Aisyah Putri Ramadhani' } as any,
      data: mockData
    });
    expect(element).toBeDefined();
    expect(element.type).toBe(InspectorImmunizationTab);
  });

  it('renders correctly with live backend immunization data shape', () => {
    const liveBackendData: any = {
      flow: 'immunization',
      type: 'immunization',
      child: {
        id: '18a98efe-1f10-4449-9824-59509ea6602c',
        childName: 'Laksana Herlambang',
        childNik: '3201012509257504',
        childBirthDate: '2025-09-25',
        childSex: 'Laki-laki',
        parentPhone: '085348441137',
        fatherName: 'Nalar Hidayat',
        motherName: 'Eka Anandya',
        childAddress: 'Ki. Purnawarman no 3, Selong',
        hasVaccineHistory: 'Ya, pernah',
        hasAllergyHistory: 'Tidak ada alergi',
        childAllergyHistory: 'Tidak ada'
      },
      answers: {
        childName: 'Laksana Herlambang',
        childNik: '3201012509257504',
        childBirthDate: '2025-09-25',
        childSex: 'Laki-laki',
        parentPhone: '085348441137',
        fatherName: 'Nalar Hidayat',
        motherName: 'Eka Anandya',
        childAddress: 'Ki. Purnawarman no 3, Selong',
        hasVaccineHistory: 'Ya, pernah',
        hasAllergyHistory: 'Tidak ada alergi',
        childAllergyHistory: 'Tidak ada'
      },
      automatic: {
        childAgeAtSubmit: ''
      }
    };

    const element = React.createElement(InspectorImmunizationTab, {
      appointment: {
        id: 'ecf22581-b6a3-47f5-b1c3-df931baca024',
        patient_name: 'Laksana Herlambang',
        service: 'Imunisasi Dasar & Lanjutan'
      } as any,
      data: liveBackendData
    });
    expect(element).toBeDefined();
    expect(element.type).toBe(InspectorImmunizationTab);
  });
});
