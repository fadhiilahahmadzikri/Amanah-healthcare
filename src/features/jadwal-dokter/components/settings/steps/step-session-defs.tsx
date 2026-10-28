'use client';

import React from 'react';
import {
  MasterSessionDefsManager,
  type MasterSessionDefsManagerProps
} from './master-session-defs-manager';

export type StepSessionDefsProps = MasterSessionDefsManagerProps;

export function StepSessionDefs(props: StepSessionDefsProps) {
  return <MasterSessionDefsManager {...props} />;
}
