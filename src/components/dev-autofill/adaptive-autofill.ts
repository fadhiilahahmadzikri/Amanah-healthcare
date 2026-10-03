import type { FormRequirementData } from '@/features/klinik/api/kia-intake-service';
import { formRequirementGuard } from '@/features/klinik/model/form-requirement-guard';

export function getActiveFormRequirement(): FormRequirementData | null {
  return formRequirementGuard.getActiveRequirement();
}

export function isFieldOmitted(
  fieldId: string,
  requirement?: FormRequirementData | null
): boolean {
  if (!requirement?.isExistingPatient || !requirement.omittedFieldIds) {
    return false;
  }
  return requirement.omittedFieldIds.includes(fieldId);
}

export function getCanonicalDatabaseValue(
  fieldId: string,
  requirement?: FormRequirementData | null
): string | null {
  if (!requirement?.isExistingPatient) {
    return null;
  }

  const reusable = requirement.reusableIdentity?.[fieldId];
  if (reusable !== undefined && reusable !== null && String(reusable).trim() !== '') {
    return String(reusable);
  }

  const prefilled = requirement.prefilledValues?.[fieldId];
  if (prefilled !== undefined && prefilled !== null && String(prefilled).trim() !== '') {
    return String(prefilled);
  }

  return null;
}

export function resolveAdaptiveAutofillValues(
  flow: string,
  rawValues: Record<string, string>,
  customRequirement?: FormRequirementData | null
): Record<string, string> {
  const requirement =
    customRequirement !== undefined ? customRequirement : getActiveFormRequirement();

  if (!requirement || !requirement.isExistingPatient) {
    return { ...rawValues };
  }

  if (requirement.flow && requirement.flow !== flow) {
    return { ...rawValues };
  }

  const omittedSet = new Set(requirement.omittedFieldIds || []);
  const result: Record<string, string> = {};

  const allPredefinedKeys = new Set([
    ...Object.keys(requirement.reusableIdentity || {}),
    ...Object.keys(requirement.prefilledValues || {})
  ]);

  for (const [key, value] of Object.entries(rawValues)) {
    if (omittedSet.has(key)) {
      continue;
    }

    const canonicalValue = getCanonicalDatabaseValue(key, requirement);
    if (canonicalValue !== null) {
      result[key] = canonicalValue;
    } else {
      result[key] = value;
    }
  }

  for (const key of allPredefinedKeys) {
    if (omittedSet.has(key)) {
      continue;
    }
    if (result[key] === undefined) {
      const canonicalValue = getCanonicalDatabaseValue(key, requirement);
      if (canonicalValue !== null) {
        result[key] = canonicalValue;
      }
    }
  }

  return result;
}

export function resolveAdaptiveClearValues(
  flow: string,
  rawValues: Record<string, string>,
  customRequirement?: FormRequirementData | null
): Record<string, string> {
  const requirement =
    customRequirement !== undefined ? customRequirement : getActiveFormRequirement();

  const emptyValues: Record<string, string> = {};

  if (!requirement || !requirement.isExistingPatient) {
    for (const key of Object.keys(rawValues)) {
      emptyValues[key] = '';
    }
    return emptyValues;
  }

  if (requirement.flow && requirement.flow !== flow) {
    for (const key of Object.keys(rawValues)) {
      emptyValues[key] = '';
    }
    return emptyValues;
  }

  const omittedSet = new Set(requirement.omittedFieldIds || []);

  for (const key of Object.keys(rawValues)) {
    if (omittedSet.has(key)) {
      continue;
    }

    const canonicalValue = getCanonicalDatabaseValue(key, requirement);
    if (canonicalValue !== null) {
      emptyValues[key] = canonicalValue;
    } else {
      emptyValues[key] = '';
    }
  }

  return emptyValues;
}
