import type { UnifiedInspectorData } from '../../../inspector/types';
import type { Appointment } from '../../../../api/types';
import type { FormJsonSchema } from '../../../../constants/medical-appointment-types';
import type { ImunisasiFormData, VaccineRowData } from '../../types';
import { formatClinicDate } from '@/lib/date-format';
import { formatMaskedNik } from '@/components/ui/masked-nik';
import {
  getInactiveFieldIds,
  VACCINE_SCHEDULE_DEFINITIONS
} from './clinical-adapter-helpers';

/**
 * Adapter from upstream UnifiedInspectorData to 1:1 ImunisasiFormData
 * Aligns vaccine rows strictly by vaccine code to the 15 standard table slots.
 * Relational entries in `public.child_immunization_entries` are the Single Source of Truth.
 */
export function adaptToImunisasiFormData(
  data: UnifiedInspectorData,
  _appointment?: Appointment,
  schema?: FormJsonSchema | Record<string, any> | null
): ImunisasiFormData {
  const c = data.child;
  const p = data.patient;
  const inactive = getInactiveFieldIds(schema);
  const isFieldActive = (id: string) => !inactive.has(id);

  const mrn = p?.medicalRecordNumber || '0000000000';
  const cleanDigits = mrn.replace(/\D/g, '').padStart(10, '0').slice(-10);
  const recordDigits = cleanDigits.split('');

  const childName = isFieldActive('childName') ? (c?.childName || p?.fullName || '') : '';
  const childNik = isFieldActive('childNik') ? (c?.childNik || p?.nik || '') : '';
  const rawBirthDate = isFieldActive('childBirthDate') ? (c?.childBirthDate || p?.birthDate) : undefined;
  const childBirthDate = rawBirthDate
    ? formatClinicDate(rawBirthDate, { style: 'human_full' })
    : '';
  const phone = isFieldActive('parentPhone') ? (c?.parentPhone || p?.phone || '') : '';

  const fatherName = isFieldActive('fatherName') ? (c?.fatherName || '') : '';
  const motherName = isFieldActive('motherName') ? (c?.motherName || p?.motherName || '') : '';
  const address = isFieldActive('childAddress') ? (c?.childAddress || p?.address || '') : '';

  // Construct 15 entries strictly mapped to defaultImunisasiConfig.vaccineTable.rows
  const vaccineRows: (VaccineRowData | undefined)[] = Array.from({ length: 15 }, () => undefined);

  // Relational entries from backend (SSOT)
  const relationalEntries: any[] = Array.isArray(c?.entries) ? c.entries : [];

  VACCINE_SCHEDULE_DEFINITIONS.forEach((def) => {
    if (relationalEntries.length > 0) {
      const match = relationalEntries.find(
        (entry) =>
          entry.rowIndex === def.rowIdx ||
          (entry.vaccineCode && def.codes.includes(entry.vaccineCode))
      );

      if (match) {
        const rawDate = match.injectionDate;
        const hasDate = Boolean(rawDate);
        const hasVitals =
          match.weightKg != null ||
          match.heightCm != null ||
          match.headCircumferenceCm != null ||
          match.temperatureCelsius != null;
        const hasSymptoms = Boolean(match.fever || match.cough || match.runnyNose);
        const hasPlanning = Boolean(match.planning || match.notes);
        const isGiven = match.status === 'GIVEN';

        // Include row if it has any recorded clinical activity
        if (isGiven || hasDate || hasVitals || hasSymptoms || hasPlanning) {
          const matchedDate = rawDate
            ? formatClinicDate(rawDate, { style: 'human_short' })
            : '';

          const matchedAge =
            match.ageDisplay ||
            (match.ageEstimateMonths !== undefined ? `${match.ageEstimateMonths} bln` : '');

          const matchedPlanning = match.planning || match.notes || '';

          const matchedSubjective = [
            `Demam: ${match.fever || ''}`,
            `Batuk: ${match.cough || ''}`,
            `Pilek: ${match.runnyNose || ''}`
          ];

          const bbStr = match.weightKg != null ? `${match.weightKg} kg` : '';
          const pbStr = match.heightCm != null ? `${match.heightCm} cm` : '';
          const lkStr = match.headCircumferenceCm != null ? `${match.headCircumferenceCm} cm` : '';
          const tempStr = match.temperatureCelsius != null ? `${match.temperatureCelsius}°C` : '';
          const matchedObjective = [`BB/PB: ${bbStr}/${pbStr}`, `LK/S: ${lkStr}/${tempStr}`];

          vaccineRows[def.rowIdx] = {
            injectionDate: matchedDate,
            age: matchedAge,
            subjective: matchedSubjective,
            objective: matchedObjective,
            planning: matchedPlanning
          };
        }
      }
    }
  });

  return {
    header: {
      topCode: 'RM-01',
      recordDigits
    },
    identity: {
      leftValues: [childName, childNik ? formatMaskedNik(childNik) : '', childBirthDate, phone],
      rightValues: [fatherName, motherName, address, '']
    },
    preTable: {
      previousVaccines: c?.previousVaccineHistory || '',
      allergy: c?.childAllergyHistory || ''
    },
    vaccineRows
  };
}
