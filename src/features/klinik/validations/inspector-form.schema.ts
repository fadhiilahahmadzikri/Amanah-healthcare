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
  type MaternalValidationResult,
  type MaternityInspectorTab
} from './maternity-form.schema';

export {
  immunizationFormZodSchema,
  validateImmunizationForm,
  getImmunizationTabWithErrors,
  type ImmunizationValidationResult,
  type ImmunizationInspectorTab
} from './immunization-form.schema';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
