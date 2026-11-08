export {
  regularFormZodSchema,
  validateRegularForm,
  type RegularValidationResult
} from './regular-form.schema';

export {
  maternalFormZodSchema,
  maternalConditionItemZodSchema,
  maternalConditionItemZodSchema as conditionResponseItemZodSchema,
  validateMaternalForm,
  getMaternityTabWithErrors,
  getMaternityTabErrorCounts,
  getTabForErrorKey,
  MATERNITY_TAB_LABELS,
  MATERNITY_FIELD_TAB_MAP,
  MATERNITY_FIELD_DOM_ID_MAP,
  type MaternalValidationResult,
  type MaternityInspectorTab
} from './maternity-form.schema';

export {
  immunizationFormZodSchema,
  validateImmunizationForm,
  getImmunizationTabWithErrors,
  getImmunizationTabErrorCounts,
  getTabForImmunizationErrorKey,
  getImmunizationDomIdForErrorKey,
  IMMUNIZATION_FIELD_TAB_MAP,
  IMMUNIZATION_FIELD_DOM_ID_MAP,
  type ImmunizationValidationResult,
  type ImmunizationInspectorTab
} from './immunization-form.schema';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
