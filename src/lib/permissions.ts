import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc, userAc } from 'better-auth/plugins/admin/access';

export const statement = {
  ...defaultStatements,
  clinic: ['manage', 'view'],
  'patient-record': ['create', 'read', 'update', 'delete'],
  'doctor-schedule': ['manage', 'view'],
  'staff-attendance': ['manage', 'view'],
  appointment: ['create', 'read', 'update', 'cancel'],
  queue: ['read', 'take-ticket'],
  workspace: ['manage', 'read'],
  billing: ['manage', 'read']
} as const;

export const ac = createAccessControl(statement);

export const patient = ac.newRole({
  ...userAc.statements,
  appointment: ['create', 'read', 'cancel'],
  queue: ['read', 'take-ticket']
});

export const user = ac.newRole({
  ...userAc.statements,
  appointment: ['create', 'read', 'cancel'],
  queue: ['read', 'take-ticket']
});

export const admin = ac.newRole({
  ...adminAc.statements,
  clinic: ['manage', 'view'],
  'patient-record': ['create', 'read', 'update', 'delete'],
  'doctor-schedule': ['manage', 'view'],
  'staff-attendance': ['manage', 'view'],
  appointment: ['create', 'read', 'update', 'cancel'],
  queue: ['read', 'take-ticket'],
  workspace: ['manage', 'read'],
  billing: ['manage', 'read']
});
