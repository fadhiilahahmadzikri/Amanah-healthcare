import { clientFetch } from '@/lib/client-fetch';

export interface DayInfoConfig {
  dow: number;
  label: string;
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
  category: 'duration' | 'queue' | 'notification' | 'general';
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

export interface UpdateScheduleConfigurationPayload {
  sessionDefs?: UpdateSessionDefPayload[];
  weeklyTemplates?: UpdateWeeklyTemplatePayload[];
  clinicSettings?: UpdateClinicSettingPayload[];
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
