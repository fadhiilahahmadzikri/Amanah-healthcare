/**
 * Canonical Single Source of Truth for RBAC Permissions, Audience, and Tiers in Frontend Web.
 * Directly mirrors the 40 canonical permissions in PostgreSQL 'permissions' table.
 * Zero Magic Strings.
 */

export const AUDIENCE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external'
} as const;

export type AudienceType = (typeof AUDIENCE)[keyof typeof AUDIENCE];

export const ROLE_AUDIENCE = AUDIENCE;
export type RoleAudience = AudienceType;

export const NOTIFICATION_AUDIENCE = {
  ALL: 'all',
  INTERNAL: 'internal',
  EXTERNAL: 'external'
} as const;

export type NotificationAudience =
  (typeof NOTIFICATION_AUDIENCE)[keyof typeof NOTIFICATION_AUDIENCE];

export const ROLE_TIER = {
  MACRO: 'macro',
  MICRO: 'micro'
} as const;

export type RoleTierType = (typeof ROLE_TIER)[keyof typeof ROLE_TIER];

export const PERMISSIONS = {
  APP: {
    ACCESS: 'app:access'
  },
  APPOINTMENTS: {
    BOOK: 'appointments:book',
    MANAGE: 'appointments:manage',
    READ: 'appointments:read'
  },
  ATTENDANCE: {
    APPROVE: 'attendance:approve',
    MANAGE: 'attendance:manage',
    READ: 'attendance:read',
    REVIEW: 'attendance:review',
    SUBMIT: 'attendance:submit'
  },
  CLINICS: {
    MANAGE: 'clinics:manage'
  },
  NOTIFICATIONS: {
    BROADCAST: 'notifications:broadcast',
    READ: 'notifications:read'
  },
  PATIENTS: {
    MANAGE: 'patients:manage',
    READ: 'patients:read',
    REGISTER: 'patients:register'
  },
  PAYROLL: {
    CALCULATE: 'payroll:calculate',
    MANAGE: 'payroll:manage',
    READ: 'payroll:read',
    READ_SELF: 'payroll:read_self'
  },
  PRESCRIPTIONS: {
    WRITE: 'prescriptions:write'
  },
  PROFILE: {
    READ: 'profile:read',
    UPDATE: 'profile:update'
  },
  QUEUE: {
    CALL: 'queue:call',
    CANCEL: 'queue:cancel',
    COMPLETE: 'queue:complete',
    READ: 'queue:read',
    RECALL: 'queue:recall',
    SERVE: 'queue:serve',
    SKIP: 'queue:skip'
  },
  RECORDS: {
    READ: 'records:read',
    WRITE: 'records:write'
  },
  ROLES: {
    MANAGE: 'roles:manage',
    READ: 'roles:read'
  },
  SCHEDULES: {
    MANAGE: 'schedules:manage',
    READ: 'schedules:read'
  },
  PAGES: {
    MANAGE: 'pages:manage',
    READ: 'pages:read'
  },
  CHAT: {
    READ: 'chat:read',
    SEND: 'chat:send'
  },
  STAFF: {
    INVITE: 'staff:invite',
    MANAGE: 'staff:manage',
    READ: 'staff:read'
  },
  USERS: {
    DELETE: 'users:delete',
    EXPORT: 'users:export',
    MANAGE: 'users:manage',
    READ: 'users:read',
    RESTORE: 'users:restore'
  },
  WILDCARD: '*'
} as const;

export type PermissionCode =
  | (typeof PERMISSIONS.APP)[keyof typeof PERMISSIONS.APP]
  | (typeof PERMISSIONS.APPOINTMENTS)[keyof typeof PERMISSIONS.APPOINTMENTS]
  | (typeof PERMISSIONS.ATTENDANCE)[keyof typeof PERMISSIONS.ATTENDANCE]
  | (typeof PERMISSIONS.CHAT)[keyof typeof PERMISSIONS.CHAT]
  | (typeof PERMISSIONS.CLINICS)[keyof typeof PERMISSIONS.CLINICS]
  | (typeof PERMISSIONS.NOTIFICATIONS)[keyof typeof PERMISSIONS.NOTIFICATIONS]
  | (typeof PERMISSIONS.PAGES)[keyof typeof PERMISSIONS.PAGES]
  | (typeof PERMISSIONS.PATIENTS)[keyof typeof PERMISSIONS.PATIENTS]
  | (typeof PERMISSIONS.PAYROLL)[keyof typeof PERMISSIONS.PAYROLL]
  | (typeof PERMISSIONS.PRESCRIPTIONS)[keyof typeof PERMISSIONS.PRESCRIPTIONS]
  | (typeof PERMISSIONS.PROFILE)[keyof typeof PERMISSIONS.PROFILE]
  | (typeof PERMISSIONS.QUEUE)[keyof typeof PERMISSIONS.QUEUE]
  | (typeof PERMISSIONS.RECORDS)[keyof typeof PERMISSIONS.RECORDS]
  | (typeof PERMISSIONS.ROLES)[keyof typeof PERMISSIONS.ROLES]
  | (typeof PERMISSIONS.SCHEDULES)[keyof typeof PERMISSIONS.SCHEDULES]
  | (typeof PERMISSIONS.STAFF)[keyof typeof PERMISSIONS.STAFF]
  | (typeof PERMISSIONS.USERS)[keyof typeof PERMISSIONS.USERS]
  | '*';
