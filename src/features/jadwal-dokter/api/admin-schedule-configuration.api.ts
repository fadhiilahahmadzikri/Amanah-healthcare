import { clientFetch } from '@/lib/client-fetch';

export interface DayInfoConfig {
  dow: number;
  label: string;
  isActive: boolean;
}

export interface SessionDefConfig {
  id: string;
  code: string;
  labelKey: string;
  label: string;
  timeRange: string;
  codePrefix: string;
  sortOrder: number;
  isActive: boolean;
  defaultStartsAt: string;
  defaultEndsAt: string;
}

export interface WeeklyTemplateConfig {
  id?: string;
  sessionId: string;
  sessionCode: string;
  sessionLabel: string;
  dow: number;
  dowLabel: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isMasterActive?: boolean;
}

export interface ClinicSettingOption {
  value: string;
  label: string;
  description?: string;
  flagCode?: string;
  countryCode?: string;
}

export interface ClinicSettingConfig {
  key: string;
  scopeType: string;
  value: any;
  category: 'duration' | 'queue' | 'notification' | 'general' | 'attendance';
  label: string;
  description: string;
  controlType?: 'text' | 'number' | 'boolean' | 'select';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: ClinicSettingOption[];
  isAdminFacing?: boolean;
}

export interface ScheduleConfigurationResponse {
  days: DayInfoConfig[];
  sessionDefs: SessionDefConfig[];
  weeklyTemplates: WeeklyTemplateConfig[];
  clinicSettings: ClinicSettingConfig[];
}

export interface UpdateSessionDefPayload {
  id: string;
  isActive?: boolean;
  sortOrder?: number;
  defaultStartsAt?: string;
  defaultEndsAt?: string;
}

export interface UpdateWeeklyTemplatePayload {
  id?: string;
  sessionId: string;
  dow: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface UpdateClinicSettingPayload {
  key: string;
  value: any;
}

export interface UpdateOperatingDayPayload {
  dow: number;
  isActive: boolean;
}

export interface UpdateScheduleConfigurationPayload {
  sessionDefs?: UpdateSessionDefPayload[];
  weeklyTemplates?: UpdateWeeklyTemplatePayload[];
  clinicSettings?: UpdateClinicSettingPayload[];
  operatingDays?: UpdateOperatingDayPayload[];
}

export interface ScheduleConfigurationImpactResult {
  severity: 'NONE' | 'LOW' | 'HIGH';
  affectedDoctorsCount: number;
  affectedAppointmentsCount: number;
  warnings: string[];
}

export async function fetchScheduleConfiguration(): Promise<ScheduleConfigurationResponse> {
  const res = await clientFetch<
    ScheduleConfigurationResponse | { data: ScheduleConfigurationResponse }
  >('/api/v1/admin/schedule-configuration');

  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as ScheduleConfigurationResponse;
}

export async function evaluateScheduleImpact(
  payload: UpdateScheduleConfigurationPayload
): Promise<ScheduleConfigurationImpactResult> {
  const res = await clientFetch<
    ScheduleConfigurationImpactResult | { data: ScheduleConfigurationImpactResult }
  >('/api/v1/admin/schedule-configuration/evaluate-impact', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as ScheduleConfigurationImpactResult;
}

export async function updateScheduleConfiguration(
  payload: UpdateScheduleConfigurationPayload
): Promise<{ success: boolean; message: string }> {
  return await clientFetch<{ success: boolean; message: string }>(
    '/api/v1/admin/schedule-configuration/batch',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    }
  );
}

export async function updateOperatingDaysBatch(
  days: UpdateOperatingDayPayload[]
): Promise<{ success: boolean; message: string }> {
  return await clientFetch<{ success: boolean; message: string }>(
    '/api/v1/admin/operating-days/batch',
    {
      method: 'PUT',
      body: JSON.stringify({ days })
    }
  );
}

export interface CreateSessionDefPayload {
  label: string;
  codePrefix?: string;
  defaultStartsAt: string;
  defaultEndsAt: string;
  isActive?: boolean;
}

export interface UpdateSingleSessionDefPayload {
  label?: string;
  codePrefix?: string;
  defaultStartsAt?: string;
  defaultEndsAt?: string;
  isActive?: boolean;
}

export async function createSessionDef(
  payload: CreateSessionDefPayload
): Promise<{ success: boolean; data: SessionDefConfig }> {
  return await clientFetch<{ success: boolean; data: SessionDefConfig }>(
    '/api/v1/admin/schedule-configuration/session-defs',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export async function updateSingleSessionDef(
  id: string,
  payload: UpdateSingleSessionDefPayload
): Promise<{ success: boolean; message: string }> {
  return await clientFetch<{ success: boolean; message: string }>(
    `/api/v1/admin/schedule-configuration/session-defs/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    }
  );
}

export interface DeleteSessionDefOptions {
  cascade?: boolean;
  confirmText?: string;
}

export interface SessionDefImpactDoctorDay {
  dow: number;
  dayName: string;
  roomName?: string | null;
}

export interface SessionDefImpactDoctor {
  id: string;
  displayName: string;
  specialty?: string | null;
  activeDays: SessionDefImpactDoctorDay[];
}

export interface SessionDefImpactResult {
  shiftId: string;
  shiftLabel: string;
  shiftCode: string;
  totalAssignmentsCount: number;
  affectedDoctorsCount: number;
  affectedDoctors: SessionDefImpactDoctor[];
  weeklyTemplatesCount: number;
  hasActiveTickets: boolean;
  activeTicketsCount: number;
}

export async function getSessionDefById(id: string): Promise<SessionDefConfig> {
  const res = await clientFetch<SessionDefConfig | { data: SessionDefConfig }>(
    `/api/v1/admin/schedule-configuration/session-defs/${id}`
  );

  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as SessionDefConfig;
}

export async function getSessionDefImpact(id: string): Promise<SessionDefImpactResult> {
  const res = await clientFetch<SessionDefImpactResult | { data: SessionDefImpactResult }>(
    `/api/v1/admin/schedule-configuration/session-defs/${id}/impact`
  );

  if (res && 'data' in res && res.data) {
    return res.data;
  }
  return res as SessionDefImpactResult;
}

export async function deleteSessionDef(
  id: string,
  options?: DeleteSessionDefOptions
): Promise<{ success: boolean; message: string }> {
  const params = new URLSearchParams();
  if (options?.cascade) {
    params.set('cascade', 'true');
  }
  if (options?.confirmText) {
    params.set('confirmText', options.confirmText);
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';

  return await clientFetch<{ success: boolean; message: string }>(
    `/api/v1/admin/schedule-configuration/session-defs/${id}${queryString}`,
    {
      method: 'DELETE',
      body: options ? JSON.stringify(options) : undefined
    }
  );
}
