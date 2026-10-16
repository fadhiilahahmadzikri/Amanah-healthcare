'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { StaffMember } from '../api/staff-management.api';
import { scheduleSessionsQueryOptions, staffRosterQueryOptions } from '../api/queries';
import { useResetStaffRosterMutation, useUpdateStaffRosterMutation } from '../api/mutations';

export interface UseStaffRosterModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface DayDef {
  dow: number;
  label: string;
  isActive: boolean;
}

export interface SessionDef {
  id: string;
  code: string;
  label: string;
  timeRange?: string;
  isActive: boolean;
}

export interface UseStaffRosterModalResult {
  loading: boolean;
  saving: boolean;
  isOverride: boolean;
  days: DayDef[];
  sessionDefs: SessionDef[];
  selectedAssignments: Record<string, boolean>;
  templateAssignments: Record<string, boolean>;
  isResetConfirmOpen: boolean;
  openResetConfirm: () => void;
  closeResetConfirm: () => void;
  toggleSession: (dow: number, sessionId: string) => void;
  toggleDay: (dow: number) => void;
  resetDayToTemplate: (dow: number) => void;
  handleSave: () => Promise<void>;
  handleConfirmResetToTemplate: () => Promise<void>;
}

export function useStaffRosterModal({
  staff,
  isOpen,
  onClose,
  onSuccess
}: UseStaffRosterModalProps): UseStaffRosterModalResult {
  const [isOverride, setIsOverride] = useState(false);
  const [days, setDays] = useState<DayDef[]>([]);
  const [sessionDefs, setSessionDefs] = useState<SessionDef[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, boolean>>({});
  const [templateAssignments, setTemplateAssignments] = useState<Record<string, boolean>>({});
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const staffId = staff?.id || '';

  const { data: config, isLoading: isLoadingConfig } = useQuery({
    ...scheduleSessionsQueryOptions(),
    enabled: Boolean(isOpen && staffId)
  });

  const { data: currentRosters = [], isLoading: isLoadingRosters } = useQuery({
    ...staffRosterQueryOptions(staffId),
    enabled: Boolean(isOpen && staffId)
  });

  const updateMutation = useUpdateStaffRosterMutation();
  const resetMutation = useResetStaffRosterMutation();

  useEffect(() => {
    if (!isOpen || !config) return;

    const activeSessions = (config.sessionDefs || []).filter((s) => s.isActive);
    setSessionDefs(activeSessions);

    const configDays: DayDef[] =
      config.days && config.days.length > 0
        ? config.days
        : [
            { dow: 1, label: 'Senin', isActive: true },
            { dow: 2, label: 'Selasa', isActive: true },
            { dow: 3, label: 'Rabu', isActive: true },
            { dow: 4, label: 'Kamis', isActive: true },
            { dow: 5, label: 'Jumat', isActive: true },
            { dow: 6, label: 'Sabtu', isActive: true },
            { dow: 0, label: 'Minggu', isActive: false }
          ];
    setDays(configDays);

    const tplMap: Record<string, boolean> = {};
    if (config.weeklyTemplates) {
      for (const t of config.weeklyTemplates) {
        if (t.isActive) {
          tplMap[`${t.dow}_${t.sessionId}`] = true;
        }
      }
    }
    setTemplateAssignments(tplMap);

    const hasOverride = currentRosters.some((r) => r.isOverride === true);
    setIsOverride(hasOverride);

    const currentMap: Record<string, boolean> = {};
    for (const r of currentRosters) {
      if (r.isActive !== false) {
        currentMap[`${r.dow}_${r.sessionId}`] = true;
      }
    }
    setSelectedAssignments(currentMap);
  }, [isOpen, config, currentRosters]);

  const toggleSession = useCallback((dow: number, sessionId: string) => {
    const key = `${dow}_${sessionId}`;
    setSelectedAssignments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const toggleDay = useCallback(
    (dow: number) => {
      const isCurrentlyActiveOnDay = sessionDefs.some((s) =>
        Boolean(selectedAssignments[`${dow}_${s.id}`])
      );

      setSelectedAssignments((prev) => {
        const next = { ...prev };
        for (const s of sessionDefs) {
          const key = `${dow}_${s.id}`;
          next[key] = !isCurrentlyActiveOnDay;
        }
        return next;
      });
    },
    [sessionDefs, selectedAssignments]
  );

  const resetDayToTemplate = useCallback(
    (dow: number) => {
      setSelectedAssignments((prev) => {
        const next = { ...prev };
        for (const s of sessionDefs) {
          const key = `${dow}_${s.id}`;
          next[key] = Boolean(templateAssignments[key]);
        }
        return next;
      });
      const dayObj = days.find((d) => d.dow === dow);
      toast.info(`Jadwal hari ${dayObj?.label || dow} disesuaikan ke template mingguan klinik`);
    },
    [days, sessionDefs, templateAssignments]
  );

  const handleConfirmResetToTemplate = useCallback(async () => {
    if (!staff) return;
    try {
      await resetMutation.mutateAsync(staff.id);
      setIsOverride(false);
      setSelectedAssignments({ ...templateAssignments });
      setIsResetConfirmOpen(false);
      onSuccess?.();
    } catch {
      // Handled by mutation onError toast
    }
  }, [staff, resetMutation, templateAssignments, onSuccess]);

  const handleSave = useCallback(async () => {
    if (!staff) return;

    const activeRosters: Array<{ sessionId: string; dow: number }> = [];
    for (const day of days) {
      for (const s of sessionDefs) {
        const key = `${day.dow}_${s.id}`;
        if (selectedAssignments[key]) {
          activeRosters.push({
            dow: day.dow,
            sessionId: s.id
          });
        }
      }
    }

    try {
      await updateMutation.mutateAsync({
        staffId: staff.id,
        payload: { rosters: activeRosters }
      });
      setIsOverride(true);
      onSuccess?.();
      onClose();
    } catch {
      // Handled by mutation onError toast
    }
  }, [staff, days, sessionDefs, selectedAssignments, updateMutation, onSuccess, onClose]);

  return {
    loading: isLoadingConfig || isLoadingRosters,
    saving: updateMutation.isPending || resetMutation.isPending,
    isOverride,
    days,
    sessionDefs,
    selectedAssignments,
    templateAssignments,
    isResetConfirmOpen,
    openResetConfirm: () => setIsResetConfirmOpen(true),
    closeResetConfirm: () => setIsResetConfirmOpen(false),
    toggleSession,
    toggleDay,
    resetDayToTemplate,
    handleSave,
    handleConfirmResetToTemplate
  };
}
