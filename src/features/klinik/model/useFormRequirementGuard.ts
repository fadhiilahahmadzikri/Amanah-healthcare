'use client';

import * as React from 'react';
import { formRequirementGuard } from './form-requirement-guard';

export function useFormRequirementGuard() {
  const activeRequirement = React.useSyncExternalStore(
    (callback) => formRequirementGuard.subscribe(callback),
    () => formRequirementGuard.getActiveRequirement(),
    () => null
  );

  const isResolving = React.useSyncExternalStore(
    (callback) => formRequirementGuard.subscribe(callback),
    () => formRequirementGuard.getIsResolving(),
    () => false
  );

  return {
    activeRequirement,
    isResolving,
    prefetch: formRequirementGuard.prefetch.bind(formRequirementGuard),
    resolveAndLock: formRequirementGuard.resolveAndLock.bind(formRequirementGuard),
    getCached: formRequirementGuard.getCached.bind(formRequirementGuard),
    clearActiveRequirement: formRequirementGuard.clearActiveRequirement.bind(formRequirementGuard),
    reset: formRequirementGuard.reset.bind(formRequirementGuard)
  };
}
