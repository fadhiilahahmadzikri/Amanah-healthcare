'use client';

import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/lib/client-fetch';
import {
  type ClinicDateFormatStyle,
  type ClinicTimeFormatStyle,
  formatClinicDate,
  formatClinicTime,
  formatClinicDateTime
} from '@/lib/date-format';

export interface ClinicTimeConfigResponse {
  clinicTimezone: string;
  clinicLocale: string;
  dateFormatStyle: ClinicDateFormatStyle;
  timeFormatStyle: ClinicTimeFormatStyle;
  today: string;
  nowIso: string;
  currentTime: string;
  operationalHours: string;
}

export const CLINIC_TIME_CONFIG_QUERY_KEY = ['clinic-time-config'] as const;

export async function fetchClinicTimeConfig(): Promise<ClinicTimeConfigResponse> {
  const res = await clientFetch<ClinicTimeConfigResponse>('/api/v1/time/current');
  return {
    clinicTimezone: res?.clinicTimezone ?? 'Asia/Jakarta',
    clinicLocale: res?.clinicLocale ?? 'id-ID',
    dateFormatStyle: (res?.dateFormatStyle as ClinicDateFormatStyle) ?? 'human_full',
    timeFormatStyle: (res?.timeFormatStyle as ClinicTimeFormatStyle) ?? '24h',
    today: res?.today ?? new Date().toISOString().slice(0, 10),
    nowIso: res?.nowIso ?? new Date().toISOString(),
    currentTime: res?.currentTime ?? '08:00',
    operationalHours: res?.operationalHours ?? '06:00 - 24:00'
  };
}

export function useClinicTimeConfig() {
  const { data, isLoading, error } = useQuery({
    queryKey: CLINIC_TIME_CONFIG_QUERY_KEY,
    queryFn: fetchClinicTimeConfig,
    staleTime: 5 * 60 * 1000, // 5 menit
    refetchOnWindowFocus: false
  });

  const locale = data?.clinicLocale ?? 'id-ID';
  const defaultDateStyle = data?.dateFormatStyle ?? 'human_full';
  const defaultTimeStyle = data?.timeFormatStyle ?? '24h';

  const formatDate = (
    date: string | Date | number | null | undefined,
    style?: ClinicDateFormatStyle
  ) => {
    return formatClinicDate(date, {
      style: style ?? defaultDateStyle,
      locale
    });
  };

  const formatTime = (
    date: string | Date | number | null | undefined,
    style?: ClinicTimeFormatStyle,
    withSuffix = false
  ) => {
    return formatClinicTime(date, {
      style: style ?? defaultTimeStyle,
      withSuffix,
      locale
    });
  };

  const formatDateTime = (
    date: string | Date | number | null | undefined,
    options?: {
      dateStyle?: ClinicDateFormatStyle;
      timeStyle?: ClinicTimeFormatStyle;
      separator?: string;
      withSuffix?: boolean;
    }
  ) => {
    return formatClinicDateTime(date, {
      dateStyle: options?.dateStyle ?? defaultDateStyle,
      timeStyle: options?.timeStyle ?? defaultTimeStyle,
      separator: options?.separator,
      withSuffix: options?.withSuffix,
      locale
    });
  };

  return {
    config: data,
    isLoading,
    error,
    formatDate,
    formatTime,
    formatDateTime
  };
}
