/**
 * Facade re-exporting clinical form adapters.
 * Decomposed into domain-specific adapters in `./adapters/`:
 * - `pmb-form-adapter.ts`
 * - `imunisasi-form-adapter.ts`
 * - `reguler-form-adapter.ts`
 * - `clinical-adapter-helpers.ts`
 */
export {
  adaptToPmbFormData,
  adaptToImunisasiFormData,
  adaptToRegulerFormData,
  getInactiveFieldIds,
  formatGender,
  CANONICAL_PMB_DISEASE_KEYS,
  VACCINE_SCHEDULE_DEFINITIONS,
  type VaccineScheduleDef
} from './adapters';
