'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchScheduleConfiguration,
  updateScheduleConfiguration,
  evaluateScheduleImpact,
  type SessionDefConfig,
  type WeeklyTemplateConfig,
  type ClinicSettingConfig,
  type UpdateScheduleConfigurationPayload,
  type ScheduleConfigurationImpactResult
} from '../api/admin-schedule-configuration.api';
import { doctorScheduleKeys } from '../api/queries';
import { SCHEDULE_QUERY_KEYS } from '../constants/schedule-shift.constants';

export type ConfigurationCategory =
  | 'session_defs'
  | 'weekly_templates'
  | 'clinic_settings';

export interface UseDoctorScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ConfigurationCategory;
}

export function useDoctorScheduleSettingsModal({
  isOpen,
  onClose,
  category = 'session_defs'
}: UseDoctorScheduleSettingsModalProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-schedule-configuration'],
    queryFn: fetchScheduleConfiguration,
    enabled: isOpen,
    staleTime: 30_000
  });

  const [draftSessionDefs, setDraftSessionDefs] = useState<SessionDefConfig[]>([]);
  const [draftWeeklyTemplates, setDraftWeeklyTemplates] = useState<WeeklyTemplateConfig[]>([]);
  const [draftClinicSettings, setDraftClinicSettings] = useState<ClinicSettingConfig[]>([]);

  const [impactResult, setImpactResult] = useState<ScheduleConfigurationImpactResult | null>(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [isEvaluatingImpact, setIsEvaluatingImpact] = useState(false);

  useEffect(() => {
    if (data && isOpen) {
      setDraftSessionDefs(JSON.parse(JSON.stringify(data.sessionDefs ?? [])));
      setDraftWeeklyTemplates(JSON.parse(JSON.stringify(data.weeklyTemplates ?? [])));
      setDraftClinicSettings(JSON.parse(JSON.stringify(data.clinicSettings ?? [])));
    }
  }, [data, isOpen]);

  const toggleSessionDef = useCallback((id: string) => {
    setDraftSessionDefs((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      );
      const target = updated.find((item) => item.id === id);
      if (target) {
        const willBeActive = target.isActive;
        setDraftWeeklyTemplates((wPrev) =>
          wPrev.map((wt) => {
            if (wt.sessionId === id) {
              return {
                ...wt,
                isMasterActive: willBeActive,
                isActive: willBeActive ? wt.isActive : false,
              };
            }
            return wt;
          })
        );
      }
      return updated;
    });
  }, []);

  const toggleWeeklyTemplateActive = useCallback(
    (dow: number, sessionId: string) => {
      const masterDef = draftSessionDefs.find((d) => d.id === sessionId);
      if (masterDef && !masterDef.isActive) {
        toast.error(
          `Shift ${masterDef.label || masterDef.code} sedang dinonaktifkan di Master Shift Operasional. Aktifkan master terlebih dahulu.`
        );
        return;
      }

      setDraftWeeklyTemplates((prev) =>
        prev.map((item) =>
          item.dow === dow && item.sessionId === sessionId
            ? { ...item, isActive: !item.isActive }
            : item
        )
      );
    },
    [draftSessionDefs]
  );

  const updateWeeklyTemplateTime = useCallback(
    (dow: number, sessionId: string, field: 'startsAt' | 'endsAt', value: string) => {
      setDraftWeeklyTemplates((prev) =>
        prev.map((item) =>
          item.dow === dow && item.sessionId === sessionId ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const updateClinicSettingValue = useCallback((key: string, value: any) => {
    setDraftClinicSettings((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }, []);

  const timeValidationError = useMemo(() => {
    for (const item of draftWeeklyTemplates) {
      if (item.isActive && item.startsAt >= item.endsAt) {
        return `Jam selesai pada shift ${item.sessionLabel} (Hari ${item.dow}) harus lebih lambat dari jam mulai`;
      }
    }
    return null;
  }, [draftWeeklyTemplates]);

  const dirtyChanges = useMemo(() => {
    if (!data) return { defs: [], templates: [], settings: [], totalCount: 0 };

    const defs = draftSessionDefs.filter((d) => {
      const orig = data.sessionDefs.find((o) => o.id === d.id);
      return orig && orig.isActive !== d.isActive;
    });

    const templates = draftWeeklyTemplates.filter((t) => {
      const orig = data.weeklyTemplates.find(
        (o) => o.dow === t.dow && o.sessionId === t.sessionId
      );
      if (!orig) return true;
      return (
        orig.isActive !== t.isActive ||
        orig.startsAt !== t.startsAt ||
        orig.endsAt !== t.endsAt
      );
    });

    const settings = draftClinicSettings.filter((s) => {
      const orig = data.clinicSettings.find((o) => o.key === s.key);
      if (!orig) return false;
      return JSON.stringify(orig.value) !== JSON.stringify(s.value);
    });

    return {
      defs,
      templates,
      settings,
      totalCount: defs.length + templates.length + settings.length
    };
  }, [data, draftSessionDefs, draftWeeklyTemplates, draftClinicSettings]);

  const categoryDirtyCount = useMemo(() => {
    switch (category) {
      case 'session_defs':
        return dirtyChanges.defs.length;
      case 'weekly_templates':
        return dirtyChanges.templates.length;
      case 'clinic_settings':
        return dirtyChanges.settings.length;
      default:
        return dirtyChanges.totalCount;
    }
  }, [category, dirtyChanges]);

  const buildPayload = useCallback((): UpdateScheduleConfigurationPayload => {
    const payload: UpdateScheduleConfigurationPayload = {};

    if (category === 'session_defs' && dirtyChanges.defs.length > 0) {
      payload.sessionDefs = dirtyChanges.defs.map((d) => ({
        id: d.id,
        isActive: d.isActive,
        sortOrder: d.sortOrder
      }));
    }

    if (category === 'weekly_templates' && dirtyChanges.templates.length > 0) {
      payload.weeklyTemplates = dirtyChanges.templates.map((t) => ({
        id: t.id,
        sessionId: t.sessionId,
        dow: t.dow,
        startsAt: t.startsAt,
        endsAt: t.endsAt,
        isActive: t.isActive
      }));
    }

    if (category === 'clinic_settings' && dirtyChanges.settings.length > 0) {
      payload.clinicSettings = dirtyChanges.settings.map((s) => ({
        key: s.key,
        value: s.value
      }));
    }

    return payload;
  }, [category, dirtyChanges]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      return updateScheduleConfiguration(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schedule-configuration'] });
      queryClient.invalidateQueries({ queryKey: doctorScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.SCHEDULES] });
      queryClient.invalidateQueries({ queryKey: [SCHEDULE_QUERY_KEYS.PRACTITIONERS] });

      const successLabel =
        category === 'session_defs'
          ? 'Shift operasional berhasil diperbarui.'
          : category === 'weekly_templates'
          ? 'Template mingguan berhasil diperbarui.'
          : 'Parameter klinik berhasil diperbarui.';

      toast.success(successLabel);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan';
      toast.error(msg);
    }
  });

  const handleRequestSave = useCallback(async () => {
    if (category === 'weekly_templates' && timeValidationError) {
      toast.error(timeValidationError);
      return;
    }

    if (categoryDirtyCount === 0) {
      toast.info('Tidak ada perubahan yang dilakukan.');
      onClose();
      return;
    }

    const payload = buildPayload();

    try {
      setIsEvaluatingImpact(true);
      const impact = await evaluateScheduleImpact(payload);
      if (impact.severity === 'HIGH') {
        setImpactResult(impact);
        setShowImpactDialog(true);
      } else {
        mutation.mutate();
      }
    } catch {
      // Fallback: simpan langsung jika endpoint evaluasi gagal jaringan
      mutation.mutate();
    } finally {
      setIsEvaluatingImpact(false);
    }
  }, [category, categoryDirtyCount, timeValidationError, buildPayload, mutation, onClose]);

  const handleConfirmSave = useCallback(() => {
    setShowImpactDialog(false);
    mutation.mutate();
  }, [mutation]);

  const handleCancelImpactDialog = useCallback(() => {
    setShowImpactDialog(false);
    setImpactResult(null);
    if (data) {
      setDraftSessionDefs(JSON.parse(JSON.stringify(data.sessionDefs ?? [])));
      setDraftWeeklyTemplates(JSON.parse(JSON.stringify(data.weeklyTemplates ?? [])));
      setDraftClinicSettings(JSON.parse(JSON.stringify(data.clinicSettings ?? [])));
    }
  }, [data]);

  return {
    category,
    isLoading,
    isError,
    refetch,
    draftSessionDefs,
    draftWeeklyTemplates,
    draftClinicSettings,
    toggleSessionDef,
    toggleWeeklyTemplateActive,
    updateWeeklyTemplateTime,
    updateClinicSettingValue,
    timeValidationError,
    dirtyCount: categoryDirtyCount,
    days: data?.days ?? [],
    isSubmitting: mutation.isPending || isEvaluatingImpact,
    impactResult,
    showImpactDialog,
    handleRequestSave,
    handleConfirmSave,
    handleCancelImpactDialog
  };
}
