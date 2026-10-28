'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchScheduleConfiguration,
  updateScheduleConfiguration,
  evaluateScheduleImpact,
  createSessionDef,
  updateSingleSessionDef,
  deleteSessionDef,
  type SessionDefConfig,
  type WeeklyTemplateConfig,
  type ClinicSettingConfig,
  type DayInfoConfig,
  type UpdateScheduleConfigurationPayload,
  type ScheduleConfigurationImpactResult,
  type CreateSessionDefPayload,
  type UpdateSingleSessionDefPayload
} from '../api/admin-schedule-configuration.api';
import { syncAllDoctorSchedules } from '../api/mutations';
import {
  detectSessionDefsOverlaps,
  parseTimeToMinutes,
  parseTimeEndToMinutes,
  minutesToTimeString
} from '../utils/shift-time-validator';

export type ConfigurationCategory = 'session_defs' | 'weekly_templates' | 'clinic_settings';

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
  const [draftOperatingDays, setDraftOperatingDays] = useState<DayInfoConfig[]>([]);

  const [impactResult, setImpactResult] = useState<ScheduleConfigurationImpactResult | null>(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [isEvaluatingImpact, setIsEvaluatingImpact] = useState(false);

  useEffect(() => {
    if (data && isOpen) {
      setDraftSessionDefs(JSON.parse(JSON.stringify(data.sessionDefs ?? [])));
      setDraftWeeklyTemplates(JSON.parse(JSON.stringify(data.weeklyTemplates ?? [])));
      setDraftClinicSettings(JSON.parse(JSON.stringify(data.clinicSettings ?? [])));
      setDraftOperatingDays(JSON.parse(JSON.stringify(data.days ?? [])));
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
                isActive: willBeActive ? wt.isActive : false
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
          `Shift ${masterDef.label} sedang dinonaktifkan di Master Shift Operasional. Aktifkan master terlebih dahulu.`
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

  const updateSessionDefTime = useCallback(
    (id: string, field: 'defaultStartsAt' | 'defaultEndsAt', value: string) => {
      setDraftSessionDefs((prev) => {
        let nextDefs = prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };
          const s = field === 'defaultStartsAt' ? value : updated.defaultStartsAt;
          const e = field === 'defaultEndsAt' ? value : updated.defaultEndsAt;
          updated.timeRange = `${s.slice(0, 5)} - ${e.slice(0, 5)}`;
          return updated;
        });

        const targetIndex = nextDefs.findIndex((d) => d.id === id);
        if (targetIndex !== -1) {
          if (field === 'defaultEndsAt') {
            const endMin = parseTimeEndToMinutes(value);
            // Cari shift aktif berikutnya dalam urutan sortOrder
            const nextActive = nextDefs.slice(targetIndex + 1).find((d) => d.isActive);
            if (nextActive) {
              const nextStartMin = parseTimeToMinutes(nextActive.defaultStartsAt);
              // HANYA JIKA TERJADI TABRAKAN: newEndsAt > nextStartsAt
              if (endMin > nextStartMin) {
                const newNextStart = value;
                const nextEndMin = parseTimeEndToMinutes(nextActive.defaultEndsAt, endMin);
                let newNextEnd = nextActive.defaultEndsAt;
                if (endMin >= nextEndMin) {
                  // Jika jam selesai shift berikutnya juga tertabrak, dorong minimal 1 jam ke depan
                  const pushedEndMin = Math.min(1440, endMin + 60);
                  newNextEnd = `${minutesToTimeString(pushedEndMin)}:00`;
                }
                nextDefs = nextDefs.map((d) =>
                  d.id === nextActive.id
                    ? {
                        ...d,
                        defaultStartsAt: newNextStart,
                        defaultEndsAt: newNextEnd,
                        timeRange: `${newNextStart.slice(0, 5)} - ${newNextEnd.slice(0, 5)}`
                      }
                    : d
                );
                toast.info(
                  `Jam mulai Shift ${nextActive.label} otomatis disesuaikan ke ${value.slice(0, 5)} agar tidak bertabrakan.`
                );
              }
              // JIKA TIDAK TABRAKAN (endMin <= nextStartMin), JEDA KLINIK TETAP DIPERTAHANKAN!
            }
          } else if (field === 'defaultStartsAt') {
            const startMin = parseTimeToMinutes(value);
            // Cari shift aktif sebelumnya
            const prevActive = nextDefs
              .slice(0, targetIndex)
              .toReversed()
              .find((d) => d.isActive);
            if (prevActive) {
              const prevEndMin = parseTimeEndToMinutes(prevActive.defaultEndsAt);
              // HANYA JIKA TERJADI TABRAKAN: newStartsAt < prevEndsAt
              if (startMin < prevEndMin) {
                const newPrevEnd = value;
                nextDefs = nextDefs.map((d) =>
                  d.id === prevActive.id
                    ? {
                        ...d,
                        defaultEndsAt: newPrevEnd,
                        timeRange: `${d.defaultStartsAt.slice(0, 5)} - ${newPrevEnd.slice(0, 5)}`
                      }
                    : d
                );
                toast.info(
                  `Jam selesai Shift ${prevActive.label} disesuaikan ke ${value.slice(0, 5)} agar tidak bertabrakan.`
                );
              }
            }
          }
        }

        // Sinkronisasi perubahan master ke seluruh template jadwal mingguan
        setDraftWeeklyTemplates((prevTemplates) =>
          prevTemplates.map((wt) => {
            const matchedDef = nextDefs.find((d) => d.id === wt.sessionId);
            if (!matchedDef) return wt;
            return {
              ...wt,
              startsAt: matchedDef.defaultStartsAt,
              endsAt: matchedDef.defaultEndsAt
            };
          })
        );

        return nextDefs;
      });
    },
    []
  );

  const toggleOperatingDayActive = useCallback((dow: number) => {
    setDraftOperatingDays((prev) =>
      prev.map((item) => (item.dow === dow ? { ...item, isActive: !item.isActive } : item))
    );
  }, []);

  const updateClinicSettingValue = useCallback((key: string, value: unknown) => {
    setDraftClinicSettings((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }, []);

  const { timeValidationError, conflictingDefIds } = useMemo(() => {
    if (category === 'session_defs') {
      const result = detectSessionDefsOverlaps(draftSessionDefs);
      return {
        timeValidationError: result.errorMessage,
        conflictingDefIds: result.conflictingIds
      };
    }

    if (category === 'weekly_templates') {
      for (const item of draftWeeklyTemplates) {
        if (item.isActive && item.startsAt >= item.endsAt) {
          const friendlyShift = item.sessionLabel;
          return {
            timeValidationError: `Jam selesai pada shift ${friendlyShift} (Hari ${item.dow}) harus lebih lambat dari jam mulai`,
            conflictingDefIds: [item.sessionId]
          };
        }
      }
    }

    return { timeValidationError: null, conflictingDefIds: [] };
  }, [category, draftSessionDefs, draftWeeklyTemplates]);

  const dirtyChanges = useMemo(() => {
    if (!data) return { defs: [], templates: [], settings: [], days: [], totalCount: 0 };

    const defs = draftSessionDefs.filter((d) => {
      const orig = data.sessionDefs.find((o) => o.id === d.id);
      return (
        orig &&
        (orig.isActive !== d.isActive ||
          orig.defaultStartsAt !== d.defaultStartsAt ||
          orig.defaultEndsAt !== d.defaultEndsAt)
      );
    });

    const templates = draftWeeklyTemplates.filter((t) => {
      const orig = data.weeklyTemplates.find((o) => o.dow === t.dow && o.sessionId === t.sessionId);
      if (!orig) return true;
      return (
        orig.isActive !== t.isActive || orig.startsAt !== t.startsAt || orig.endsAt !== t.endsAt
      );
    });

    const settings = draftClinicSettings.filter((s) => {
      const orig = data.clinicSettings.find((o) => o.key === s.key);
      if (!orig) return false;
      return JSON.stringify(orig.value) !== JSON.stringify(s.value);
    });

    const daysChanges = draftOperatingDays.filter((d) => {
      const orig = data.days.find((o) => o.dow === d.dow);
      return orig && orig.isActive !== d.isActive;
    });

    return {
      defs,
      templates,
      settings,
      days: daysChanges,
      totalCount: defs.length + templates.length + settings.length + daysChanges.length
    };
  }, [data, draftSessionDefs, draftWeeklyTemplates, draftClinicSettings, draftOperatingDays]);

  const dirtyCount = dirtyChanges.totalCount;

  const buildPayload = useCallback((): UpdateScheduleConfigurationPayload => {
    const payload: UpdateScheduleConfigurationPayload = {};

    if (dirtyChanges.defs.length > 0) {
      payload.sessionDefs = dirtyChanges.defs.map((d) => ({
        id: d.id,
        isActive: d.isActive,
        sortOrder: d.sortOrder,
        defaultStartsAt: d.defaultStartsAt,
        defaultEndsAt: d.defaultEndsAt
      }));
    }
    if (dirtyChanges.days.length > 0) {
      payload.operatingDays = dirtyChanges.days.map((d) => ({
        dow: d.dow,
        isActive: d.isActive
      }));
    }

    if (dirtyChanges.templates.length > 0) {
      payload.weeklyTemplates = dirtyChanges.templates.map((t) => ({
        id: t.id,
        sessionId: t.sessionId,
        dow: t.dow,
        startsAt: t.startsAt,
        endsAt: t.endsAt,
        isActive: t.isActive
      }));
    }

    if (dirtyChanges.settings.length > 0) {
      payload.clinicSettings = dirtyChanges.settings.map((s) => ({
        key: s.key,
        value: s.value
      }));
    }

    return payload;
  }, [dirtyChanges]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      return updateScheduleConfiguration(payload);
    },
    onSuccess: () => {
      syncAllDoctorSchedules(queryClient);
      toast.success('Pengaturan jadwal klinik berhasil disimpan.');
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan';
      toast.error(msg);
    }
  });

  const handleRequestSave = useCallback(async () => {
    if (timeValidationError) {
      toast.error(timeValidationError);
      return;
    }

    if (dirtyCount === 0) {
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
  }, [category, dirtyCount, timeValidationError, buildPayload, mutation, onClose]);

  const handleConfirmSave = useCallback(() => {
    setShowImpactDialog(false);
    mutation.mutate();
  }, [mutation]);

  const resetDraftChanges = useCallback(() => {
    if (data) {
      setDraftSessionDefs(JSON.parse(JSON.stringify(data.sessionDefs ?? [])));
      setDraftWeeklyTemplates(JSON.parse(JSON.stringify(data.weeklyTemplates ?? [])));
      setDraftClinicSettings(JSON.parse(JSON.stringify(data.clinicSettings ?? [])));
      setDraftOperatingDays(JSON.parse(JSON.stringify(data.days ?? [])));
      toast.info('Perubahan dibatalkan. Mengembalikan ke data tersimpan.');
    }
  }, [data]);

  const resetToCanonicalDefaults = useCallback(() => {
    setDraftSessionDefs((prev) => {
      const restored = prev.map((item) => {
        const canonicalStart = item.defaultStartsAt;
        const canonicalEnd = item.defaultEndsAt;
        return {
          ...item,
          defaultStartsAt: canonicalStart,
          defaultEndsAt: canonicalEnd,
          timeRange: `${canonicalStart.slice(0, 5)} - ${canonicalEnd.slice(0, 5)}`
        };
      });

      setDraftWeeklyTemplates((prevTemplates) =>
        prevTemplates.map((wt) => {
          const matchedDef = restored.find((d) => d.id === wt.sessionId);
          if (!matchedDef) return wt;
          return {
            ...wt,
            startsAt: matchedDef.defaultStartsAt,
            endsAt: matchedDef.defaultEndsAt
          };
        })
      );

      toast.success('Jam operasional shift dikembalikan ke standar baku klinik.');
      return restored;
    });
  }, []);

  const handleCancelImpactDialog = useCallback(() => {
    setShowImpactDialog(false);
    setImpactResult(null);
    if (data) {
      setDraftSessionDefs(JSON.parse(JSON.stringify(data.sessionDefs ?? [])));
      setDraftWeeklyTemplates(JSON.parse(JSON.stringify(data.weeklyTemplates ?? [])));
      setDraftClinicSettings(JSON.parse(JSON.stringify(data.clinicSettings ?? [])));
      setDraftOperatingDays(JSON.parse(JSON.stringify(data.days ?? [])));
    }
  }, [data]);

  const handleAddSessionDef = useCallback(
    async (payload: CreateSessionDefPayload) => {
      await createSessionDef(payload);
      toast.success(`Shift ${payload.label} berhasil ditambahkan.`);
      void refetch();
      syncAllDoctorSchedules(queryClient);
    },
    [queryClient, refetch]
  );

  const handleEditSessionDef = useCallback(
    async (id: string, payload: UpdateSingleSessionDefPayload) => {
      await updateSingleSessionDef(id, payload);
      toast.success('Shift berhasil diperbarui.');
      void refetch();
      syncAllDoctorSchedules(queryClient);
    },
    [queryClient, refetch]
  );

  const handleDeleteSessionDef = useCallback(
    async (id: string) => {
      await deleteSessionDef(id);
      toast.success('Shift berhasil dihapus.');
      void refetch();
      syncAllDoctorSchedules(queryClient);
    },
    [queryClient, refetch]
  );

  return {
    category,
    isLoading,
    isError,
    refetch,
    draftSessionDefs,
    draftWeeklyTemplates,
    draftClinicSettings,
    draftOperatingDays,
    toggleSessionDef,
    updateSessionDefTime,
    handleAddSessionDef,
    handleEditSessionDef,
    handleDeleteSessionDef,
    toggleOperatingDayActive,
    toggleWeeklyTemplateActive,
    updateWeeklyTemplateTime,
    updateClinicSettingValue,
    timeValidationError,
    conflictingDefIds,
    dirtyCount,
    days: draftOperatingDays.length > 0 ? draftOperatingDays : (data?.days ?? []),
    isSubmitting: mutation.isPending || isEvaluatingImpact,
    impactResult,
    showImpactDialog,
    handleRequestSave,
    handleConfirmSave,
    handleCancelImpactDialog,
    resetDraftChanges,
    resetToCanonicalDefaults
  };
}
