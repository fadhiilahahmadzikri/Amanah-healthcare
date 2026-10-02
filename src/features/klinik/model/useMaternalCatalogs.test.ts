import { describe, expect, it } from 'bun:test';
import { pregnancyFlowDefinition } from '../constants/pregnancy-flow-definition';
import { immunizationFlowDefinition } from '../constants/immunization-flow-definition';
import { enrichMedicalFlowDefinition } from './useMaternalCatalogs';

describe('enrichMedicalFlowDefinition', () => {
  it('dynamically enriches pregnancy flow definition choices from backend catalogs', () => {
    const mockCatalogs = {
      educationChoices: ['SD', 'SMP', 'SMA', 'S1'],
      religionChoices: ['Islam', 'Kristen'],
      bloodTypeChoices: ['A', 'B', 'AB', 'O', 'Belum Tahu'],
      tetanusChoices: ['Belum pernah', 'T1', 'T2'],
      occupationChoices: ['PNS', 'Karyawan', 'Wiraswasta'],
      deliveryMethodChoices: ['Normal / Spontan', 'Sectio Caesarea (SC)'],
      deliveryPlaceChoices: ['Rumah Sakit', 'Puskesmas', 'Klinik Bersalin'],
      childSexChoices: ['Laki-laki', 'Perempuan'],
      birthAttendantChoices: ['Dokter Spesialis Kandungan (Sp.OG)', 'Bidan'],
      contraceptiveTypeChoices: ['Suntik 3 Bulan', 'IUD / Spiral', 'Pil KB']
    };

    const enriched = enrichMedicalFlowDefinition(pregnancyFlowDefinition, mockCatalogs);

    const motherJob = enriched.sections.flatMap((s) => s.fields).find((f) => f.id === 'motherJob');
    expect(motherJob?.choices).toEqual(['PNS', 'Karyawan', 'Wiraswasta']);

    const partnerJob = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'partnerJob');
    expect(partnerJob?.choices).toEqual(['PNS', 'Karyawan', 'Wiraswasta']);

    const motherEdu = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'motherEducation');
    expect(motherEdu?.choices).toEqual(['SD', 'SMP', 'SMA', 'S1']);

    const partnerEdu = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'partnerEducation');
    expect(partnerEdu?.choices).toEqual(['SD', 'SMP', 'SMA', 'S1']);

    const religion = enriched.sections.flatMap((s) => s.fields).find((f) => f.id === 'religion');
    expect(religion?.choices).toEqual(['Islam', 'Kristen']);

    const motherBlood = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'motherBloodType');
    expect(motherBlood?.choices).toEqual(['A', 'B', 'AB', 'O', 'Belum Tahu']);

    const partnerBlood = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'partnerBloodType');
    expect(partnerBlood?.choices).toEqual(['A', 'B', 'AB', 'O', 'Belum Tahu']);

    const tetanus = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'tetanusStatus');
    expect(tetanus?.choices).toEqual(['Belum pernah', 'T1', 'T2']);

    const deliveryMethod = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'previousPregnancy1DeliveryMethod');
    expect(deliveryMethod?.choices).toEqual(['Normal / Spontan', 'Sectio Caesarea (SC)']);

    const deliveryPlace = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'previousPregnancy1DeliveryPlace');
    expect(deliveryPlace?.choices).toEqual(['Rumah Sakit', 'Puskesmas', 'Klinik Bersalin']);

    const childSex = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'previousPregnancy1ChildSex');
    expect(childSex?.choices).toEqual(['Laki-laki', 'Perempuan']);

    const birthAttendant = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'previousPregnancy1BirthAttendant');
    expect(birthAttendant?.choices).toEqual(['Dokter Spesialis Kandungan (Sp.OG)', 'Bidan']);

    const contraType = enriched.sections
      .flatMap((s) => s.fields)
      .find((f) => f.id === 'contraception1Type');
    expect(contraType?.choices).toEqual(['Suntik 3 Bulan', 'IUD / Spiral', 'Pil KB']);
  });

  it('leaves non-pregnancy flow definitions untouched', () => {
    const mockCatalogs = {
      occupationChoices: ['PNS']
    };

    const enriched = enrichMedicalFlowDefinition(immunizationFlowDefinition, mockCatalogs);
    expect(enriched).toBe(immunizationFlowDefinition);
  });
});
